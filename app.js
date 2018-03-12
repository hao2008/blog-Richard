var express = require('express');
var app = express();
var router = require('./routers/router');
var path = require('path');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ueditor = require('ueditor');
var session = require('express-session');

app.listen(3000, function () {
    console.log('server has started and listening port is 3000');
});

app.use(session({
    secret:'abc',
    resave:false,
    saveUninitialized:true
}));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.use('libs/ueditor/ue', ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    // 上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var imgname = req.ueditor.filename;
        var img_url = '/upload';
        req.ue_up(img_url); // 只需输入要保存的地址
    } else if (req.query.action === 'listimage') {
        // 图片列表请求
        var dir_url = '/upload';
        res.ue_list(dir_url); // 列出dir_url目录下的所有图片
    } else {
        // 其他请求
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/libs/ueditor/nodejs/config.json');
    }
}));
// 模板引擎
app.set("view engine", "ejs");

// 首页
app.get("/", router.showIndex);
// 编写页面
app.get("/recording", router.showRecording);
// 执行保存
app.post("/doRecording", router.doRecording);
// 取得文章
app.post("/getArticle", router.getArticle);
// 取得文章页数
app.post("/getAllAmount", router.getAllAmount);
// 文章页面
app.get("/article", router.showArticle);
// 获取用户地理位置
app.post("/getAddress", router.getAddress);
// 浏览量
app.post("/addVisitorNum", router.addVisitorNum);
// 点赞数
app.post("/addThumbsUp", router.addThumbsUp);

// 分类文章
app.get("/JavaScript", router.showJavaScript);
app.post("/getJavaScript", router.getJavaScript);
app.get("/NodeJS", router.showNodeJS);
app.post("/getNodeJS", router.getNodeJS);
app.get("/Environment", router.showEnvironment);
app.post("/getEnvironment", router.getEnvironment);
app.get("/about", router.showAbout);

// 留言
app.get("/comment", router.showComments);
app.post("/doComment", router.comment);
app.post("/getComment", router.getComment);
app.post("/getAllCountComment", router.getAllCountComment);