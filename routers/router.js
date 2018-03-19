var formidable = require('formidable'); // 获取表单数据
var db = require('../models/db');
var md5 = require('../models/md5');
var fs = require('fs');
var moment = require('moment'); // 处理时间
var MongoClient = require('mongodb').MongoClient,
    test = require('assert');

// 首页
exports.showIndex = function (req, res, next) {
    res.render("index");
};

// 访问者地理位置
exports.getAddress = function (req, res, next) {
    // 得到用户填写的东西
    var form = new formidable.IncomingForm();
    var ipAddress = getClientIp(req);

    form.parse(req, function (err, fields, files) {
        var cxipAddress = fields.cxipAddress;
        var cxIsp = fields.cxIsp;
        var cxBrowser = files.cxBrowser;
        var cxOS = files.cxOS;
        var gdIsp = files.gdIsp;

        db.getAllCount("Visitor", function (count) {
            var allCount = count.toString();
            var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 写入数据库
            db.insertOne("Visitor", {
                "ID":parseInt(allCount) + 1,
                "ipAddress":ipAddress,
                "cxipAddress":cxipAddress ? cxipAddress : "查询失败",
                "cxIsp":cxIsp ? cxIsp : "无法定位",
                "cxBrowser": cxBrowser ? cxBrowser : "无法识别浏览器",
                "cxOS" : cxOS ? cxOS : "无法识别系统",
                "gdIsp" : gdIsp ? gdIsp : "无法定位",
                "date" : date
            }, function (err, result) {
                if (err) {
                    console.log("服务器错误" + err);
                    return;
                }
                console.log("有人访问主页了");
                res.send("1");
            });

        });
    });
};

// 获取客户端真是ip
function getClientIp(req) {
    var ipAddress;
    var forwardedIpsStr = req.headers['X-Forwarded-For']; // 判断是否有反向代理头信息
    if (forwardedIpsStr) {
        // 如果反向代理，则将头信息中的第一个地址取出，该地址是真是的客户端IP
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // 如果没有直接获取IP
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}

// 取得文章
exports.getArticle = function (req, res, next) {
    var page = req.query.page;
    db.find("article", {}, {"pageamount" : 10, "page" : page, "sort" : {"date" : -1}}, function (err, result) {
        var obj = {"allResult" : result};
        res.json(obj);
    });
};

// 取得总页数
exports.getAllAmount = function (req, res, next) {
    db.getAllCount("article", function (count) {
        res.send(count.toString());
    });
};

// 文章页面
exports.showArticle = function (req, res, next) {
    console.log(req.query.ID)
    if (req.query.ID == undefined) {
        res.send("想干啥？");
        return;
    }

    var aId = parseInt(req.query.ID);
    db.find("article", {"ID": aId}, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render("article", {
            "allResult" : result[0]
        });
    });
};

// 浏览量
exports.addVisitorNum = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var aId = parseInt(fields.ID);
        db.find("article", {"ID" : aId}, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            var visitNum = result[0].visitNum;
            var ID = result[0].ID;
            db.updateMany("article", {"ID" : ID}, {$set: {"visitNum" : visitNum + 1}}, function (err, results) {
                if (err) {
                    console.log("浏览量数据错误：" + err);
                    return;
                }
                res.send("1");
            });
        });
    });
};

// 点赞数量
exports.addThumbsUp = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var aId = parseInt(fields.ID);
        db.find("article", {"ID": aId}, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            var thumbsUp = result[0].thumbsUp;
            var ID = result[0].ID;
            db.updateMany("article", {"ID" : ID}, {$set:{"thumbsUp" : thumbsUp + 1}}, function (mongoError) {
                if (err) {
                    console.log("点赞数据错误：" + err);
                    return;
                }
                res.send("1");
            });
        });
    });
};

// 前端
exports.web = function (req, res, next) {
    res.render("web");
};
exports.webArticle = function (req, res, next) {
    db.find("article", {"classify":"web"}, {"pageamount":10, "sort":{"date":-1}}, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var obj = {"allResult":result};
        res.json(obj);
    });
};

// 移动端
exports.mobile = function (req, res, next) {
    res.render("mobile");
};
exports.mobileArticle = function (req, res, next) {
    db.find("article", {"classify":"mobile"}, {"pageamount":10, "sort":{"date":-1}}, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var obj = {"allResult":result};
        res.json(obj);
    });
};

// 后端
exports.backend = function (req, res, next) {
    res.render("backend");
};
exports.backendArticle = function (req, res, next) {
    db.find("article", {"classify":"backend"}, {"pageamount":10, "sort":{"date":-1}}, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var obj = {"allResult":result};
        res.json(obj);
    });
};
// 医学杂谈
exports.medicine = function (req, res, next) {
    res.render("medicine");
};
exports.medicineArticle = function (req, res, next) {
    db.find("article", {"classify":"medicine"}, {"pageamount":10, "sort":{"date":-1}}, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var obj = {"allResult":result};
        res.json(obj);
    });
};

// 其他
exports.other = function (req, res, next) {
    res.render("other");
};
exports.otherArticle = function (req, res, next) {
    db.find("article", {"classify":"other"}, {"pageamount":10, "sort":{"date":-1}}, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var obj = {"allResult":result};
        res.json(obj);
    });
};

// 关于
exports.showAbout = function (req, res, next) {
    res.render("about");
}


// 评论
exports.showComments = function (req, res, next) {
    res.render("comment");
};

exports.comment = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var name = fields.name;
        var email = fields.email;
        var content = fields.content;
        db.getAllCount("comment", function (count) {
            var allCount = count.toString();
            var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            db.insertOne("comment", {
                "ID":parseInt(allCount) + 1,
                "name":name,
                "email":email,
                "content":content,
                "date":date
            }, function (mongoError) {
                if (err) {
                    console.log("留言错误" + err);
                    return;
                }
                res.send("1");
            });
        });
    });
};
// 获取评论
exports.getComment = function (req, res, next) {
    var page = req.query.page;
    db.find("comment", {}, {"pageamount" : 10, "page":page, "sort":{"date":-1}}, function (err, result) {
        var obj = {"allResult" : result};
        res.json(obj);
    });
};
// 获取评论数
exports.getAllCountComment = function (req, res, next) {
    db.getAllCount("comment", function (count) {
        res.send(count.toString());
    });
};



// ******************** 后台 ******************
// 登录
exports.showLogin = function (req, res, next) {
    res.render("login");
};
exports.login = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var name = fields.username;
        var password = fields.password;
        if (!name) {
            res.send("-4"); // 用户名为空
            return;
        }
        if (!password) {
            res.send("-5"); // 密码为空
            return;
        }
        password = md5(md5(password).substr(4, 7) + md5(password));
        db.find("user", {"username" : name}, function (err, result) {
            if (err) {
                res.send("-3"); // 服务器错误
                return;
            }
            if (!result.length) {
                res.send("-1"); // 没有此人
                return;
            }
            var dbpassword = result[0].password;
            if (password == dbpassword) {
                req.session.login = "1";
                res.send("1"); // 登录成功
            } else {
                res.send("-2"); // 密码不匹配
            }
        });
    });
};

exports.manage = function (req, res, next) {
    if (req.session.login !== '1') {
        res.redirect("/login");
        return;
    }
    res.render("manage");
};

// 编写页面
exports.showRecording = function (req, res, next) {
    if (req.session.login != "1") {
        res.redirect("/login");
        return;
    }
    res.render("recording");
};

exports.doRecording = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields) {
        db.getAllCount("article", function (count) {
            var allCount = count.toString();
            var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            // 写入数据库
            db.insertOne("article", {
                "ID" : parseInt(allCount) + 1,
                "topic" : fields.topic,
                "publisher" : fields.publisher,
                "classify" : fields.classify,
                "classifyCN" : fields.classifyCN,
                "content" : fields.content,
                "date" : date,
                "thumbsUp" : 0,
                "visitNum" : 0
            }, function (err, result) {
                if (err) {
                    res.send("-1");
                    return;
                }
                res.send("1");
            });
        });
    });
};

exports.delArticle = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var ID = parseInt(fields.ID);
        db.deleteMany("article", {"ID":ID}, function (mongoError) {
            if (mongoError) {
                return;
            }
            res.send("1");
        });
    });
};