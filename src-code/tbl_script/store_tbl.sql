USE bubbleshop;

DROP TABLE IF EXISTS `store`;

CREATE TABLE store (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    name CHAR(20) NOT NULL,
    score DECIMAL(2, 1) DEFAULT "4.4",
    address VARCHAR(255) NOT NULL,
    phone CHAR(11) NOT NULL,
    openinghour VARCHAR(255) NOT NULL DEFAULT "9:30-17:30",
    warehouse_id SMALLINT NOT NULL,
    img VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
)

