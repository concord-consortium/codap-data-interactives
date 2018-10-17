CREATE TABLE IF NOT EXISTS peeps (
   id INT NOT NULL AUTO_INCREMENT,
   year SMALLINT,
   state_code SMALLINT,
   weight FLOAT,
   sample_data VARCHAR(1024),
   PRIMARY KEY(id)
 );


CREATE TABLE IF NOT EXISTS pumas
(
	state VARCHAR(2),
	statePUMA VARCHAR(10),
	description VARCHAR(100),
	pop10 INT,
	hholds10 INT,
	aLand_m INT,
	aWater_m INT,
	aLand_sqmi FLOAT,
	aWater_sqmi FLOAT,
	lat FLOAT,
	`long` FLOAT
);