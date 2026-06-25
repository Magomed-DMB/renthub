-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Июн 24 2026 г., 23:50
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `renthub`
--

-- --------------------------------------------------------

--
-- Структура таблицы `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `email`, `created_at`) VALUES
(1, 'admin', '$2a$10$nsaUc5bC6NxSUX8yScl9LuF4lsTkLu0m.kLB/q4C/tzATjdLt8umK', 'admin@renthub.com', '2026-06-21 19:35:07'),
(2, 'admin1', '$2a$10$E1Ii9DicRhUbSAUJJnhDLePiu8lTy4MlYzJs46b/pkvBEznUADCc6', NULL, '2026-06-21 19:56:59');

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `icon`, `icon_url`, `image`, `description`, `is_active`, `sort_order`, `created_at`) VALUES
(16, NULL, 'Бытовая техника и электроника', 'bytovaya-tehnika-i-elektronika-1782227454348', '', NULL, '/uploads/1782227454346-982871262.webp', '', 1, 0, '2026-06-23 15:10:54'),
(17, NULL, 'Детские товары', 'detskie-tovary-1782227476922', '', NULL, '/uploads/1782227476921-480359811.webp', '', 1, 0, '2026-06-23 15:11:16'),
(18, NULL, 'Здоровье', 'zdorove-1782227496794', '', NULL, '/uploads/1782227496793-406179535.webp', '', 1, 0, '2026-06-23 15:11:36'),
(19, NULL, 'Книги', 'knigi-1782227540643', '', NULL, '/uploads/1782227540643-838210328.webp', '', 1, 0, '2026-06-23 15:12:20'),
(20, NULL, 'Спорт и активных отдых', 'sport-i-aktivnyh-otdyh-1782227557357', '', NULL, '/uploads/1782227557356-675233137.webp', '', 1, 0, '2026-06-23 15:12:37'),
(21, NULL, 'Товары для авто', 'tovary-dlya-avto-1782227623394', '', NULL, '/uploads/1782227623393-921239086.webp', '', 1, 0, '2026-06-23 15:13:43'),
(22, NULL, 'Товары для дома и дачи', 'tovary-dlya-doma-i-dachi-1782227646356', '', NULL, '/uploads/1782227646355-971437305.webp', '', 1, 0, '2026-06-23 15:14:06'),
(23, NULL, 'Товары для мероприятий', 'tovary-dlya-meropriyatij-1782227667107', '', NULL, '/uploads/1782227667106-247085592.webp', '', 1, 0, '2026-06-23 15:14:27'),
(24, NULL, 'Инструменты', 'instrumenty-1782227778440', '', NULL, '/uploads/1782227778439-511101993.webp', '', 1, 0, '2026-06-23 15:16:18');

-- --------------------------------------------------------

--
-- Структура таблицы `messenger_contacts`
--

CREATE TABLE `messenger_contacts` (
  `id` int(11) NOT NULL,
  `type` enum('telegram','whatsapp','phone','max','viber','instagram') NOT NULL,
  `label` varchar(50) NOT NULL,
  `value` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `messenger_contacts`
--

INSERT INTO `messenger_contacts` (`id`, `type`, `label`, `value`, `icon`, `color`, `is_active`, `sort_order`) VALUES
(1, 'telegram', 'Telegram', 'https://t.me/renthub', NULL, '#0088cc', 1, 2),
(2, 'whatsapp', 'WhatsApp', 'https://wa.me/+79624214589', NULL, '#25D366', 1, 1),
(4, 'phone', 'Позвонить', '+79624214589', NULL, '#10B981', 1, 3),
(5, 'max', 'Max', 'https://max.ru/your_account', '💬', '#8B5CF6', 1, 4);

-- --------------------------------------------------------

--
-- Структура таблицы `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `deposit` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('available','rented') DEFAULT 'available',
  `is_featured` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `products`
--

INSERT INTO `products` (`id`, `category_id`, `title`, `slug`, `description`, `price_per_day`, `deposit`, `image`, `status`, `is_featured`, `views`, `created_at`) VALUES
(1, 24, 'Перфоратор', 'perforator-1782071915335', 'Хороший', 1000.00, 2000.00, '/uploads/1782243711317-902233349.webp', 'rented', 1, 22, '2026-06-21 19:58:35'),
(4, 24, 'Пила', 'pila-1782336448791', NULL, 500.00, 3000.00, '/uploads/1782336448789-343995243.webp', 'available', 0, 0, '2026-06-24 21:27:28');

-- --------------------------------------------------------

--
-- Структура таблицы `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `updated_at`) VALUES
(1, 'site_name', 'ВайПрокат', '2026-06-22 01:27:30'),
(2, 'site_description', 'Прокат товаров на каждый день', '2026-06-21 19:35:07'),
(3, 'rent_conditions', 'Условия проката: залог, паспорт, минимальный срок 1 день.', '2026-06-21 19:35:07'),
(4, 'delivery_info', 'Доставка по городу от 300₽. Самовывоз бесплатно.', '2026-06-22 01:24:47'),
(25, 'site_logo', '/uploads/1782300345692-400309156.png', '2026-06-24 11:25:45'),
(26, 'hero_tag', '', '2026-06-23 19:24:39'),
(27, 'hero_title', 'Арендуйте <span class=\"text-accent\">всё</span>, что нужно', '2026-06-22 01:21:19'),
(28, 'hero_subtitle', 'Инструменты, техника, спортинвентарь и многое другое.', '2026-06-23 19:27:16'),
(29, 'hero_button_text', 'Открыть каталог →', '2026-06-23 19:26:29'),
(30, 'hero_button_link', '/catalog', '2026-06-23 19:26:29'),
(31, 'hero_secondary_button_text', 'Как это работает', '2026-06-22 01:21:19'),
(32, 'hero_secondary_button_link', '#how', '2026-06-22 01:21:19'),
(33, 'hero_image', '', '2026-06-22 01:21:19'),
(119, 'contact_phone', '', '2026-06-22 02:08:21'),
(120, 'contact_email', 'info@renthub.com', '2026-06-22 01:38:40'),
(121, 'contact_address', 'г. Москва, ул. Примерная, 1', '2026-06-22 01:38:40'),
(122, 'footer_description', 'Прокат товаров на каждый день. Просто, быстро, выгодно.', '2026-06-22 01:38:40');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Индексы таблицы `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_categories_slug` (`slug`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Индексы таблицы `messenger_contacts`
--
ALTER TABLE `messenger_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_slug` (`slug`);

--
-- Индексы таблицы `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT для таблицы `messenger_contacts`
--
ALTER TABLE `messenger_contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=303;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_parent_category` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
