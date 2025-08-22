const { Pool } = require('pg');
require('dotenv').config();

// Parse connection string to determine if it's local or remote
const connectionString = process.env.DATABASE_URL;
const isLocalDatabase = connectionString && (
  connectionString.includes('localhost') || 
  connectionString.includes('127.0.0.1') ||
  connectionString.includes(':5432/')
);

// Configure SSL based on database type
const sslConfig = isLocalDatabase 
  ? false  // No SSL for local database
  : { rejectUnauthorized: false };  // SSL for remote database

console.log(`🔗 Database connection: ${isLocalDatabase ? 'Local' : 'Remote'}`);
console.log(`🔒 SSL: ${isLocalDatabase ? 'Disabled' : 'Enabled'}`);

const pool = new Pool({
  connectionString: connectionString,
  ssl: sslConfig,
  // Additional connection options for better stability
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 20 // Maximum number of clients in the pool
});

// Test connection on startup
pool.on('connect', (client) => {
  console.log('✅ New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
});

module.exports = pool;
