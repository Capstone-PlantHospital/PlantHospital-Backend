-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.30 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- planthospital 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `planthospital` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `planthospital`;

-- 테이블 planthospital.diagnosis 구조 내보내기
CREATE TABLE IF NOT EXISTS `diagnosis` (
  `diagnosis_id` int unsigned NOT NULL AUTO_INCREMENT,
  `diagnosis_folder_id` int unsigned NOT NULL,
  `diagnosis_type` int unsigned NOT NULL,
  `diagnosis_date` date NOT NULL,
  `disease_id` int unsigned NOT NULL,
  `disease_name` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `disease_scale` int unsigned NOT NULL,
  PRIMARY KEY (`diagnosis_id`),
  KEY `FK_diagnosis_folder` (`diagnosis_folder_id`) USING BTREE,
  CONSTRAINT `FK_diagnosis_folder` FOREIGN KEY (`diagnosis_folder_id`) REFERENCES `folder` (`folder_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 planthospital.folder 구조 내보내기
CREATE TABLE IF NOT EXISTS `folder` (
  `folder_id` int unsigned NOT NULL AUTO_INCREMENT,
  `folder_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `folder_type` int unsigned NOT NULL,
  `folder_user_id` int unsigned NOT NULL,
  PRIMARY KEY (`folder_id`),
  KEY `FK_folder_user` (`folder_user_id`),
  CONSTRAINT `FK_folder_user` FOREIGN KEY (`folder_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 planthospital.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_first_name` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_last_name` varchar(5) NOT NULL,
  `user_number` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_number` (`user_number`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
