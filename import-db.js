// backend/import-db.js
import mysql from 'mysql2/promise';
import fs from 'fs';

async function importDb() {
  console.log('📖 Чтение renthub.sql...');
  const sql = fs.readFileSync('renthub.sql', 'utf8');
  
  // Разбиваем на запросы (игнорируем пустые строки и комментарии)
  const queries = sql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('/*'));

  console.log(`🔌 Подключение к Railway MySQL...`);
  const conn = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
  });

  console.log(`⏳ Выполнение ${queries.length} запросов...`);
  let success = 0;
  
  for (let i = 0; i < queries.length; i++) {
    try {
      await conn.query(queries[i]);
      success++;
      if (success % 50 === 0) console.log(`  ✅ Выполнено: ${success}`);
    } catch (err) {
      console.error(`  ❌ Ошибка в запросе #${i + 1}:`, err.message.substring(0, 120));
    }
  }

  await conn.end();
  console.log(`\n🎉 Импорт завершён! Успешно: ${success}, Пропущено: ${queries.length - success}`);
}

importDb().catch(err => {
  console.error('💥 Критическая ошибка:', err.message);
  process.exit(1);
});