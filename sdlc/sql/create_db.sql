CREATE DATABASE sdlc;
CREATE USER 'sdlcuser'@'localhost' IDENTIFIED BY 'sdlcuser';
GRANT SELECT, CREATE TEMPORARY TABLES, EXECUTE, INSERT, DROP ON sdlc.* TO 'sdlcuser'@'localhost';