import express from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичный: активные контакты
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM messenger_contacts WHERE is_active = 1 ORDER BY sort_order'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Админ: все контакты
router.get('/all', authMiddleware, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM messenger_contacts ORDER BY sort_order');
  res.json(rows);
});

// Админ: создание
router.post('/', authMiddleware, async (req, res) => {
  const { type, label, value, icon, color, sort_order } = req.body;
  const [result] = await pool.query(
    'INSERT INTO messenger_contacts (type, label, value, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [type, label, value, icon, color, sort_order || 0]
  );
  res.status(201).json({ id: result.insertId });
});

// Админ: обновление
router.put('/:id', authMiddleware, async (req, res) => {
  const { type, label, value, icon, color, is_active, sort_order } = req.body;
  await pool.query(
    'UPDATE messenger_contacts SET type=?, label=?, value=?, icon=?, color=?, is_active=?, sort_order=? WHERE id=?',
    [type, label, value, icon, color, is_active, sort_order, req.params.id]
  );
  res.json({ success: true });
});

// Админ: удаление
router.delete('/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM messenger_contacts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;