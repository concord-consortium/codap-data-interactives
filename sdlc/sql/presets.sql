
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
      UPDATE presets
        SET randnum=rand()*@sum_weights, 
          ref_key=(
            SELECT peeps.id 
            FROM peeps 
            WHERE year=@yr 
              AND randnum > peeps.accum_yr 
            ORDER BY peeps.accum_yr DESC 
            LIMIT 1), 
          usage_ct = 0 
        WHERE yr=@yr AND ((usage_ct > 0) OR (ref_key IS NULL));
      SET j = j + 1;
    END WHILE;
    DROP TABLE years;
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
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_presets2;
DELIMITER $$
CREATE PROCEDURE update_presets2 (lim INT)
BEGIN
  CALL log_preset('begin');
#   UPDATE presets,stats
#     SET presets.randnum=rand()*stats.sum_weights,
#         presets.ref_key=(SELECT peeps.id
#                          FROM peeps
#                          WHERE peeps.year=presets.yr
#                            AND presets.randnum > peeps.accum_yr
#                          ORDER BY peeps.accum_yr DESC
#                          LIMIT 1),
#         presets.usage_ct = 0
#     WHERE (presets.ref_key IS NULL)
#       AND stats.year = presets.yr
#       AND stats.state_code IS NULL
#     LIMIT lim;
  UPDATE presets
    SET presets.randnum=rand()*(SELECT sum_weights FROM stats WHERE year = presets.yr and state_code IS NULL),
        presets.ref_key=(SELECT peeps.id
                         FROM peeps
                         WHERE peeps.year=presets.yr
                           AND presets.randnum > peeps.accum_yr
                         ORDER BY peeps.accum_yr DESC
                         LIMIT 1),
        presets.usage_ct = presets.usage_ct - 1
    ORDER BY presets.usage_ct
    LIMIT lim;
  CALL log_preset('end');
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS get_samples;
DELIMITER $$
CREATE PROCEDURE get_samples (IN numrows INT, IN yar SMALLINT)
  BEGIN 
  DROP TABLE IF EXISTS xtab;
  CREATE TEMPORARY TABLE  xtab AS (
    SELECT peeps.id, peeps.sample_data FROM peeps,presets
    WHERE presets.usage_ct = 0 AND presets.yr = yar AND peeps.id=presets.ref_key LIMIT numrows);
  UPDATE presets SET usage_ct = 1 
    WHERE usage_ct = 0 AND yr=yar LIMIT numrows ;
  SELECT * FROM xtab;
  END$$
DELIMITER ;

