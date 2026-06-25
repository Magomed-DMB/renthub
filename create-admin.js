import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function createAdmin() {
  try {
    console.log('🔐 Создание первого администратора\n');

    const username = await question('Логин: ');
    const password = await question('Пароль: ');
    const email = await question('Email (необязательно): ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [existing] = await connection.query(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log('\n❌ Админ с таким логином уже существует!');
      rl.close();
      await connection.end();
      return;
    }

    await connection.query(
      'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email || null]
    );

    console.log('\n✅ Администратор успешно создан!');
    console.log(`   Логин: ${username}`);
    console.log(`   Email: ${email || 'не указан'}`);
    console.log('\n🔑 Войдите на http://localhost:3000/admin/login');

    rl.close();
    await connection.end();
  } catch (err) {
    console.error('\n❌ Ошибка:', err.message);
    rl.close();
  }
}

createAdmin();