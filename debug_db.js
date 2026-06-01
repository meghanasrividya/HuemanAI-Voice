const { Client } = require('pg');
const client = new Client({
  host: '51.24.11.116',
  user: 'sales_user',
  password: 'sales@#2025',
  database: 'sales_db',
  port: 5432,
  ssl: false
});

async function run() {
  try {
    await client.connect();
    console.log('Connected!');

    // Find all tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' 
      AND (table_name LIKE '%book%' OR table_name LIKE '%reserv%' OR table_name LIKE '%report%')
      LIMIT 20
    `);
    console.log('Booking/Report Tables:', JSON.stringify(tables.rows));

    // Check all tables
    const allTables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name
    `);
    console.log('All Tables:', JSON.stringify(allTables.rows));

  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    await client.end();
  }
}

run();
