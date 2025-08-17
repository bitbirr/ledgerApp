-- Migration 0003_add_audit_logs.sql: Add audit logs table

-- Create audit logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255),
  `branch_id` varchar(255),
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100),
  `record_id` varchar(255),
  `old_values` json,
  `new_values` json,
  `ip_address` varchar(45),
  `user_agent` varchar(500),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_audit_logs_user` (`user_id`),
  KEY `ix_audit_logs_business` (`business_id`),
  KEY `ix_audit_logs_branch` (`branch_id`),
  KEY `ix_audit_logs_action` (`action`),
  KEY `ix_audit_logs_table` (`table_name`),
  KEY `ix_audit_logs_date` (`created_at`)
);