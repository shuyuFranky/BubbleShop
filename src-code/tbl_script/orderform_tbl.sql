USE bubbleshop;

DROP TABLE IF EXISTS `orderform`;

CREATE TABLE orderform (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    customer_id SMALLINT NOT NULL,
    store_id SMALLINT NOT NULL,
    goods_num SMALLINT NOT NULL DEFAULT 1,
    ordertime DATETIME NOT NULL DEFAULT NOW(),
    total_value DECIMAL(5, 3) NOT NULL,
    deliverycode SMALLINT NOT NULL UNIQUE,
    PRIMARY KEY (id)
)
