USE bubbleshop;

DROP TABLE IF EXISTS `deliveryman`;

CREATE TABLE deliveryman (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    store_id SMALLINT NOT NULL,
    password CHAR(20) NOT NULL,
    PRIMARY KEY (id)
)
