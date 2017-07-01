USE bubbleshop;

DROP TABLE IF EXISTS `goods_cart`;

CREATE TABLE goods_cart (
    goods_id SMALLINT NOT NULL,
    cart_id SMALLINT NOT NULL,
    goods_num SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (goods_id, cart_id)
)
