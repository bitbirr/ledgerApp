import fetch from 'node-fetch';

async function testBranchesAPI() {
  console.log('🧪 Testing /api/branches endpoint...');
  
  const businessId = 'biz_vm6cc68ua'; // From your test results
  const url = `http://localhost:5000/api/branches?businessId=${businessId}`;
  
  try {
    console.log(`📡 Calling: ${url}`);
    const response = await fetch(url);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Found ${data.length} branches:`);
      data.forEach(branch => {
        console.log(`  - ${branch.name} (ID: ${branch.id})`);
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ Error Response:`, errorText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testBranchesAPI();