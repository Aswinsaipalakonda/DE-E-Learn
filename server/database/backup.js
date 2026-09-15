require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createDatabaseBackup() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'de_elearn';

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_${database}_${timestamp}.sql`);

  console.log(`[Backup] Starting automatic backup for database '${database}'...`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    const [tables] = await conn.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
    const tableNames = tables.map((t) => Object.values(t)[0]);

    let dump = `-- =========================================================================\n`;
    dump += `-- DataDock Automated Database Backup\n`;
    dump += `-- Database: ${database}\n`;
    dump += `-- Generated: ${now.toISOString()}\n`;
    dump += `-- =========================================================================\n\n`;
    dump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const tbl of tableNames) {
      // 1. Table structure
      const [createRes] = await conn.query(`SHOW CREATE TABLE \`${tbl}\``);
      dump += `-- Table structure for table \`${tbl}\`\n`;
      dump += `DROP TABLE IF EXISTS \`${tbl}\`;\n`;
      dump += `${createRes[0]['Create Table']};\n\n`;

      // 2. Table data
      const [rows] = await conn.query(`SELECT * FROM \`${tbl}\``);
      if (rows && rows.length > 0) {
        dump += `-- Dumping data for table \`${tbl}\` (${rows.length} rows)\n`;
        const cols = Object.keys(rows[0]).map((c) => `\`${c}\``).join(', ');
        
        for (const row of rows) {
          const values = Object.values(row).map((val) => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === 'object') return conn.escape(JSON.stringify(val));
            return conn.escape(String(val));
          }).join(', ');

          dump += `INSERT INTO \`${tbl}\` (${cols}) VALUES (${values});\n`;
        }
        dump += `\n`;
      }
    }

    dump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    fs.writeFileSync(backupFile, dump, 'utf8');
    const sizeMb = (fs.statSync(backupFile).size / (1024 * 1024)).toFixed(2);
    console.log(`✓ [Backup] Successfully saved ${backupFile} (${sizeMb} MB)`);

    // Clean up backups older than 30 days
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const f of files) {
      if (f.startsWith('backup_') && f.endsWith('.sql')) {
        const fp = path.join(backupDir, f);
        if (fs.statSync(fp).mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(fp);
          console.log(`[Backup Cleanup] Removed old backup: ${f}`);
        }
      }
    }

    return { success: true, file: backupFile, sizeMb };
  } catch (err) {
    console.error(`❌ [Backup Error]:`, err.message);
    return { success: false, error: err.message };
  } finally {
    if (conn) await conn.end();
  }
}

// In-app Daily Background Scheduler (12:20 AM IST)
let isSchedulerRunning = false;
let lastBackupDay = -1;

function initDailyBackupScheduler() {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;

  console.log('✓ [Auto-Backup Scheduler] Active. Target time: 12:20 AM daily.');

  // Check every 30 seconds
  setInterval(async () => {
    const now = new Date();
    // IST Timezone conversion (+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const currentDay = istTime.getUTCDate();

    // Trigger at 00:20 (12:20 AM) once per day
    if (hours === 0 && minutes === 20 && lastBackupDay !== currentDay) {
      lastBackupDay = currentDay;
      console.log(`⏰ [Auto-Backup] Running daily scheduled backup at 12:20 AM IST...`);
      await createDatabaseBackup();
    }
  }, 30 * 1000);
}

// Start scheduler automatically
initDailyBackupScheduler();

module.exports = {
  createDatabaseBackup,
  initDailyBackupScheduler,
};
