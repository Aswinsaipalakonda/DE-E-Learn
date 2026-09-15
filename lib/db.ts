import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysql_pool: mysql.Pool | undefined;
}

const pool =
  global.__mysql_pool ||
  mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'de_elearn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__mysql_pool = pool;
}

export default pool;
