DROP TABLE IF EXISTS peeps;
CREATE TABLE `peeps` (
  `id` int(11) NOT NULL,
  `year` smallint(6) DEFAULT NULL,
  `state_code` smallint(6) DEFAULT NULL,
  `perwt` decimal(10,2) DEFAULT NULL,
  `accum_yr` decimal(12,2) DEFAULT NULL,
  `accum_yr_st` decimal(12,2) DEFAULT NULL,
  `sample_data` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_accum_yr` (`year`,`accum_yr`)
 );

CREATE INDEX idx_accum_yr_st ON peeps (state_code, year, accum_yr_st);
CREATE INDEX idx_accum_yr ON peeps (year, accum_yr);

DROP TABLE IF EXISTS stats;
CREATE TABLE `stats` (
  `id` int(11) NOT NULL,
  `year` smallint(6) DEFAULT NULL,
  `state_code` smallint(6) DEFAULT NULL,
  `sum_weights` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
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
CREATE TABLE `presets` (
  `yr` smallint(6) DEFAULT NULL,
  `randnum` float DEFAULT NULL,
  `ref_key` int(11) DEFAULT NULL,
  `usage_ct` smallint(6) DEFAULT NULL
);

DROP TABLE IF EXISTS preset_log;
CREATE TABLE `preset_log` (
  `eventtime` datetime DEFAULT NULL,
  `eventtype` varchar(10) DEFAULT NULL,
  `update_count` int(11) DEFAULT NULL
);

DROP PROCEDURE IF EXISTS log_preset;
DELIMITER $$
CREATE PROCEDURE log_preset (eventType VARCHAR(10))
  BEGIN
    SELECT @count:=count(*) FROM presets WHERE usage_ct>0 OR ref_key IS NULL;
    INSERT INTO preset_log VALUES (now(), eventType, @count);
  END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS populate_preset_year;
DELIMITER $$
CREATE PROCEDURE populate_preset_year (num_per_year INT, year INT)
  BEGIN
    DECLARE i INT;
    SET i = 1;
    WHILE i <= num_per_year DO
      INSERT INTO presets (yr) VALUES (year);
      SET i = i+1;
    END WHILE;
  END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS populate_presets;
DELIMITER $$
CREATE PROCEDURE populate_presets (num_per_year INT)
  BEGIN
    DECLARE j SMALLINT;
    DROP TABLE IF EXISTS years;
    CREATE TEMPORARY TABLE years AS (SELECT DISTINCT(year) FROM peeps);
    SELECT @yr_count:=count(*) FROM years;
    SET j = 0;
    WHILE j < @yr_count DO
      SELECT @yr:=year FROM years limit j, 1;
      CALL populate_preset_year(num_per_year, @yr);
      SET j = j + 1;
    END WHILE;
    DROP TABLE years;
    CALL populate_preset_year(num_per_year, 2017);
    CALL populate_preset_year(num_per_year, 2017);
  END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_presets;
DELIMITER $$
CREATE PROCEDURE update_presets ()
  BEGIN
    CALL log_preset('begin');
    UPDATE presets, stats
      SET presets.randnum=rand()*stats.sum_weights
      WHERE ((presets.usage_ct > 0) OR (presets.ref_key IS NULL))
            AND stats.year = presets.yr
            AND stats.state_code IS NULL;
    UPDATE presets
      SET presets.ref_key=(SELECT peeps.id
            FROM peeps
            WHERE peeps.year=presets.yr
                  AND presets.randnum > peeps.accum_yr
            ORDER BY peeps.accum_yr DESC
            LIMIT 1),
        presets.usage_ct = 0
      WHERE ((presets.usage_ct > 0) OR (presets.ref_key IS NULL));
    CALL log_preset('end');
  END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_presets1;
DELIMITER $$
CREATE PROCEDURE update_presets1 (lim INT)
BEGIN
  CALL log_preset('begin');
  UPDATE presets, stats
  SET presets.randnum=rand()*stats.sum_weights
  WHERE ((presets.usage_ct > 0) OR (presets.ref_key IS NULL))
    AND stats.year = presets.yr
    AND stats.state_code IS NULL;
  UPDATE presets
  SET presets.ref_key=(SELECT peeps.id
                       FROM peeps
                       WHERE peeps.year=presets.yr
                         AND presets.randnum > peeps.accum_yr
                       ORDER BY peeps.accum_yr DESC
                       LIMIT 1),
      presets.usage_ct = 0
  WHERE ((presets.usage_ct > 0) OR (presets.ref_key IS NULL)) LIMIT lim;
  CALL log_preset('end');
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS make_presets;
DELIMITER $
CREATE PROCEDURE make_presets (iters INT)
  BEGIN
    DECLARE i INT;
    SET i = 0;
    WHILE (i < iters) DO
      CALL populate_presets(500);
      CALL update_presets;
      SET i = i + 1;
    END WHILE ;
  END $
DELIMITER ;
# DROP EVENT IF EXISTS update_presets_event;
# CREATE EVENT update_presets_event ON SCHEDULE EVERY 20 MINUTE DO CALL update_presets();

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
