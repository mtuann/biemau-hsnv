#!/usr/bin/env node

/**
 * Test Database Connection Script
 * Tests different connection string formats for the remote database
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing Database Connections...\n');

// Test different connection string formats
const connectionTests = [
  {
    name: 'Original (with port)',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a:5432/myformsdb_s54w'
  },
  {
    name: 'Without port (default 5432)',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a/myformsdb_s54w'
  },
  {
    name: 'With .railway.app domain',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a.railway.app:5432/myformsdb_s54w'
  },
  {
    name: 'With .render.com domain',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a.render.com:5432/myformsdb_s54w'
  },
  {
    name: 'With .supabase.co domain',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a.supabase.co:5432/myformsdb_s54w'
  },
  {
    name: 'With .neon.tech domain',
    url: 'postgresql://biemau_user:dSWyJQBsPvbGZjcZsB13XOGdLKzxisL0@dpg-d2gkb5fdiees73dk0dkg-a.neon.tech:5432/myformsdb_s54w'
  }
];

async function testConnection(connectionString, name) {
  console.log(`🧪 Testing: ${name}`);
  console.log(`   URL: ${connectionString}`);
  
  try {
    const pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10 seconds timeout
      idleTimeoutMillis: 30000
    });
    
    const client = await pool.connect();
    console.log(`   ✅ SUCCESS: Connected to database!`);
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`   📊 Database time: ${result.rows[0].current_time}`);
    console.log(`   🗄️  Database version: ${result.rows[0].db_version.split(' ')[0]}`);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    if (error.code === 'ENOTFOUND') {
      console.log(`   💡 This hostname cannot be resolved. Try a different domain.`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Connection refused. Check if the service is running.`);
    } else if (error.code === '28P01') {
      console.log(`   💡 Authentication failed. Check username/password.`);
    } else if (error.code === '3D000') {
      console.log(`   💡 Database does not exist. Check database name.`);
    }
    return false;
  }
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting connection tests...\n');
  
  let successfulConnections = 0;
  
  for (const test of connectionTests) {
    const success = await testConnection(test.url, test.name);
    if (success) {
      successfulConnections++;
      console.log(`🎉 Found working connection: ${test.name}`);
      console.log(`   Use this in your .env file: DATABASE_URL="${test.url}"\n`);
      break; // Stop after first successful connection
    }
  }
  
  if (successfulConnections === 0) {
    console.log('❌ No working connections found.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if the database service is running');
    console.log('2. Verify the hostname and domain');
    console.log('3. Check if the credentials are correct');
    console.log('4. Ensure the database name exists');
    console.log('5. Check if your IP is whitelisted');
  } else {
    console.log('✅ Database connection test completed successfully!');
  }
}

// Run the tests
runTests().catch(console.error);
