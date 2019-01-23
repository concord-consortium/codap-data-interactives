DROP TABLE IF EXISTS peeps;
CREATE TABLE peeps (
   id INT NOT NULL AUTO_INCREMENT,
   year SMALLINT,
   state_code SMALLINT,
   perwt DECIMAL (10,2),
   accum_yr DECIMAL (12,2),
   accum_yr_st DECIMAL (12,2),
   sample_data VARCHAR(1024),
   PRIMARY KEY (id)
 );

DROP TABLE IF EXISTS stats;
CREATE TABLE stats (
  id INT NOT NULL AUTO_INCREMENT,
  year SMALLINT,
  state_code SMALLINT,
  sum_weights DECIMAL(12,2),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS pumas;
CREATE TABLE pumas
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

DROP PROCEDURE IF EXISTS InsertRandom;
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

DROP TABLE IF EXISTS presets;
CREATE TABLE presets (
  yr SMALLINT,
  randnum FLOAT,
  ref_key INT,
  usage_ct SMALLINT
);

DROP PROCEDURE IF EXISTS populate_presets;
DELIMITER $$
CREATE PROCEDURE populate_presets (num_per_year INT)
  BEGIN
    DECLARE i INT;
    DECLARE j SMALLINT;
    DROP TABLE IF EXISTS years;
    CREATE TEMPORARY TABLE years AS (SELECT DISTINCT(year) FROM peeps);
    SELECT @yr_count:=count(*) FROM years;
    SET j = 0;
    WHILE j <= @yr_count DO
      SELECT @yr:=year FROM years limit j, 1;
      SET i = 1;
      WHILE i <= num_per_year DO
        INSERT INTO presets (yr) VALUES (@yr);
        SET i = i+1;
      END WHILE;
      SET j = j + 1;
    END WHILE;
    DROP TABLE years;
  END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_presets;
DELIMITER $$
CREATE PROCEDURE update_presets ()
  BEGIN
    DECLARE j SMALLINT;
    DROP TABLE IF EXISTS years;
    CREATE TEMPORARY TABLE years AS (SELECT DISTINCT(year) FROM peeps);
    SELECT @yr_count:=count(*) FROM years;
    SET j = 0;
    WHILE j < @yr_count DO
      SELECT @yr:=year FROM years limit j, 1;
      SELECT @sum_weights:=sum_weights
        FROM stats
        WHERE year=@yr AND state_code IS NULL;
        START TRANSACTION;
      UPDATE presets
        SET randnum=rand()*@sum_weights,
          ref_key=(SELECT peeps.id
              FROM peeps
              WHERE year=@yr
                    AND randnum > peeps.accum_yr
              ORDER BY peeps.accum_yr DESC
              LIMIT 1),
          usage_ct = 0
        WHERE yr=@yr AND ((usage_ct > 0) OR (ref_key IS NULL));
      COMMIT;
      SET j = j + 1;
    END WHILE;
    DROP TABLE years;
  END $$
DELIMITER ;

DROP EVENT IF EXISTS update_presets_event;
CREATE EVENT update_presets_event ON SCHEDULE EVERY 20 MINUTE DO CALL update_presets();

# DROP PROCEDURE IF EXISTS get_samples;
# DELIMITER $$
# CREATE PROCEDURE get_samples (IN numrows INT, IN yar SMALLINT)
#   BEGIN
#     DROP TABLE IF EXISTS xtab;
#     CREATE TEMPORARY TABLE  xtab AS (
#       SELECT peeps.id, peeps.sample_data FROM peeps,presets
#       WHERE presets.usage_ct = 0 AND presets.yr = yar AND peeps.id=presets.ref_key LIMIT numrows);
#     UPDATE presets SET usage_ct = 1
#     WHERE usage_ct = 0 AND yr=yar LIMIT numrows ;
#     SELECT * FROM xtab;
#   END$$
# DELIMITER ;
