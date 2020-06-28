const nodemailer = require('nodemailer');
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
const credentials = require("./credentials")
const db = require("./db")
const MongooseStore = require("koa-session-mongoose")

async function sendEmail(){
    var valid = await db.reminder.find({});
    if( valid.length != 0 ){
        var today = new Date();
        var notify = new Date();
        var email_arr = [];
        var remind = await db.reminder.find({})
        notify = remind[remind.length-1].time;
        let message = remind[remind.length-1].message;
        let emails = await db.user.find({"group":{$eq:2}}) //teachers
        for(var i =0;i<emails.length;i++){
            if(emails[i].email == null){
                continue;
            }
            else email_arr.push(emails[i].email);
        }
        var smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: credentials.gmail.user, // generated gmail user
                pass: credentials.gmail.pass // generated gmail account password
            }
        });
        if(today.getFullYear() === notify.getFullYear() &&
            (today.getMonth()+1) === (notify.getMonth()+1) &&
            today.getDate() === (notify.getDate()-7)){
            let mailOptions = { 
                from: "a1065510@mail.nuk.edu.tw", // sender address 
                subject: "導師文件繳交期限提醒", // Subject line 
                html: message+"test for 軟工", // plaintext body 
                to: email_arr
            } 

            // send mail with defined transport object 
            smtpTransport.sendMail(mailOptions, (error, info)=>{ 
                if (error) { 
                 return console.log(error); 
                } 
                console.log('Message %s sent: %s', info.messageId, info.response); 
            }); 
        }
    }
}

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
    }
    if (ctx.url.startsWith("/admin/") || ctx.url.startsWith("/api/admin/")) {
        if (ctx.session.admin != 1) {
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
    sendEmail();

    console.log("Koa server run on http://localhost:3000/")
})

setInterval(sendEmail,1000*60*60*24)

