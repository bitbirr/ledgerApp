// add-inventory-items.js
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

// Helper functions
const now = () => new Date();

async function addInventoryItems() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(config);
    console.log('Connected to the database');
    
    // Get the business ID for "Najib El Haji"
    const [businesses] = await connection.execute(
      'SELECT id FROM businesses WHERE name = ?',
      ['Najib El Haji']
    );
    
    if (businesses.length === 0) {
      console.log('Business "Najib El Haji" not found');
      return;
    }
    
    const businessId = businesses[0].id;
    console.log(`Found business: Najib El Haji (ID: ${businessId})`);
    
    // Define inventory items for Najib El Haji Electronics
    const inventoryItems = [
      // Electronics
      { name: 'Samsung Galaxy S21', rate: 25000, uom: 'pcs', categoryId: null, openingStock: 5, lowStockAlert: 1 },
      { name: 'iPhone 13 Pro', rate: 35000, uom: 'pcs', categoryId: null, openingStock: 3, lowStockAlert: 1 },
      { name: 'iPad Air', rate: 18000, uom: 'pcs', categoryId: null, openingStock: 4, lowStockAlert: 1 },
      
      // Mobile Phones
      { name: 'Tecno Spark 10', rate: 8000, uom: 'pcs', categoryId: null, openingStock: 10, lowStockAlert: 2 },
      { name: 'Infinix Hot 12', rate: 6500, uom: 'pcs', categoryId: null, openingStock: 8, lowStockAlert: 2 },
      { name: 'Samsung A32', rate: 12000, uom: 'pcs', categoryId: null, openingStock: 6, lowStockAlert: 1 },
      
      // Accessories
      { name: 'iPhone Lightning Cable', rate: 200, uom: 'pcs', categoryId: null, openingStock: 50, lowStockAlert: 10 },
      { name: 'Samsung USB-C Cable', rate: 150, uom: 'pcs', categoryId: null, openingStock: 40, lowStockAlert: 8 },
      { name: 'Power Bank 10000mAh', rate: 800, uom: 'pcs', categoryId: null, openingStock: 15, lowStockAlert: 3 },
      { name: 'Bluetooth Earphones', rate: 500, uom: 'pcs', categoryId: null, openingStock: 20, lowStockAlert: 4 },
      
      // Home Appliances
      { name: 'Samsung 55" 4K TV', rate: 35000, uom: 'pcs', categoryId: null, openingStock: 3, lowStockAlert: 1 },
      { name: 'LG Microwave Oven', rate: 4500, uom: 'pcs', categoryId: null, openingStock: 5, lowStockAlert: 1 },
      { name: 'Electric Kettle', rate: 800, uom: 'pcs', categoryId: null, openingStock: 12, lowStockAlert: 3 },
      
      // Computer Parts
      { name: 'Gaming Mouse', rate: 400, uom: 'pcs', categoryId: null, openingStock: 25, lowStockAlert: 5 },
      { name: 'Keyboard', rate: 600, uom: 'pcs', categoryId: null, openingStock: 20, lowStockAlert: 4 },
      { name: 'USB Flash Drive 32GB', rate: 250, uom: 'pcs', categoryId: null, openingStock: 30, lowStockAlert: 6 }
    ];
    
    // Get existing categories for this business
    const [categories] = await connection.execute(
      'SELECT id, name FROM categories WHERE business_id = ?',
      [businessId]
    );
    
    // Create a map of category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    console.log('Categories found:', categoryMap);
    
    // Add inventory items
    for (const item of inventoryItems) {
      // Check if item already exists
      const [existingItems] = await connection.execute(
        'SELECT id FROM items WHERE name = ? AND business_id = ?',
        [item.name, businessId]
      );
      
      if (existingItems.length > 0) {
        console.log(`Item already exists: ${item.name}`);
        continue;
      }
      
      // Assign category ID based on item name
      if (item.name.includes('Samsung') || item.name.includes('iPhone') || item.name.includes('iPad')) {
        item.categoryId = categoryMap['Electronics'] || null;
      } else if (item.name.includes('Tecno') || item.name.includes('Infinix')) {
        item.categoryId = categoryMap['Mobile Phones'] || null;
      } else if (item.name.includes('Cable') || item.name.includes('Earphones') || item.name.includes('Power Bank')) {
        item.categoryId = categoryMap['Accessories'] || null;
      } else if (item.name.includes('TV') || item.name.includes('Microwave') || item.name.includes('Kettle')) {
        item.categoryId = categoryMap['Home Appliances'] || null;
      } else {
        item.categoryId = categoryMap['Computer Parts'] || null;
      }
      
      // Create item ID
      const itemId = `item_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert item
      await connection.execute(
        'INSERT INTO items (id, name, rate, uom, category_id, business_id, opening_stock, low_stock_alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [itemId, item.name, item.rate, item.uom, item.categoryId, businessId, item.openingStock, item.lowStockAlert]
      );
      
      console.log(`Added item: ${item.name} (ID: ${itemId})`);
    }
    
    console.log('Inventory items added successfully!');
    
  } catch (error) {
    console.error('Error adding inventory items:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the inventory addition
addInventoryItems();