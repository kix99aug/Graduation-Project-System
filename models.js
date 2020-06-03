const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/gps", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const studentSchema = mongoose.Schema({
    id: Number,
    name: String,
    email: String,
})

const teacherSchema = mongoose.Schema({
    id: Number,
    name: String,
    email: String,
})

module.exports = {
    student:mongoose.model('Students', studentSchema),
    teacher:mongoose.model('Teachers', teacherSchema),
}