import mysql from 'mysql2/promise';

// Отладка: показываем переменные при старте
console.log('🔧 Настройки подключения к БД:');
console.log('  MYSQLHOST:', process.env.MYSQLHOST || '(не задан)');
console.log('  MYSQLUSER:', process.env.MYSQLUSER || '(не задан)');
console.log('  MYSQLDATABASE:', process.env.MYSQLDATABASE || '(не задан)');
console.log('  MYSQLPORT:', process.env.MYSQLPORT || '(не задан)');

const pool = mysql.createPool({
  // Railway MySQL использует переменные MYSQL*
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // Не используем localhost!
  multipleStatements: true
});

// Проверка подключения при старте
pool.getConnection()
  .then(conn => {
    console.log('✅ Подключение к Railway MySQL установлено!');
    console.log('   Host:', process.env.MYSQLHOST);
    console.log('   Database:', process.env.MYSQLDATABASE);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err.message);
    console.error('   Код ошибки:', err.code);
    console.error('   Host:', process.env.MYSQLHOST);
    console.error('   User:', process.env.MYSQLUSER);
    console.error('   Database:', process.env.MYSQLDATABASE);
  });

export default pool;