import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://didig.ru',
    'http://didig.ru'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RentHub API работает!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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
    message: `Маршрут ${req.method} ${req.url} не найден`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/categories',
      'GET /api/products',
      'GET /api/settings',
      'GET /api/messengers',
      'POST /api/admin/login'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RentHub API работает на порту ${PORT}`);
});