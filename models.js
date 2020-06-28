const Schema = require('mongoose').Schema
const model = require('mongoose').model

const userSchema = new Schema({
    account: String,
    name: String,
    avatar: { type: Schema.Types.ObjectId, ref: "Storage" },          //storage._id
    group: Number,          //1:Admin 2:Teacher 3:Student 4:User
    email: String,
    team: { type: Schema.Types.ObjectId, ref: "Team" },           //team._id
    grade: Number,          //學生才擁有，系級
    link: String,           //個人網站的link
    score: Number,
    intro: String,
})

const commentSchema = new Schema({
    content: String,
    sender: { type: Schema.Types.ObjectId, ref: "User" },         //訊息的傳送者,user._id
    time: Date,//訊息傳送時間
    teamId: Schema.Types.ObjectId,
})

const messageSchema = new Schema({
    type: String,           //1:Text 2:Image
    text: String,
    image: { type: Schema.Types.ObjectId, ref: "Storage" },
    sender: { type: Schema.Types.ObjectId, ref: "User" },         //訊息的傳送者,user.id
    time: Date,             //訊息傳送時間
})

const teamSchema = new Schema({
    name: String,
    grade: Number,          //該組別的系級
    teacher: { type: Schema.Types.ObjectId, ref: "User" },        //user._id
    leader: { type: Schema.Types.ObjectId, ref: "User" },        //user._id
    poster: { type: Schema.Types.ObjectId, ref: "Storage" },          //storage._id
    report: { type: Schema.Types.ObjectId, ref: "Storage" },          //storage._id
    code: { type: Schema.Types.ObjectId, ref: "Storage" },            //storage._id
    files: [{ type: Schema.Types.ObjectId, ref: "Storage" }],            //Array of storage._id
    info: String,             //專題簡介
    archived: Boolean,        //是否歸檔
    score: Number,            //專題成績
    rank: Number,              //專題名次
    reward: [String],            //Array of String
})

const reminderSchema = new Schema({
    message: String,
    time: Date,             //要提醒user(老師)的時間
})

const backupSchema = Schema({
    time: Date,
})

const systemSetSchema = new Schema({
    time: Date,
})

const storageSchema = new Schema({
    filename: String,
    path: String,
    owner: Schema.Types.ObjectId,          //team._id
})

const scheduleSchema = new Schema({
    teamId: Schema.Types.ObjectId,
    name: String,
    year: Number,
    month: Number,
    day: Number,
})

const blackboardSchema = new Schema({
    content: String,
    x: Number,
    y: Number,
    owner: Schema.Types.ObjectId,          //team._id
})
module.exports = {
    user: model('User', userSchema),
    comment: model('Comment', commentSchema),
    messages: model('Message', messageSchema),
    team: model('Team', teamSchema),
    reminder: model('Reminder', reminderSchema),
    storage: model('Storage', storageSchema),
    backup: model('Backup', backupSchema),
    systemSet: model('systemSet', systemSetSchema),
    schedule: model('schedule', scheduleSchema),
    blackboard: model('blackboard', blackboardSchema),
}