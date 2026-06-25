import bcrypt from 'bcryptjs';

const password = 'admin123'; // Ваш пароль
const hash = await bcrypt.hash(password, 10);

console.log('Хеш для пароля "' + password + '":');
console.log(hash);