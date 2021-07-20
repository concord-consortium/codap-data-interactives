# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.6.38)
# Database: fish
# Generation Time: 2018-05-23 17:46:24 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table games
# ------------------------------------------------------------

DROP TABLE IF EXISTS `games`;

CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gameCode` varchar(32) NOT NULL,
  `turn` int(11) NOT NULL,
  `population` int(11) NOT NULL,
  `gameState` varchar(12) NOT NULL DEFAULT 'none',
  `chair` varchar(20) DEFAULT '',
  `config` varchar(10) NOT NULL DEFAULT 'alpha',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table players
# ------------------------------------------------------------

DROP TABLE IF EXISTS `players`;

CREATE TABLE `players` (
  `playerName` varchar(20) NOT NULL,
  `gameCode` varchar(32) NOT NULL,
  `onTurn` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  KEY `gameCode` (`gameCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table turns
# ------------------------------------------------------------

DROP TABLE IF EXISTS `turns`;

CREATE TABLE `turns` (
  `playerName` varchar(20) NOT NULL,
  `gameCode` varchar(32) NOT NULL,
  `onTurn` int(11) NOT NULL,
  `visible` float NOT NULL,
  `sought` float NOT NULL,
  `caught` float NOT NULL,
  `balanceBefore` int(11) NOT NULL,
  `unitPrice` float DEFAULT NULL,
  `income` int(11) DEFAULT NULL,
  `expenses` int(11) DEFAULT NULL,
  `balanceAfter` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
