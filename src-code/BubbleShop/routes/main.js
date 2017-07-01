/**
 * Created with JetBrains WebStorm.
 * User: zhangyi
 * Date: 13-7-9
 * Time: 下午8:13
 * To change this template use File | Settings | File Templates.
 */
var fs = require("fs");
var dbConfig = require("../db.json");
var mysql = require("mysql");
var queues = require('mysql-queues');


exports.autoroute = {
    "get" : {
        "(.?)/main" : showNewMVH,
        "(.?)/updateMenu" : function(req, res) {
            //mytool.updateMenuConfig();
            res.end("<meta http-equiv='content-type' content='text/html; charset=utf-8' /> 提货点已成功更新");
        },
        "(.?)/main/:id" : showstore
    },
    "post" : {
        '(.?)/orderFruit' : orderFruit,
        '(.?)/orderFood' : orderFoodHandler,
        '(.?)/cancelOrder' : cancelOrderHandler,
        '(.?)/pay' : changePayStatusHandler,
    }
};

var mytool = require("../tool");
var g_isLoaded = false;
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

function getTS() {
    var date = new Date();
    //上午、下午
    return date.getHours() >= 12 ? "1" : "0";
}

function fuck(req, res){
    res.render('fuckbaby',{goods : "I do not want to fuck you bitch"});
}

function orderFruit(req, res){
    if(mytool.checkSession(req, res)) {
        var o = req.body;
        var gname = req.body.gname;
        var gprice = req.body.gprice;
        var conn = mytool.getConnection();
        conn.query("SELECT id FROM customer WHERE name = ?",[o.uName],function(err,rows){
            if(err){
                throw err;
            }
            else{
                var uid = rows[0].id;
                var deliverycode = (new Date() - 0) % 10086;
                var orderform_id = (new Date() - 0) % 10007;
                conn = conn || mytool.getConnection();
                conn.query("INSERT INTO orderform (id, customer_id, store_id, goods_num, total_value, deliverycode) VALUE (?,?,?,?,?,?)",
                        [orderform_id, uid, o.sId, o.total_num, o.total_price, deliverycode], function(err){
                    if(err){
                        res.send({errno:1, msg:"insert into table orderform error"});
                        throw err;
                    }
                    else{
                        for(var i = 0; i<gname.length; i++){
                            conn.query("INSERT INTO orderform_goods (orderform_id, goodsname, per_price) VALUE (?,?,?)",
                                [orderform_id, gname[i].trim(), gprice[i].trim()], function(err){
                                if(err){
                                    res.send({errno:1, msg:"insert into table orderform_goods error"});
                                    throw err;
                                }
                                else{
                                    console.log("insert one item into orderform_goods");
                                }
                            })
                        }
                        console.log('server orderform_id : ' + orderform_id);
                        req.session.user.order_id = orderform_id;
                        res.send({errno:0, msg:"ok", order_id:orderform_id}); 
                    }
                })
            }
        })
        
    }
    return ;
}

function showstore(req, res) {
    if(!mytool.checkIden(req, res)){
        console.log("未登录");
    }
    var sId = req.params[0];
    var conn = mytool.getConnection();
    conn.query("SELECT id, name, kinds, marketprice, img, price FROM goods, store_goods WHERE store_goods.store_id = ? and goods.id = store_goods.goods_id", [sId], 
    function(err, rows1){
        if (err) {
            throw err;
        }
        else {
            conn.query("SELECT id, name, score, address, phone, openinghour, img FROM store WHERE id = ?", [sId], function(err, rows2){
                if(err){
                    throw err;
                }
                else{
                    res.render('mystore',{store : rows2, goods : rows1, user : req.session.user});
                }
            })
        }
    });
    return ;
}

function showNewMVH(req, res) {
    if (mytool.checkIden(req, res)) {
    //if(true){
        if (!g_isLoaded) {
            g_isLoaded = true;

            //mytool.updateMenuConfig();
        }

        var dining_arr = [];
        var files = fs.readFileSync(__dirname + "/../public/dao/store.json", "utf8");
        var o = JSON.parse(files);
        
        //for (o_ in o) {
        //    dining_arr.push([o[o_]["id"], o[o_]["name"], o[o_]["address"], o[o_]["score"]]);
        //}

        //console.log(o);
        dining_arr = o;

        var currDate = new Date().format("YYYY-MM-dd");
        var ts = getTS();
        var uId = req.session.user.uId;
        var conn = mytool.getConnection();
        var isClose = false;

        if (req.session.user.isAdmin) {
            queryOrderStatus(conn, currDate, ts, res, function() {
                isClose = false;
                render();
            }, function() {
                isClose = true;
                render();
            });
        } else {
            render();
        }

        function render() {
            queryOrderedDataHandler(conn, uId, currDate, ts, res, function(row) {
                var timeDes = ts == "1" ? "晚餐" : "午餐";
                res.render('main_new', {user : req.session.user, mixi_place : dining_arr, dinner_data : row, is_admin : req.session.user.isAdmin, is_close : isClose, time_des:timeDes});
                conn.end();
                conn = null;
            })
        }
    }
}

function showMainViewHandler(req, res) {
    if (mytool.checkIden(req, res)) {
    //if(true){
        if (!g_isLoaded) {
            g_isLoaded = true;

            //mytool.updateMenuConfig();
        }

        var dining_arr = [];
        for (var i in MENUS_CONFIG) {
            var _o = MENUS_CONFIG[i];

            if (_o["status"] == "1") {
                dining_arr.push([_o["id"], _o["name"]]);
            }
        }

        var currDate = new Date().format("YYYY-MM-dd");
        var ts = getTS();
        var uId = req.session.user.uId;
        var conn = mytool.getConnection();
        var isClose = false;

        if (req.session.user.isAdmin) {
            queryOrderStatus(conn, currDate, ts, res, function() {
                isClose = false;
                render();
            }, function() {
                isClose = true;
                render();
            });
        } else {
            render();
        }

        function render() {
            queryOrderedDataHandler(conn, uId, currDate, ts, res, function(row) {
                var timeDes = ts == "1" ? "晚餐" : "午餐";
                res.render('main', {user : req.session.user, mixi_place : dining_arr, dinner_data : row, is_admin : req.session.user.isAdmin, is_close : isClose, time_des:timeDes});
                conn.end();
                conn = null;
            })
        }
    }
}

//查询已订餐的数据
function queryOrderedDataHandler(conn, uId, currDate, ts, res, callback) {
    var row = null;
    conn = conn || mytool.getConnection();

    conn.query("SELECT * FROM order_rice WHERE uid = ? AND d_date = ? AND ts = ?", [uId, currDate, ts], function(err, rows, fields) {
        if (err) {
            throw err;
            o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
            res.end(JSON.stringify(o));

            return false;
        } else if (rows.length == 0) {
            row = null;
        } else {
            row = rows[0];
        }

        callback && callback(row);
    });
}


function showOrderDinnerHandler(req, res) {
    if (mytool.checkIden(req, res)) {
        var dId = req.params[0];
        var menusConfig = MENUS_CONFIG[dId];

        if (!menusConfig) {
            var dirPath = __dirname + '/../public/menu';
            var filePath = dirPath + "/" + dId+".json";

            if (!fs.existsSync(filePath)) {
                res.end('<meta http-equiv="content-type" content="text\/html; charset=utf-8" \/>您访问的菜单已不存在');
                return ;
            }

            MENUS_CONFIG[dId] = require("../public/menu/"+dId+".json");
            menusConfig = MENUS_CONFIG[dId];

            console.log("加载菜单：", menusConfig);
        }

        var connection = mytool.getConnection();

        var currDate = new Date().format("YYYY-MM-dd");
        var ts = getTS();
        var isClose = false;
        var uId = req.session.user.uId;

        queryOrderStatus(connection, currDate, ts, res, function() {
            isClose = false;
            renderHandler();
        } , function() {
            isClose = true;
            renderHandler();
        });

        function renderHandler() {
            queryOrderedDataHandler(connection, uId, currDate, ts, res, function(row) {
                var timeDes = ts == "1" ? "晚餐" : "午餐";
                res.render('order_dinner', {user : req.session.user, d_id :dId, menus_config : menusConfig, is_close : isClose, dinner_data : row, time_des : timeDes});
                connection.end();
                connection = null;
            });
        }
    }
}

function orderFoodHandler(req, res) {
    if (mytool.checkSession(req, res)) {
        var uId = req.body.uId;
        var uName = req.body.uName;
        var menuName = req.body.menuName;
        var menuPrice = req.body.menuPrice;
        var dId = req.body.dId;
        var ts = req.body.ts || getTS();  //午餐还是晚餐
        var o = null;

        if (req.session.user.uId != uId || req.session.user.uName != uName) {
            o = {code:1, msg:"请求非法"};
            res.end(JSON.stringify(o));
            return false;
        }

        if (ts != "0" && ts != "1") {
            o = {code:1, msg:"非法参数"};
            res.end(JSON.stringify(o));
            return false;
        }

        var menuConfig = MENUS_CONFIG[dId];
        if (!menuConfig) {
            o = {code:1, msg:"您需要预订的餐厅不存在"};
            res.end(JSON.stringify(o));
            return false;
        }

        if (!menuName || !menuPrice || !uId || !uName || !dId) {
            o = {code:1, msg:"请求缺少必要参数"};
            res.end(JSON.stringify(o));
            return false;
        }

        if (!menuConfig['menus'][menuName]) {
            o = {code:1, msg:"预订的菜不存在"};
            res.end(JSON.stringify(o));
            return false;
        }

        if (menuConfig['menus'][menuName] != menuPrice) {
            o = {code:1, msg:"传递的价格有误"};
            res.end(JSON.stringify(o));
            return false;
        }

        var dName = menuConfig['name'];
        var addrIp = req.ip;

        var currDate = new Date().format("YYYY-MM-dd");
        var currTime = new Date().format("YYYY-MM-dd hh:mm:ss");

        var connection = mytool.getConnection();

        //订餐系统是否已关闭
        checkOrderStatus(connection, currDate, ts, res, queryOrder);

        function queryOrder() {
            connection.query("SELECT * FROM order_rice AS t WHERE t.`uid` = ? AND d_date = ? AND ts = ?", [uId, currDate, ts], function(err, rows, fields) {
                if (err) {
                    throw err;
                    o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                    res.end(JSON.stringify(o));

                    connection.end();
                    connection = null;
                } else if (rows.length > 0) {
                    o = {code:100, msg:"您今天已经订过餐了"};
                    res.end(JSON.stringify(o));

                    connection.end();
                    connection = null;
                } else {
                    execOrder();
                }
            });
        }

        function execOrder() {
            var trans = connection.startTransaction();
            trans.query("INSERT INTO order_rice VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [uId, uName, currDate, currTime, ts, menuName, menuPrice, dId, dName, addrIp, 0], function (err, info) {
                if (err) {
                    throw err;
                    trans.rollback();
                    console.log(info);

                    o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                    res.end(JSON.stringify(o));

                    connection.end();
                    connection = null;
                } else {
                    trans.commit(function (err, info) {
                        console.log(info);
                        o = {code:0, msg:"订餐成功"};
                        res.end(JSON.stringify(o));

                        connection.end();
                        connection = null;
                    });
                }
            });
            trans.execute();
        }
    }
}

function checkOrderStatus(conn, tDate, ts, res, callback) {
    var o = null;

    queryOrderStatus(conn, tDate, ts, res, callback, function() {
        o = {code:10000, msg:"订餐系统已关闭，请联系管理员"};
        res.end(JSON.stringify(o));
    });
}

function queryOrderStatus(conn, tDate, ts, res, callback, callback2) {
    var o = null;

    conn.query("SELECT * FROM order_status WHERE d_date = ? AND ts = ?", [tDate, ts], function(err, rows, fields) {
        if (err) {
            throw err;
            o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
            res.end(JSON.stringify(o));
        } else if (rows.length == 0) {
            callback();
        } else {
            var row = rows[0];
            if (row["b_close"] == 0) {
                callback();
            } else {
                callback2();
            }
        }
    });
}


function cancelOrderHandler(req, res) {
    if (mytool.checkSession(req, res)) {
        var currDate = new Date().format("YYYY-MM-dd");
        var uId = req.session.user.uId;
        var ts = req.body.ts || getTS();  //午餐还是晚餐
        var o = null;

        if (ts != "0" && ts != "1") {
            o = {code:1, msg:"非法参数"};
            res.end(JSON.stringify(o));
            return false;
        }

        var connection = mytool.getConnection();

        function cancelHandler() {
            connection.query("DELETE FROM order_rice WHERE uid = ? AND d_date = ? AND ts = ?", [uId, currDate, ts], function(err, rows, fields) {
                if (err) {
                    throw err;
                    o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                    res.end(JSON.stringify(o));
                } else {
                    o = {code:0, msg:"您的订餐已取消"};
                    res.end(JSON.stringify(o));
                }

                connection.end();
                connection = null;
            });
        }

        //订餐系统是否已关闭
        checkOrderStatus(connection, currDate, ts, res, cancelHandler);
    }
}

function changePayStatusHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }

        var nId = req.body.nid;
        if (!nId) {
            o = {code:1, msg:"缺少参数"};
            res.end(JSON.stringify(o));
            return ;
        }

        var connection = mytool.getConnection();
        connection.query("UPDATE order_rice SET is_pay = '1' WHERE n_id = ?", [nId], function(err, rows, fields) {
            if (err) {
                throw err;
                o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                res.end(JSON.stringify(o));
            } else {
                o = {code:0, msg:""};
                res.end(JSON.stringify(o));
            }

            connection.end();
            connection = null;
        });
    }
}


