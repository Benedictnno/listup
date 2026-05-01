const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixIndex() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
  }

  // Add specific options for SRV resolution issues
  const client = new MongoClient(url, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4 // Force IPv4
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Extract DB name from URL or use default
    const dbName = url.includes('?') ? url.split('/').pop().split('?')[0] : url.split('/').pop();
    const db = client.db(dbName);
    const collection = db.collection('User');

    console.log('🔍 Checking existing indexes on "User" collection...');
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Look for any index involving the phone field
    const phoneIndex = indexes.find(idx => idx.key && idx.key.phone);
    
    if (phoneIndex) {
      console.log(`🗑️  Dropping old index: ${phoneIndex.name}`);
      await collection.dropIndex(phoneIndex.name);
    } else {
      console.log('ℹ️  No existing phone index found to drop.');
    }

    console.log('✨ Creating new UNIQUE and SPARSE index for "phone"...');
    await collection.createIndex(
      { phone: 1 }, 
      { unique: true, sparse: true, name: "phone_1" }
    );

    console.log('✅ Successfully fixed the index! Multiple NULL phones are now allowed.');

  } catch (error) {
    console.error('❌ Error fixing index:', error);
    if (error.code === 'ECONNREFUSED') {
       console.log('\n💡 Tip: This looks like a network/DNS issue. Ensure you are connected to the internet and MongoDB Atlas is accessible.');
    }
  } finally {
    await client.close();
  }
}

fixIndex();
