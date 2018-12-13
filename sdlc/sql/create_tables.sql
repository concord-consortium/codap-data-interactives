/* todo Shouldn't we just drop table, if it exists, then recreate? */
CREATE TABLE IF NOT EXISTS peeps (
   id INT NOT NULL AUTO_INCREMENT,
   year SMALLINT,
   state_code SMALLINT,
   perwt DECIMAL (10,2),
   accum_yr DECIMAL (12,2),
   accum_yr_st DECIMAL (12,2),
   sample_data VARCHAR(1024),
   PRIMARY KEY (id)
 );

/* todo Shouldn't we just drop table, if it exists, then recreate? */
CREATE TABLE IF NOT EXISTS stats (
  id INT NOT NULL AUTO_INCREMENT,
  year SMALLINT,
  state_code SMALLINT,
  sum_weights DECIMAL(12,2),
  PRIMARY KEY (id)
);

/* todo Shouldn't we just drop table, if it exists, then recreate? */
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

/* todo Learn more about delimiters. Also, is there a way to conditionalize creation?
   Or always drop procedure before creation?
 */
DELIMITER $$
CREATE PROCEDURE InsertRandom(IN NumRows INT,
                                    IN MinVal FLOAT,
                                    IN MaxVal FLOAT)
         BEGIN
         DECLARE i INT;
         SET i = 1;
         START TRANSACTION;
         WHILE i <= NumRows DO
             INSERT INTO rand_numbers VALUES (MinVal +
                RAND() * (MaxVal - MinVal));
             SET i = i + 1;
         END WHILE;
         END $$
DELIMITER ;
