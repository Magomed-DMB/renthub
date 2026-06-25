import express from 'express';
import pool from '../config/db.js';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичный: все настройки
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    const settings = rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Админ: обновление настроек
router.put('/', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const {
      site_name,
      site_logo,
      hero_tag,
      hero_title,
      hero_subtitle,
      hero_button_text,
      hero_button_link,
      hero_secondary_button_text,
      hero_secondary_button_link,
      hero_image,
      rent_conditions,
      delivery_info,
      contact_phone,
      contact_email,
      contact_address,
      footer_description
    } = req.body;

    const settingsToUpdate = {
      site_name,
      site_logo,
      hero_tag,
      hero_title,
      hero_subtitle,
      hero_button_text,
      hero_button_link,
      hero_secondary_button_text,
      hero_secondary_button_link,
      hero_image,
      rent_conditions,
      delivery_info,
      contact_phone,
      contact_email,
      contact_address,
      footer_description
    };

    // Если загружен логотип
    if (req.file) {
      settingsToUpdate.site_logo = `/uploads/${req.file.filename}`;
    }

    // ✅ ИСПРАВЛЕНО: Обновляем ВСЕ поля, включая пустые строки
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        // Пропускаем undefined и null, но сохраняем пустые строки
        if (value !== undefined && value !== null) {
          await connection.query(
            'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
            [key, value, value]
          );
        }
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
    console.error('Ошибка обновления настроек:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

export default router;