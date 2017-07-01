USE bubbleshop;

DROP TABLE IF EXISTS `store_goods`;

CREATE TABLE store_goods (
    store_id SMALLINT NOT NULL,
    goods_id SMALLINT NOT NULL,
    price DECIMAL(5, 3) NOT NULL DEFAULT 0,
    PRIMARY KEY (store_id, goods_id)
)
