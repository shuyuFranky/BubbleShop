USE bubbleshop;

DROP TABLE IF EXISTS `warehouse`;

CREATE TABLE warehouse (
    id SMALLINT NOT NULL AUTO_INCREMENT,
    pos VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
)
