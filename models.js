const mongoose = require('mongoose');
const Schema = mongoose.Schema

mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const userSchema = new Schema({
    account: String,
    name: String,
    avatar: Schema.Types.ObjectId,          //storage._id
    group: Number,          //1:Admin 2:Teacher 3:Student 4:User
    email: String,
    team: Schema.Types.ObjectId,           //team._id
    grade: Number,          //學生才擁有，系級
    link: String,           //個人網站的link
    score: Number
})

const commentSchema = new Schema({
    content: String,
    sender: Schema.Types.ObjectId,         //訊息的傳送者,user._id
    time: Date,             //訊息傳送時間
})

const messageSchema = new Schema({
    type: String,           //1:Text 2:Image
    text: String,
    image: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,         //訊息的傳送者,user.id
    time: Date,             //訊息傳送時間
})

const teamSchema = new Schema({
    name: String,
    grade: Number,          //該組別的系級
    teacher: Schema.Types.ObjectId,        //user._id
    leader: Schema.Types.ObjectId,        //user._id
    poster: Schema.Types.ObjectId,          //storage._id
    report: Schema.Types.ObjectId,          //storage._id
    code: Schema.Types.ObjectId,            //storage._id
    files: [Schema.Types.ObjectId],            //Array of storage._id
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

const backupSchema = mongoose.Schema({
    time: Date,
})

const systemSetSchema = new Schema({
    time: Date,
})

const storageSchema = new Schema({
    filename: String,
})

module.exports = {
    user: mongoose.model('User', userSchema),
    comment: mongoose.model('Comment', commentSchema),
    messages: mongoose.model('Message', messageSchema),
    team: mongoose.model('Team', teamSchema),
    reminder: mongoose.model('Reminder', reminderSchema),
    storage: mongoose.model('Storage', storageSchema),
    backups: mongoose.model('Backup', backupSchema),
    systemSet: mongoose.model('systemSet', systemSetSchema),
}