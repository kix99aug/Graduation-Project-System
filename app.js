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
mongoose.connect("mongodb://127.0.0.1:27017/", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))
app.use(bodyParser());

router
    .get('/', async ctx => {
        ctx.session.count = ctx.session.count + 1
        ctx.body = ctx.session
    })
    .get('/login', async ctx => {
        var url = "https://accounts.google.com/o/oauth2/v2/auth?" +
            "scope=email%20profile&" +
            "redirect_uri=http://localhost:3000/loginCallback&" +
            "response_type=code&" +
            "client_id=" + "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com";
        ctx.redirect(url)
    })
    .get('/hello', async ctx => {
        await ctx.render("index", {
            title: "高雄大學資訊工程學系",
            topic: "畢業專題交流平台"
        })
    })
    .get("/loginCallback", async ctx => {
        if (!ctx.query.code) {
            ctx.throw(400)
            ctx.body = { error: "Request Error: Google access code is required." }
            return
        }
        let formData = {
            code: ctx.query.code,
            client_id: "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com",
            client_secret: "zlT87D-MtpTF5ltC3w5k2hKN",
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/loginCallback"
        }
        fetch("https://www.googleapis.com/oauth2/v4/token", {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: Object.keys(formData).map(keyName => {
                return encodeURIComponent(keyName) + '=' + encodeURIComponent(formData[keyName])
            }).join('&')
        })
            .then(res => {
                return res.json()
            })
            .then(json => {
                fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${json.access_token}`)
                    .then(res => {
                        return res.json()
                    })
                    .then(json => console.log(json))
            })
    })


app.use(session({ store: new MongooseStore() }, app))
app.use(router.routes())
app.use(mount('/static', serve('./static')))

app.listen(3000)