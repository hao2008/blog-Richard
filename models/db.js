var MongoClient = require('mongodb').MongoClient;
var settings = require('./setting');

function _connectDB(callback) {
    var url = settings.dburl;
    // 连接数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('**** mongodb has connected' + settings.dburl);
        callback(err, db);
    });
}

// 插入数据
exports.insertOne = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).insertOne(json, function (err, result) {
            callback(err, result);
            db.close();
        })
    })
};

// 查找数据
exports.find = function (collectionName, json, C, D) {
    var result = [];
    if (arguments.length == 3) {
        var callback = C;
        var skipnumber = 0;
        var limit = 0;
    } else  if (arguments.length == 4) {
        var callback = D;
        var args = C;
        // 应该省略的条数
        var skipnumber = args.pageamount * args.page || 0;
        var limit = args.pageamount || 0;
        var sort = args.sort || {};
    } else  {
        throw new Error("find函数的参数个数，必须是3或4个");
        return;
    }

    _connectDB(function (err, db) {
        var cursor = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
        cursor.each(function (mongoError, p2) {
            if (mongoError) {
                callback(mongoError, null);
                db.close();
                return;
            }
            if (p2 != null) {
                result.push(p2);
            } else {
                // 遍历结束，没有更多文档了
                callback(null, result);
                db.close();
            }
        })
    })
}

// 删除
exports.deleteMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close();
            }
        );
    });
};

// 修改
exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            }
        );
    });
};

exports.getAllCount = function (collectionName, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function (count) {
            callback(count);
            db.close();
        });
    });
};