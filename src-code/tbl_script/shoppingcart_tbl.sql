USE bubbleshop;

DROP TABLE IF EXISTS `shoppingcart`;

CREATE TABLE shoppingcart (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    customer_id SMALLINT NOT NULL,
    store_id SMALLINT NOT NULL,
    PRIMARY KEY (id)
)
