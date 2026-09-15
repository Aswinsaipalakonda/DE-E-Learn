require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'de_elearn';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log('✓ Successfully connected to MySQL server.');

    // 1. Create database if not exists
    console.log(`Creating database ${database} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`✓ Using database ${database}.`);

    // 2. Read and execute schema.sql
    console.log('Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 3. Read and execute seed.sql
    console.log('Executing seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✓ Seed data inserted successfully.');

    // 4. Normalize subject titles (sanitize any bullet or encoding issues to clean pipe separators)
    await connection.query(`
      UPDATE \`subjects\` 
      SET \`title\` = REPLACE(REPLACE(REPLACE(\`title\`, 'â€¢', ' | '), '•', ' | '), '–', '-')
      WHERE \`title\` LIKE '%â€¢%' OR \`title\` LIKE '%•%' OR \`title\` LIKE '%–%';
    `);
    console.log('✓ Subject titles normalized with clean pipe separators.');

    console.log('\n=========================================');
    console.log('🎉 Database initialization complete!');
    console.log('System Admin: admin@mvgrce.edu.in');
    console.log('Password:     AdminPassword@123!');
    console.log('Faculty:      33 department staff accounts seeded');
    console.log('Password:     MVGRDE@<last-4-digits-of-mobile>');
    console.log('=========================================\n');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Please ensure XAMPP MySQL is started in XAMPP Control Panel.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
