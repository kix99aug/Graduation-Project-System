const path = require('path')
const crypto = require('crypto')
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const serve = require('koa-static')
const mount = require('koa-mount')
const session = require("koa-session");
const bodyParser = require('koa-bodyparser');
const MongooseStore = require("koa-session-mongoose")

const app = new Koa()
const router = new Router()
app.keys = [crypto.randomBytes(20).toString('hex')];
mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const client_id = "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com"
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN"

app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))
app.use(bodyParser());

router
    .get('/', async ctx => {
        await ctx.render("index")
    })
    .get('/login', async ctx => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&redirect_uri=http://localhost:3000/loginCallback&response_type=code&client_id=${client_id}`
        ctx.redirect(url)
    })
    .get('/mainpage', async ctx => {
        await ctx.render("mainpage", {
            title: "畢業專題交流平台",
            name: ctx.session.name? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/profile', async ctx => {
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png"
        })
    })
    .get('/project', async ctx => {
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name? ctx.session.name : "訪客",
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
            ctx.session.login = true
            ctx.session.id = googleData.id
            ctx.session.name = googleData.name
            ctx.redirect("/mainpage")
        } else {
            // 回傳錯誤
            ctx.throw(400)
        }
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

app.listen(3000)