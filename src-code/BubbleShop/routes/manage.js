var fs = require("fs");
var dbConfig = require("../db.json");
var mysql = require("mysql");
var queues = require('mysql-queues');

exports.autoroute = {
    "get" : {
        "(.?)/manager/close_order" : closeOrderHandler,
        "(.?)/manager/open_order" : openOrderHandler,
        "(.?)/manager/list/" : showorderform,
        "(.?)/manager/menu" : showAllMenusHandler,
        "(.?)/manager/delMenu" : delMenuHandler,
        "(.?)/manager/order_food_list/" : showOrderFoodListHandler,
        "(.?)/manager/order_fruit_list/" : showOrderFruitListHandler,
    },
    "post" : {
        "(.?)/manager/orderId" : showOrderFruitListById,
        "(.?)/manager/querystore" : queryStore, 
        "(.?)/manager/saveMenu" : saveMenuHandler,
        "(.?)/manager/getstoreinfo" : getStoreInfo
    }
};

//全局变量
var MENUS_CONFIG = {};
var mytool = require("../tool");


//依赖的函数

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
    return date.getHours() >= 12 ? "1" : "0";
}

function getStoreInfo(req, res){
    var o = null;

    if (mytool.checkSession(req, res)) {
        var store_id = req.body.store_id;
        //store_id = parseInt(store_id) + 1;
        //store_id = store_id + "";
        var conn = mytool.getConnection();
        var sql = "SELECT a.name as name, a.kinds as kinds, a.marketprice as marketprice, a.img as img, b.price as price FROM goods a, store_goods b " + 
            "WHERE a.id = b.goods_id AND b.store_id = ?";
        conn.query(sql, [store_id], function(err, rows){
            if (err){
                res.send({errno:1, msg:"数据库查询出错"});
                throw err;
            }
            else {
                res.send({errno:0, msg:"ok", menus: rows});
            }
        })
    }
}

//对应的路由处理函数
function closeOrderHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }

        var ts = req.body.ts || getTS();  
        mytool.updateOrderStatusHandler(1, ts, res);
    }
}

function openOrderHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }
        var ts = req.body.ts || getTS();  //午餐还是晚餐
        mytool.updateOrderStatusHandler(0, ts, res);
    }
}

function showorderform(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        var uid = req.session.user.uId;
        if (req.session.user.isAdmin){
            uid = req.session.user.deli_id;
        }
        var conn = mytool.getConnection();
        var sql = "SELECT a.store_id as s_id, b.name as s_name, c.customer_id as c_id, c.id as orderform_id, c.goods_num as g_num, c.ordertime as c_time, c.total_value as price, c.deliverycode as code " + 
            "from deliveryman a, store b, orderform c " +
            "where a.store_id = b.id and c.store_id = b.id and a.id = ?";
        conn.query(sql, [uid], function(err, rows){
            if(err){
                throw err;
            }
            else{
                res.render('orderinfo_work', {user : req.session.user, list_data :rows})
            }
        })
    }
}

function showDinnerListHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        //参数
        var queryDate = req.query.queryDate || new Date().format("YYYY-MM-dd");
        var ts = req.query.ts || getTS();

        if (!/^(0|1)$/.test(ts)) {
            ts = getTS();
        }

        if (!/^\d{4}\-\d{2}\-\d{2}$/.test(queryDate)) {
            queryDate = new Date().format("YYYY-MM-dd");
        }

        var sql = ["SELECT * FROM order_rice WHERE d_date = ? AND ts = ? "];
        var sqlParamsArr = [queryDate, ts];

        var dId = req.query.d_id;
        if (MENUS_CONFIG[dId]) {
            sql.push(" AND dining_id = ?");
            sqlParamsArr.push(dId);
        } else {
            dId = "";
        }

        var isPay = req.query.is_pay;
        if (/^(0|1)$/.test(isPay)) {
            sql.push(" AND is_pay = ?");
            sqlParamsArr.push(isPay);
        } else {
            isPay = "";
        }

        sql.push(" ORDER BY dining_id,food_name");
        sql = sql.join("");
        console.log("sql:", sql);

        var connection = mytool.getConnection();
        connection.query(sql, sqlParamsArr, function(err, rows, fields) {
            if (err) {
                throw err;
                o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                res.end(JSON.stringify(o));
            } else {
                var arr = [];
                for (var i = 0, len = rows.length; i < len; i++) {
                    arr.push(rows[i]);
                }
                //console.log(arr);
                res.render('list', {user : req.session.user, list_data : arr, query_data : {
                    queryDate : queryDate,
                    ts : ts,
                    dId : dId,
                    isPay : isPay
                }});
            }

            connection.end();
            connection = null;
        });
    }
}

function showAllMenusHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }

        var dining_arr = [];
        var files = fs.readFileSync(__dirname + "/../public/dao/store.json", "utf8");
        var store_arr = JSON.parse(files);

        res.render('menus', {user : req.session.user, store_data : store_arr});
    }
}

function delMenuHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }

        var store_Id = req.query.m_id;
        if (!store_Id) {
            o = {code:1, msg:"参数传递不正确"};
            res.end(JSON.stringify(o));
            return ;
        }
        console.log(store_Id);
        var conn = mytool.getConnection();
        var sql = "DELETE FROM store WHERE id = ? ";
        conn.query(sql ,[store_Id], function(err, rows){
            if(err){
                res.send({errno:1, msg:"删除提货点发生错误"});
                throw err;
            }
            else {
                conn.query("SELECT id, name, address, score ,phone, warehouse_id as wid, openinghour, img FROM store", function(err, rows){
                    if(err){
                        throw err;
                    }
                    else{
                        fs.writeFile("./public/dao/store.json", JSON.stringify(rows), function(err){
                            if(err){
                                throw err;
                            }
                            else{
                                console.log("write file success");
                            }
                        });
                    }
                });
                res.send({errno:0, msg:"ok"});
            }
        })
    }
}

function showOrderFruitListById(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        var sql = "select a.goodsname as goods_name, a.goods_num, a.per_price , b.total_value as totalprice, d.name as store_name, b.ordertime as d_date " + 
            "from store d, orderform_goods a, orderform b, customer c " + 
            "where c.id = b.customer_id and b.id = a.orderform_id and d.id = b.store_id and b.id = ?";

        var order_id = req.body.orderid;
        req.session.user.order_id = order_id;
        
        res.send({errno: 0, msg: "ok"});

        return ;
    }
}

function queryStore(req, res) {
    var o = null;
    if(mytool.checkSession(req, res)) {
        var sql = "SELECT c.customer_id as c_id, c.goods_num as g_num, c.ordertime as c_time, c.total_value as price, c.deliverycode as code " + 
            "from store b, orderform c " +
            "where c.store_id = b.id and b.id = ?";
        var conn = mytool.getConnection();
        var store_id = req.body.store_id;
        conn.query("SELECT id FROM deliveryman WHERE store_id = ?", [store_id], function(err, rows){
            if(err){
                throw err;
            }
            else{
                if(rows.length > 0){
                    req.session.user.deli_id = rows[0].id;
                    res.send({errno:0, msg:"ok"});
                }
                else{
                    res.send({errno:1, msg:"您输入的提货点ID错误"});
                }
                //res.send({errno:0, msg:"ok", user : req.session.user, list_data :rows});
            }
        })
    }
}

function showOrderFruitListHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        var sql = "select a.goodsname as goods_name, a.goods_num, a.per_price , b.total_value as totalprice, d.name as store_name, b.ordertime as d_date " + 
            "from store d, orderform_goods a, orderform b, customer c " + 
            "where c.id = b.customer_id and b.id = a.orderform_id and d.id = b.store_id and b.id = ?";
        var uId = req.session.user.uId;
        var order_id = req.session.user.order_id || 0;

        var conn = mytool.getConnection();
        conn.query(sql, [order_id], function(err, rows) {
            if (err) {
                throw err;
                o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                res.end(JSON.stringify(o));
            } else {
                var arr = [];
                for (var i = 0, len = rows.length; i < len; i++) {
                    arr.push(rows[i]);
                }
                if (rows[0]){
                    var totalprice = rows[0]['totalprice'];
                }
                else{
                    var totalprice = 0;
                }
                    
                //console.log(arr);
                res.render('orderinfo', {user : req.session.user, total_price : totalprice,list_data : arr});
            }

            conn.end();
            conn = null;
        });
    }
}


function showOrderFoodListHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {

        //参数
        var queryDate = req.query.queryDate || new Date().format("YYYY-MM-dd");
        var ts = req.query.ts || getTS();

        if (!/^(0|1)$/.test(ts)) {
            ts = getTS();
        }

        if (!/^\d{4}\-\d{2}\-\d{2}$/.test(queryDate)) {
            queryDate = new Date().format("YYYY-MM-dd");
        }

        var sql = ["SELECT food_name,COUNT(1) AS num,price, dining_name, d_date, ts FROM order_rice WHERE d_date = ? AND ts = ?"];
        var sqlParamsArr = [queryDate, ts];

        var dId = req.query.d_id;
        if (MENUS_CONFIG[dId]) {

        } else {
            for (var kDid in MENUS_CONFIG) {
                dId = kDid;
                break;
            }
        }

        sql.push(" AND dining_id = ?");
        sqlParamsArr.push(dId);

        sql.push(" GROUP BY food_name ORDER BY dining_id,food_name");
        sql = sql.join("");
        console.log("sql:", sql);

        var connection = mytool.getConnection();
        connection.query(sql, sqlParamsArr, function(err, rows, fields) {
            if (err) {
                throw err;
                o = {code:1, msg:"系统发生非预期错误，请联系管理员"};
                res.end(JSON.stringify(o));
            } else {
                var arr = [];
                for (var i = 0, len = rows.length; i < len; i++) {
                    arr.push(rows[i]);
                }
                //console.log(arr);
                res.render('order_food_list', {user : req.session.user, list_data : arr, query_data : {
                    queryDate : queryDate,
                    ts : ts,
                    dId : dId
                }});
            }

            connection.end();
            connection = null;
        });
    }
}

function saveMenuHandler(req, res) {
    var o = null;

    if (mytool.checkSession(req, res)) {
        if (!req.session.user.isAdmin) {
            o = {code:1, msg:"非管理员，无权进行此操作"};
            res.end(JSON.stringify(o));
            return ;
        }

        var menuId = req.body.m_id;
        if (!menuId) {
            o = {code:1, msg:"参数传递不正确"};
            res.end(JSON.stringify(o));
            return ;
        }

        var filePath = __dirname + '/../public/menu/' + menuId + ".json";
        var menuContent = req.body.m_content;

        fs.writeFile(filePath, menuContent, "utf8", function(err) {
            if (err) {
                o = {code:1, msg:err};
                res.end(JSON.stringify(o));
                return ;
            }

            updateMenuConfig();

            o = {code:0, msg:""};
            res.end(JSON.stringify(o));
            return ;
        });
    }
}
