USE bubbleshop;

DROP TABLE IF EXISTS `warehouse_goods`;

CREATE TABLE warehouse_goods (
    warehouse_id SMALLINT NOT NULL,
    goods_id SMALLINT NOT NULL,
    goods_num SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (warehouse_id, goods_id)
)
