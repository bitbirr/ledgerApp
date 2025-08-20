node reset-database.js

npx drizzle-kit push:mysql

npx drizzle-kit push

npx drizzle-kit push

Execute Task 18

CREATE USER 'ledger_user'@'%' IDENTIFIED BY 'ledgerApp';

GRANT ALL PRIVILEGES ON ledgerApp.* TO 'ledger_user'@'%';

/api/auth/login - Standard user login
/api/auth/admin/login - SuperAdmin login
/api/auth/businesses - Get user's businesses
/api/auth/branches/:businessId - Get business branches