import { db, schema } from './server/db/index.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function testAuth() {
  // Test SuperAdmin authentication
  console.log('Testing SuperAdmin authentication...');
  const [adminUser] = await db.select().from(schema.users).where(eq(schema.users.email, 'admin@system.com'));
  
  if (adminUser) {
    console.log('Found admin user:', adminUser.email);
    console.log('Stored hash:', adminUser.passwordHash);
    
    const isValid = await bcrypt.compare('adminpassword', adminUser.passwordHash);
    console.log('Password validation result:', isValid);
  } else {
    console.log('Admin user not found');
  }
  
  // Test regular user authentication
  console.log('\nTesting regular user authentication...');
  const [regularUser] = await db.select().from(schema.users).where(eq(schema.users.email, 'ismail@eng-ict.com'));
  
  if (regularUser) {
    console.log('Found regular user:', regularUser.email);
    console.log('Stored hash:', regularUser.passwordHash);
    
    const isValid = await bcrypt.compare('password123', regularUser.passwordHash);
    console.log('Password validation result:', isValid);
  } else {
    console.log('Regular user not found');
  }
}

testAuth();