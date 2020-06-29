let csv = require("csv")
let fs = require("fs")
let db = require("./db")

fs.readFile("./stu_da.csv",{encoding:"utf8"},(e,d)=>{
    csv.parse(d,{columns: true},async (err,output)=>{
        output.forEach(async element => {
            let [user] = await db.user.find({account:{$eq:element.account.toLowerCase()}})
            if(!user) await db.user.new(element.account.toLowerCase(),element.name,null,4,element.email,null,parseInt(element.account.substr(1,3))+4,null,null,null,element.gender)
            else await user.update({
                email:element.email,
                gender:element.gender
            })
        });
    })
})