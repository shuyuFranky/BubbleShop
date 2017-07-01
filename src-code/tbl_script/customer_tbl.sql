USE bubbleshop;

DROP TABLE IF EXISTS `customer`;

CREATE TABLE customer (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone CHAR(11) NOT NULL,
    password CHAR(20) NOT NULL,
    PRIMARY KEY (id)
);
