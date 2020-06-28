const router = new (require('koa-router'))();
const db = require("./db");

router
    .get('/admin', async ctx => {
        ctx.redirect('/admin/index');
    })
    .get('/admin/editPI', async (ctx) => {
        await ctx.render('admin/editingProjectInfo', {
            title: '畢業專題交流平台',
            subtitle: '管理專題 & 團隊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
        });
    })
    .get('/admin/editPF', async (ctx) => {
        await ctx.render('admin/editingProjectFiles', {
            title: '畢業專題交流平台',
            subtitle: '管理專題 & 團隊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
        });
    })
    .get('/admin/accountM', async (ctx) => {
        await ctx.render('admin/accountManagement', {
            title: '畢業專題交流平台',
            subtitle: '管理使用者',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
        });
    })
    .get('/admin/editAC', async (ctx) => {
        await ctx.render('admin/editingAccount', {
            title: '畢業專題交流平台',
            subtitle: '管理使用者',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
        });
    })
    .get('/admin/timeSetting', async ctx => {
        if ((await db.systemSet.find()).length == 0) {
            await db.systemSet.new(null);
        }
        let [timeset] = await db.systemSet.find({})
        let backUpData = await db.backup.find({})
        let sendBackUpData = []
        for (i in backUpData) {
            sendBackUpData.push(backUpData[i].time)
        }
        console.log(timeset)
        await ctx.render('admin/time', {
            title: '畢業專題交流平台',
            subtitle: '系統時程設定',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
            recordtime: ctx.session.recordtime ? ctx.session.recordtime : '109/06/09',
            year: timeset.year ? timeset.year : '00',
            month: timeset.month ? timeset.month : '00',
            day: timeset.day ? timeset.day : '00',
            data: sendBackUpData
        })
    })
    .get('/admin/index', async ctx => {
        await ctx.render('admin/index', {
            title: '畢業專題交流平台',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png'
        })
    })
    .get('/admin/managePT', async ctx => {
        let ptList = await db.team.find({});
        await ctx.render('admin/projectAndteamManagement', {
            title: '畢業專題交流平台',
            subtitle: '管理專題 & 團隊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            ptItems: ptList,
        })
    })
    .get('/admin/editPI/:id', async ctx => {
        let [team] = await db.team.find({ '_id': { '$eq': ctx.params.id } })
        let [user] = await db.user.find({ '_id': { '$eq': team.leader } })
        let [teacher] = await db.user.find({ '_id': { '$eq': team.teacher } })
        let members = await db.user.find({ '$and': [{ 'team': { '$eq': ctx.params.id } }, { '_id': { '$nin': teacher._id } }, { '_id': { '$nin': user._id } }] })
        await ctx.render('admin/editingProjectInfo', {
            title: '畢業專題交流平台',
            subtitle: '管理專題 & 團隊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            projectName: team.name,
            leaderAccount: user.account,
            memberAccount: members,
            teacherName: teacher.name,
            projectInfo: team.info,
            teamId: ctx.params.id,
            result:true
        })
    })
    .get('/admin/editPF/:id', async ctx => {
        let files = await db.storage.find({ 'owner': { '$eq': ctx.params.id } }, 'filename') //array of storage._id
        await ctx.render('admin/editingProjectFiles', {
            title: '畢業專題交流平台',
            subtitle: '管理專題 & 團隊',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            teamId: ctx.params.id,
            files: files
        })
    })

    .delete('/api/admin/team/storage/:id', async (ctx) => {
        let [res] = await db.storage.find({
            _id: { $eq: ctx.params.id }
        });
        console.log(res)
        unlink('./' + res.path, (e) => { });
        await res.deleteOne();
        ctx.status = 200;
    })
    .get('/admin/users', async ctx => {
        await ctx.render('admin/accountManagement', {
            title: '畢業專題交流平台',
            subtitle: '管理使用者',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png'
        })
    })
    .get('/admin/user/edit/:id', async ctx => {
        let [user] = await db.user.find({ _id: { '$eq': ctx.params.id } })
        await ctx.render('admin/editingAccount', {
            title: '畢業專題交流平台',
            subtitle: '管理使用者',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            user: user
        })
    })
    .post('/admin/user/edit/:id', async ctx => {
        let [user] = await db.user.find({ _id: { '$eq': ctx.params.id } })
        await user.update(ctx.request.body)
        await ctx.render('admin/editingAccount', {
            title: '畢業專題交流平台',
            subtitle: '管理使用者',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image ? ctx.session.image : '/static/images/favicon_sad.png',
            user: ctx.request.body
        })
    })

    .post('/api/admin/newTeam', async function (ctx) {
        let [teacher] = await db.user.find({
            name: { $eq: ctx.request.body.teacher },
        });
        let [leader] = await db.user.find({
            account: { $eq: ctx.request.body.members[0] },
        });
        if (!teacher || !leader) ctx.body = { result: false };
        else {
            await db.team
                .new(ctx.request.body.name, 109, teacher._id, leader._id, null, null, null, null, null, null, null, 4, null)
                .then(async (res) => {
                    db.user.modify({ _id: teacher._id }, { team: res._id });
                    db.user.modify({ _id: leader._id }, { team: res._id });
                    for (var i = 1; i < ctx.request.body.members.length; i++) {
                        let member = await db.user.find({
                            account: { $eq: ctx.request.body.members[i] },
                        });
                        db.user.modify({ _id: member[0]._id }, { team: res._id });
                    }
                });
            ctx.body = {
                result: true,
            };
        }
    })
    //admin
    .put('/api/admin/user', async (ctx) => {
        let res = await db.user.new(
            ctx.request.body
        );
        ctx.body = {
            result: true,
            id: res._id,
        };
    })

    .put('/api/admin/projectTeam', async (ctx) => {
        let res = await db.team.new(
            ctx.request.body
        );
        ctx.body = {
            result: true,
            id: res._id,
        };
    })
    .delete('/api/admin/projectTeam/:id', async function (ctx) {
        let res = await db.team.remove({ _id: { '$eq': ctx.params.id } })
        let member=await db.user.find({ team: { '$eq': ctx.params.id } })
        for(i in member){
            await db.user.modify({ team: { '$eq': ctx.params.id }},{team:null} )
        }
        ctx.status = res > 0 ? 200 : 204
        ctx.body = {
            result: res > 0
        }
    })
    .delete('/api/admin/user/:id', async function (ctx) {
        let res = await db.user.remove({ _id: { '$eq': ctx.params.id } })
        ctx.status = res > 0 ? 200 : 204
        ctx.body = {
            result: res > 0
        }
    })
    .get('/api/admin/users', async function (ctx) {
        let users = await db.user.find({}, 'account name')
        ctx.body = users
    })

    .post('/api/admin/backupTimeSetting', async function (ctx) {
        if ((await db.systemSet.find()).length == 0) {
            await db.systemSet.new(null);
        }
        let [timeSet] = await db.systemSet.find({})
        console.log('0000000000000000000.0000' + ctx.request.body.year)
        await timeSet.update({ 'year': ctx.request.body.year })
        await timeSet.update({ 'month': ctx.request.body.month })
        await timeSet.update({ 'day': ctx.request.body.day })
        ctx.body = {
            result: true
        }
    })

    .post('/api/admin/projecTimeSetting', async function (ctx) {
        await db.backup.new(Date(ctx.request.body.date))
        console.log(' 有new 了喔')
        let lastestBack = await db.backup.find({})
        let backupLength = (await db.backup.find({})).length
        ctx.body = {
            result: true
        }
    })

    .post('/api/admin/reminderTimeSetting', async function (ctx) {
        let date = new Date(ctx.request.body.date)
        let message = "導師繳交期限於 " + date.getFullYear() + " 年 " 
                    + (date.getMonth()+1) + " 月 " 
                    + date.getDate() + " 日 ! <br>記得繳交喔~";
        await db.reminder.new(message,new Date(ctx.request.body.date))
        ctx.body = {
            result: true
        }
    })
    //admin
    .post('/api/admin/ptList', async function (ctx) {
        let ptList = await db.team.find();
        ctx.body = {
            result: ptList,
        };
    })
    .post('/api/admin/editPI/:id', async function (ctx) {
        let members = await db.user.find({ team: { $eq: ctx.params.id }, group: { $eq: 3 } })
        let userToDelete = []
        console.log(ctx.request.body.mas)
        members.forEach(ele => {
            if (ctx.request.body.mas.indexOf(ele.account) == -1) userToDelete.push(ele)
        })
        for (let i = 0; i < userToDelete.length; i++) {
            await userToDelete[i].update({ team: null })
        }
        for (let i = 0; i < ctx.request.body.mas.length; i++) {
            await db.user.modify({ account: { $eq: ctx.request.body.mas[i] } }, { team: ctx.params.id })
        }
        let [team] = await db.team.find({ '_id': { '$eq': ctx.params.id } })
        let [leader] = await db.user.find({ '_id': { '$eq': team.leader } })
        let [teacher] = await db.user.find({ '_id': { '$eq': team.teacher } })
        await team.update({ 'name': ctx.request.body.pN, 'info': ctx.request.body.pI, 'leader': leader._id, teacher: teacher._id })
        ctx.body = {
            result: true
        }
    })
    .delete('/api/admin/editPI/:id', async (ctx) => {
        let [res] = await db.user.find({
            account: { $eq: ctx.params.id },
        });
        console.log(res)
        // let [res] = await db.user.find({
        //     _id: { $eq: ctx.params.id },
        // });
        // unlink('./' + res.path, (e) => { });
        // await res.deleteOne();
        // ctx.status = 200;
    })

    module.exports = {
        routes:router.routes()
    }
