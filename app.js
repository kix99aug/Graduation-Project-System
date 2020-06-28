const socketIO = require("socket.io")
const path = require("path")
const views = require("koa-views")
const serve = require("koa-static")
const mount = require("koa-mount")
const session = require("koa-session")
const bodyParser = require("koa-body")
const http = require("http")
const koa = new (require("koa"))()
const bos = require("./bos")
const pms = require("./pms")
const sas = require("./sas")
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
        console.error(err)
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
    }
    if (ctx.url.startsWith("/admin/") || ctx.url.startsWith("/api/admin/")) {
        if (ctx.session.admin != 1) {
            ctx.throw(403)
            return
        }
    }

    await next()
})

koa.use(bodyParser({
    formidable: { uploadDir: "./uploads" }, //This is where the files would come
    multipart: true,
    urlencoded: true,
}))

koa.use(bos)

koa.use(pms)

koa.use(sas)

const server = http.createServer(koa.callback())

koa.io = socketIO(server, {})

koa.io.use(async (socket, next) => {
    let error = null
    try {
        let ctx = koa.createContext(socket.request, new http.OutgoingMessage())
        await ctx.session._sessCtx.initFromExternal()
        socket.session = ctx.session
    } catch (err) {
        error = err
    }
    return next(error)
})

koa.io.on("connection", (client) => {
    client.join(client.session.team)
    client.room = client.session.team
    koa.io.in(client.room).emit("userin", {
        id: client.session.id,
        name: client.session.name,
    })
    client.on("message", async function (message) {
        koa.io.in(client.room).emit("message", {
            id: client.session.id,
            picture: client.session.image,
            name: client.session.name,
            message: message,
        })
    })
    client.on("disconnect", async function () {
        koa.io.in(client.room).emit("userout", {
            id: client.session.id,
            name: client.session.name,
        })
    })
})

server.listen(3000, async (e) => {
    //   db.user.modify({"name":"潘彥霖"},{"group":1})
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
    //db.backup.new(new Data())
    console.log("Koa server run on http://localhost:3000/")
})
