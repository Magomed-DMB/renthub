import express from 'express';
import pool from '../config/db.js';
import slugify from 'slugify';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичный: все активные категории (плоский список с parent_id)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, 
              COUNT(DISTINCT p.id) as products_count,
              (SELECT COUNT(*) FROM categories sub 
               WHERE sub.parent_id = c.id AND sub.is_active = 1) as subcategories_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Публичный: иерархия категорий (для главной страницы)
router.get('/hierarchy', async (req, res) => {
  try {
    // Получаем все активные категории
    const [rows] = await pool.query(
      `SELECT c.*, 
              COUNT(DISTINCT p.id) as direct_products_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    // Функция для подсчета общего количества товаров (включая подкатегории)
    const calculateTotalProducts = (categoryId, allCategories) => {
      let total = allCategories.find(c => c.id === categoryId)?.direct_products_count || 0;

      // Находим все подкатегории
      const subcategories = allCategories.filter(c => c.parent_id === categoryId);

      // Рекурсивно добавляем товары из подкатегорий
      for (const sub of subcategories) {
        total += calculateTotalProducts(sub.id, allCategories);
      }

      return total;
    };

    // Добавляем общее количество товаров к каждой категории
    const categoriesWithTotal = rows.map(cat => ({
      ...cat,
      products_count: cat.direct_products_count,
      total_products_count: calculateTotalProducts(cat.id, rows),
      children: []
    }));

    // Строим иерархию
    const tree = [];
    const map = {};

    categoriesWithTotal.forEach(item => {
      map[item.id] = item;
    });

    categoriesWithTotal.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(item);
      } else if (!item.parent_id) {
        tree.push(item);
      }
    });

    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Функция построения дерева из плоского списка
function buildTree(items) {
  const map = {};
  const tree = [];

  // Создаём карту категорий
  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  // Распределяем по родителям
  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      tree.push(map[item.id]);
    }
  });

  return tree;
}

// Админ: все категории (включая неактивные)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, 
              COUNT(DISTINCT p.id) as products_count,
              parent.name as parent_name
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       LEFT JOIN categories parent ON c.parent_id = parent.id
       GROUP BY c.id
       ORDER BY c.parent_id IS NULL DESC, c.parent_id ASC, c.sort_order ASC, c.name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Админ: создание категории
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, icon, icon_url, description, is_active, sort_order, parent_id } = req.body;
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const isActiveValue = ['true', '1', 'on', true, 1].includes(is_active);
    const sortOrder = sort_order ? parseInt(sort_order) : 0;
    const parentId = parent_id && parent_id !== '' ? parseInt(parent_id) : null;

    // Проверка: нельзя сделать родителя своим потомком
    if (parentId) {
      const [check] = await pool.query('SELECT id FROM categories WHERE id = ?', [parentId]);
      if (!check.length) {
        return res.status(400).json({ error: 'Родительская категория не найдена' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO categories 
       (name, slug, icon, icon_url, image, description, is_active, sort_order, parent_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, icon, icon_url || null, image, description, isActiveValue, sortOrder, parentId]
    );
    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

// ✅ ВАЖНО: /reorder должен быть ВЫШЕ /:id
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Неверный формат данных' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const item of categories) {
        await connection.query(
          'UPDATE categories SET sort_order = ? WHERE id = ?',
          [item.sort_order, item.id]
        );
      }
      await connection.commit();
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Ошибка обновления порядка:', err);
    res.status(500).json({ error: 'Ошибка обновления порядка' });
  }
});

// Админ: обновление категории
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      name, icon, icon_url, description, is_active, sort_order, parent_id, delete_image
    } = req.body;

    const categoryId = parseInt(req.params.id);
    const parentId = parent_id && parent_id !== '' ? parseInt(parent_id) : null;

    // Проверка: нельзя сделать категорию родителем самой себя
    if (parentId === categoryId) {
      return res.status(400).json({ error: 'Категория не может быть родителем самой себя' });
    }

    // Проверка: нельзя сделать потомка родителем (защита от циклов)
    if (parentId) {
      const isDescendant = await checkIsDescendant(categoryId, parentId);
      if (isDescendant) {
        return res.status(400).json({ error: 'Нельзя сделать потомка родителем' });
      }
    }

    const isActiveValue = ['true', '1', 'on', true, 1].includes(is_active);
    const sortOrder = sort_order ? parseInt(sort_order) : 0;

    const [current] = await pool.query('SELECT image FROM categories WHERE id = ?', [categoryId]);
    const currentImage = current[0]?.image;

    const updates = [
      'name = ?', 'icon = ?', 'icon_url = ?', 'description = ?',
      'is_active = ?', 'sort_order = ?', 'parent_id = ?'
    ];
    const params = [name, icon, icon_url || null, description, isActiveValue, sortOrder, parentId];

    // Обработка изображения
    if (req.file) {
      updates.push('image = ?');
      params.push(`/uploads/${req.file.filename}`);
    } else if (delete_image === 'true' || delete_image === true || delete_image === '1') {
      updates.push('image = ?');
      params.push(null);
    }

    params.push(categoryId);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка обновления категории:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// Проверка: является ли категория potentialChild потомком potentialParent
async function checkIsDescendant(potentialParent, potentialChild) {
  if (potentialParent === potentialChild) return true;

  let currentId = potentialChild;
  const visited = new Set();

  while (currentId) {
    if (visited.has(currentId)) return false; // Защита от циклов
    visited.add(currentId);

    const [rows] = await pool.query(
      'SELECT parent_id FROM categories WHERE id = ?',
      [currentId]
    );

    if (!rows.length || !rows[0].parent_id) return false;
    if (rows[0].parent_id === potentialParent) return true;
    currentId = rows[0].parent_id;
  }

  return false;
}

// Админ: удаление категории
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Проверяем наличие подкатегорий
    const [subcategories] = await pool.query(
      'SELECT id, name FROM categories WHERE parent_id = ?',
      [categoryId]
    );

    if (subcategories.length > 0) {
      return res.status(400).json({
        error: `Нельзя удалить категорию с подкатегориями. Сначала удалите: ${subcategories.map(s => s.name).join(', ')}`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

export default router;