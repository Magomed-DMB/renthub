import mysql from 'mysql2/promise';

console.log('🔧 Настройка подключения к БД...');

let pool;

// Вариант 1: Используем DATABASE_URL (Railway MySQL)
if (process.env.DATABASE_URL) {
  console.log('✅ Используем DATABASE_URL');
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true
  });
} 
// Вариант 2: Используем отдельные переменные MYSQL*
else if (process.env.MYSQLHOST) {
  console.log('✅ Используем переменные MYSQL*');
  pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: parseInt(process.env.MYSQLPORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000
  });
} 
// Вариант 3: Локальная разработка
else if (process.env.DB_HOST) {
  console.log('✅ Используем переменные DB_* (локальная разработка)');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} 
// Ошибка — нет переменных
else {
  console.error('❌ Переменные БД не найдены!');
  console.error('   Добавьте DATABASE_URL в Railway Variables');
  process.exit(1);
}

// Проверка подключения при старте
pool.getConnection()
  .then(conn => {
    console.log('✅ Подключение к БД установлено!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err.message);
    console.error('   Код:', err.code);
    if (process.env.DATABASE_URL) {
      console.log('   Используется DATABASE_URL');
    }
  });

export default pool;