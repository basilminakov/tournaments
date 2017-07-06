CREATE DATABASE IF NOT EXISTS `Tournaments`;

USE `Tournaments`;

CREATE TABLE IF NOT EXISTS `players` (
  `playerId` varchar(7) NOT NULL,
  `isBacker` tinyint(4) NOT NULL DEFAULT '0',
  `tournamentId` int(11) DEFAULT NULL,
  `backerFor` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`playerId`),
  UNIQUE KEY `id_UNIQUE` (`playerId`)
  
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `tournaments` (
  `id` int(11) NOT NULL,
  `deposit` int(11) NOT NULL,
  `closed` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `winners` (
  `userId` varchar(7) NOT NULL,
  `prize` int(11) NOT NULL,
  `tournamentId` int(11) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(7) NOT NULL,  
  `balance` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB;
