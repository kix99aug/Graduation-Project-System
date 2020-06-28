const router = new (require('koa-router'))()
const fetch = require("node-fetch")
const db = require("./db")

const client_id =
    "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com"
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN"

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
            grade: "避不了業",
            professor: "沒人要你",
            introduction: user.intro ? user.intro : "親~請輸入您的簡介歐~~~",
            canFix: true
        })
    })
    .get('/profile/:id', async ctx => {
        let [user] = await db.user.find({ "_id": { "$eq": ctx.params.id } })
        let [team] = await db.team.find({ "_id": { "$eq": user.team } })
        let [professor] = await db.user.find({ "_id": { "$eq": team.teacher } })
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: user.name,
            image: user.avatar ? user.avatar : "/static/images/favicon_sad.png",
            grade: user.grade,
            professor: professor ? professor.name : 無,
            introduction: user.intro ? user.intro : "無",
            canFix: false
        })
    })
    .get('/projects', async ctx => {
        let teams = await db.team.find({})
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            data: teams
        })
    })
    .get('/project/:id', async ctx => {
        let [project] = await db.team.find({ "_id": { "$eq": ctx.params.id } })
        let members = await db.user.find({ group: { $eq: 3 }, team: { $eq: ctx.params.id } })
        let [teahcer] = await db.user.find({ group: { $eq: 2 }, team: { $eq: ctx.params.id } })
        let comments = await db.comment.find({ "teamId": ctx.params.id })
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            members: members,
            teahcer: teahcer,
            project: project,
            comments: comments
        })
    })
    .post('/search', async ctx => {
        let input = ctx.request.body.search
        let result = await db.team.find({ "name": new RegExp(input, "g") })
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image ? ctx.session.image : "/static/images/favicon_sad.png",
            data: result
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

    .post("/api/profile", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } })
        await user.update({ intro: ctx.request.body.content })
        ctx.body = {
            result: true,
        }
    })

module.exports = {
    routes: router.routes()
}
