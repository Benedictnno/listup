const axios = require('axios');

// Test configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testVendorEndpoints() {
  console.log('🧪 Testing ListUp Vendor Listing Endpoints...\n');
  
  try {
    // Test 1: Get vendor listings by ID (public)
    console.log('1️⃣ Testing GET /vendors/:vendorId/public...');
    try {
      const response = await axios.get(`${BASE_URL}/api/listings/vendors/64f8a1b2c3d4e5f6a7b8c9d0/public`);
      console.log('✅ Public vendor listings endpoint works');
      console.log(`📊 Found ${response.data.data.listings.length} listings`);
      console.log(`🏪 Store: ${response.data.data.vendor.storeName}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Vendor not found (expected if no vendors exist)');
      } else {
        console.log('❌ Error:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('');
    
    // Test 2: Get vendor listings by store name (public)
    console.log('2️⃣ Testing GET /stores/:storeName...');
    try {
      const response = await axios.get(`${BASE_URL}/api/listings/stores/TestStore`);
      console.log('✅ Store name endpoint works');
      console.log(`📊 Found ${response.data.data.listings.length} listings`);
      console.log(`🏪 Store: ${response.data.data.vendor.storeName}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Store not found (expected if no stores exist)');
      } else {
        console.log('❌ Error:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('');
    
    // Test 3: Test pagination
    console.log('3️⃣ Testing pagination...');
    try {
      const response = await axios.get(`${BASE_URL}/api/listings/vendors/64f8a1b2c3d4e5f6a7b8c9d0/public?page=1&limit=5`);
      console.log('✅ Pagination works');
      console.log(`📄 Page: ${response.data.data.pagination.page}`);
      console.log(`📊 Limit: ${response.data.data.pagination.limit}`);
      console.log(`📈 Total: ${response.data.data.pagination.total}`);
      console.log(`📚 Pages: ${response.data.data.pagination.pages}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Vendor not found (pagination test skipped)');
      } else {
        console.log('❌ Pagination error:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🎉 Vendor endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVendorEndpoints();
