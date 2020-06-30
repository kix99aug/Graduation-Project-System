const router = new (require("koa-router"))();
const fetch = require("node-fetch");
const db = require("./db");
const send = require("koa-send");

const client_id =
    "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com";
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN";

router
    .get("/", async (ctx) => {
        ctx.redirect("/intro");
    })
    .get("/intro", async (ctx) => {
        await ctx.render("intro", {
            title: "高雄大學資訊工程學系 畢業專題交流平台",
        });
    })
    .get("/logout",async ctx=>{
        ctx.session = null
        ctx.redirect("/intro");
    })
    .get("/login", async (ctx) => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&redirect_uri=http://localhost:3000/loginCallback&response_type=code&client_id=${client_id}`;
        ctx.redirect(url);
    })
    
    .get("/loginCallback", async (ctx) => {
        let formData = {
            code: ctx.query.code,
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/loginCallback",
        };
        let json = await (
            await fetch("https://www.googleapis.com/oauth2/v4/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: Object.keys(formData)
                    .map((keyName) => {
                        return (
                            encodeURIComponent(keyName) +
                            "=" +
                            encodeURIComponent(formData[keyName])
                        );
                    })
                    .join("&"),
            })
        ).json();
        let googleData = await (
            await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${json.access_token}`
            )
        ).json();
        console.log(googleData)
        if (googleData.hd === "mail.nuk.edu.tw" || googleData.hd === "go.nuk.edu.tw") {
            // 確認資料庫
            let account = googleData.email.split("@")[0];
            let [user] = await db.user.find({ account: { $eq: account } });
            if (!user) user = await db.user.new(account, googleData.name, googleData.picture, googleData.hd === "go.nuk.edu.tw" ? 2 : 3, googleData.email, null, googleData.hd === "mail.nuk.edu.tw" ? googleData.email.substr(1, 3) : null, null, null, null, null)
            else await user.update({ avatar: googleData.picture },{new:true})
            ctx.session.login = true;
            ctx.session.id = user._id;
            ctx.session.name = googleData.name;
            ctx.session.team = user.team;
            ctx.session.image = googleData.picture;
            ctx.session.group = user.group
            ctx.redirect("/index");
        } else {
            // 回傳錯誤
            ctx.throw(400);
        }
    })
    .get('/index', async ctx => {
        if (ctx.session.group == 1) {
            ctx.redirect("/admin/index")
        }
        else {
            await ctx.render("index", {
                title: "畢業專題交流平台",
                name: ctx.session.name ? ctx.session.name : "訪客",
                image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
                team: ctx.session.team ? true : false,
                login:ctx.session.login ? true : false
            })
        }
    })
    .get('/profile', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.session.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        let [professor] = await db.user.find({ "_id": { "$eq": team.teacher } })
        //學生的profile
        console.log(user)
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: user.name,
            image: user.avatar ? user.avatar : "/static/images/favicon_sad.png",
            grade: user.grade,
            professor: professor ? professor.name : "無",
            introduction: user.intro ? user.intro : "無",
            canFix: true,
            email: user.email ? user.email : "無",
            group: user.group,
            link: user.link,
            gender: user.gender ? user.gender : "秘密",
            user:user
        })


    })
    .get('/profile/:id', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.params.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name,
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            grade: user.grade,
            professor: team ? team.teacher.name : null,
            introduction: user.intro ? user.intro : "無",
            canFix: false,
            email: user.email ? user.email : "無",
            group: user.group,
            link: user.link,
            gender: user.gender ? user.gender : "秘密",
            user: user
        })
    })
    .get('/projects', async ctx => {
        let query = {archived:true}
        if (ctx.request.query.grade) query.grade = ctx.request.query.grade
        let teams = await db.team.find(query)
        let grade = await db.team.model.distinct('grade')
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            data: teams,
            query: ctx.request.query.grade,
            grade: grade
        })
    })
    .get('/project/:id', async ctx => {
        let [project] = await db.team.find({ "_id": { "$eq": ctx.params.id } })
        let members = await db.user.find({ group: { $eq: 3 }, team: { $eq: ctx.params.id } })
        let comments = await db.comment.find({ "teamId": ctx.params.id })
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            members: members,
            project: project,
            comments: comments,
            login: ctx.session.login
        })
    })
    .post('/search', async ctx => {
        let input = ctx.request.body.search
        let result = await db.team.find({ "name": new RegExp(input, "g") })
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            data: result,
            query: {},
            grade: -1
        })
    })
    .post("/api/profile", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } })
        await user.update(ctx.request.body)
        ctx.body = {
            result: true,
        }
    })

    .get("/api/storage/:id", async (ctx) => {
        let [res] = await db.storage.find({
            _id: { $eq: ctx.params.id },
        });
        if (res.public == true) await send(ctx, res.path);
        else ctx.throw(403)
    })

    .get("/api/alert",async ctx=>{
        
    })

module.exports = {
    routes: router.routes()
}
