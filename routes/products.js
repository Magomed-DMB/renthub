import express from 'express';
import pool from '../config/db.js';
import slugify from 'slugify';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичный: список товаров с фильтрами, пагинацией (Infinite Scroll)
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      status = '',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = ['1=1'];
    const params = [];

    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      // Поддерживаем фильтрацию по родительской категории (включая подкатегории)
      conditions.push('(c.slug = ? OR c.parent_id IN (SELECT id FROM categories WHERE slug = ?))');
      params.push(category, category);
    }
    if (minPrice) {
      conditions.push('p.price_per_day >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push('p.price_per_day <= ?');
      params.push(parseFloat(maxPrice));
    }
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    conditions.push('c.is_active = 1');

    const whereClause = conditions.join(' AND ');

    // Общее количество для Infinite Scroll
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      products: rows,
      total: countRows[0].total,
      page: parseInt(page),
      hasMore: offset + rows.length < countRows[0].total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Публичный: один товар
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Товар не найден' });

    await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [rows[0].id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Админ: создание товара
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, category_id, description, price_per_day, deposit, is_featured } = req.body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO products 
       (title, slug, category_id, description, price_per_day, deposit, image, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        category_id,
        description,
        price_per_day,
        deposit ? parseFloat(deposit) : null,  // ← добавлено
        image,
        is_featured === 'true'
      ]
    );

    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
});

// Админ: обновление статуса (арендован / доступен)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'rented'].includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Админ: обновление товара
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, category_id, description, price_per_day, deposit, is_featured } = req.body;
    const updates = [
      'title = ?',
      'category_id = ?',
      'description = ?',
      'price_per_day = ?',
      'deposit = ?',  // ← добавлено
      'is_featured = ?'
    ];
    const params = [
      title,
      category_id,
      description,
      price_per_day,
      deposit ? parseFloat(deposit) : null,  // ← добавлено
      is_featured === 'true'
    ];

    if (req.file) {
      updates.push('image = ?');
      params.push(`/uploads/${req.file.filename}`);
    }

    params.push(req.params.id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Админ: удаление товара
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

export default router;