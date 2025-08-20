import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testBranchesEndpoint() {
  console.log('🔍 Testing branches API endpoint with direct MySQL...');
  console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
  
  let connection;
  
  try {
    // Create MySQL connection
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('\n📋 Getting all businesses...');
    const [businesses] = await connection.execute(
      'SELECT `id`, `name` FROM `businesses`'
    );
    
    console.log(`Businesses found: ${businesses.length}`);
    businesses.forEach(biz => {
      console.log(`  - ${biz.name} (ID: ${biz.id})`);
    });
    
    if (businesses.length > 0) {
      const businessId = businesses[0].id;
      console.log(`\n🏢 Testing branches for business: ${businesses[0].name} (${businessId})`);
      
      // Fixed: Use business_id instead of businessId
      const [branches] = await connection.execute(
        'SELECT `id`, `name`, `business_id` FROM `branches` WHERE `business_id` = ?',
        [businessId]
      );
      
      console.log(`\n🌿 Branches found: ${branches.length}`);
      if (branches.length > 0) {
        branches.forEach(branch => {
          console.log(`  - ${branch.name} (ID: ${branch.id})`);
        });
      } else {
        console.log('  ❌ No branches found for this business!');
        console.log('  💡 This explains why the login page shows "No branches found"');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testBranchesEndpoint();