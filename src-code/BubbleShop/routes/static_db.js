var fs = require("fs");
var dbConfig = require("../db.json");
var mysql = require("mysql");
var queues = require('mysql-queues');

exports.autoroute = {
    "get" : {
        "(.?)/gen_store_info" : gen_store_info,
        "(.?)/gen_goods_info" : gen_goods_info
    },
    "post" : {
        '(.?)/store_info' : gen_store_info
    }
};

var mytool = require("../tool");

function gen_store_info(req, res) {
    var conn = mytool.getConnection();
    conn.query("SELECT id, name, address, score ,phone, warehouse_id as wid, openinghour, img FROM store", function(err, rows){
        if(err){
            throw err;
        }
        else{
            res.send(JSON.stringify(rows));
            fs.writeFile("./public/dao/store.json", JSON.stringify(rows), function(err){
                if(err){
                    throw err;
                }
                else{
                    console.log("write file success");
                }
            });

            console.log(rows[0]);
        }
    });
    return ;
}

function gen_goods_info(req, res) {
    var conn = mytool.getConnection();
    conn.query("SELECT id, name, kinds, marketprice, img FROM goods", function(err, rows){
        if(err){
            throw err;
        }
        else{
            res.send(JSON.stringify(rows));
            fs.writeFile("./public/dao/goods.json", JSON.stringify(rows), function(err){
                if(err){
                    throw err;
                }
                else{
                    console.log("write file success");
                }
            });
            console.log(rows[0]);
        }
    });
    return ;
}