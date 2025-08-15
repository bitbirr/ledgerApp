-- --------------------------------------------------------
-- Host:                         47.236.39.181
-- Server version:               10.5.27-MariaDB - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------
USE ledger;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table gwldb.app_settings
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`setting_value`)),
  `setting_type` enum('string','number','boolean','json','object') DEFAULT 'string',
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_setting_key` (`setting_key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table gwldb.app_settings: ~9 rows (approximately)
INSERT INTO `app_settings` (`setting_id`, `setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_system`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 'serial_number_config', '{"prefix": "PKG", "randomDigits": 4, "separator": "", "format": "prefix+random"}', 'json', 'serial_numbers', 'Package serial number generation configuration', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(2, 'order_id_config', '{"prefix": "ORD", "randomDigits": 6, "separator": "-", "format": "prefix+separator+random", "includeDate": false, "dateFormat": "YYYYMMDD"}', 'json', 'order_ids', 'Order ID generation configuration', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(3, 'business_info', '{"name": "Najib", "address": "", "phone": "", "email": "", "website": "", "taxId": "", "logo": null, "description": "", "workingHours": "Mon-Sat: 8:00 AM - 8:00 PM", "currency": "USD", "timezone": "UTC"}', 'json', 'business', 'Business information and contact details', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(4, 'invoice_settings', '{"template": "default", "showLogo": true, "showBusinessInfo": true, "showTaxInfo": false, "footerText": "Thank you for your business!", "termsAndConditions": "", "autoGenerate": true, "numberFormat": "INV-{number}", "startingNumber": 1000, "includeQRCode": false}', 'json', 'invoices', 'Invoice generation and formatting settings', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(5, 'notification_settings', '{"orderNotifications": true, "paymentReminders": true, "lowStockAlerts": false, "customerUpdates": true, "systemMaintenance": true, "emailNotifications": true, "pushNotifications": false, "smsNotifications": false, "autoClose": 5000, "position": "top-right", "sound": true}', 'json', 'notifications', 'Notification preferences and settings', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(6, 'theme_settings', '{"mode": "light", "primaryColor": "#3b82f6", "fontSize": "medium", "compactMode": false, "sidebarCollapsed": false, "showAnimations": true, "customCSS": ""}', 'json', 'theme', 'Theme and appearance customization', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(7, 'app_language', '"en"', 'string', 'general', 'Default application language', 0, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(8, 'app_version', '"1.0.0"', 'string', 'system', 'Application version', 1, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL),
	(9, 'last_backup', 'null', 'string', 'system', 'Last database backup timestamp', 1, '2025-08-02 18:04:11', '2025-08-02 18:04:11', NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
