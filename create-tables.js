// create-tables.js
import mysql from 'mysql2/promise';

// Database configuration from .env
const DATABASE_URL = 'mysql://ledger_user:ledgerApp@47.236.39.181:3306/ledger?ssl=false&authPlugins=mysql_native_password';

// Parse the database URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.searchParams.get('ssl') === 'true'
};

async function createTables() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(config);
    console.log('Connected to the database');
    
    // Create tables if they don't exist
    const tables = [
      `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        logo TEXT,
        owner_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS business_users (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        branch_id VARCHAR(255),
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Staff',
        permissions TEXT,
        invited_by VARCHAR(255),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        business_id VARCHAR(255) NOT NULL
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS gl_accounts (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        parent_id VARCHAR(255),
        is_leaf BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        system_flag BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        currency VARCHAR(10) DEFAULT 'ETB',
        language VARCHAR(10) DEFAULT 'en',
        date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
        time_format VARCHAR(5) DEFAULT '24',
        first_day_of_week INT DEFAULT 1,
        first_day_of_month INT DEFAULT 1,
        first_day_of_year INT DEFAULT 1,
        show_time_in_reports BOOLEAN DEFAULT TRUE,
        show_previous_balance BOOLEAN DEFAULT TRUE,
        dark_mode BOOLEAN DEFAULT FALSE,
        biometric_enabled BOOLEAN DEFAULT FALSE
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS tax_rates (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        rate DECIMAL(6,4) NOT NULL,
        effective_from TIMESTAMP NOT NULL,
        effective_to TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        kind VARCHAR(10) DEFAULT 'VAT'
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS tax_codes (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100),
        rate_id VARCHAR(255) NOT NULL,
        scope VARCHAR(20) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE
      )
      `
    ];
    
    for (const table of tables) {
      await connection.execute(table);
      console.log(`Created table: ${table.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]}`);
    }
    
    console.log('All tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the table creation
createTables();