### TABLES ###
# Tables must be created in a particular order due to referential constraints i.e. foreign keys.
CREATE TABLE IF NOT EXISTS User
(
    user_id        INT          NOT NULL AUTO_INCREMENT,
    name           VARCHAR(128) NOT NULL,
    email          VARCHAR(128) NOT NULL,
    password       VARCHAR(256) NOT NULL COMMENT 'Only store the hash here, not the actual password!',
    auth_token     VARCHAR(32),
    city           VARCHAR(128),
    country        VARCHAR(64),
    photo_filename VARCHAR(64),
    PRIMARY KEY (user_id),
    UNIQUE (email),
    UNIQUE (auth_token)
);

CREATE TABLE IF NOT EXISTS Category
(
    category_id INT         NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64) NOT NULL,
    PRIMARY KEY (category_id)
);

CREATE TABLE IF NOT EXISTS Petition
(
    petition_id    INT           NOT NULL AUTO_INCREMENT,
    title          VARCHAR(256)  NOT NULL,
    description    VARCHAR(2048) NOT NULL,
    author_id      INT           NOT NULL,
    category_id    INT           NOT NULL,
    created_date   DATETIME      NOT NULL,
    closing_date   DATETIME,
    photo_filename VARCHAR(256),
    PRIMARY KEY (petition_id),
    FOREIGN KEY (author_id) REFERENCES User (user_id),
    FOREIGN KEY (category_id) REFERENCES Category (category_id)
);

CREATE TABLE IF NOT EXISTS Signature
(
    signatory_id INT      NOT NULL,
    petition_id  INT      NOT NULL,
    signed_date  DATETIME NOT NULL,
    PRIMARY KEY (signatory_id, petition_id),
    FOREIGN KEY (signatory_id) REFERENCES User (user_id),
    FOREIGN KEY (petition_id) REFERENCES Petition (petition_id) ON DELETE CASCADE
);

INSERT INTO 
    Category(name) 
VALUES 
    ('Human rights'), 
    ('Environment'), 
    ('Politics'), 
    ('Other');
