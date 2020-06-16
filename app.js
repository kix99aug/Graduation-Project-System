const path = require('path')
const crypto = require('crypto')
const fetch = require("node-fetch");
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const serve = require('koa-static')
const mount = require('koa-mount')
const session = require("koa-session");
const bodyParser = require('koa-body');
const MongooseStore = require("koa-session-mongoose")
const Models = require("./models")

const app = new Koa()
const router = new Router()
app.keys = [crypto.randomBytes(20).toString('hex')];

const client_id = "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com"
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN"

app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))
app.use(bodyParser({
    formidable:{uploadDir: './uploads'},    //This is where the files would come
    multipart: true,
    urlencoded: true
 }));

let notes =
{
    1: { x: .1, y: .1, content: "123" },
    2: { x: .2, y: .2, content: "123" },
    3: { x: .3, y: .3, content: "123" },
    4: { x: .4, y: .4, content: "123" },
}


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
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            grade: "避不了業",
            professor: "沒人要你",
            introduction: ctx.session.introduction ? ctx.session.introduction : "我是大雞雞，又香又甜又好吃"
        })
    })
    .get('/projects', async ctx => {
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            projectName: "行車安全警示系統",
            projectInfo: "啊我就怕被罵啊幹你娘鄵",

        })
    })
    .get('/project/:id', async ctx => {
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
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
            console.log(googleData)
            ctx.session.login = true
            ctx.session.id = googleData.id
            ctx.session.name = googleData.name
            ctx.session.image = googleData.picture
            ctx.redirect("/index")
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
    .get('/team/data', async ctx => {
        await ctx.render("team/data", {
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
    .get('/team/judge', async ctx => {
        await ctx.render("team/judge", {
            title: "畢業專題交流平台",
            subtitle: "專題評分",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            studentName: ctx.session.studentName ? ctx.session.studentName : "胡帥哥",
        })
    })
    .get('/team/info', async ctx => {
        await ctx.render("team/info", {
            title: "畢業專題交流平台",
            subtitle: "專題資訊",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            teamMateName: ctx.session.teamMateName ? ctx.session.teamMateName : "黃翰俞",
            guideTeacherName: ctx.session.guideTeacherName ? ctx.session.guideTeacherName : "張寶榮",
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
    .get('/admin/accountM', async ctx => {
        await ctx.render("admin/accountManagement", {
            title: "畢業專題交流平台",
            subtitle: "管理使用者",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/editAC', async ctx => {
        await ctx.render("admin/editingAccount", {
            title: "畢業專題交流平台",
            subtitle: "管理使用者",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/admin/timeSetting', async ctx => {
        await ctx.render("admin/time", {
            title: "畢業專題交流平台",
            subtitle: "系統時程設定",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })

    // apis
    .get('/api/blackboard/all', async ctx => {
        ctx.body = {
            result: true,
            data: notes
        }
    })
    .get('/api/blackboard/remove/:id', async ctx => {
        delete notes[ctx.params.id]
        ctx.body = {
            result: true
        }
    })
    .post('/api/blackboard/modify/:id', async ctx => {
        notes[ctx.params.id] = ctx.request.body
        ctx.body = {
            result: true
        }
    })
    .post('/api/blackboard/new', async ctx => {
        let newKey = parseInt(Math.random() * Number.MAX_SAFE_INTEGER)
        notes[newKey] = ctx.request.body
        ctx.body = {
            result: true,
            id: newKey
        }
    })
    .post('/api/storage/upload',async ctx=>{
        console.log(ctx.request.body.files);
        ctx.body = "Received your data!"
    })


app.use(session({ store: new MongooseStore() }, app))
app.use(async (ctx, next) => {
    ctx.set('Server', 'Koa 2.12.0')
    await next()
})
app.use(async (ctx, next) => {
    try {
        await next()
        const status = ctx.status || 404
        if (status === 404) {
            ctx.throw(404)
        }
    } catch (err) {
        ctx.status = err.status || 500
        if (ctx.status != 200) {
            await ctx.render('error')
        }
    }
})
app.use(router.routes())
app.use(mount('/static', serve('./static')))

app.listen(3000, async e => {
    console.log("Koa server run on http://localhost:3000/")
})