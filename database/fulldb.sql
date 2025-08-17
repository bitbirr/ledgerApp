-- --------------------------------------------------------
-- Host:                         47.236.39.181
-- Server version:               10.5.27-MariaDB - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table ledger.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `category_id` varchar(255) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `archived` tinyint(1) DEFAULT 0,
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.accounts: ~9 rows (approximately)
INSERT INTO `accounts` (`id`, `name`, `phone`, `type`, `category_id`, `photo_url`, `created_at`, `archived`, `user_id`, `business_id`) VALUES
	('acc_ism_clientA', 'SomTel Jigjiga', '+252-63-000000', 'customer', 'cat_ism_services', NULL, '2025-08-17 07:26:37', 0, 'user_ismail', 'biz_ismail'),
	('acc_ism_clientB', 'Jigjiga Univ.', '+251-25-000000', 'customer', 'cat_ism_services', NULL, '2025-08-17 07:26:37', 0, 'user_ismail', 'biz_ismail'),
	('acc_ism_supplier', 'Ethio IT Supply', '+251-11-000000', 'vendor', 'cat_ism_parts', NULL, '2025-08-17 07:26:37', 0, 'user_ismail', 'biz_ismail'),
	('acc_maw_clientA', 'Regional Bureau', '+251-25-111111', 'customer', 'cat_maw_audio', NULL, '2025-08-17 07:26:37', 0, 'user_mawlid', 'biz_mawlid'),
	('acc_maw_clientB', 'Fafan Media', '+251-25-222222', 'customer', 'cat_maw_video', NULL, '2025-08-17 07:26:37', 0, 'user_mawlid', 'biz_mawlid'),
	('acc_maw_supplier', 'Djibouti Print House', '+253-21-000000', 'vendor', 'cat_maw_print', NULL, '2025-08-17 07:26:37', 0, 'user_mawlid', 'biz_mawlid'),
	('acc_naj_clientA', 'Karamara Hotel', '+251-25-000111', 'customer', 'cat_naj_home', NULL, '2025-08-17 07:26:37', 0, 'user_najib', 'biz_najib'),
	('acc_naj_clientB', 'City Mall', '+251-25-000222', 'customer', 'cat_naj_mobile', NULL, '2025-08-17 07:26:37', 0, 'user_najib', 'biz_najib'),
	('acc_naj_supplier', 'Addis Electronics Dist.', '+251-11-123456', 'vendor', 'cat_naj_access', NULL, '2025-08-17 07:26:37', 0, 'user_najib', 'biz_najib');

-- Dumping structure for table ledger.app_settings
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` varchar(20) DEFAULT 'string',
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `app_settings_setting_key_unique` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.app_settings: ~2 rows (approximately)
INSERT INTO `app_settings` (`setting_id`, `setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_system`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(3, 'ui.theme', 'light', 'string', 'ui', 'Default UI theme', 0, '2025-08-17 07:26:38', '2025-08-17 07:26:38', NULL, NULL),
	(4, 'tax.defaultVatPct', '0.1500', 'number', 'tax', 'Default VAT %', 1, '2025-08-17 07:26:38', '2025-08-17 07:26:38', NULL, NULL);

-- Dumping structure for table ledger.businesses
CREATE TABLE IF NOT EXISTS `businesses` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` text DEFAULT NULL,
  `owner_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.businesses: ~3 rows (approximately)
INSERT INTO `businesses` (`id`, `name`, `address`, `phone`, `email`, `website`, `logo_url`, `owner_id`, `created_at`, `updated_at`) VALUES
	('biz_ismail', 'Eng Ismail ICT Company', 'Kebele 04, Jigjiga, Ethiopia', '+251-91-000-0001', 'info@eng-ict.com', 'https://eng-ict.com', NULL, 'user_ismail', '2025-08-17 07:26:32', '2025-08-17 07:26:32'),
	('biz_mawlid', 'Mawlid Opera Studio', 'Fafan, Jigjiga, Ethiopia', '+251-91-000-0003', 'hello@opera.studio', 'https://opera.studio', NULL, 'user_mawlid', '2025-08-17 07:26:32', '2025-08-17 07:26:32'),
	('biz_najib', 'Najib Haji Electronics', 'Karamara, Jigjiga, Ethiopia', '+251-91-000-0002', 'support@hajielec.com', 'https://hajielec.com', NULL, 'user_najib', '2025-08-17 07:26:32', '2025-08-17 07:26:32');

-- Dumping structure for table ledger.business_users
CREATE TABLE IF NOT EXISTS `business_users` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'staff',
  `permissions` text DEFAULT NULL,
  `invited_by` varchar(255) DEFAULT NULL,
  `invited_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `accepted_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.business_users: ~3 rows (approximately)
INSERT INTO `business_users` (`id`, `business_id`, `user_id`, `role`, `permissions`, `invited_by`, `invited_at`, `accepted_at`, `status`, `created_at`) VALUES
	('bu_ismail_owner', 'biz_ismail', 'user_ismail', 'owner', NULL, 'user_ismail', '2025-08-17 07:26:34', '2025-08-17 07:26:34', 'accepted', '2025-08-17 07:26:34'),
	('bu_mawlid_owner', 'biz_mawlid', 'user_mawlid', 'owner', NULL, 'user_mawlid', '2025-08-17 07:26:34', '2025-08-17 07:26:34', 'accepted', '2025-08-17 07:26:34'),
	('bu_najib_owner', 'biz_najib', 'user_najib', 'owner', NULL, 'user_najib', '2025-08-17 07:26:34', '2025-08-17 07:26:34', 'accepted', '2025-08-17 07:26:34');

-- Dumping structure for table ledger.cashbook
CREATE TABLE IF NOT EXISTS `cashbook` (
  `id` varchar(255) NOT NULL,
  `date_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `direction` varchar(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `attachment_url` text DEFAULT NULL,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.cashbook: ~2 rows (approximately)
INSERT INTO `cashbook` (`id`, `date_time`, `direction`, `amount`, `note`, `attachment_url`, `business_id`) VALUES
	('cb_ism_1', '2025-08-05 07:27:21', 'in', 20000.00, 'SomTel payment', NULL, 'biz_ismail'),
	('cb_ism_2', '2025-08-12 07:27:21', 'out', 3000.00, 'Office supplies', NULL, 'biz_ismail'),
	('cb_maw_1', '2025-08-10 07:27:21', 'out', 5000.00, 'Studio rent', NULL, 'biz_mawlid'),
	('cb_naj_1', '2025-07-30 07:27:21', 'in', 45000.00, 'TV cash sale', NULL, 'biz_najib'),
	('cb_naj_2', '2025-08-14 07:27:21', 'out', 7000.00, 'Shop utilities', NULL, 'biz_najib');

-- Dumping structure for table ledger.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.categories: ~4 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `color`, `business_id`) VALUES
	('cat_ism_hw', 'Hardware', '#8E24AA', 'biz_ismail'),
	('cat_ism_parts', 'Parts', '#00897B', 'biz_ismail'),
	('cat_ism_services', 'ICT Services', '#1976D2', 'biz_ismail'),
	('cat_maw_audio', 'Audio Services', '#1976D2', 'biz_mawlid'),
	('cat_maw_print', 'Print', '#00897B', 'biz_mawlid'),
	('cat_maw_video', 'Video Services', '#8E24AA', 'biz_mawlid'),
	('cat_naj_access', 'Accessories', '#00897B', 'biz_najib'),
	('cat_naj_home', 'Home Electronics', '#1976D2', 'biz_najib'),
	('cat_naj_mobile', 'Mobile', '#8E24AA', 'biz_najib');

-- Dumping structure for table ledger.gl_accounts
CREATE TABLE IF NOT EXISTS `gl_accounts` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `is_leaf` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `system_flag` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.gl_accounts: ~9 rows (approximately)
INSERT INTO `gl_accounts` (`id`, `business_id`, `code`, `name`, `type`, `parent_id`, `is_leaf`, `is_active`, `system_flag`, `description`, `created_at`, `updated_at`) VALUES
	('biz_ismail_1000', 'biz_ismail', '1000', 'Cash', 'asset', NULL, 1, 1, 1, 'Cash in hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_1100', 'biz_ismail', '1100', 'Accounts Receivable', 'asset', NULL, 1, 1, 1, 'Trade debtors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_1200', 'biz_ismail', '1200', 'Inventory', 'asset', NULL, 1, 1, 1, 'Inventory on hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_2000', 'biz_ismail', '2000', 'Accounts Payable', 'liability', NULL, 1, 1, 1, 'Trade creditors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_3000', 'biz_ismail', '3000', 'Owner’s Equity', 'equity', NULL, 1, 1, 1, 'Capital', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_4000', 'biz_ismail', '4000', 'Sales Revenue', 'revenue', NULL, 1, 1, 1, 'Product/service sales', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_5000', 'biz_ismail', '5000', 'Cost of Goods Sold', 'expense', NULL, 1, 1, 1, 'COGS', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_ismail_5100', 'biz_ismail', '5100', 'Rent Expense', 'expense', NULL, 1, 1, 1, 'Rent', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_1000', 'biz_mawlid', '1000', 'Cash', 'asset', NULL, 1, 1, 1, 'Cash in hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_1100', 'biz_mawlid', '1100', 'Accounts Receivable', 'asset', NULL, 1, 1, 1, 'Trade debtors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_1200', 'biz_mawlid', '1200', 'Inventory', 'asset', NULL, 1, 1, 1, 'Inventory on hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_2000', 'biz_mawlid', '2000', 'Accounts Payable', 'liability', NULL, 1, 1, 1, 'Trade creditors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_3000', 'biz_mawlid', '3000', 'Owner’s Equity', 'equity', NULL, 1, 1, 1, 'Capital', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_4000', 'biz_mawlid', '4000', 'Sales Revenue', 'revenue', NULL, 1, 1, 1, 'Product/service sales', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_5000', 'biz_mawlid', '5000', 'Cost of Goods Sold', 'expense', NULL, 1, 1, 1, 'COGS', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_mawlid_5100', 'biz_mawlid', '5100', 'Rent Expense', 'expense', NULL, 1, 1, 1, 'Rent', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_1000', 'biz_najib', '1000', 'Cash', 'asset', NULL, 1, 1, 1, 'Cash in hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_1100', 'biz_najib', '1100', 'Accounts Receivable', 'asset', NULL, 1, 1, 1, 'Trade debtors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_1200', 'biz_najib', '1200', 'Inventory', 'asset', NULL, 1, 1, 1, 'Inventory on hand', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_2000', 'biz_najib', '2000', 'Accounts Payable', 'liability', NULL, 1, 1, 1, 'Trade creditors', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_3000', 'biz_najib', '3000', 'Owner’s Equity', 'equity', NULL, 1, 1, 1, 'Capital', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_4000', 'biz_najib', '4000', 'Sales Revenue', 'revenue', NULL, 1, 1, 1, 'Product/service sales', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_5000', 'biz_najib', '5000', 'Cost of Goods Sold', 'expense', NULL, 1, 1, 1, 'COGS', '2025-08-17 07:26:40', '2025-08-17 07:26:40'),
	('biz_najib_5100', 'biz_najib', '5100', 'Rent Expense', 'expense', NULL, 1, 1, 1, 'Rent', '2025-08-17 07:26:40', '2025-08-17 07:26:40');

-- Dumping structure for table ledger.gl_journal_entries
CREATE TABLE IF NOT EXISTS `gl_journal_entries` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `memo` text DEFAULT NULL,
  `source_module` varchar(50) NOT NULL,
  `source_id` varchar(255) DEFAULT NULL,
  `posted_by` varchar(255) NOT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `locked` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.gl_journal_entries: ~3 rows (approximately)
INSERT INTO `gl_journal_entries` (`id`, `business_id`, `entry_date`, `memo`, `source_module`, `source_id`, `posted_by`, `posted_at`, `created_at`, `locked`) VALUES
	('je_ism_open', 'biz_ismail', '2025-01-01 16:00:00', 'Opening balance', 'opening_balance', NULL, 'user_ismail', '2025-08-17 07:26:44', '2025-08-17 07:26:44', 0),
	('je_ism_receipt1', 'biz_ismail', '2025-08-05 07:27:03', 'SomTel payment', 'cashbook', NULL, 'user_ismail', '2025-08-17 07:27:03', '2025-08-17 07:27:03', 0),
	('je_ism_sale1', 'biz_ismail', '2025-07-28 07:26:52', 'Network setup for SomTel – on credit', 'invoice', NULL, 'user_ismail', '2025-08-17 07:26:52', '2025-08-17 07:26:52', 0),
	('je_maw_open', 'biz_mawlid', '2025-01-01 16:00:00', 'Opening balance', 'opening_balance', NULL, 'user_mawlid', '2025-08-17 07:26:51', '2025-08-17 07:26:51', 0),
	('je_maw_rent', 'biz_mawlid', '2025-08-10 07:27:14', 'Studio rent', 'manual', NULL, 'user_mawlid', '2025-08-17 07:27:14', '2025-08-17 07:27:14', 0),
	('je_maw_sale1', 'biz_mawlid', '2025-08-02 07:26:58', 'Recording session – on credit', 'invoice', NULL, 'user_mawlid', '2025-08-17 07:26:58', '2025-08-17 07:26:58', 0),
	('je_naj_cogs1', 'biz_najib', '2025-07-30 07:27:06', 'COGS for Samsung sale', 'inventory', NULL, 'user_najib', '2025-08-17 07:27:06', '2025-08-17 07:27:06', 0),
	('je_naj_open', 'biz_najib', '2025-01-01 16:00:00', 'Opening balance', 'opening_balance', NULL, 'user_najib', '2025-08-17 07:26:45', '2025-08-17 07:26:45', 0),
	('je_naj_purchase1', 'biz_najib', '2025-07-23 07:27:05', 'Purchase 3x Samsung 55" on credit', 'purchase', NULL, 'user_najib', '2025-08-17 07:27:05', '2025-08-17 07:27:05', 0),
	('je_naj_sale1', 'biz_najib', '2025-07-30 07:26:53', 'Sold Samsung 55" to Karamara Hotel – cash', 'invoice', NULL, 'user_najib', '2025-08-17 07:26:53', '2025-08-17 07:26:53', 0);

-- Dumping structure for table ledger.gl_journal_lines
CREATE TABLE IF NOT EXISTS `gl_journal_lines` (
  `id` varchar(255) NOT NULL,
  `entry_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `debit` decimal(14,2) DEFAULT 0.00,
  `credit` decimal(14,2) DEFAULT 0.00,
  `party_id` varchar(255) DEFAULT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.gl_journal_lines: ~8 rows (approximately)
INSERT INTO `gl_journal_lines` (`id`, `entry_id`, `business_id`, `account_id`, `debit`, `credit`, `party_id`, `item_id`, `notes`) VALUES
	('je_ism_open_L1', 'je_ism_open', 'biz_ismail', 'biz_ismail_1000', 50000.00, 0.00, NULL, NULL, NULL),
	('je_ism_open_L2', 'je_ism_open', 'biz_ismail', 'biz_ismail_3000', 0.00, 50000.00, NULL, NULL, NULL),
	('je_ism_receipt1_L1', 'je_ism_receipt1', 'biz_ismail', 'biz_ismail_1000', 20000.00, 0.00, NULL, NULL, 'Cash in'),
	('je_ism_receipt1_L2', 'je_ism_receipt1', 'biz_ismail', 'biz_ismail_1100', 0.00, 20000.00, NULL, NULL, 'Reduce AR'),
	('je_ism_sale1_L1', 'je_ism_sale1', 'biz_ismail', 'biz_ismail_1100', 25000.00, 0.00, NULL, NULL, 'AR SomTel'),
	('je_ism_sale1_L2', 'je_ism_sale1', 'biz_ismail', 'biz_ismail_4000', 0.00, 25000.00, NULL, NULL, 'Sales revenue'),
	('je_maw_open_L1', 'je_maw_open', 'biz_mawlid', 'biz_mawlid_1000', 30000.00, 0.00, NULL, NULL, NULL),
	('je_maw_open_L2', 'je_maw_open', 'biz_mawlid', 'biz_mawlid_3000', 0.00, 30000.00, NULL, NULL, NULL),
	('je_maw_rent_L1', 'je_maw_rent', 'biz_mawlid', 'biz_mawlid_5100', 5000.00, 0.00, NULL, NULL, 'Rent'),
	('je_maw_rent_L2', 'je_maw_rent', 'biz_mawlid', 'biz_mawlid_1000', 0.00, 5000.00, NULL, NULL, 'Cash out'),
	('je_maw_sale1_L1', 'je_maw_sale1', 'biz_mawlid', 'biz_mawlid_1100', 4000.00, 0.00, NULL, NULL, 'AR Fafan Media'),
	('je_maw_sale1_L2', 'je_maw_sale1', 'biz_mawlid', 'biz_mawlid_4000', 0.00, 4000.00, NULL, NULL, 'Sales revenue'),
	('je_naj_cogs1_L1', 'je_naj_cogs1', 'biz_najib', 'biz_najib_5000', 40000.00, 0.00, NULL, NULL, 'COGS'),
	('je_naj_cogs1_L2', 'je_naj_cogs1', 'biz_najib', 'biz_najib_1200', 0.00, 40000.00, NULL, NULL, 'Inventory out'),
	('je_naj_open_L1', 'je_naj_open', 'biz_najib', 'biz_najib_1000', 80000.00, 0.00, NULL, NULL, NULL),
	('je_naj_open_L2', 'je_naj_open', 'biz_najib', 'biz_najib_3000', 0.00, 80000.00, NULL, NULL, NULL),
	('je_naj_purchase1_L1', 'je_naj_purchase1', 'biz_najib', 'biz_najib_1200', 120000.00, 0.00, NULL, NULL, 'Inventory'),
	('je_naj_purchase1_L2', 'je_naj_purchase1', 'biz_najib', 'biz_najib_2000', 0.00, 120000.00, NULL, NULL, 'AP Addis Electronics'),
	('je_naj_sale1_L1', 'je_naj_sale1', 'biz_najib', 'biz_najib_1000', 45000.00, 0.00, NULL, NULL, 'Cash sale'),
	('je_naj_sale1_L2', 'je_naj_sale1', 'biz_najib', 'biz_najib_4000', 0.00, 45000.00, NULL, NULL, 'Sales revenue');

-- Dumping structure for table ledger.inventory_movements
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `item_id` varchar(255) NOT NULL,
  `qty_in` decimal(14,3) DEFAULT 0.000,
  `qty_out` decimal(14,3) DEFAULT 0.000,
  `unit_cost` decimal(14,4) NOT NULL,
  `value` decimal(16,2) NOT NULL,
  `source_module` varchar(50) NOT NULL,
  `source_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.inventory_movements: ~1 rows (approximately)
INSERT INTO `inventory_movements` (`id`, `business_id`, `date`, `item_id`, `qty_in`, `qty_out`, `unit_cost`, `value`, `source_module`, `source_id`, `created_at`) VALUES
	('im_naj_in_1', 'biz_najib', '2025-07-23 07:27:22', 'itm_naj_tv', 3.000, 0.000, 40000.0000, 120000.00, 'purchase', 'je_naj_purchase1', '2025-08-17 07:27:22'),
	('im_naj_out_1', 'biz_najib', '2025-07-30 07:27:22', 'itm_naj_tv', 0.000, 1.000, 40000.0000, 40000.00, 'invoice', 'je_naj_cogs1', '2025-08-17 07:27:22');

-- Dumping structure for table ledger.invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` varchar(255) NOT NULL,
  `number` varchar(100) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `due_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `addl_charges` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `pdf_url` text DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.invoices: ~1 rows (approximately)
INSERT INTO `invoices` (`id`, `number`, `account_id`, `kind`, `issue_date`, `due_date`, `subtotal`, `discount`, `addl_charges`, `total`, `pdf_url`, `status`, `business_id`) VALUES
	('inv_ism_001', 'INV-ISM-001', 'acc_ism_clientA', 'sale', '2025-07-28 07:27:23', '2025-08-12 07:27:23', 25000.00, 0.00, 0.00, 25000.00, NULL, 'open', 'biz_ismail'),
	('inv_maw_001', 'INV-MAW-001', 'acc_maw_clientB', 'sale', '2025-08-02 07:27:23', '2025-08-15 07:27:23', 4000.00, 0.00, 0.00, 4000.00, NULL, 'open', 'biz_mawlid'),
	('inv_naj_001', 'INV-NAJ-001', 'acc_naj_clientA', 'sale', '2025-07-30 07:27:23', '2025-08-16 07:27:23', 45000.00, 0.00, 0.00, 45000.00, NULL, 'paid', 'biz_najib');

-- Dumping structure for table ledger.invoice_items
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` varchar(255) NOT NULL,
  `invoice_id` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `discount_pct` decimal(5,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.invoice_items: ~1 rows (approximately)
INSERT INTO `invoice_items` (`id`, `invoice_id`, `item_id`, `qty`, `rate`, `discount_pct`, `total`) VALUES
	('ii_ism_001_1', 'inv_ism_001', 'itm_ism_service', 1.00, 25000.00, 0.00, 25000.00),
	('ii_maw_001_1', 'inv_maw_001', 'itm_maw_rec', 5.00, 800.00, 0.00, 4000.00),
	('ii_naj_001_1', 'inv_naj_001', 'itm_naj_tv', 1.00, 45000.00, 0.00, 45000.00);

-- Dumping structure for table ledger.items
CREATE TABLE IF NOT EXISTS `items` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `uom` varchar(50) NOT NULL,
  `category_id` varchar(255) DEFAULT NULL,
  `opening_stock` decimal(10,2) DEFAULT 0.00,
  `low_stock_alert` decimal(10,2) DEFAULT 0.00,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.items: ~4 rows (approximately)
INSERT INTO `items` (`id`, `name`, `rate`, `uom`, `category_id`, `opening_stock`, `low_stock_alert`, `business_id`) VALUES
	('itm_ism_router', 'Cisco Router', 15000.00, 'pcs', 'cat_ism_hw', 10.00, 2.00, 'biz_ismail'),
	('itm_ism_service', 'Network Setup (per site)', 25000.00, 'job', 'cat_ism_services', 0.00, 0.00, 'biz_ismail'),
	('itm_maw_print', 'A3 Poster Print', 150.00, 'pcs', 'cat_maw_print', 200.00, 50.00, 'biz_mawlid'),
	('itm_maw_rec', 'Studio Recording (hour)', 800.00, 'hr', 'cat_maw_audio', 0.00, 0.00, 'biz_mawlid'),
	('itm_naj_phone', 'Tecno Spark 10', 12000.00, 'pcs', 'cat_naj_mobile', 8.00, 2.00, 'biz_najib'),
	('itm_naj_tv', 'Samsung 55" 4K TV', 45000.00, 'pcs', 'cat_naj_home', 5.00, 1.00, 'biz_najib');

-- Dumping structure for table ledger.opening_balances
CREATE TABLE IF NOT EXISTS `opening_balances` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `period_start` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `memo` text DEFAULT NULL,
  `locked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.opening_balances: ~1 rows (approximately)
INSERT INTO `opening_balances` (`id`, `business_id`, `period_start`, `memo`, `locked`, `created_at`) VALUES
	('ob_ism_2025', 'biz_ismail', '2024-12-31 16:00:00', 'Opening balance 2025', 0, '2025-08-17 07:26:41'),
	('ob_maw_2025', 'biz_mawlid', '2024-12-31 16:00:00', 'Opening balance 2025', 0, '2025-08-17 07:26:41'),
	('ob_naj_2025', 'biz_najib', '2024-12-31 16:00:00', 'Opening balance 2025', 0, '2025-08-17 07:26:41');

-- Dumping structure for table ledger.posting_rules
CREATE TABLE IF NOT EXISTS `posting_rules` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `debit_account_id` varchar(255) DEFAULT NULL,
  `credit_account_id` varchar(255) DEFAULT NULL,
  `formula` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.posting_rules: ~2 rows (approximately)

-- Dumping structure for table ledger.preferences
CREATE TABLE IF NOT EXISTS `preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_format` varchar(20) DEFAULT 'DD/MM/YYYY',
  `time_format` varchar(5) DEFAULT '12',
  `currency` varchar(10) DEFAULT 'ETB',
  `language` varchar(10) DEFAULT 'en',
  `first_day_of_week` int(11) DEFAULT 1,
  `first_day_of_month` int(11) DEFAULT 1,
  `first_day_of_year` int(11) DEFAULT 1,
  `show_time_in_reports` tinyint(1) DEFAULT 1,
  `show_previous_balance` tinyint(1) DEFAULT 1,
  `dark_mode` tinyint(1) DEFAULT 0,
  `biometric_enabled` tinyint(1) DEFAULT 0,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.preferences: ~3 rows (approximately)
INSERT INTO `preferences` (`id`, `date_format`, `time_format`, `currency`, `language`, `first_day_of_week`, `first_day_of_month`, `first_day_of_year`, `show_time_in_reports`, `show_previous_balance`, `dark_mode`, `biometric_enabled`, `business_id`) VALUES
	(4, 'YYYY-MM-DD', '24', 'ETB', 'en', 1, 1, 1, 1, 1, 0, 0, 'biz_ismail'),
	(5, 'YYYY-MM-DD', '24', 'ETB', 'en', 1, 1, 1, 1, 1, 0, 0, 'biz_najib'),
	(6, 'YYYY-MM-DD', '24', 'ETB', 'en', 1, 1, 1, 1, 1, 0, 0, 'biz_mawlid');

-- Dumping structure for table ledger.tax_codes
CREATE TABLE IF NOT EXISTS `tax_codes` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `rate_id` varchar(255) NOT NULL,
  `scope` varchar(20) NOT NULL,
  `direction` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.tax_codes: ~1 rows (approximately)
INSERT INTO `tax_codes` (`id`, `business_id`, `code`, `name`, `rate_id`, `scope`, `direction`, `is_default`) VALUES
	('taxcode_vat_sales_ism', 'biz_ismail', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_ism', 'sales', 'output', 1),
	('taxcode_vat_sales_maw', 'biz_mawlid', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_maw', 'sales', 'output', 1),
	('taxcode_vat_sales_naj', 'biz_najib', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_naj', 'sales', 'output', 1);

-- Dumping structure for table ledger.tax_rates
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rate` decimal(6,4) NOT NULL,
  `effective_from` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `effective_to` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `is_active` tinyint(1) DEFAULT 1,
  `kind` varchar(10) DEFAULT 'VAT',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.tax_rates: ~2 rows (approximately)
INSERT INTO `tax_rates` (`id`, `business_id`, `name`, `rate`, `effective_from`, `effective_to`, `is_active`, `kind`) VALUES
	('taxrate_vat15_biz_ism', 'biz_ismail', 'VAT 15%', 0.1500, '2025-04-19 07:26:39', '2025-08-17 15:26:41', 1, 'VAT'),
	('taxrate_vat15_biz_maw', 'biz_mawlid', 'VAT 15%', 0.1500, '2025-04-19 07:26:39', '2025-08-17 15:26:41', 1, 'VAT'),
	('taxrate_vat15_biz_naj', 'biz_najib', 'VAT 15%', 0.1500, '2025-04-19 07:26:39', '2025-08-17 15:26:41', 1, 'VAT');

-- Dumping structure for table ledger.transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `date_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `kind` varchar(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `due_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0,
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.transactions: ~2 rows (approximately)
INSERT INTO `transactions` (`id`, `account_id`, `date_time`, `kind`, `amount`, `note`, `image_url`, `due_date`, `created_at`, `updated_at`, `deleted`, `user_id`, `business_id`) VALUES
	('txn_ism_1', 'acc_ism_clientA', '2025-07-28 07:27:23', 'credit', 25000.00, 'Invoice INV-ISM-001', NULL, '2025-08-12 07:27:23', '2025-08-17 07:27:23', '2025-08-17 07:27:23', 0, 'user_ismail', 'biz_ismail'),
	('txn_ism_2', 'acc_ism_clientA', '2025-08-05 07:27:23', 'debit', 20000.00, 'Cash received', NULL, '2025-08-17 15:27:26', '2025-08-17 07:27:23', '2025-08-17 07:27:23', 0, 'user_ismail', 'biz_ismail'),
	('txn_maw_1', 'acc_maw_clientB', '2025-08-02 07:27:23', 'credit', 4000.00, 'Invoice INV-MAW-001', NULL, '2025-08-15 07:27:23', '2025-08-17 07:27:23', '2025-08-17 07:27:23', 0, 'user_mawlid', 'biz_mawlid'),
	('txn_naj_1', 'acc_naj_clientA', '2025-07-30 07:27:23', 'credit', 45000.00, 'Cash sale INV-NAJ-001', NULL, '2025-08-17 15:27:26', '2025-08-17 07:27:23', '2025-08-17 07:27:23', 0, 'user_najib', 'biz_najib');

-- Dumping structure for table ledger.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `email`, `name`, `password_hash`, `email_verified`, `created_at`, `updated_at`) VALUES
	('user_ismail', 'ismail@eng-ict.com', 'Eng. Ismail', 'hash_ismail', 1, '2025-08-17 07:26:32', '2025-08-17 07:26:32'),
	('user_mawlid', 'mawlid@opera.studio', 'Mawlid Opera', 'hash_mawlid', 1, '2025-08-17 07:26:32', '2025-08-17 07:26:32'),
	('user_najib', 'najib@hajielec.com', 'Najib Haji', 'hash_najib', 1, '2025-08-17 07:26:32', '2025-08-17 07:26:32');

-- Dumping structure for table ledger.__drizzle_migrations
CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table ledger.__drizzle_migrations: ~2 rows (approximately)
INSERT INTO `__drizzle_migrations` (`id`, `hash`, `created_at`) VALUES
	(1, 'f90e28137278315d6e810b29e5e17f30d6d6b49fb9c10ca55f2d5027ae72549b', 1755290577921),
	(2, 'a382cd9b5724e1f761b3922f2d6acc3e63af2523ffc553f111225b9cb9802a50', 1755370769720);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
