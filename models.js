const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = mongoose.Schema({
    account: String,
    name: String,
    avatar: String,          //storage._id
    group: Number,          //1:Admin 2:Teacher 3:Student 4:User
    email: String,
    team: Number,           //team._id
    grade: Number,          //學生才擁有，系級
    link: String,           //個人網站的link
    score: Number
})

const commentSchema = mongoose.Schema({
    content: String,
    sender: Number,         //訊息的傳送者,user._id
    time: Date,             //訊息傳送時間
})

const messageSchema = mongoose.Schema({
    type: String,           //1:Text 2:Image
    content: String,        //1:Text 2:storage._id
    sender: Number,         //訊息的傳送者,user.id
    time: Date,             //訊息傳送時間
})

const teamSchema = mongoose.Schema({
    name: String,
    grade: Number,          //該組別的系級
    teacher: Number,        //user._id
    leader: Number,        //user._id
    poster: String,          //storage._id
    report: String,          //storage._id
    code: String,            //storage._id
    files: Array,            //Array of storage._id
    info: String,             //專題簡介
    archived: Boolean,        //是否歸檔
    score: Number,            //專題成績
    rank: Number,              //專題名次
    reward: Array            //Array of String
})

const reminderSchema = mongoose.Schema({
    message: String,
    time: Date,             //要提醒user(老師)的時間
})

const backupsSchema = mongoose.Schema({
    time: Date,
})

const systemSetSchema = mongoose.Schema({
    time: Date,
})

const storageSchema = mongoose.Schema({
    filename: String,
})

module.exports = {
    user: mongoose.model('Users', userSchema),
    comment: mongoose.model('Comments', commentSchema),
    messages: mongoose.model('Messages', messageSchema),
    team: mongoose.model('Teams', teamSchema),
    reminder: mongoose.model('Reminders', reminderSchema),
    storage: mongoose.model('Storages', storageSchema),
    backups: mongoose.model('Backups', backupSchema),
    systemSet: mongoose.model('systemSet', systemSetSchema),
}
