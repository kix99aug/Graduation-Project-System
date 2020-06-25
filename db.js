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
    new:async function(account,name,avatar,group,email,team,grade,link,score){
        let model = new Models.user({
            account: account,
            name: name,
            avatar: null,          //storage._id
            group: group,          //1:Admin 2:Teacher 3:Student 4:User
            email: email,
            team: null,           //team._id
            grade: grade,          //學生才擁有，系級
            link: link,           //個人網站的link
            score: score
        })
        return model.save()
    },
    find:async function(obj){
        return Models.user.find(obj)
    },
    modify:async function(u_id,objUpdate){
            Models.user.findByIdAndUpdate(u_id,objUpdate,function(err,res){
            if(err) console.error(err)
            else console.log(res)
            })
    },
}

let team = {
    new:async function(name,grade,teacher,leader,poster,report,code,files,info,archived,score,rank,reward){
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
    find:async function(obj){
        let query = await Models.team.find(obj)
        return query
    }
}

module.exports = {
    user:user,
    team:team,
}
