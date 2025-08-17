-- Full Database Migration Script for RBAC Implementation
-- This script will drop all existing tables and recreate them with the RBAC schema
use ledger;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS gl_journal_lines;
DROP TABLE IF EXISTS gl_journal_entries;
DROP TABLE IF EXISTS inventory_movements;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS posting_rules;
DROP TABLE IF EXISTS tax_codes;
DROP TABLE IF EXISTS tax_rates;
DROP TABLE IF EXISTS gl_accounts;
DROP TABLE IF EXISTS opening_balances;
DROP TABLE IF EXISTS business_users;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS cashbook;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Create tables in correct order (respecting foreign key dependencies)

-- Users table - for authentication and user management
CREATE TABLE users (
  id varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  email_verified boolean DEFAULT false,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
);

-- Businesses table - replaces shops with enhanced multi-tenant features
CREATE TABLE businesses (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  address text,
  phone varchar(50),
  email varchar(255),
  website varchar(255),
  logo_url text,
  owner_id varchar(255) NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Branches table - for multi-branch support
CREATE TABLE branches (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  address text,
  phone varchar(50),
  email varchar(255),
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_branches_business (business_id),
  CONSTRAINT fk_branches_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Business Users junction table - for staff invitations and roles
CREATE TABLE business_users (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  branch_id varchar(255),
  user_id varchar(255) NOT NULL,
  role varchar(50) DEFAULT 'staff',
  permissions text,
  invited_by varchar(255),
  invited_at timestamp DEFAULT CURRENT_TIMESTAMP,
  accepted_at timestamp,
  status varchar(20) DEFAULT 'pending',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_business_users_business (business_id),
  KEY ix_business_users_branch (branch_id),
  KEY ix_business_users_user (user_id),
  CONSTRAINT fk_business_users_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_business_users_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE SET NULL,
  CONSTRAINT fk_business_users_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Update accounts table to use businessId instead of shopId
CREATE TABLE accounts (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  phone varchar(50),
  type varchar(50) NOT NULL,
  category_id varchar(255),
  business_id varchar(255) NOT NULL,
  photo_url text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  archived boolean DEFAULT false,
  user_id varchar(255) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_accounts_business (business_id),
  CONSTRAINT fk_accounts_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Update categories table to include businessId for multi-tenancy
CREATE TABLE categories (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  color varchar(7) NOT NULL,
  business_id varchar(255) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_categories_business (business_id),
  CONSTRAINT fk_categories_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Update transactions table to include businessId
CREATE TABLE transactions (
  id varchar(255) NOT NULL,
  account_id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  date_time timestamp NOT NULL,
  kind varchar(10) NOT NULL,
  amount decimal(10,2) NOT NULL,
  note text,
  image_url text,
  due_date timestamp,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  deleted boolean DEFAULT false,
  user_id varchar(255) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_transactions_account (account_id),
  KEY ix_transactions_business (business_id),
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Update cashbook table to include businessId
CREATE TABLE cashbook (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  date_time timestamp NOT NULL,
  direction varchar(10) NOT NULL,
  amount decimal(10,2) NOT NULL,
  note text,
  attachment_url text,
  PRIMARY KEY (id),
  KEY ix_cashbook_business (business_id),
  CONSTRAINT fk_cashbook_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Update items table to include businessId
CREATE TABLE items (
  id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  rate decimal(10,2) NOT NULL,
  uom varchar(50) NOT NULL,
  category_id varchar(255),
  business_id varchar(255) NOT NULL,
  opening_stock decimal(10,2) DEFAULT '0',
  low_stock_alert decimal(10,2) DEFAULT '0',
  PRIMARY KEY (id),
  KEY ix_items_business (business_id),
  CONSTRAINT fk_items_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Update invoices table to include businessId
CREATE TABLE invoices (
  id varchar(255) NOT NULL,
  number varchar(100) NOT NULL,
  account_id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  kind varchar(20) NOT NULL,
  issue_date timestamp NOT NULL,
  due_date timestamp,
  subtotal decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT '0',
  addl_charges decimal(10,2) DEFAULT '0',
  total decimal(10,2) NOT NULL,
  pdf_url text,
  status varchar(20) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_invoices_account (account_id),
  KEY ix_invoices_business (business_id),
  CONSTRAINT fk_invoices_account FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE invoice_items (
  id varchar(255) NOT NULL,
  invoice_id varchar(255) NOT NULL,
  item_id varchar(255) NOT NULL,
  qty decimal(10,2) NOT NULL,
  rate decimal(10,2) NOT NULL,
  discount_pct decimal(5,2) DEFAULT '0',
  total decimal(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_invoice_items_invoice (invoice_id),
  KEY ix_invoice_items_item (item_id),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_items_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

-- Update preferences to be business-specific
CREATE TABLE preferences (
  id int NOT NULL AUTO_INCREMENT,
  business_id varchar(255) NOT NULL,
  date_format varchar(20) DEFAULT 'DD/MM/YYYY',
  time_format varchar(5) DEFAULT '12',
  currency varchar(10) DEFAULT 'ETB',
  language varchar(10) DEFAULT 'en',
  first_day_of_week int DEFAULT 1,
  first_day_of_month int DEFAULT 1,
  first_day_of_year int DEFAULT 1,
  show_time_in_reports boolean DEFAULT true,
  show_previous_balance boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  biometric_enabled boolean DEFAULT false,
  PRIMARY KEY (id),
  KEY ix_preferences_business (business_id),
  CONSTRAINT fk_preferences_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Add the new app_settings table
CREATE TABLE app_settings (
  setting_id int NOT NULL AUTO_INCREMENT,
  setting_key varchar(100) NOT NULL,
  setting_value text,
  setting_type varchar(20) DEFAULT 'string',
  category varchar(50) NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by varchar(100),
  updated_by varchar(100),
  PRIMARY KEY (setting_id),
  UNIQUE KEY uk_app_settings_key (setting_key)
);

-- General Ledger (GL) and Tax tables for double-entry accounting (Config C)

-- Chart of Accounts
CREATE TABLE gl_accounts (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  name varchar(255) NOT NULL,
  type varchar(20) NOT NULL,
  parent_id varchar(255),
  is_leaf boolean DEFAULT true,
  is_active boolean DEFAULT true,
  system_flag boolean DEFAULT false,
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_gl_accounts_business (business_id),
  CONSTRAINT fk_gl_accounts_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Journal Entries (header)
CREATE TABLE gl_journal_entries (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  entry_date timestamp NOT NULL,
  memo text,
  source_module varchar(50) NOT NULL,
  source_id varchar(255),
  posted_by varchar(255) NOT NULL,
  posted_at timestamp DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  locked boolean DEFAULT false,
  PRIMARY KEY (id),
  KEY ix_gl_journal_entries_business (business_id),
  CONSTRAINT fk_gl_journal_entries_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Journal Lines (detail)
CREATE TABLE gl_journal_lines (
  id varchar(255) NOT NULL,
  entry_id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  account_id varchar(255) NOT NULL,
  debit decimal(14,2) DEFAULT '0',
  credit decimal(14,2) DEFAULT '0',
  party_id varchar(255),
  item_id varchar(255),
  notes text,
  PRIMARY KEY (id),
  KEY ix_gl_journal_lines_entry (entry_id),
  KEY ix_gl_journal_lines_business (business_id),
  KEY ix_gl_journal_lines_account (account_id),
  CONSTRAINT fk_gl_journal_lines_entry FOREIGN KEY (entry_id) REFERENCES gl_journal_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_gl_journal_lines_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_gl_journal_lines_account FOREIGN KEY (account_id) REFERENCES gl_accounts (id) ON DELETE CASCADE
);

-- Inventory Movements for weighted-average costing
CREATE TABLE inventory_movements (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  date timestamp NOT NULL,
  item_id varchar(255) NOT NULL,
  qty_in decimal(14,3) DEFAULT '0',
  qty_out decimal(14,3) DEFAULT '0',
  unit_cost decimal(14,4) NOT NULL,
  value decimal(16,2) NOT NULL,
  source_module varchar(50) NOT NULL,
  source_id varchar(255) NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_inventory_movements_business (business_id),
  KEY ix_inventory_movements_item (item_id),
  CONSTRAINT fk_inventory_movements_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_inventory_movements_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

-- Tax Rates and Codes
CREATE TABLE tax_rates (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  rate decimal(6,4) NOT NULL,
  effective_from timestamp NOT NULL,
  effective_to timestamp,
  is_active boolean DEFAULT true,
  kind varchar(10) DEFAULT 'VAT',
  PRIMARY KEY (id),
  KEY ix_tax_rates_business (business_id),
  CONSTRAINT fk_tax_rates_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE TABLE tax_codes (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  name varchar(100),
  rate_id varchar(255) NOT NULL,
  scope varchar(20) NOT NULL,
  direction varchar(10) NOT NULL,
  is_default boolean DEFAULT false,
  PRIMARY KEY (id),
  KEY ix_tax_codes_business (business_id),
  CONSTRAINT fk_tax_codes_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Posting Rules (configurable)
CREATE TABLE posting_rules (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  module varchar(50) NOT NULL,
  action varchar(50) NOT NULL,
  debit_account_id varchar(255),
  credit_account_id varchar(255),
  formula text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_posting_rules_business (business_id),
  CONSTRAINT fk_posting_rules_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Opening Balances (one per business/period)
CREATE TABLE opening_balances (
  id varchar(255) NOT NULL,
  business_id varchar(255) NOT NULL,
  period_start timestamp NOT NULL,
  memo text,
  locked boolean DEFAULT false,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_opening_balances_business (business_id),
  CONSTRAINT fk_opening_balances_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

-- Audit Logs table - for tracking user actions
CREATE TABLE audit_logs (
  id varchar(255) NOT NULL,
  user_id varchar(255) NOT NULL,
  business_id varchar(255),
  branch_id varchar(255),
  action varchar(100) NOT NULL,
  table_name varchar(100),
  record_id varchar(255),
  old_values text,
  new_values text,
  ip_address varchar(45),
  user_agent varchar(500),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_audit_logs_user (user_id),
  KEY ix_audit_logs_business (business_id),
  KEY ix_audit_logs_branch (branch_id),
  KEY ix_audit_logs_action (action),
  KEY ix_audit_logs_table (table_name),
  KEY ix_audit_logs_date (created_at),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Add foreign key constraint for businesses.owner_id
ALTER TABLE businesses ADD CONSTRAINT fk_businesses_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE;

-- Insert sample data for testing

-- Insert sample users
INSERT INTO users (id, email, name, password_hash, email_verified, created_at, updated_at) VALUES
('user_ismail', 'ismail@eng-ict.com', 'Eng. Ismail', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', true, NOW(), NOW()),
('user_najib', 'najib@hajielec.com', 'Najib Haji', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', true, NOW(), NOW()),
('user_mawlid', 'mawlid@opera.studio', 'Mawlid Opera', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', true, NOW(), NOW()),
('user_admin', 'admin@system.com', 'System Administrator', '$2b$12$wHVSVzamJ66H43m5nU86ruYQqGN4we6yPn4b/6tTzpwE0fA9V0d9u', true, NOW(), NOW());

-- Insert sample businesses
INSERT INTO businesses (id, name, address, phone, email, website, logo_url, owner_id, created_at, updated_at) VALUES
('biz_ismail', 'Eng Ismail ICT Company', 'Kebele 04, Jigjiga, Ethiopia', '+251-91-000-0001', 'info@eng-ict.com', 'https://eng-ict.com', NULL, 'user_ismail', NOW(), NOW()),
('biz_najib', 'Najib Haji Electronics', 'Karamara, Jigjiga, Ethiopia', '+251-91-000-0002', 'support@hajielec.com', 'https://hajielec.com', NULL, 'user_najib', NOW(), NOW()),
('biz_mawlid', 'Mawlid Opera Studio', 'Fafan, Jigjiga, Ethiopia', '+251-91-000-0003', 'hello@opera.studio', 'https://opera.studio', NULL, 'user_mawlid', NOW(), NOW());

-- Insert sample branches
INSERT INTO branches (id, business_id, name, address, phone, email, is_active, created_at, updated_at) VALUES
('branch_ismail_main', 'biz_ismail', 'Main Branch', 'Kebele 04, Jigjiga, Ethiopia', '+251-91-000-0001', 'main@eng-ict.com', true, NOW(), NOW()),
('branch_ismail_branch1', 'biz_ismail', 'Branch 1', 'Kebele 05, Jigjiga, Ethiopia', '+251-91-000-0004', 'branch1@eng-ict.com', true, NOW(), NOW()),
('branch_najib_main', 'biz_najib', 'Main Branch', 'Karamara, Jigjiga, Ethiopia', '+251-91-000-0002', 'main@hajielec.com', true, NOW(), NOW()),
('branch_najib_branch1', 'biz_najib', 'Branch 1', 'Kebele 06, Jigjiga, Ethiopia', '+251-91-000-0005', 'branch1@hajielec.com', true, NOW(), NOW()),
('branch_mawlid_main', 'biz_mawlid', 'Main Branch', 'Fafan, Jigjiga, Ethiopia', '+251-91-000-0003', 'main@opera.studio', true, NOW(), NOW()),
('branch_mawlid_branch1', 'biz_mawlid', 'Branch 1', 'Kebele 07, Jigjiga, Ethiopia', '+251-91-000-0006', 'branch1@opera.studio', true, NOW(), NOW());

-- Insert sample business users
INSERT INTO business_users (id, business_id, branch_id, user_id, role, permissions, invited_by, invited_at, accepted_at, status, created_at) VALUES
('bu_ismail_owner', 'biz_ismail', 'branch_ismail_main', 'user_ismail', 'Admin', NULL, 'user_ismail', NOW(), NOW(), 'accepted', NOW()),
('bu_najib_owner', 'biz_najib', 'branch_najib_main', 'user_najib', 'Admin', NULL, 'user_najib', NOW(), NOW(), 'accepted', NOW()),
('bu_mawlid_owner', 'biz_mawlid', 'branch_mawlid_main', 'user_mawlid', 'Admin', NULL, 'user_mawlid', NOW(), NOW(), 'accepted', NOW()),
('bu_ismail_staff1', 'biz_ismail', 'branch_ismail_main', 'user_ismail', 'Staff', NULL, 'user_ismail', NOW(), NOW(), 'accepted', NOW()),
('bu_ismail_staff2', 'biz_ismail', 'branch_ismail_branch1', 'user_ismail', 'Staff', NULL, 'user_ismail', NOW(), NOW(), 'accepted', NOW()),
('bu_admin_super', 'biz_ismail', 'branch_ismail_main', 'user_admin', 'SuperAdmin', NULL, 'user_admin', NOW(), NOW(), 'accepted', NOW());

-- Insert sample preferences
INSERT INTO preferences (business_id, currency, language, date_format, time_format, first_day_of_week, first_day_of_month, first_day_of_year, show_time_in_reports, show_previous_balance, dark_mode, biometric_enabled) VALUES
('biz_ismail', 'ETB', 'en', 'YYYY-MM-DD', '24', 1, 1, 1, true, true, false, false),
('biz_najib', 'ETB', 'en', 'YYYY-MM-DD', '24', 1, 1, 1, true, true, false, false),
('biz_mawlid', 'ETB', 'en', 'YYYY-MM-DD', '24', 1, 1, 1, true, true, false, false);

-- Insert sample app settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, category, description, is_system, created_at, updated_at) VALUES
('ui.theme', 'light', 'string', 'ui', 'Default UI theme', false, NOW(), NOW()),
('tax.defaultVatPct', '0.1500', 'number', 'tax', 'Default VAT %', true, NOW(), NOW());

-- Insert sample categories
INSERT INTO categories (id, name, color, business_id) VALUES
('cat_ism_services', 'ICT Services', '#1976D2', 'biz_ismail'),
('cat_ism_hw', 'Hardware', '#8E24AA', 'biz_ismail'),
('cat_ism_parts', 'Parts', '#00897B', 'biz_ismail'),
('cat_naj_home', 'Home Electronics', '#1976D2', 'biz_najib'),
('cat_naj_mobile', 'Mobile', '#8E24AA', 'biz_najib'),
('cat_naj_access', 'Accessories', '#00897B', 'biz_najib'),
('cat_maw_audio', 'Audio Services', '#1976D2', 'biz_mawlid'),
('cat_maw_video', 'Video Services', '#8E24AA', 'biz_mawlid'),
('cat_maw_print', 'Print', '#00897B', 'biz_mawlid');

-- Insert sample accounts
INSERT INTO accounts (id, name, phone, type, category_id, business_id, photo_url, created_at, archived, user_id) VALUES
('acc_ism_clientA', 'SomTel Jigjiga', '+252-63-000000', 'customer', 'cat_ism_services', 'biz_ismail', NULL, NOW(), false, 'user_ismail'),
('acc_ism_clientB', 'Jigjiga Univ.', '+251-25-000000', 'customer', 'cat_ism_services', 'biz_ismail', NULL, NOW(), false, 'user_ismail'),
('acc_ism_supplier', 'Ethio IT Supply', '+251-11-000000', 'vendor', 'cat_ism_parts', 'biz_ismail', NULL, NOW(), false, 'user_ismail'),
('acc_naj_clientA', 'Karamara Hotel', '+251-25-000111', 'customer', 'cat_naj_home', 'biz_najib', NULL, NOW(), false, 'user_najib'),
('acc_naj_clientB', 'City Mall', '+251-25-000222', 'customer', 'cat_naj_mobile', 'biz_najib', NULL, NOW(), false, 'user_najib'),
('acc_naj_supplier', 'Addis Electronics Dist.', '+251-11-123456', 'vendor', 'cat_naj_access', 'biz_najib', NULL, NOW(), false, 'user_najib'),
('acc_maw_clientA', 'Regional Bureau', '+251-25-111111', 'customer', 'cat_maw_audio', 'biz_mawlid', NULL, NOW(), false, 'user_mawlid'),
('acc_maw_clientB', 'Fafan Media', '+251-25-222222', 'customer', 'cat_maw_video', 'biz_mawlid', NULL, NOW(), false, 'user_mawlid'),
('acc_maw_supplier', 'Djibouti Print House', '+253-21-000000', 'vendor', 'cat_maw_print', 'biz_mawlid', NULL, NOW(), false, 'user_mawlid');

-- Insert sample items
INSERT INTO items (id, name, rate, uom, category_id, business_id, opening_stock, low_stock_alert) VALUES
('itm_ism_router', 'Cisco Router', 15000.00, 'pcs', 'cat_ism_hw', 'biz_ismail', 10.00, 2.00),
('itm_ism_service', 'Network Setup (per site)', 25000.00, 'job', 'cat_ism_services', 'biz_ismail', 0.00, 0.00),
('itm_naj_tv', 'Samsung 55" 4K TV', 45000.00, 'pcs', 'cat_naj_home', 'biz_najib', 5.00, 1.00),
('itm_naj_phone', 'Tecno Spark 10', 12000.00, 'pcs', 'cat_naj_mobile', 'biz_najib', 8.00, 2.00),
('itm_maw_rec', 'Studio Recording (hour)', 800.00, 'hr', 'cat_maw_audio', 'biz_mawlid', 0.00, 0.00),
('itm_maw_print', 'A3 Poster Print', 150.00, 'pcs', 'cat_maw_print', 'biz_mawlid', 200.00, 50.00);

-- Insert sample tax rates and codes
INSERT INTO tax_rates (id, business_id, name, rate, effective_from, effective_to, is_active, kind) VALUES
('taxrate_vat15_biz_ism', 'biz_ismail', 'VAT 15%', 0.1500, DATE_SUB(NOW(), INTERVAL 120 DAY), NULL, true, 'VAT'),
('taxrate_vat15_biz_naj', 'biz_najib', 'VAT 15%', 0.1500, DATE_SUB(NOW(), INTERVAL 120 DAY), NULL, true, 'VAT'),
('taxrate_vat15_biz_maw', 'biz_mawlid', 'VAT 15%', 0.1500, DATE_SUB(NOW(), INTERVAL 120 DAY), NULL, true, 'VAT');

INSERT INTO tax_codes (id, business_id, code, name, rate_id, scope, direction, is_default) VALUES
('taxcode_vat_sales_ism', 'biz_ismail', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_ism', 'sales', 'output', true),
('taxcode_vat_sales_naj', 'biz_najib', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_naj', 'sales', 'output', true),
('taxcode_vat_sales_maw', 'biz_mawlid', 'VAT-SALES', 'VAT 15% Output', 'taxrate_vat15_biz_maw', 'sales', 'output', true);

-- Insert sample GL accounts
INSERT INTO gl_accounts (id, business_id, code, name, type, parent_id, is_leaf, is_active, system_flag, description, created_at, updated_at) VALUES
-- For biz_ismail
('biz_ismail_1000', 'biz_ismail', '1000', 'Cash', 'asset', NULL, true, true, true, 'Cash in hand', NOW(), NOW()),
('biz_ismail_1100', 'biz_ismail', '1100', 'Accounts Receivable', 'asset', NULL, true, true, true, 'Trade debtors', NOW(), NOW()),
('biz_ismail_1200', 'biz_ismail', '1200', 'Inventory', 'asset', NULL, true, true, true, 'Inventory on hand', NOW(), NOW()),
('biz_ismail_2000', 'biz_ismail', '2000', 'Accounts Payable', 'liability', NULL, true, true, true, 'Trade creditors', NOW(), NOW()),
('biz_ismail_3000', 'biz_ismail', '3000', 'Owner’s Equity', 'equity', NULL, true, true, true, 'Capital', NOW(), NOW()),
('biz_ismail_4000', 'biz_ismail', '4000', 'Sales Revenue', 'revenue', NULL, true, true, true, 'Product/service sales', NOW(), NOW()),
('biz_ismail_5000', 'biz_ismail', '5000', 'Cost of Goods Sold', 'expense', NULL, true, true, true, 'COGS', NOW(), NOW()),
('biz_ismail_5100', 'biz_ismail', '5100', 'Rent Expense', 'expense', NULL, true, true, true, 'Rent', NOW(), NOW()),
-- For biz_najib
('biz_najib_1000', 'biz_najib', '1000', 'Cash', 'asset', NULL, true, true, true, 'Cash in hand', NOW(), NOW()),
('biz_najib_1100', 'biz_najib', '1100', 'Accounts Receivable', 'asset', NULL, true, true, true, 'Trade debtors', NOW(), NOW()),
('biz_najib_1200', 'biz_najib', '1200', 'Inventory', 'asset', NULL, true, true, true, 'Inventory on hand', NOW(), NOW()),
('biz_najib_2000', 'biz_najib', '2000', 'Accounts Payable', 'liability', NULL, true, true, true, 'Trade creditors', NOW(), NOW()),
('biz_najib_3000', 'biz_najib', '3000', 'Owner’s Equity', 'equity', NULL, true, true, true, 'Capital', NOW(), NOW()),
('biz_najib_4000', 'biz_najib', '4000', 'Sales Revenue', 'revenue', NULL, true, true, true, 'Product/service sales', NOW(), NOW()),
('biz_najib_5000', 'biz_najib', '5000', 'Cost of Goods Sold', 'expense', NULL, true, true, true, 'COGS', NOW(), NOW()),
('biz_najib_5100', 'biz_najib', '5100', 'Rent Expense', 'expense', NULL, true, true, true, 'Rent', NOW(), NOW()),
-- For biz_mawlid
('biz_mawlid_1000', 'biz_mawlid', '1000', 'Cash', 'asset', NULL, true, true, true, 'Cash in hand', NOW(), NOW()),
('biz_mawlid_1100', 'biz_mawlid', '1100', 'Accounts Receivable', 'asset', NULL, true, true, true, 'Trade debtors', NOW(), NOW()),
('biz_mawlid_1200', 'biz_mawlid', '1200', 'Inventory', 'asset', NULL, true, true, true, 'Inventory on hand', NOW(), NOW()),
('biz_mawlid_2000', 'biz_mawlid', '2000', 'Accounts Payable', 'liability', NULL, true, true, true, 'Trade creditors', NOW(), NOW()),
('biz_mawlid_3000', 'biz_mawlid', '3000', 'Owner’s Equity', 'equity', NULL, true, true, true, 'Capital', NOW(), NOW()),
('biz_mawlid_4000', 'biz_mawlid', '4000', 'Sales Revenue', 'revenue', NULL, true, true, true, 'Product/service sales', NOW(), NOW()),
('biz_mawlid_5000', 'biz_mawlid', '5000', 'Cost of Goods Sold', 'expense', NULL, true, true, true, 'COGS', NOW(), NOW()),
('biz_mawlid_5100', 'biz_mawlid', '5100', 'Rent Expense', 'expense', NULL, true, true, true, 'Rent', NOW(), NOW());

-- Insert sample opening balances
INSERT INTO opening_balances (id, business_id, period_start, memo, locked, created_at) VALUES
('ob_ism_2025', 'biz_ismail', '2025-01-01 00:00:00', 'Opening balance 2025', false, NOW()),
('ob_naj_2025', 'biz_najib', '2025-01-01 00:00:00', 'Opening balance 2025', false, NOW()),
('ob_maw_2025', 'biz_mawlid', '2025-01-01 00:00:00', 'Opening balance 2025', false, NOW());

-- Insert sample journal entries and lines
-- Opening balances
INSERT INTO gl_journal_entries (id, business_id, entry_date, memo, source_module, source_id, posted_by, posted_at, created_at, locked) VALUES
('je_ism_open', 'biz_ismail', '2025-01-02 00:00:00', 'Opening balance', 'opening_balance', NULL, 'user_ismail', NOW(), NOW(), false),
('je_naj_open', 'biz_najib', '2025-01-02 00:00:00', 'Opening balance', 'opening_balance', NULL, 'user_najib', NOW(), NOW(), false),
('je_maw_open', 'biz_mawlid', '2025-01-02 00:00:00', 'Opening balance', 'opening_balance', NULL, 'user_mawlid', NOW(), NOW(), false);

INSERT INTO gl_journal_lines (id, entry_id, business_id, account_id, debit, credit, party_id, item_id, notes) VALUES
('je_ism_open_L1', 'je_ism_open', 'biz_ismail', 'biz_ismail_1000', '50000.00', '0.00', NULL, NULL, 'Cash'),
('je_ism_open_L2', 'je_ism_open', 'biz_ismail', 'biz_ismail_3000', '0.00', '50000.00', NULL, NULL, 'Capital'),
('je_naj_open_L1', 'je_naj_open', 'biz_najib', 'biz_najib_1000', '80000.00', '0.00', NULL, NULL, 'Cash'),
('je_naj_open_L2', 'je_naj_open', 'biz_najib', 'biz_najib_3000', '0.00', '80000.00', NULL, NULL, 'Capital'),
('je_maw_open_L1', 'je_maw_open', 'biz_mawlid', 'biz_mawlid_1000', '30000.00', '0.00', NULL, NULL, 'Cash'),
('je_maw_open_L2', 'je_maw_open', 'biz_mawlid', 'biz_mawlid_3000', '0.00', '30000.00', NULL, NULL, 'Capital');

COMMIT;