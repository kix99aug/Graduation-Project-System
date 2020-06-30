const path = require("path")
const views = require("koa-views")
const serve = require("koa-static")
const mount = require("koa-mount")
const session = require("koa-session")
const body = require("koa-body")
const http = require("http")
const koa = new (require("koa"))()
const bos = require("./bos")
const pms = require("./pms")
const sas = require("./sas")
const db = require("./db")
const MongooseStore = require("koa-session-mongoose")

koa.keys = ["088f149f3e8d7a69f3999f0c850f71140168bc18"]

koa.use(
    views(path.join(__dirname, "./views"), {
        extension: "ejs",
    })
)

koa.use(session({ store: new MongooseStore() }, koa))

koa.use(mount("/static", serve("./static")))

koa.use(async (ctx, next) => {
    try {
        await next()
        const status = ctx.status || 404
        if (status === 404) {
            ctx.throw(status)
        }
    } catch (err) {
        ctx.status = err.status || 500
        if(ctx.status != 404) console.error(err)
        if (ctx.status != 200) {
            if (ctx.method == "GET")
                await ctx.render("error", { code: ctx.status, server: "Koa 2.12.0" })
        }
    }
})

koa.use(async (ctx, next) => {
    if (ctx.url.startsWith("/team/") || ctx.url.startsWith("/api/team/")) {
        if (!ctx.session.team) {
            ctx.redirect("/login")
            ctx.throw(403)
            return
        }
        let [team] = await db.team.find({_id:{$eq:ctx.session.team}})
        if(team.archived) {
            console.log(team.archived)
            ctx.redirect("/project/"+ctx.session.team)
            return
        }
    }
    if (ctx.url.startsWith("/admin/") || ctx.url.startsWith("/api/admin/")) {
        if (ctx.session.group != 1) {
            ctx.throw(403)
            return
        }
    }

    await next()
})

koa.use(body({ formidable: { uploadDir: "./uploads" }, multipart: true, urlencoded: true, }))

koa.use(bos.routes)

koa.use(pms.routes)

koa.use(sas.routes)

koa.server = http.createServer(koa.callback())

pms.io(koa)

koa.http = http


koa.server.listen(3000, async (e) => {
    console.log("Koa server run on http://localhost:3000/")
})

