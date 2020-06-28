const router = new (require("koa-router"))();
const fetch = require("node-fetch");
const db = require("./db");
const send = require("koa-send");

const client_id =
    "712826989675-rs5ej0evsmp78hsphju6sudhhn3pb38s.apps.googleusercontent.com";
const client_secret = "zlT87D-MtpTF5ltC3w5k2hKN";

router
    .get("/", async (ctx) => {
        ctx.redirect("/intro");
    })
    .get("/intro", async (ctx) => {
        await ctx.render("intro", {
            title: "高雄大學資訊工程學系 畢業專題交流平台",
        });
    })
    .get("/login", async (ctx) => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&redirect_uri=http://localhost:3000/loginCallback&response_type=code&client_id=${client_id}`;
        ctx.redirect(url);
    })
    .get("/index", async (ctx) => {
        await ctx.render("index", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
        });
    })
    .get("/profile", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        let [team] = await db.team.find({ _id: { $eq: user.team } });
        let [professor] = await db.user.find({ _id: { $eq: team.teacher } });

        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
            grade: "避不了業",
            professor: "沒人要你",
            introduction: user.intro ? user.intro : "親~請輸入您的簡介歐~~~",
            canFix: true,
        });
    })
    .get("/profile/:id", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.params.id } });
        await ctx.render("profile", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
            grade: "避不了業",
            professor: "沒人要你",
            introduction: user.intro ? user.intro : "親~請輸入您的簡介歐~~~",
            canFix: false,
        });
    })
    .get("/projects", async (ctx) => {
        let teams = await db.team.find({});
        //資料庫中所有project的資料彙整
        projectData = [];
        for (i in teams) {
            projectName = teams[i].name;
            projectInfo = teams[i].info;
            projectId = teams[i]._id;
            var project = {
                projectName: projectName,
                projectInfo: projectInfo,
                id: projectId,
            };
            projectData.push(project);
        }
        await ctx.render("projects", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
            data: projectData,
        });
    })
    .get("/project/:id", async (ctx) => {
        //切出team id
        projectID = ctx.params.id;
        ctx.params.id;
        let [projectContext] = await db.team.find({ _id: { $eq: projectID } });
        let member = await db.user.find({ team: { $eq: projectID } });
        let memberAccount = []; //學生的學號
        let teachName = ""; //
        let projectInfo = projectContext.info;
        let comments = await db.comment.find({ teamId: projectID });
        let commentSend = [];
        //將資料庫的評論資料換成要顯示的方式
        //評論資料
        for (i in comments) {
            [sender] = await db.user.find({ _id: { $eq: comments[i].sender } });
            senderName = sender.name;
            Acomment = {
                name: senderName,
                time: comments[i].time,
                content: comments[i].content,
                SenderID: comments[i].sender,
                SenderImage: sender.imageLink,
            };
            commentSend.push(Acomment);
        }
        //團隊成員資料
        for (i in member) {
            if (member[i].group == 3) {
                memberAccount.push({
                    account: member[i].account,
                    name: member[i].name,
                });
            } else {
                teachName = member[i].name;
            }
        }
        reward = projectContext.reward;
        if (reward == null) {
            reward = [];
        }
        await ctx.render("project", {
            title: "畢業專題交流平台",
            name: ctx.session.name ? ctx.session.name : "訪客",
            image: ctx.session.image
                ? ctx.session.image
                : "/static/images/favicon_sad.png",
            projectName: projectContext.name,
            member: memberAccount,
            teachName: teachName,
            projectInfo: projectInfo,
            comments: commentSend,
            reward: reward,
        });
    })
    .post("/search", async (ctx) => {
        input = ctx.request.body.searchInput;
        console.log(input);
        result = await db.team.find({ name: new RegExp(input, "g") });
        console.log(result);
        if (result.length == 0) {
            redirect = "/projects";
        } else {
            redirect = "/project/" + result[0]._id;
        }
        ctx.body = {
            result: true,
            redirect: redirect,
        };
    })
    .get("/loginCallback", async (ctx) => {
        let formData = {
            code: ctx.query.code,
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/loginCallback",
        };
        let json = await (
            await fetch("https://www.googleapis.com/oauth2/v4/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: Object.keys(formData)
                    .map((keyName) => {
                        return (
                            encodeURIComponent(keyName) +
                            "=" +
                            encodeURIComponent(formData[keyName])
                        );
                    })
                    .join("&"),
            })
        ).json();
        let googleData = await (
            await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${json.access_token}`
            )
        ).json();
        
        let gender = await fetch(
                `https://www.googleapis.com/auth/user.gender.read?access_token=${json.access_token}`
            )
        let qqq = await gender.text()
        console.log(qqq)
        if (
            googleData.hd === "mail.nuk.edu.tw" ||
            googleData.hd === "go.nuk.edu.tw"
        ) {
            // 確認資料庫
            let account = googleData.email.split("@")[0];
            let [user] = await db.user.find({ account: { $eq: account } });
            if (!user) {
                user = await db.user.new(
                    account,
                    googleData.name,
                    null,
                    null,
                    googleData.email,
                    null,
                    null,
                    null,
                    null,
                    null,
                    googleData.picture
                );
            } else {
                console.log("picture");
                console.log(googleData.picture);
                await db.user.modify(
                    { account: { $eq: account } },
                    { avatar: googleData.picture }
                );
            }
            if (user.group === 1) {
                await db.user.modify({ _id: user._id }, { group: 1 });
                console.log(user);
                ctx.session.login = true;
                ctx.session.id = user._id;
                ctx.session.name = googleData.name;
                ctx.session.team = user.team;
                ctx.session.image = googleData.picture;
                ctx.session.admin = user.group;
                ctx.redirect("/admin");
            } else {
                console.log(user);
                ctx.session.login = true;
                ctx.session.id = user._id;
                ctx.session.name = googleData.name;
                ctx.session.team = user.team;
                ctx.session.image = googleData.picture;
                ctx.redirect("/index");
            }
        } else {
            // 回傳錯誤
            ctx.throw(400);
        }
    })

    .post("/api/profile", async (ctx) => {
        let [user] = await db.user.find({ _id: { $eq: ctx.session.id } });
        await user.update({ intro: ctx.request.body.content });
        ctx.body = {
            result: true,
        };
    })

    .get("/api/storage/:id", async (ctx) => {
        let [res] = await db.storage.find({
            _id: { $eq: ctx.params.id },
        });
        if(res.public == true) await send(ctx, res.path);
        else ctx.throw(403)
    });

module.exports = {
    routes: router.routes(),
};
