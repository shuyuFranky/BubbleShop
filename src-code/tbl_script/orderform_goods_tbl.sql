USE bubbleshop;

DROP TABLE IF EXISTS `orderform_goods`;

CREATE TABLE orderform_goods(
    id SMALLINT NOT NULL AUTO_INCREMENT,
    orderform_id SMALLINT NOT NULL,
    goodsname CHAR(20) NOT NULL,
    per_price DECIMAL(5,3) NOT NULL DEFAULT 0,
    goods_num SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
)
