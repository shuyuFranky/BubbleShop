var proxyRequest = require('request');
var fs = require("fs");

var mytool = require("../tool");

exports.autoroute = {
    'get' : {
        '(.?)/(index)?' : showIndexView,
        '(.?)/login' : checkLoginHandler,
        '(.?)/login_bubble' : loginHandler,
        '(.?)/logout' : onLogoutHandler,
        '(.?)/log_out' : onClearUserIdenHandler,
        '(.?)/update_priv' : updatePrivHandler
    },
    'post' : {
        '(.?)/login' : checkLoginHandler,
        '(.?)/checklogin' : mylogin
    }
};

function mylogin(req, res) {
    var name = req.body.name;
    var gender = req.body.gender;
    var phone = req.body.phone;
    var password = req.body.password;
    var conn = mytool.getConnection();
    conn.query("INSERT INTO customer (name, gender, phone, password) VALUE (?,?,?,?)",[name, gender, phone, password],function(err){
        if (err){
            res.send({errno:1, msg:"数据库操作错误"});
            throw err;
        }
        else{
            console.log("fucking here");
            res.send({errno:0, msg:"ok"});
        }
    })
    return ;
}

function showIndexView(req, res) {
    if (req.session.user && req.session.user.uId !== undefined && req.session.user.uName !== undefined) {
        res.end();
        res.redirect("main");
    } else {
        res.render('index', {user : req.session.user});
    }
}

function checkLoginHandler(req, res) {
    var pt = req.body.pt.toString().trim();
    var pwd = req.body.pwd.toString().trim();

    var o = {};
    
    if (pt == "") {
        o = {code:1, msg:'帐号不能为空'};
        res.end(JSON.stringify(o));
        return ;
    } else if (pwd == "") {
        o = {code:1, msg:'密码不能为空'};
        res.end(JSON.stringify(o));
        return ;
    }

    var conn = mytool.getConnection();

    conn.query("SELECT id, name, password FROM customer WHERE name = ?",[pt],function(err, rows){
        if(err){
            throw err;
        }
        else{
            if(!rows[0]){
                o = {code:1, msg:'用户不存在'};
                res.end(JSON.stringify(o));
                return ;
            }
            else{
                if(pwd != rows[0].password){
                    o = {code:1, msg:'密码不正确'};
                    res.end(JSON.stringify(o));
                    return ;
                }
                else{
                    req.session.user = {
                        uId : rows[0].id,
                        pd : pwd,
                        uName : pt,
                        isAdmin : checkIsAdmin(pt)
                    };
                    res.end(JSON.stringify({code:0, msg:"登陆成功"}));
                    return ;
                }
            }
        }
    })
    
    return ;
}

function loginHandler(req, res) {
    res.render('login');
}

function onLogoutHandler(req, res) {
    req.session.user = null;
    res.redirect("../index");
}

function onClearUserIdenHandler(req, res) {
    var uName = req.session.user ? req.session.user["uName"] : null;

    req.session.user = null;

    if (uName) {
        req.session.user = {uName : uName};
    }

    res.redirect("../index");
}

var MANAGER_LIST = null;
function checkIsAdmin(uName) {
    if (!MANAGER_LIST) {
//        MANAGER_LIST = require("../public/manager.json");

        var fileContent = fs.readFileSync(__dirname + '/../public/manager.json');
        MANAGER_LIST = JSON.parse(fileContent);
    }

    return MANAGER_LIST[uName] == "1" ? true : false;
}

function updatePrivHandler(req, res) {
    if (req.session.user && req.session.user.uId !== undefined && req.session.user.uName !== undefined) {

        var o = null;

        if (req.session.user.isAdmin) {
            MANAGER_LIST = null;

            o = {code:0, msg:"管理员列表更新成功"};
            res.end(JSON.stringify(o));
        } else {
            o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
            res.end(JSON.stringify(o));
        }

    } else {
        res.redirect("../");
    }
}