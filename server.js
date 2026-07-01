import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'https://magomed-dmb.github.io',
    'https://didig.ru',
    'http://didig.ru',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Раздача изображений из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Проверка работоспособности
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RentHub API работает!'
  });
});

// API маршруты
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import settingsRouter from './routes/settings.js';
import messengersRouter from './routes/messengers.js';
import authRouter from './routes/auth.js';

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/messengers', messengersRouter);
app.use('/api/admin', authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Маршрут ${req.method} ${req.url} не найден`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RentHub API работает на порту ${PORT}`);
});