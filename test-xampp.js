import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testXampp() {
  console.log('🔍 Проверка подключения к XAMPP MySQL...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'renthub',
    port: 3306
  };

  console.log('📋 Конфигурация:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${config.password ? '***' : '(пустой)'}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Port: ${config.port}\n`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Успешное подключение к XAMPP MySQL!\n');

    // Версия MySQL
    const [version] = await connection.query('SELECT VERSION() as v');
    console.log(`📦 Версия MySQL: ${version[0].v}`);

    // Список таблиц
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Таблицы (${tables.length}):`);
    tables.forEach(t => console.log(`   • ${Object.values(t)[0]}`));

    // Статистика
    const [admins] = await connection.query('SELECT COUNT(*) as c FROM admins');
    const [products] = await connection.query('SELECT COUNT(*) as c FROM products');
    const [categories] = await connection.query('SELECT COUNT(*) as c FROM categories');
    const [messengers] = await connection.query('SELECT COUNT(*) as c FROM messenger_contacts');

    console.log('\n📈 Статистика:');
    console.log(`   👤 Админов: ${admins[0].c}`);
    console.log(`   📦 Товаров: ${products[0].c}`);
    console.log(`   📂 Категорий: ${categories[0].c}`);
    console.log(`   💬 Мессенджеров: ${messengers[0].c}`);

    await connection.end();
    console.log('\n🎉 XAMPP MySQL работает корректно!');
    
  } catch (err) {
    console.error('\n❌ Ошибка подключения!');
    console.error(`   ${err.code}: ${err.message}\n`);

    if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 База данных не создана.');
      console.log('   Откройте http://localhost/phpmyadmin');
      console.log('   и импортируйте файл database/schema.sql\n');
    }
    
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 MySQL в XAMPP не запущен!');
      console.log('   Откройте XAMPP Control Panel');
      console.log('   и нажмите Start напротив MySQL\n');
    }
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Неверный логин/пароль.');
      console.log('   В XAMPP по умолчанию:');
      console.log('   User: root');
      console.log('   Password: (пустой)\n');
    }
  }
}

testXampp();