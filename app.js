const socketIO = require('socket.io');

const path = require("path")
const crypto = require("crypto")
const fetch = require("node-fetch")
const views = require("koa-views")
const serve = require("koa-static")
const send = require('koa-send');
const mount = require("koa-mount")
const session = require("koa-session")
const bodyParser = require('koa-body')({
    formidable: { uploadDir: './uploads' },    //This is where the files would come
    multipart: true,
    urlencoded: true
})
const Koa = require("koa")
const http = require('http');
const Router = require("koa-router")
const MongooseStore = require("koa-session-mongoose")
const app = new Koa()
const router = new Router()
const db = require("./db")
const { unlink } = require("fs");
const { join } = require('path');

const client_id =
    "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com";
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN";

let notes = {
    1: { x: 0.1, y: 0.1, content: "123" },
    2: { x: 0.2, y: 0.2, content: "123" },
    3: { x: 0.3, y: 0.3, content: "123" },
    4: { x: 0.4, y: 0.4, content: "123" },
};

router
    .get('/', async ctx => {
        ctx.redirect("/intro")
    })
    .get('/intro', async ctx => {
        await ctx.render("intro", {
            title: "高雄大學資訊工程學系 畢業專題交流平台"
        })
    })
    .get('/login', async ctx => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&redirect_uri=http://localhost:3000/loginCallback&response_type=code&client_id=${client_id}`
        ctx.redirect(url)
    })
    .get('/index', async ctx => {
        await ctx.render("index", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/profile', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        let [professor] = await db.user.find({ "_id": { "$eq": team.teacher } })

        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            grade: ctx.session.grade ? ctx.session.grade : "???",
            professor: professor.name ? professor.name : "???",
            introduction: user.intro ? user.intro : "親~請輸入您的簡介歐~~~",
        })
    })
    .get('/projects', async ctx => {
        let teams = await db.team.find({})
        //資料庫中所有project的資料彙整
        projectData = []
        for (i in teams) {
            projectName = teams[i].name
            projectInfo = teams[i].info
            projectId = teams[i]._id
            var project = { 'projectName': projectName, 'projectInfo': projectInfo, 'id': projectId }
            projectData.push(project)
        }
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            data: projectData
        })
    })
    .get('/project/:id', async ctx => {
        //切出team id
        url = ctx.request.url
        let [projectContext] = await db.team.find({ "_id": { "$eq": ctx.params.id } })
        let member = await db.user.find({ "team": { "$eq": ctx.params.id } })
        let memberAccount = [] //學生的學號
        let teachName = ""//
        for (i in member) {
            if (member[i].group == 3) {
                memberAccount.push({ 'account': member[i].account, 'name': member[i].name })
            } else {
                teachName = member[i].name
            }

        }
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            projectName: projectContext.name,
            member: memberAccount,
            teachName: teachName
        })
    })
    .get("/loginCallback", async ctx => {
        let formData = {
            code: ctx.query.code,
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/loginCallback"
        }
        let json = await (
            await fetch("https://www.googleapis.com/oauth2/v4/token", {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: Object.keys(formData).map(keyName => {
                    return encodeURIComponent(keyName) + '=' + encodeURIComponent(formData[keyName])
                }).join('&')
            })
        ).json()
        let googleData = await (
            await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${json.access_token}`)
        ).json()
        if (googleData.hd === "mail.nuk.edu.tw" || googleData.hd === "go.nuk.edu.tw") {
            // 確認資料庫
            let account = googleData.email.split('@')[0]
            let [user] = await db.user.find({ "account": { "$eq": account } })
            if (!user) user = await db.user.new(account, googleData.name, null, null, googleData.email, null, null, null, null, null)
            if (user.group === 1) {
                await db.user.modify({ "_id": user._id }, { "group": 1 })
                console.log(user)
                ctx.session.login = true
                ctx.session.id = user._id
                ctx.session.name = googleData.name
                ctx.session.team = user.team
                ctx.session.image = googleData.picture
                ctx.session.admin = user.group
                ctx.redirect("/admin")
            }
            else {
                console.log(user)
                ctx.session.login = true
                ctx.session.id = user._id
                ctx.session.name = googleData.name
                ctx.session.team = user.team
                ctx.session.image = googleData.picture
                ctx.redirect("/index")
            }
        } else {
            // 回傳錯誤
            ctx.throw(400)
        }
    })
    .get('/team/schedule', async ctx => {
        await ctx.render("team/schedule", {
            title: "畢業專題交流平台",
            subtitle: "行程表",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/team/storage', async ctx => {
        await ctx.render("team/storage", {
            title: "畢業專題交流平台",
            subtitle: "檔案上傳",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/team/blackboard', async ctx => {
        await ctx.render("team/blackboard", {
            title: "畢業專題交流平台",
            subtitle: "留言板",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get("/team/judge", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let [team] = await db.team.find({ _id: { $eq: user.team } });
        let [teamMate] = await db.user.find({ team: team._id });
        await ctx.render("team/judge", {
            title: "畢業專題交流平台",
            subtitle: "專題評分",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
            teamGrade: team.score ? team.score : "尚未評",
        });
    })
    .get('/team/info', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        await ctx.render("team/info", {
            title: "畢業專題交流平台",
            subtitle: "專題資訊",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            teamMateName: ctx.session.teamMateName ? ctx.session.teamMateName : "黃翰俞",
            guideTeacherName: ctx.session.guideTeacherName ? ctx.session.guideTeacherName : "張寶榮",
            projectName: team.name ? team.name : "親~為你們的組別命個名麻~",
            info: team.info ? team.info : "親~~說明一下你們的專題介紹啦~啾咪",
        })
    })
    .get('/team/conference', async ctx => {
        await ctx.render("team/conference", {
            title: "畢業專題交流平台",
            subtitle: "線上會議",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            id: ctx.session.id,
            teamMateName: ctx.session.teamMateName ? ctx.session.teamMateName : "黃翰俞",
            guideTeacherName: ctx.session.guideTeacherName ? ctx.session.guideTeacherName : "???",
        })
    })

    //Backend
    .get('/admin', async ctx => {
        ctx.redirect("/admin/index")
    })
    .get('/admin/index', async ctx => {
        await ctx.render("admin/index", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/managePT', async ctx => {
        await ctx.render("admin/projectAndteamManagement", {
            title: "畢業專題交流平台",
            subtitle: "管理專題 & 團隊",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/editPI', async ctx => {
        await ctx.render("admin/editingProjectInfo", {
            title: "畢業專題交流平台",
            subtitle: "管理專題 & 團隊",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/editPF', async ctx => {
        await ctx.render("admin/editingProjectFiles", {
            title: "畢業專題交流平台",
            subtitle: "管理專題 & 團隊",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/users', async ctx => {
        await ctx.render("admin/accountManagement", {
            title: "畢業專題交流平台",
            subtitle: "管理使用者",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/user/edit/:id', async ctx => {
        let [user] = await db.user.find({ _id: { "$eq": ctx.params.id } })
        await ctx.render("admin/editingAccount", {
            title: "畢業專題交流平台",
            subtitle: "管理使用者",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            user: user
        })
    })
    .post('/admin/user/edit/:id', async ctx => {
        let [user] = await db.user.find({ _id: { "$eq": ctx.params.id } })
        await user.update(ctx.request.body)
        await ctx.render("admin/editingAccount", {
            title: "畢業專題交流平台",
            subtitle: "管理使用者",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            user: ctx.request.body
        })
    })
    .get('/admin/timeSetting', async ctx => {
        await ctx.render("admin/time", {
            title: "畢業專題交流平台",
            subtitle: "系統時程設定",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            recordtime: ctx.session.recordtime ? ctx.session.recordtime : "109/06/09",
            year: db.systemSet.year ? db.systemSet.year : "00",
            month: db.systemSet.month ? db.systemSet.month : "00",
            day: db.systemSet.day ? db.systemSet.day : "00",

        })
    })

    // apis
    .post('/api/profile', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        await user.update({ "intro": ctx.request.body.content })
        ctx.body = {
            result: true,
        }
    })
    // team
    .get('/api/team/blackboard/all', async ctx => {
        ctx.body = {
            result: true,
            data: notes
        }
    })
    .get('/api/team/blackboard/remove/:id', async ctx => {
        delete notes[ctx.params.id]
        ctx.body = {
            result: true
        }
    })
    .post('/api/team/blackboard/modify/:id', async ctx => {
        notes[ctx.params.id] = ctx.request.body
        ctx.body = {
            result: true
        }
    })
    .post('/api/team/blackboard/new', async ctx => {
        let newKey = parseInt(Math.random() * Number.MAX_SAFE_INTEGER)
        notes[newKey] = ctx.request.body
        ctx.body = {
            result: true,
            id: newKey
        }
    })
    .get('/api/team/storage', async ctx => {
        let res = await db.storage.find({ "owner": { "$eq": ctx.session.team } })
        let ans = res.map(x => Object({ id: x._id, filename: x.filename }))
        ctx.body = ans
    })
    .get('/api/team/storage/:id', async ctx => {
        let [res] = await db.storage.find({ "owner": { "$eq": ctx.session.team }, "_id": { "$eq": ctx.params.id } })
        console.log(res)
        await send(ctx, res.path)
    })
    .delete('/api/team/storage/:id', async ctx => {
        let [res] = await db.storage.find({ "owner": { "$eq": ctx.session.team }, "_id": { "$eq": ctx.params.id } })
        unlink("./" + res.path, e => { })
        await res.deleteOne()
        ctx.status = 200
    })
    .get("/api/conference/myname", async (ctx) => {
        ctx.body = {
            result: true,
            id: ctx.session.id
        }
    })
    .post('/api/team/info', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        let teamMate = await db.user.find({ "team": { "$eq": user.team } })
        await team.update({ "info": ctx.request.body.info })
        await team.update({ "name": ctx.request.body.projectName })
        ctx.body = {
            result: true,
            teamMate: teamMate,
        }
    })
    .get('/api/team/info_2', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let teamMate = await db.user.find({ "team": { "$eq": user.team } })
        ctx.body = {
            result: true,
            teamMate: teamMate,
        }
    })

    // apis
    .get("/api/team/blackboard/all", async (ctx) => {
        ctx.body = {
            result: true,
            data: notes,
        };
    })
    .get("/api/team/blackboard/remove/:id", async (ctx) => {
        delete notes[ctx.params.id];
        ctx.body = {
            result: true,
        };
    })
    .post("/api/team/blackboard/modify/:id", async (ctx) => {
        notes[ctx.params.id] = ctx.request.body;
        ctx.body = {
            result: true,
        };
    })
    .post("/api/team/blackboard/new", async (ctx) => {
        let newKey = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
        notes[newKey] = ctx.request.body;
        ctx.body = {
            result: true,
            id: newKey,
        };
    })
    .get("/api/team/storage", async (ctx) => {
        let res = await db.storage.find({ owner: { $eq: ctx.session.team } });
        let ans = res.map((x) => Object({ id: x._id, filename: x.filename }));
        ctx.body = ans;
    })
    .get("/api/team/storage/:id", async (ctx) => {
        let [res] = await db.storage.find({
            owner: { $eq: ctx.session.team },
            _id: { $eq: ctx.params.id },
        });
        console.log(res);
        await send(ctx, res.path);
    })
    .delete("/api/team/storage/:id", async (ctx) => {
        let [res] = await db.storage.find({
            owner: { $eq: ctx.session.team },
            _id: { $eq: ctx.params.id },
        });
        unlink("./" + res.path, (e) => { });
        await res.deleteOne();
        ctx.status = 200;
    })
    .put("/api/team/storage", async (ctx) => {
        let res = await db.storage.new(
            ctx.request.files.file.name,
            ctx.request.files.file.path,
            ctx.session.team
        );
        ctx.body = {
            result: true,
            id: res._id,
            filename: ctx.request.files.file.name,
        };
    })
    .get("/api/conference/myname", async (ctx) => {
        ctx.body = {
            result: true,
            id: ctx.session.id,
        };
    })
    .post("/api/team/info", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let [team] = await db.team.find({ _id: { $eq: user.team } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });
        await team.update({ info: ctx.request.body.info });
        await team.update({ name: ctx.request.body.projectName });
        ctx.body = {
            result: true,
            teamMate: teamMate,
        };
    })
    .get("/api/team/info_2", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });
        ctx.body = {
            result: true,
            teamMate: teamMate,
        };
    })

    .get("/api/team/judge", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });

        ctx.body = {
            result: true,
            group: user.group,
            teamMate: teamMate,
        };
    })
    .post("/api/team/judge/score", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });
        let [team] = await db.team.find({ _id: { $eq: user.team } });
        var j = 0;
        for (var i = 0; i < teamMate.length; i++) {
            if (teamMate[i].group == 2) {
                continue
            }
            else {
                let [user1] = await db.user.find({ _id: { $eq: teamMate[i]._id } });

                await user1.update({ score: ctx.request.body[j] })
                j++
            }
        }
        await team.update({ score: ctx.request.body.teamscore });
        ctx.body = {
            result: true,
        };
    })
    .post('/api/admin/newTeam', async function (ctx) {
        let [teacher] = await db.user.find({ "name": { "$eq": ctx.request.body.teacher } })
        let [leader] = await db.user.find({ "account": { "$eq": ctx.request.body.members[0] } })
        if (!teacher || !leader) ctx.body = { result: false };
        else {
            await db.team.new(ctx.request.body.name, 109, teacher._id, leader._id, null, null, null, null, null, null, null, 4, null).then(async res => {
                db.user.modify({ "_id": teacher._id }, { "team": res._id })
                db.user.modify({ "_id": leader._id }, { "team": res._id })
                for (var i = 1; i < ctx.request.body.members.length; i++) {
                    let member = await db.user.find({ "account": { "$eq": ctx.request.body.members[i] } })
                    db.user.modify({ "_id": member[0]._id }, { "team": res._id })
                }
            })
            ctx.body = {
                result: true
            }
        }
    })
    .post('/api/team/AllSchedule', async ctx => {
        console.log(ctx.request.body)
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let eventList = await db.schedule.find({ "teamId": { "$eq": user.team } })
        ctx.body = {
            result: true,
            AllEvent: eventList
        }
    })
    .post('/api/team/newSchedule', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        data = ctx.request.body
        let Sid
        await db.schedule.new(user.team, data.Name, data.Year, data.Month, data.Day).then(res => {
            Sid = res._id
        })
        ctx.body = {
            result: true,
            "id": Sid
        }
    })
    .post('/api/team/deleteSchedule', async ctx => {
        console.log(ctx.request.body)
        deleteData = ctx.request.body
        for (i in deleteData) {
            await db.schedule.remove({ "_id": deleteData[i] })
        }
        ctx.body = {
            result: true,
        }
    })

    //admin



    .put("/api/admin/user", async (ctx) => {
        let res = await db.user.new(
            ctx.request.body
        );
        ctx.body = {
            result: true,
            id: res._id,
        };
    })



    .post('/api/admin/ptList', async function (ctx) {
        let ptList = await db.team.find();
        ctx.body = {
            result: ptList,
        }
    })
    .post('/api/admin/newTeam', async function (ctx) {
        let [teacher] = await db.user.find({ "name": { "$eq": ctx.request.body.teacher } })
        let [leader] = await db.user.find({ "account": { "$eq": ctx.request.body.members[0] } })
        if (!teacher || !leader) ctx.body = { result: false };
        else {
            await db.team.new(ctx.request.body.name, 109, teacher._id, leader._id, null, null, null, null, null, null, null, 4, null).then(async res => {
                db.user.modify({ "_id": teacher._id }, { "team": res._id })
                db.user.modify({ "_id": leader._id }, { "team": res._id })
                for (var i = 1; i < ctx.request.body.members.length; i++) {
                    let member = await db.user.find({ "account": { "$eq": ctx.request.body.members[i] } })
                    db.user.modify({ "_id": member[0]._id }, { "team": res._id })
                }
            })
            ctx.body = {
                result: true
            }
        }
    })
    .put("/api/admin/projectTeam", async (ctx) => {
        let res = await db.team.new(
            ctx.request.body
        );
        ctx.body = {
            result: true,
            id: res._id,
        };
    })
    .delete('/api/admin/projectTeam/:id', async function (ctx) {
        let res = await db.team.remove({_id:{"$eq":ctx.params.id}})
        ctx.status = res>0 ? 200:204
        ctx.body = {
            result:res>0
        }
    })
    .delete('/api/admin/user/:id', async function (ctx) {
        let res = await db.user.remove({_id:{"$eq":ctx.params.id}})
        ctx.status = res>0 ? 200:204
        ctx.body = {
            result:res>0
        }
    })
    .post('/api/admin/timeSet', async function (ctx) {
        if (db.systemSet.find().count() == 0) {
            await db.systemSet.new(null);
        }
        var [timeSet] = db.systemSet.find()
        await timeSet.update({ "year": ctx.request.body.year })
        await timeSet.update({ "month": ctx.request.body.month })
        await timeSet.update({ "day": ctx.request.body.day })

        ctx.body = {
            year: timeSet.year,
            month: timeSet.month,
            day: timeSet.day,
        }
    })


    .post("/api/profile", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        await user.update({ intro: ctx.request.body.content });
        ctx.body = {
            result: true,
        };
    });


app.keys = ["088f149f3e8d7a69f3999f0c850f71140168bc18"]

app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))

app.use(session({ store: new MongooseStore() }, app))

app.use(mount("/static", serve("./static")))
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.throw(status);
        }
    } catch (err) {
        ctx.status = err.status || 500;
        console.error(err);
        if (ctx.status != 200) {
            if (ctx.method == "GET")
                await ctx.render("error", { code: ctx.status, server: "Koa 2.12.0" });
        }
    }
});
app.use(async (ctx, next) => {
    if (ctx.url.startsWith("/team/") || ctx.url.startsWith("/api/team/")) {
        if (!ctx.session.team) {
            ctx.redirect("/login");
            // ctx.throw(403)
            return;
        }
    }
    if (ctx.url.startsWith("/admin/") || ctx.url.startsWith("/api/admin/")) {
        console.log(ctx.session.id)

        if (ctx.session.admin != 1) {
            ctx.throw(403)
            return
        }
    }
    await next()
})
app.use(bodyParser)
app.use(router.routes())

app.server = http.createServer(app.callback());
app.listen = (...args) => {
    app.server.listen.call(app.server, ...args);
    return app.server;
};

app.io = socketIO(app.server, {});

// add Socket.io middleware to parse Koa-session cookie
app.io.use(async (socket, next) => {
    let error = null;
    try {
        // create a new (fake) Koa context to decrypt the session cookie
        let ctx = app.createContext(socket.request, new http.OutgoingMessage());
        await ctx.session._sessCtx.initFromExternal()
        socket.session = ctx.session;
    } catch (err) {
        error = err;
    }
    return next(error);
});


app.io.on('connection', client => {
    client.join(client.session.team)
    client.room = client.session.team
    app.io.in(client.room).emit('userin', {
        id: client.session.id,
        name: client.session.name
    })
    client.on('message', async function (message) {
        app.io.in(client.room).emit('message', {
            id: client.session.id,
            picture: client.session.image,
            name: client.session.name,
            message: message,
        })
    })
    client.on('disconnect', async function () {
        app.io.in(client.room).emit('userout', {
            id: client.session.id,
            name: client.session.name
        })
    })

})

app.listen(3000, async e => {

    // db.user.modify({"name":"胡勝清"},{"group":1})
    //db.user.modify({"name":"胡勝清"},{"group":3})
    // let T = ["brchang","張保榮","http://www.csie.nuk.edu.tw/~brchang/"]
    // let L  = ["a1055502","洪至謙"]
    // let S1 = ["a1053340","張丞賢"]
    // let S2 = ["a1055510","黃冠淇"]
    // let S3 = ["a1055537","李宛萱"]
    // let TEAMNAME = "WOW!DISCO!"

    //新增entity
    // db.user.new(T[0],T[1],null,2,null,null,null,T[2],null)
    // db.user.new(L[0],L[1],null,3,null,null,109,null,null)
    // db.user.new(S1[0],S1[1],null,3,null,null,109,null,null)
    // db.user.new(S2[0],S2[1],null,3,null,null,109,null,null)
    // db.user.new(S3[0],S3[1],null,3,null,null,109,null,null)

    // let [id_teacher] = await db.user.find({"account":{"$eq":T[0]}})
    // let [id_leader] = await db.user.find({"account":{"$eq":L[0]}})
    // let [id_1] = await db.user.find({"account":{"$eq":S1[0]}})
    // let [id_2] = await db.user.find({"account":{"$eq":S2[0]}})
    // //let [id_3] = await db.user.find({"account":{"$eq":S3[0]}})


    //     db.team.new(TEAMNAME,109,id_teacher._id,id_leader._id,null,null,null,null,null,null,null,4,null).then(res=>{
    //             db.user.modify(id_teacher._id,{"team":res._id})
    //             db.user.modify(id_leader._id,{"team":res._id})
    //             db.user.modify(id_1._id,{"team":res._id})
    //             db.user.modify(id_2._id,{"team":res._id})
    //             db.user.modify(id_3._id,{"team":res._id})
    //         })
    console.log("Koa server run on http://localhost:3000/")
})
