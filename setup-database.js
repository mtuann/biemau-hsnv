#!/usr/bin/env node

/**
 * Database Setup Script for HSNV Scoring System
 * 
 * This script helps set up the database schema for the forms system.
 * Run this script after setting up your PostgreSQL database connection.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 HSNV Database Setup Script');
console.log('================================\n');

// Check if database-schema.sql exists
const schemaFile = path.join(__dirname, 'database-schema.sql');
if (!fs.existsSync(schemaFile)) {
  console.error('❌ Error: database-schema.sql not found!');
  console.log('Please ensure the database-schema.sql file exists in the project root.');
  process.exit(1);
}

console.log('✅ Found database-schema.sql');
console.log('\n📋 Database Schema Contents:');
console.log('================================');

// Read and display the schema
const schema = fs.readFileSync(schemaFile, 'utf8');
console.log(schema);

console.log('\n📝 Setup Instructions:');
console.log('================================');
console.log('1. Ensure PostgreSQL is running and accessible');
console.log('2. Create a database for the HSNV system');
console.log('3. Set up your .env file with DATABASE_URL');
console.log('4. Run the SQL commands from database-schema.sql');
console.log('5. Start the application with: npm start');
console.log('\n💡 Tip: You can copy the SQL commands above and run them in your PostgreSQL client');

console.log('\n🔧 Environment Variables Required:');
console.log('================================');
console.log('DATABASE_URL=postgresql://username:password@localhost:5432/database_name');
console.log('\nExample:');
console.log('DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/hsnv_scoring');

console.log('\n🚀 Next Steps:');
console.log('================================');
console.log('1. Set up your .env file');
console.log('2. Run the database schema SQL');
console.log('3. Start the application');
console.log('4. Test the forms integration');

console.log('\n✅ Setup script completed successfully!');
console.log('For more information, see FORMS_UPDATE_README.md');
