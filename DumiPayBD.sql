CREATE DATABASE  IF NOT EXISTS `Domy_Pay_Tarjeta` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `Domy_Pay_Tarjeta`;
-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: Domy_Pay_Tarjeta
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Vouchers`
--

DROP TABLE IF EXISTS `Vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vouchers` (
  `voucher_id` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `current_balance` decimal(10,2) NOT NULL,
  `initial_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `store_id` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `open_payments_quote_id` varchar(255) DEFAULT NULL,
  `op_cont_token` text DEFAULT NULL,
  `op_cont_uri` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  KEY `idx_quote_id` (`open_payments_quote_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vouchers`
--

LOCK TABLES `Vouchers` WRITE;
/*!40000 ALTER TABLE `Vouchers` DISABLE KEYS */;
INSERT INTO `Vouchers` VALUES ('15551573-4ecd-4133-b48e-83b9a4b8cc9d','Irving Chávez Monroy','chavez25@gmail.com',510.00,510.00,'active','002','2025-11-08 10:49:20',NULL,NULL,NULL),('3016fc58-ed66-4550-8999-d28092b6ce91','Damaris Sánchez Peñaloza','dama27@gmail.com',132.80,500.00,'active','005','2025-11-08 13:39:46',NULL,NULL,NULL),('315eead3-9819-49b4-aab5-c8f0bcfa3fad','Diego García Calderón','gc.diego02@gmail.com',331.80,500.00,'active','009','2025-11-09 01:05:18',NULL,NULL,NULL),('491e8ead-2bf3-4c0e-b1a7-f287326b82d6','Diego','gc.diego02@gmail.com',440.00,500.00,'active','09','2025-11-08 18:55:22',NULL,NULL,NULL),('990797e5-877f-4f4c-9397-69d0e99eb25e','Diego','gc.diego02@gmail.com',500.00,500.00,'active','09','2025-11-08 18:47:17',NULL,NULL,NULL),('9ca1c498-8bba-45a0-9c02-fe8f86ee3dda','Diego García Calderón','gc.diego02@gmail.com',100.00,100.00,'active','001','2025-11-08 10:39:35',NULL,NULL,NULL),('df391644-2c07-43ca-8ec4-f20539d73728','Diego García Calderón','gc.diego02@gmail.com',331.80,500.00,'active','001','2025-11-09 01:02:21',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'Domy_Pay_Tarjeta'
--

--
-- Dumping routines for database 'Domy_Pay_Tarjeta'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-09  6:25:14
