var fs = require("fs");
var dbConfig = require("./db.json");
var mysql = require("mysql");
var queues = require('mysql-queues');

var MENUS_CONFIG = {};

/** * 时间对象的格式化; */
Date.prototype.format = function (format) {
    /*
    * eg:format="YYYY-MM-dd hh:mm:ss";
    */
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/((|Y|)+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }

    return format;
}

exports.checkIden = function (req, res) {
    if (req.session.user && req.session.user.uId !== undefined && req.session.user.uName !== undefined) {
        return true;
    } else {
        res.redirect("../");
        return false;
    }
}

exports.getConnection = function () {
    var connection = mysql.createConnection({
        host : dbConfig["dbHost"],
        port : 3306,
        user : dbConfig["uName"],
        password : dbConfig["uPwd"],
        database : dbConfig["dbName"],
        charset : 'UTF8_GENERAL_CI',
        debug : false
    });

    queues(connection, true);

    connection.connect();

    return connection;
}


exports.updateMenuConfig = function () {
    MENUS_CONFIG = {};

    var dirPath = __dirname + '/public/menu';
    var files = fs.readdirSync(dirPath);

    files.forEach(function(fileName) {
        if (/\.json$/.test(fileName)) {
            var filePath = dirPath + "/" + fileName;
            var fileContent = fs.readFileSync(filePath, "utf8");
            var o = JSON.parse(fileContent);

            MENUS_CONFIG[o["id"]] = o;
        }
    });
}

exports.checkSession = function (req, res) {
    if (req.session.user && req.session.user.uId !== undefined && req.session.user.uName !== undefined) {
        return true;
    } else {
        var o = {code:1000, msg:"当前登录身份已过期"};
        res.end(JSON.stringify(o));
        return false;
    }
}

exports.updateOrderStatusHandler = function (iden, ts, res) {
    var currDate = new Date().format("YYYY-MM-dd");

    var connection = exports.getConnection();
    connection.query("REPLACE INTO order_status (d_date, b_close, ts) VALUES(?,?,?)", [currDate, iden, ts], function(err, rows, fields) {
        if (err) {
            throw err;
            o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
            res.end(JSON.stringify(o));
        } else {
            o = {code:0, msg:"操作成功"};
            res.end(JSON.stringify(o));
        }

        connection.end();
        connection = null;
    });
}
