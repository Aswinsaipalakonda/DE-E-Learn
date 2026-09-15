import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysql_pool: mysql.Pool | undefined;
}

const host = process.env.DB_HOST || 'localhost';

const pool =
  global.__mysql_pool ||
  mysql.createPool({
    host,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'de_elearn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 15000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__mysql_pool = pool;
} else if (typeof window === 'undefined') {
  try {
    require('../server/database/backup');
  } catch (e) {
    // Ignore in build phase
  }
}

export default pool;
