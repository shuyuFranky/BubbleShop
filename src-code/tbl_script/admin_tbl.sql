USE bubbleshop;

DROP TABLE IF EXISTS `admin`;

CREATE TABLE admin (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    password CHAR(20) NOT NULL,
    PRIMARY KEY (id)
)
