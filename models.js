const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = mongoose.Schema({
    t_flag: Boolean,
    u_id: Number,
    name: String,
    email: String,
    t_id: Number,       //所屬的 team 的 id

    d_level: Number,    //學生才擁有，系級

    pro_link: String,   //老師才擁有，自介的link
})

const commentSchema = mongoose.Schema({
    m_id: Number,
    message: String,
    c_name: String,     //訊息的傳送者
})

const communicationSchema = mongoose.Schema({
    m_id: Number,
    message: String,
    c_name: String,     //訊息的傳送者
    p_link: String,     //圖片連結
    time: String,       //訊息傳送時間
})

const teamSchema = mongoose.Schema({
    t_id: Number,
    g_teacher_name: String, //指導老師的名字
    d_level: Number,        //該組別的系級
    work_info: String,      //該組別之作品編碼
})

const remind_mailSchema = mongoose.Schema({
    m_id: Number,
    message: String,
    time: String,     //要提醒user(老師)的時間
})

module.exports = {
    user:mongoose.model('Users', userSchema),
    comment:mongoose.model('Comments', commentSchema),
    communication:mongoose.model('Communications', communicationSchema),
    team:mongoose.model('Teams', teamSchema),
    remind_mail:mongoose.model('Remind_mails', remind_mailSchema),
}