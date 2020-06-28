const socketIO = require("socket.io")
const router = new (require('koa-router'))();
const db = require("./db");
const http = require("http")
const send = require("koa-send");
const { unlink } = require("fs");

let notes = {
    1: { x: 0.1, y: 0.1, content: "123" },
    2: { x: 0.2, y: 0.2, content: "123" },
    3: { x: 0.3, y: 0.3, content: "123" },
    4: { x: 0.4, y: 0.4, content: "123" },
}

router
    .get('/team', async ctx => {
        ctx.redirect('/team/schedule')
    })
    .get('/team/schedule', async ctx => {
        await ctx.render('team/schedule', {
            title: '畢業專題交流平台',
            subtitle: '行程表',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png'
        })
    })
    .get('/team/storage', async ctx => {
        await ctx.render('team/storage', {
            title: '畢業專題交流平台',
            subtitle: '檔案上傳',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png'
        })
    })
    .get('/team/blackboard', async ctx => {
        await ctx.render('team/blackboard', {
            title: '畢業專題交流平台',
            subtitle: '留言板',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png'
        })
    })
    .get('/team/judge', async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let [team] = await db.team.find({ _id: { $eq: user.team } });
        let [teamMate] = await db.user.find({ team: team._id });
        await ctx.render('team/judge', {
            title: '畢業專題交流平台',
            subtitle: '專題評分',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
            teamGrade: team.score ? team.score : '尚未評',
        });
    })
    .get('/team/info', async ctx => {
        let [user] = await db.user.find({ '_id': { '$eq': ctx.session.id } })
        let [team] = await db.team.find({ '_id': { '$eq': user.team } })
        await ctx.render('team/info', {
            title: '畢業專題交流平台',
            subtitle: '專題資訊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            teamMateName: ctx.session.teamMateName ? ctx.session.teamMateName : '黃翰俞',
            guideTeacherName: ctx.session.guideTeacherName ? ctx.session.guideTeacherName : '張寶榮',
            projectName: team.name ? team.name : '親~為你們的組別命個名麻~',
            info: team.info ? team.info : '親~~說明一下你們的專題介紹啦~啾咪',
        })
    })
    .get('/team/conference', async ctx => {
        await ctx.render('team/conference', {
            title: '畢業專題交流平台',
            subtitle: '線上會議',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            id: ctx.session.id,
            teamMateName: ctx.session.teamMateName ? ctx.session.teamMateName : '黃翰俞',
            guideTeacherName: ctx.session.guideTeacherName ? ctx.session.guideTeacherName : '???',
            teamid:ctx.session.team?ctx.session.team:"null"
        })
    })
    .post('/api/team/conference/text' , async ctx =>{
        let res = await db.conference.new(
            ctx.request.body.teamid,
            ctx.request.body.sender,
            ctx.request.body.time,
            ctx.request.body.text,
        );
        ctx.body = {
            result: true,
        };
    })
    
    // apis
    .delete('/api/team/storage/:id', async (ctx) => {
        let [res] = await db.storage.find({
            owner: { $eq: ctx.session.team },
            _id: { $eq: ctx.params.id },
        });
        unlink('./' + res.path, (e) => { });
        await res.deleteOne();
        ctx.status = 200;
    })
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
    .post('/api/team/blackboard/new', async ctx => {
        let newKey = parseInt(Math.random() * Number.MAX_SAFE_INTEGER)
        notes[newKey] = ctx.request.body
        ctx.body = {
            result: true,
            id: newKey
        }
    })
    .post('/api/team/blackboard/modify/:id', async ctx => {
        notes[ctx.params.id] = ctx.request.body
        ctx.body = {
            result: true
        }
    })
    .post('/api/team/info', async ctx => {
        let [user] = await db.user.find({ '_id': { '$eq': ctx.session.id } })
        let [team] = await db.team.find({ '_id': { '$eq': user.team } })
        let teamMate = await db.user.find({ 'team': { '$eq': user.team } })
        await team.update({ 'info': ctx.request.body.info })
        await team.update({ 'name': ctx.request.body.projectName })
        ctx.body = {
            result: true,
            teamMate: teamMate,
        }
    })
    .get('/api/team/storage', async (ctx) => {
        let res = await db.storage.find({ owner: { $eq: ctx.session.team } });
        let ans = res.map((x) => Object({ id: x._id, filename: x.filename }));
        ctx.body = ans;
    })
    .get('/api/team/storage/:id', async (ctx) => {
        let [res] = await db.storage.find({
            owner: { $eq: ctx.session.team },
            _id: { $eq: ctx.params.id },
        });
        //console.log(res);
        await send(ctx, res.path);
    })
    .put('/api/team/storage', async (ctx) => {
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
    .get('/api/team/info_2', async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });
        ctx.body = {
            result: true,
            teamMate: teamMate,
        };
    })
    .get('/api/team/judge', async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let teamMate = await db.user.find({ team: { $eq: user.team } });

        ctx.body = {
            result: true,
            group: user.group,
            teamMate: teamMate,
        };
    })
    .post('/api/team/judge/score', async (ctx) => {
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
    .post('/api/team/AllSchedule', async ctx => {
        //console.log(ctx.request.body)
        let [user] = await db.user.find({ '_id': { '$eq': ctx.session.id } })
        let eventList = await db.schedule.find({ 'teamId': { '$eq': user.team } })
        ctx.body = {
            result: true,
            AllEvent: eventList
        }
    })
    .post('/api/team/newSchedule', async ctx => {
        let [user] = await db.user.find({ '_id': { '$eq': ctx.session.id } })
        data = ctx.request.body
        let Sid
        await db.schedule.new(user.team, data.Name, data.Year, data.Month, data.Day).then(res => {
            Sid = res._id
        })
        ctx.body = {
            result: true,
            'id': Sid
        }
    })
    .post('/api/team/deleteSchedule', async ctx => {
        //console.log(ctx.request.body)
        deleteData = ctx.request.body
        for (i in deleteData) {
            await db.schedule.remove({ '_id': deleteData[i] })
        }
        ctx.body = {
            result: true,
        }
    })

    .post('/api/team/discuss', async ctx => {
        data = ctx.request.body
        //console.log(data.content,ctx.session.id,new Date(),data.teamId)
        await db.comment.new(data.content, ctx.session.id, new Date(), data.teamId)
        ctx.body = {
            result: true,
        }
    })

function io(server,koa) {
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
    
}

module.exports = {
    routes: router.routes(),
    io:io
}
