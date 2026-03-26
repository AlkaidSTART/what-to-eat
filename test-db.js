require('dotenv').config();
const { Client } = require('pg');

// Try DATABASE_URL with pgbouncer first, then DIRECT_URL
const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
console.log('Using DATABASE_URL with pgbouncer:', !!process.env.DATABASE_URL);
console.log('Testing connection with URL:', databaseUrl?.replace(/:[^:]+@/, ':***@') || 'undefined');
console.log('env vars loaded:', !!process.env.DIRECT_URL || !!process.env.DATABASE_URL);

const client = new Client(databaseUrl);

client.on('error', (err) => {
  console.error('❌ Client error:', err.message);
  process.exit(1);
});

client.on('connect', () => {
  console.log('✅ Connected to database');
});

client.on('end', () => {
  console.log('Connection ended');
});

(async () => {
  try {
    console.log('Attempting connection...');
    await client.connect();
    console.log('✅ Successfully connected');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query result:', result.rows[0]);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  }
})();
