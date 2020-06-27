const mongoose = require('mongoose');
const Models = require("./models")

mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

let user = {
    new: async function (account, name, avatar, group, email, team, grade, link, score, intro) {
        let model = new Models.user({
            account: account,
            name: name,
            avatar: null,          //storage._id
            group: group,          //1:Admin 2:Teacher 3:Student 4:User
            email: email,
            team: null,           //team._id
            grade: grade,          //學生才擁有，系級
            link: link,           //個人網站的link
            score: score,
            intro: intro,
        })
        return model.save()
    },
    find: async function (obj, col) {
        let query
        if (col) query = await Models.user.find(obj, col)
        else query = await Models.user.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.user.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.user.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let comment = {
    new:async function(content,sender,time,teamId){
        let model = new Models.comment({
            content:content,
            sender:sender,
            time:time,
            teamId:teamId
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.comment.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.comment.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.comment.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let message = {
    new: async function (type, text, image, sender, time) {
        let model = new Models.message({
            type: type,
            text: text,
            image: image,
            sender: sender,
            time: time,
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.message.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.message.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.message.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let team = {
    new: async function (name, grade, teacher, leader, poster, report, code, files, info, archived, score, rank, reward) {
        let model = new Models.team({
            name: name,             //專題名稱
            grade: grade,          //該組別的系級
            teacher: teacher,        //user._id
            leader: leader,        //user._id
            poster: poster,          //storage._id
            report: report,          //storage._id
            code: code,            //storage._id
            files: files,            //Array of storage._id
            info: info,             //專題簡介
            archived: archived,        //是否歸檔
            score: score,            //專題成績
            rank: rank,              //專題名次
            reward: reward
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.team.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.team.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.team.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let reminder = {
    new: async function (filename, path, owner) {
        let model = new Models.reminder({
            filename: filename,
            path: path,
            owner: owner
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.reminder.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.reminder.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.reminder.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let backup = {
    new: async function (time) {
        let model = new Models.storage({
            time: time
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.storage.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.backup.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.backup.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let storage = {
    new: async function (filename, path, owner) {
        let model = new Models.storage({
            filename: filename,
            path: path,
            owner: owner
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.storage.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.storage.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.storage.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    }
}

let systemSet = {
    new:async function(time){
        let model = new Models.systemSet({
            time:time
        })
        return model.save()
    },
    find:async function(obj){
        let query = await Models.systemSet.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.systemSet.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.systemSet.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
}
let schedule = {
    new: async function (teamId, name, year, month, day) {
        let model = new Models.schedule({
            teamId: teamId,
            name: name,
            year: year,
            month: month,
            day: day,
        })
        return model.save()
    },
    find: async function (obj) {
        let query = await Models.schedule.find(obj)
        return query
    },
    modify: async function (objWhere, objUpdate) {
        Models.schedule.update(objWhere, objUpdate, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
    remove: async function (objWhere) {
        Models.schedule.remove(objWhere, function (err, res) {
            if (err) console.error(err)
            else console.log(res)
        })
    },
}

module.exports = {
    user: user,
    team: team,
    storage: storage,
    comment: comment,
    message: message,
    reminder: reminder,
    backup: backup,
    systemSet: systemSet,
    schedule: schedule,
}
