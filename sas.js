const router = new (require('koa-router'))();
const db = require("./db");
const exec = require('child_process').exec;
const nodemailer = require('nodemailer');
const credentials = require("./credentials")

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
        let timeset = await db.systemSet.find({})
        let routine = await db.routine.find({})
        let reminder = await db.reminder.find({})
        let backup = await db.backup.find({})
        let lastreminder
        if (reminder.length != 0) lastreminder = reminder[reminder.length - 1].time
        let lastbackup
        if (backup.length != 0) lastbackup = backup[backup.length - 1].time
        let lastroutine = routine[routine.length - 1]
        let lastest = timeset[timeset.length - 1]
        let nextBackupDay = new Date()
        nextBackupDay.setTime(lastest.date.getTime() + lastroutine.time * 24 * 3600 * 1000)
        await ctx.render('admin/time', {
            title: '畢業專題交流平台',
            subtitle: '系統時程設定',
            name: ctx.session.name ? ctx.session.name : '訪客',
            image: ctx.session.image
                ? ctx.session.image
                : '/static/images/favicon_sad.png',
            routine: lastroutine.time,
            nextBackupDay: nextBackupDay,
            data: timeset,
            reminder: lastreminder ? lastreminder : "",
            dateArchive: lastbackup ? lastbackup : ""
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
            grade: team.grade,
            teamId: ctx.params.id,
            result: true
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
        let member = await db.user.find({ team: { '$eq': ctx.params.id } })
        for (i in member) {
            await db.user.modify({ team: { '$eq': ctx.params.id } }, { team: null })
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
    .post('/api/admin/projecTimeSetting', async function (ctx) {
        await db.backup.new(new Date(ctx.request.body.date))
        ctx.body = {
            result: true
        }
    })

    .post('/api/admin/backupTimeSetting', async function (ctx) {
        let routine = parseInt(ctx.request.body.routine)
        await db.routine.new(routine)
        let history = await db.systemSet.find({})
        let today = new Date()
        let nextBackupDay = history[history.length - 1]
        if ((today.getTime() - nextBackupDay.date.getTime()) / 1000 / 3600 / 24 > routine) {
            nextBackupDay = await backup()
        }
        nextBackupDay = nextBackupDay.date
        nextBackupDay.setDate(nextBackupDay.getDate() + routine)
        console.log(nextBackupDay)
        ctx.body = {
            result: true,
            nextBackupDay: nextBackupDay
        }
    })

    .post('/api/admin/reminderTimeSetting', async function (ctx) {
        let date = new Date(ctx.request.body.date)
        let message = "導師繳交期限於 " + date.getFullYear() + " 年 "
            + (date.getMonth() + 1) + " 月 "
            + date.getDate() + " 日 ! \n記得繳交喔~";
        await db.reminder.new(message, new Date(ctx.request.body.date))
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
        await team.update({ 'name': ctx.request.body.pN, 'info': ctx.request.body.pI, 'grade': ctx.request.body.grade, 'leader': leader._id, teacher: teacher._id })

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
    .delete('/api/admin/time/deleteBackUp/:id', async function (ctx) {

        let res = await db.backup.remove({ _id: { '$eq': ctx.params.id } })
        ctx.status = res > 0 ? 200 : 204
        ctx.body = {
            result: res > 0
        }
    })

async function backup() {
    var { stdout, stderr } = await exec(`mongodump -d gps -o ./backups/${new Date().toLocaleDateString().replace(new RegExp("/", "g"), "-")}`)
    return db.systemSet.new(new Date())
}

async function check() {
    //backup
    let timeset = await db.systemSet.find({})
    let routine = await db.routine.find({})
    if (routine.length == 0) routine = [await db.routine.new(7)]
    if (timeset.length == 0) timeset = [await backup()]
    let lastroutine = routine[routine.length - 1]
    let lastest = timeset[timeset.length - 1]

    if ((new Date().getTime() - lastest.date.getTime()) / 1000 / 3600 / 24 > parseInt(lastroutine.time)) {
        await backup()
    }

    //archive
    let backups = await db.backup.find({})

    if (backups.length != 0) {
        let lastbackup = backups[backups.length - 1].time
        if ((lastbackup.getTime() - new Date().getTime()) < 0) {
            backups[0].db.dropCollection("backups")
            let teams = await db.team.find({ grade: { $eq: parseInt(new Date().getFullYear() - 1911 + 1) } })
            teams.forEach(async ele => {
                console.log(ele)
                await ele.update({ archived: true })
            })
        }
    }

    //sendmail
    var valid = await db.reminder.find({});
    if (valid.length != 0) {
        var today = new Date();
        var notify = new Date();
        var email_arr = [];
        var remind = await db.reminder.find({})
        notify = remind[remind.length - 1].time;
        let message = remind[remind.length - 1].message;
        let emails = await db.user.find({ "group": { $eq: 2 } }) //teachers
        for (var i = 0; i < emails.length; i++) {
            if (emails[i].email == null) {
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
        if (today.getFullYear() === notify.getFullYear() &&
            (today.getMonth() + 1) === (notify.getMonth() + 1) &&
            today.getDate() === (notify.getDate() - 7)) {
            let mailOptions = {
                from: "a1065510@mail.nuk.edu.tw", // sender address 
                subject: "導師文件繳交期限提醒", // Subject line 
                html: message + "test for 軟工", // plaintext body 
                to: email_arr
            }

            // send mail with defined transport object 
            smtpTransport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    }
}

check()
setInterval(check, 300000)

module.exports = {
    routes: router.routes()
}
