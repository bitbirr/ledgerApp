import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addSampleBranches() {
  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // Get first business
    const [businesses] = await connection.execute(
      'SELECT `id`, `name` FROM `businesses` LIMIT 1'
    );
    
    if (businesses.length === 0) {
      console.log('❌ No businesses found! Add businesses first.');
      return;
    }
    
    const businessId = businesses[0].id;
    console.log(`Adding branches for business: ${businesses[0].name}`);
    
    // Add sample branches
    const branches = [
      { id: `branch_${Date.now()}_1`, name: 'Main Branch', businessId },
      { id: `branch_${Date.now()}_2`, name: 'Downtown Branch', businessId },
      { id: `branch_${Date.now()}_3`, name: 'Mall Branch', businessId }
    ];
    
    for (const branch of branches) {
      await connection.execute(
        'INSERT INTO `branches` (`id`, `name`, `businessId`, `isActive`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [branch.id, branch.name, branch.businessId, true]
      );
      console.log(`✅ Added branch: ${branch.name}`);
    }
    
    console.log('🎉 Sample branches added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSampleBranches();