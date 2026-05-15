-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Май 15 2026 г., 16:02
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
-- База данных: `booking_system`
--

-- --------------------------------------------------------

--
-- Структура таблицы `activities`
--

CREATE TABLE `activities` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `facility_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `activity_type` varchar(100) NOT NULL DEFAULT 'general',
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `max_participants` int(11) NOT NULL DEFAULT 10,
  `base_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `category` varchar(120) DEFAULT NULL,
  `age_restriction` varchar(50) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `status` enum('active','inactive','cancelled','sold_out') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `activities`
--

INSERT INTO `activities` (`id`, `facility_id`, `name`, `description`, `slug`, `activity_type`, `duration_minutes`, `max_participants`, `base_price`, `category`, `age_restriction`, `language`, `date`, `genre`, `requirements`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('038fcced-7e66-4b54-83b3-3a2ad8e0a42f', 'c3d36fd1-8b78-446c-a34e-4ac0eb053413', 'Avengers: Endgame', 'Marvel superhero blockbuster screening', 'avengers-endgame', 'session', 150, 150, 12000.00, 'action', 'PG-13', 'English', '2026-05-08', 'Action', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('06ffd038-f6cb-4f38-ae36-62c2e9fcee28', '898dcdb3-ba35-4cae-835a-1585ee30605a', 'Luxury Lodge Weekend Package', 'Premium safari accommodation', 'luxury-lodge-weekend-package', 'programme', 2880, 40, 350000.00, 'safari', 'All Ages', 'English', '2026-05-15', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('08196abd-39ab-4b69-a8d8-d70411a6395e', 'ce879e74-e40e-400c-a79c-550a2220ec72', 'Beach Resort 5-Night Stay', 'All-inclusive beachfront holiday', 'beach-resort-5-night-stay', 'programme', 7200, 60, 480000.00, 'safari', 'All Ages', 'English', '2026-05-18', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('11f1bd30-7265-4697-b47b-4702dd3fe847', 'd136698c-5e6c-45ff-8691-2add35db96f5', 'Kilimanjaro Marangu Route 6-Day', 'Summit Africa\'s highest peak', 'kilimanjaro-marangu-route-6-day', 'programme', 8640, 60, 960000.00, 'safari', '18+', 'English', '2026-05-20', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1c018c8c-39c2-4147-89b6-e9bce822d3e0', '6bd7f46a-c96f-4bde-8027-32ca84d4634f', 'East Africa Tech Summit', 'Annual technology conference', 'east-africa-tech-summit', 'event', 1440, 500, 50000.00, 'conference', '18+', 'English', '2026-05-18', 'Conference', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1d99f855-d998-4027-ac23-a970d31ef66b', '64ca135d-dce7-4d5a-b4c1-cf3c22414630', 'Simba SC vs Young Africans', 'Premier league football match', 'simba-vs-yanga', 'event', 120, 5000, 20000.00, 'sports', 'All Ages', 'Swahili', '2026-05-12', 'Sports', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('253bab7c-008d-449f-95a1-13069ce93ae7', 'f5ba1271-c5a3-44f8-9c77-fd4f1a45838b', 'Startup Pitch Competition', 'Entrepreneurship showcase', 'startup-pitch-competition', 'event', 480, 100, 20000.00, 'workshop', '18+', 'English', '2026-05-22', 'Workshop', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('2edfb068-0c14-47de-be17-f69316fa5f6e', 'ff874a27-3eff-49c4-b000-17021b8e3b7d', 'Fast X', 'High-octane action thriller', 'fast-x', 'session', 141, 100, 11000.00, 'action', 'PG-13', 'English', '2026-05-13', 'Action', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('3104331c-6b6f-4687-a1fe-fec1f1ee1950', '9b0d1f5e-96fb-4c67-afec-f941d21972c2', 'Mount Meru 4-Day Trek', 'Guided mountain expedition', 'mount-meru-4-day-trek', 'programme', 5760, 30, 480000.00, 'safari', '16+', 'English', '2026-05-15', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('3a9f6244-bbb5-45cc-b7b5-6f31be563c91', '4b35bdf9-38fe-49a3-bc71-c4d912d4cb99', 'Selous Boat Safari', 'River wildlife exploration', 'selous-boat-safari', 'programme', 1440, 25, 180000.00, 'safari', 'All Ages', 'English', '2026-05-25', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('3db130dd-78a0-4484-885d-d91adde28493', '9fdc4134-ebb5-4dd2-8eee-6d4c94357c71', 'The Lion King', 'Disney animated classic', 'the-lion-king', 'session', 118, 120, 10000.00, 'family', 'G', 'English', '2026-05-09', 'Animation', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('47b934e1-790e-41d2-b461-5da64c03b968', '7179207a-54bb-4fd8-9661-1b98ca40421f', 'Stone Town Heritage Stay', 'Cultural immersion hotel', 'stone-town-heritage-stay', 'programme', 4320, 50, 180000.00, 'cultural', 'All Ages', 'English', '2026-05-24', 'Cultural', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4a3bd1c2-efe6-49e3-9ca8-506d40a31901', '2e37d110-b22a-466c-8996-adeaad877679', 'Crater Camp Adventure', 'Eco-camping experience', 'crater-camp-adventure', 'programme', 2880, 20, 120000.00, 'safari', '16+', 'English', '2026-05-22', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4c0202bc-a2e6-44a0-a2b8-9b8f853f6e97', 'b4fa25f2-68da-4ab4-a8bd-681b6a91fff5', 'Volleyball Championship', 'National volleyball tournament', 'volleyball-championship', 'event', 240, 500, 10000.00, 'sports', 'All Ages', 'Swahili', '2026-05-19', 'Sports', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4db05cb1-4f2b-4952-8162-9560e66d6d37', '519e54a2-2ecc-4135-9d92-de6c2d70bdd2', 'Serengeti Migration 3-Day Tour', 'Witness the great migration', 'serengeti-migration-3-day-tour', 'programme', 4320, 35, 450000.00, 'safari', 'All Ages', 'English', '2026-05-22', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('59fd650d-a393-4502-b805-f49e2778caba', '227649bb-0933-45c8-9314-dab483aa3c2e', 'City Hotel Business Package', 'Executive accommodation', 'city-hotel-business-package', 'programme', 4320, 100, 150000.00, 'conference', 'All Ages', 'English', '2026-05-20', 'Conference', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('7423246c-8335-4cb4-a56b-e6a4ece4795d', '209fc6f0-464d-45b3-9950-2175605f2263', 'Afrobeats Live Concert', 'Live music performance', 'afrobeats-live-concert', 'event', 240, 2000, 35000.00, 'concert', '16+', 'English', '2026-05-25', 'Concert', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('8f05677e-d628-4415-bb3d-62930366c9d8', 'aabf2345-8a2c-4cfa-9281-893343b00970', 'Barbie', 'Fantasy comedy adventure', 'barbie', 'session', 114, 90, 10000.00, 'comedy', 'PG', 'English', '2026-05-14', 'Comedy', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('95d02418-0e3d-41f0-ab39-eae15d08dc5f', '31b87f47-20fe-4e0f-ad72-9f1eb3c8160e', 'Art & Culture Exhibition', 'Contemporary African art showcase', 'art-culture-exhibition', 'programme', 10080, 1000, 15000.00, 'cultural', 'All Ages', 'English', '2026-06-01', 'Cultural', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ac2d4749-b3ab-48a6-b03a-9d9f401cc3da', 'a44cce97-fe6d-474c-9326-1cfa77e95c2d', 'East Africa Basketball Finals', 'Regional basketball championship', 'east-africa-basketball-finals', 'event', 180, 3000, 18000.00, 'sports', 'All Ages', 'English', '2026-05-18', 'Sports', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('b92c9d62-4a51-4142-b5eb-a4d2fda45c93', 'd1e88b3d-9fee-4c74-a61b-89f22d97bd01', 'Tanzania vs Kenya - Friendly', 'International football friendly', 'tanzania-vs-kenya', 'event', 120, 60000, 25000.00, 'sports', 'All Ages', 'English', '2026-05-15', 'Sports', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('b9dc5f85-6fa9-4b8f-bdae-d8a6162a71a7', '209fc6f0-464d-45b3-9950-2175605f2263', 'Diamond Platnumz Concert', 'Bongo Flava superstar live', 'diamond-platnumz-concert', 'event', 180, 2000, 40000.00, 'concert', 'All Ages', 'Swahili', '2026-05-28', 'Concert', NULL, 'sold_out', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('be23fcc3-db4a-4693-87bd-ceabdeaf0ea3', '9722e08e-8761-4adc-ba20-58df490acad5', 'Business Leaders Forum', 'Executive networking event', 'business-leaders-forum', 'event', 1440, 800, 75000.00, 'conference', '18+', 'English', '2026-05-20', 'Conference', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('c984f881-8dc3-451c-bf84-98d786c8dd11', '80f27540-8083-458e-a527-48c406dc27fd', 'Azam FC vs KMC', 'League championship match', 'azam-vs-kmc', 'event', 120, 20000, 15000.00, 'sports', 'All Ages', 'Swahili', '2026-05-16', 'Sports', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('d4899fc0-e9c0-4518-842e-d1255a1dfe4a', 'cd7325c0-01d7-4e92-b755-76cbbee36b18', 'Saadani Beach & Bush Safari', 'Coastal wildlife adventure', 'saadani-beach-bush-safari', 'programme', 1440, 40, 150000.00, 'safari', 'All Ages', 'English', '2026-05-17', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('eae71900-8657-4c78-8222-05a2341c9a84', 'c3d36fd1-8b78-446c-a34e-4ac0eb053413', 'Spider-Man: No Way Home', 'Action-packed superhero adventure', 'spider-man-no-way-home', 'session', 148, 150, 12000.00, 'action', 'PG-13', 'English', '2026-05-10', 'Action', NULL, 'sold_out', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f04dd610-daa0-4440-bc94-0c742105c4d5', '14b985a4-2dad-4daa-8157-6f0ed3fcfa79', 'Dune: Part Two', 'Epic sci-fi adventure', 'dune-part-two', 'session', 166, 200, 15000.00, 'sci-fi', 'PG-13', 'English', '2026-05-11', 'Sci-Fi', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f1fc1ae6-63df-4c2c-9371-73f060c636cb', 'a1774fe1-fe62-4d62-9034-0d5c793d497e', 'Oppenheimer', 'Historical drama', 'oppenheimer', 'session', 180, 80, 13000.00, 'drama', 'PG-13', 'English', '2026-05-12', 'Drama', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f50f0530-e42c-4a63-9656-ced1856a5e80', 'f300aeec-7045-4045-a694-186b3ea83c47', 'Grand Hotel Week Special', 'Luxury city accommodation', 'grand-hotel-week-special', 'programme', 10080, 150, 420000.00, 'conference', 'All Ages', 'English', '2026-06-01', 'Conference', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('fade19bf-1012-40a1-a69d-a3534926642c', 'b6e2e80d-318f-4574-bf41-2932a93aeebf', 'Ngorongoro Crater Full Day Tour', 'Wildlife safari experience', 'ngorongoro-crater-full-day-tour', 'programme', 480, 50, 200000.00, 'safari', 'All Ages', 'English', '2026-05-10', 'Safari', NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `activity_instances`
--

CREATE TABLE `activity_instances` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `activity_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `facility_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `total_slots` int(11) NOT NULL DEFAULT 0,
  `available_slots` int(11) NOT NULL DEFAULT 0,
  `price_modifier` decimal(15,2) NOT NULL DEFAULT 0.00,
  `special_notes` text DEFAULT NULL,
  `status` enum('scheduled','open','closed','cancelled','completed') NOT NULL DEFAULT 'scheduled',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `activity_instances`
--

INSERT INTO `activity_instances` (`id`, `activity_id`, `facility_id`, `start_at`, `end_at`, `total_slots`, `available_slots`, `price_modifier`, `special_notes`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0202d31c-0669-4781-9594-4665cee2383d', '1d99f855-d998-4027-ac23-a970d31ef66b', '64ca135d-dce7-4d5a-b4c1-cf3c22414630', '2026-05-23 12:15:50', '2026-05-23 14:15:50', 5000, 5000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('027b6f3e-fdbf-4b47-bc6b-764a89336079', 'f1fc1ae6-63df-4c2c-9371-73f060c636cb', 'a1774fe1-fe62-4d62-9034-0d5c793d497e', '2026-05-20 12:15:50', '2026-05-20 15:15:50', 80, 80, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('0cd3a7cf-3d42-4ab3-b08b-40a355317132', '3db130dd-78a0-4484-885d-d91adde28493', '9fdc4134-ebb5-4dd2-8eee-6d4c94357c71', '2026-05-18 12:15:50', '2026-05-18 14:13:50', 120, 120, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1a5632f6-3130-4444-a0d4-40e769c4f856', '4db05cb1-4f2b-4952-8162-9560e66d6d37', '519e54a2-2ecc-4135-9d92-de6c2d70bdd2', '2026-06-07 12:15:50', '2026-06-10 12:15:50', 35, 35, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1ed58fc4-d995-449c-9dc4-763737a14f60', 'eae71900-8657-4c78-8222-05a2341c9a84', 'c3d36fd1-8b78-446c-a34e-4ac0eb053413', '2026-05-17 12:15:50', '2026-05-17 14:43:50', 150, 150, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('2579c83d-2023-498a-930d-14bf2660812b', '038fcced-7e66-4b54-83b3-3a2ad8e0a42f', 'c3d36fd1-8b78-446c-a34e-4ac0eb053413', '2026-05-16 12:15:50', '2026-05-16 14:45:50', 150, 150, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('2dd58b8b-4ea9-464e-8140-e6022b19b315', '1c018c8c-39c2-4147-89b6-e9bce822d3e0', '6bd7f46a-c96f-4bde-8027-32ca84d4634f', '2026-05-28 12:15:50', '2026-05-29 12:15:50', 500, 500, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('321a246f-c1da-4486-b649-c27e3886ecfb', '95d02418-0e3d-41f0-ab39-eae15d08dc5f', '31b87f47-20fe-4e0f-ad72-9f1eb3c8160e', '2026-06-02 12:15:50', '2026-06-09 12:15:50', 1000, 1000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('3dec30ec-1609-4bb0-a749-a0fb1dddce87', 'ac2d4749-b3ab-48a6-b03a-9d9f401cc3da', 'a44cce97-fe6d-474c-9326-1cfa77e95c2d', '2026-05-26 12:15:50', '2026-05-26 15:15:50', 3000, 3000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('469b1794-8abe-4ba4-9859-af286189a3f1', '47b934e1-790e-41d2-b461-5da64c03b968', '7179207a-54bb-4fd8-9661-1b98ca40421f', '2026-06-13 12:15:50', '2026-06-16 12:15:50', 50, 50, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('48c00223-e119-444a-9899-e2aa7af8f583', 'fade19bf-1012-40a1-a69d-a3534926642c', 'b6e2e80d-318f-4574-bf41-2932a93aeebf', '2026-06-03 12:15:50', '2026-06-03 20:15:50', 50, 50, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4af6faff-0e62-4496-824a-270a8cb4b7d0', '7423246c-8335-4cb4-a56b-e6a4ece4795d', '209fc6f0-464d-45b3-9950-2175605f2263', '2026-05-31 12:15:50', '2026-05-31 16:15:50', 2000, 2000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('640e2798-5de9-44dd-b6e8-838fcb2ffe21', '253bab7c-008d-449f-95a1-13069ce93ae7', 'f5ba1271-c5a3-44f8-9c77-fd4f1a45838b', '2026-05-30 12:15:50', '2026-05-30 20:15:50', 100, 100, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('688cb8c0-e834-4547-86bf-e307f6ac7e48', 'b9dc5f85-6fa9-4b8f-bdae-d8a6162a71a7', '209fc6f0-464d-45b3-9950-2175605f2263', '2026-06-01 12:15:50', '2026-06-01 15:15:50', 2000, 2000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('712159a8-94d9-4781-8ee4-f3be6c4a91e1', '11f1bd30-7265-4697-b47b-4702dd3fe847', 'd136698c-5e6c-45ff-8691-2add35db96f5', '2026-06-06 12:15:50', '2026-06-12 12:15:50', 60, 60, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('781a0dc6-bb1b-453b-9855-15c50dbeb141', 'b92c9d62-4a51-4142-b5eb-a4d2fda45c93', 'd1e88b3d-9fee-4c74-a61b-89f22d97bd01', '2026-05-24 12:15:50', '2026-05-24 14:15:50', 60000, 60000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('7e71d32c-92c7-4a1f-8d69-9dfe68b69c59', '59fd650d-a393-4502-b805-f49e2778caba', '227649bb-0933-45c8-9314-dab483aa3c2e', '2026-06-11 12:15:50', '2026-06-14 12:15:50', 100, 100, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('86aa3769-96cc-4c04-b1d6-566b1f2cd03a', 'be23fcc3-db4a-4693-87bd-ceabdeaf0ea3', '9722e08e-8761-4adc-ba20-58df490acad5', '2026-05-29 12:15:50', '2026-05-30 12:15:50', 800, 800, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('8e57b4cd-f2d2-4dfd-992d-faeed3fa3d8b', 'f04dd610-daa0-4440-bc94-0c742105c4d5', '14b985a4-2dad-4daa-8157-6f0ed3fcfa79', '2026-05-19 12:15:50', '2026-05-19 15:01:50', 200, 200, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('900eed69-eed1-4f76-b791-6c382086abe9', 'd4899fc0-e9c0-4518-842e-d1255a1dfe4a', 'cd7325c0-01d7-4e92-b755-76cbbee36b18', '2026-06-05 12:15:50', '2026-06-06 12:15:50', 40, 40, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('92bb58a5-a647-4f32-96ee-033e0b463fb2', 'f50f0530-e42c-4a63-9656-ced1856a5e80', 'f300aeec-7045-4045-a694-186b3ea83c47', '2026-06-14 12:15:50', '2026-06-21 12:15:50', 150, 150, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('b0d3b6f2-87a4-4389-b32c-bd56e7707581', 'c984f881-8dc3-451c-bf84-98d786c8dd11', '80f27540-8083-458e-a527-48c406dc27fd', '2026-05-25 12:15:50', '2026-05-25 14:15:50', 20000, 20000, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('b45302ad-f382-4524-8ab7-0e15dc2b170e', '3104331c-6b6f-4687-a1fe-fec1f1ee1950', '9b0d1f5e-96fb-4c67-afec-f941d21972c2', '2026-06-04 12:15:50', '2026-06-08 12:15:50', 30, 30, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ba3b3466-bbee-48a1-8c0f-68efa60716aa', '4c0202bc-a2e6-44a0-a2b8-9b8f853f6e97', 'b4fa25f2-68da-4ab4-a8bd-681b6a91fff5', '2026-05-27 12:15:50', '2026-05-27 16:15:50', 500, 500, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('bb5f3542-6398-47d3-aa13-e5fff3417389', '4a3bd1c2-efe6-49e3-9ca8-506d40a31901', '2e37d110-b22a-466c-8996-adeaad877679', '2026-06-12 12:15:50', '2026-06-14 12:15:50', 20, 20, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('d86a7f53-99ac-41e2-95e7-86076a6197d3', '2edfb068-0c14-47de-be17-f69316fa5f6e', 'ff874a27-3eff-49c4-b000-17021b8e3b7d', '2026-05-21 12:15:50', '2026-05-21 14:36:50', 100, 100, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ddfd41b0-206c-43fb-a161-3ed5ceb13530', '3a9f6244-bbb5-45cc-b7b5-6f31be563c91', '4b35bdf9-38fe-49a3-bc71-c4d912d4cb99', '2026-06-08 12:15:50', '2026-06-09 12:15:50', 25, 25, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ec1cb928-0e4a-4f91-83bf-c89e38396b7e', '08196abd-39ab-4b69-a8d8-d70411a6395e', 'ce879e74-e40e-400c-a79c-550a2220ec72', '2026-06-10 12:15:50', '2026-06-15 12:15:50', 60, 60, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ee62ae1d-2890-4a1f-8e85-dd54bf56d74a', '06ffd038-f6cb-4f38-ae36-62c2e9fcee28', '898dcdb3-ba35-4cae-835a-1585ee30605a', '2026-06-09 12:15:50', '2026-06-11 12:15:50', 40, 40, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('fd3682d7-fc15-4be4-b851-498de7f0f898', '8f05677e-d628-4415-bb3d-62930366c9d8', 'aabf2345-8a2c-4cfa-9281-893343b00970', '2026-05-22 12:15:50', '2026-05-22 14:09:50', 90, 90, 1.00, 'Standard session', 'scheduled', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `booking_code` varchar(50) NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `booking_type` enum('transport','facility') NOT NULL DEFAULT 'transport',
  `journey_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `activity_instance_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('pending','holding','confirmed','cancelled','refunded','completed','expired') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `exchange_rate_snapshot` decimal(15,6) NOT NULL DEFAULT 1.000000,
  `passenger_count` int(11) NOT NULL DEFAULT 1,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `company_id`, `booking_type`, `journey_id`, `activity_instance_id`, `status`, `total_amount`, `currency_id`, `exchange_rate_snapshot`, `passenger_count`, `contact_name`, `contact_phone`, `contact_email`, `notes`, `expires_at`, `confirmed_at`, `cancelled_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
('1499e9a8-be52-4627-ba29-0ada4cab5c13', 'BK-FACILITY-001', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', NULL, 'facility', NULL, '2579c83d-2023-498a-930d-14bf2660812b', 'confirmed', 12000.00, '6f14bc33-0a8c-417c-a336-4303ba3a5688', 1.000000, 1, 'Amina Juma', '+255776000001', 'amina.juma@gmail.com', NULL, NULL, '2026-05-15 12:15:50', NULL, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('683b71be-d995-4eab-97aa-1dc989e1d2de', 'BK-TRANSPORT-001', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', NULL, 'transport', '87b047f0-2436-4164-b16a-5cb4e1892d99', NULL, 'confirmed', 60000.00, '6f14bc33-0a8c-417c-a336-4303ba3a5688', 1.000000, 2, 'Amina Juma', '+255776000001', 'amina.juma@gmail.com', NULL, NULL, '2026-05-15 12:15:50', NULL, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('91561558-02dc-4b48-9a35-c962290d1188', 'BKG-20260515-9YZ814FR9W37', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', NULL, 'facility', NULL, '3dec30ec-1609-4bb0-a749-a0fb1dddce87', 'holding', 72000.00, NULL, 1.000000, 4, 'John Doe', '', '', 'ID: ', '2026-05-15 13:19:17', NULL, NULL, '2026-05-15 13:09:17', '2026-05-15 13:09:17', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `booking_items`
--

CREATE TABLE `booking_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `booking_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `item_type` enum('seat','spot','room','table','section') NOT NULL DEFAULT 'seat',
  `item_code` varchar(100) NOT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `passenger_type` enum('adult','child','infant','senior') DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `booking_items`
--

INSERT INTO `booking_items` (`id`, `booking_id`, `item_type`, `item_code`, `passenger_name`, `passenger_type`, `details`, `unit_price`, `created_at`, `updated_at`, `deleted_at`) VALUES
('2d68368e-8fb6-4c0b-9043-c2ad82a4c35b', '1499e9a8-be52-4627-ba29-0ada4cab5c13', 'room', 'R1', 'Amina Juma', 'adult', '{}', 12000.00, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('80e1f9f1-857b-4ccf-b93b-8933affd09ca', '91561558-02dc-4b48-9a35-c962290d1188', 'seat', 'item-4', 'John Doe', 'adult', '{\"facility\":\"Sports Complex Indoor\",\"activity\":\"East Africa Basketball Finals\",\"session\":\"2026-05-26T12:15:50.000Z\"}', 18000.00, '2026-05-15 13:09:17', '2026-05-15 13:09:17', NULL),
('8a1c59ae-e90c-439e-b10f-1d17c0f9c866', '91561558-02dc-4b48-9a35-c962290d1188', 'seat', 'item-2', 'John Doe', 'adult', '{\"facility\":\"Sports Complex Indoor\",\"activity\":\"East Africa Basketball Finals\",\"session\":\"2026-05-26T12:15:50.000Z\"}', 18000.00, '2026-05-15 13:09:17', '2026-05-15 13:09:17', NULL),
('ccace981-37d9-4585-9709-c04613e4b61b', '91561558-02dc-4b48-9a35-c962290d1188', 'seat', 'item-1', 'John Doe', 'adult', '{\"facility\":\"Sports Complex Indoor\",\"activity\":\"East Africa Basketball Finals\",\"session\":\"2026-05-26T12:15:50.000Z\"}', 18000.00, '2026-05-15 13:09:17', '2026-05-15 13:09:17', NULL),
('e1f56e66-921d-4be5-b3df-2778b4c3c1b7', '683b71be-d995-4eab-97aa-1dc989e1d2de', 'seat', 'A2', 'Amina Juma', 'adult', '{}', 30000.00, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('eb9756e5-4a88-480d-a7f5-df9e7d9a8a2f', '683b71be-d995-4eab-97aa-1dc989e1d2de', 'seat', 'A1', 'Amina Juma', 'adult', '{}', 30000.00, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f173e45a-edcc-4357-b9f9-ff9476087986', '91561558-02dc-4b48-9a35-c962290d1188', 'seat', 'item-3', 'John Doe', 'adult', '{\"facility\":\"Sports Complex Indoor\",\"activity\":\"East Africa Basketball Finals\",\"session\":\"2026-05-26T12:15:50.000Z\"}', 18000.00, '2026-05-15 13:09:17', '2026-05-15 13:09:17', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `companies`
--

CREATE TABLE `companies` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('transport','facility','entertainment','events','outdoor','housing','sports') NOT NULL DEFAULT 'transport',
  `status` enum('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  `logo_url` varchar(500) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `companies`
--

INSERT INTO `companies` (`id`, `owner_id`, `name`, `slug`, `description`, `category`, `status`, `logo_url`, `contact_email`, `contact_phone`, `created_at`, `updated_at`, `deleted_at`) VALUES
('00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', NULL, 'Kilimanjaro Express', 'kilimanjaro-express', 'Premium bus services across Tanzania', 'transport', 'active', NULL, 'info@kiliexpress.co.tz', '+255767000001', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('0ac6f796-e400-4e18-bda1-3a0597c0070a', NULL, 'Nairobi Transit', 'nairobi-transit', 'Cross-border bus services', 'transport', 'active', NULL, 'info@nairobitransit.co.ke', '+254700000024', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('133109d3-e8a6-41ef-acf4-9d8c158d51b2', NULL, 'Precision Air', 'precision-air', 'Regional airline serving East Africa', 'transport', 'active', NULL, 'info@precisionair.co.tz', '+255767000008', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('1854ba9d-673c-4afd-b6fe-5a1cd742aab0', NULL, 'Kilimanjaro Hotel', 'kilimanjaro-hotel', 'Premium city hotel', 'facility', 'active', NULL, 'info@kilimanjarohotel.co.tz', '+255767000019', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('283d03e2-1f13-473b-a6e2-4b6c7afa27b4', NULL, 'Conference Center Arusha', 'conference-center-arusha', 'International conference facilities', 'facility', 'active', NULL, 'info@conferencearusha.co.tz', '+255767000007', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('285d9a1d-f28b-4064-a454-221254d4ada2', NULL, 'Mount Meru Tours', 'mount-meru-tours', 'Trekking and hiking expeditions', 'facility', 'active', NULL, 'info@mountmerutours.co.tz', '+255767000022', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('46e8314f-d902-4822-b3f5-4ff7825f86c5', NULL, 'Arusha Conference Centre', 'arusha-conference-centre', 'International events venue', 'facility', 'active', NULL, 'info@arushacenter.co.tz', '+255767000020', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('4ee88927-ef8c-4cf3-a15c-903dde3f6711', NULL, 'Island Ferries', 'island-ferries', 'Zanzibar and coastal ferry services', 'transport', 'active', NULL, 'info@islandferries.co.tz', '+255767000006', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('53b0068d-d467-4130-ae8e-ec04ef71a41f', NULL, 'Safari Adventures', 'safari-adventures', 'Safari car rentals and tours', 'transport', 'active', NULL, 'info@safariadventures.co.tz', '+255767000003', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('6f2774af-59a6-4701-8b5d-c0bc9436a020', NULL, 'Benjamin Mkapa Stadium', 'benjamin-mkapa-stadium', 'National sports complex', 'facility', 'active', NULL, 'info@benjaminmkapa.co.tz', '+255767000015', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('6ff00e5a-d84f-4757-a0b5-7ddc74ed481e', NULL, 'Dar Es Salaam Cinemas', 'dar-es-salaam-cinemas', 'Modern cinema experience', 'facility', 'active', NULL, 'info@darcinemas.co.tz', '+255767000002', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('78a41474-a439-4660-bb47-bc2d0f70b7a3', NULL, 'Uhuru Stadium', 'uhuru-stadium', 'Historic sports venue', 'facility', 'active', NULL, 'info@uhurustadium.co.tz', '+255767000016', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('859f5d54-beb5-4369-9e9f-e5e10babcd3c', NULL, 'Ngorongoro Adventures', 'ngorongoro-adventures', 'Crater tours and camping', 'facility', 'active', NULL, 'info@ngorongoroadventures.co.tz', '+255767000021', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('8921c3b0-d1dd-409b-880b-07354761b6b1', NULL, 'Tanzania Railways', 'tanzania-railways', 'Central railway services', 'transport', 'active', NULL, 'info@rzltz.co.tz', '+255767000005', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('8f25acd6-e4c3-4c07-8948-5b919c01e87e', NULL, 'Serengeti Lodge & Spa', 'serengeti-lodge-spa', 'Luxury safari lodge', 'facility', 'active', NULL, 'info@serengetilodge.co.tz', '+255767000017', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('9684f202-f0e0-47a6-9337-4e20ebb4b03e', NULL, 'Mlimani City Cinemas', 'mlimani-city-cinemas', 'Shopping mall cinema complex', 'facility', 'active', NULL, 'info@mlimanicinemas.co.tz', '+255767000014', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('9baa7648-bf7f-4983-bab0-7f1fc617e6ac', NULL, 'Azam Marine', 'azam-marine', 'High-speed ferry services', 'transport', 'active', NULL, 'info@azammarine.co.tz', '+255767000010', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('9f1aa03b-4e10-4ea2-891e-a8d407de5433', NULL, 'Zanzibar Beach Resort', 'zanzibar-beach-resort', 'Beachfront accommodation', 'facility', 'active', NULL, 'info@zanzibarbeach.co.tz', '+255767000018', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('a0b792b9-d68d-477e-8f2e-e30a64b0e2f7', NULL, 'Cinemax Cinemas', 'cinemax-cinemas', 'Luxury cinema chain', 'facility', 'active', NULL, 'info@cinemax.co.tz', '+255767000013', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('a910bb07-21e2-45dc-9ded-44294e63f4ad', NULL, 'Coastal Aviation', 'coastal-aviation', 'Safari and coastal flights', 'transport', 'active', NULL, 'info@coastalaviation.co.tz', '+255767000009', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('bfd28fc3-e63f-42d7-9425-8605fa6d919a', NULL, 'Serengeti Safaris', 'serengeti-safaris', 'Premium safari tour operator', 'transport', 'active', NULL, 'info@serengetisafaris.co.tz', '+255767000011', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('c61567de-9ad4-473b-bca4-f556ee719496', NULL, 'Lake Victoria Cruises', 'lake-victoria-cruises', 'Passenger and cargo ships', 'transport', 'active', NULL, 'info@lakevictoriacruises.co.tz', '+255767000025', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('e6156441-975b-4c8e-9327-e087b0e37579', NULL, 'Saadani Safari Park', 'saadani-safari-park', 'Coastal safari experiences', 'facility', 'active', NULL, 'info@saadanisafari.co.tz', '+255767000023', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('f9308b9f-4ac1-4ce9-9b85-9660c93a7216', NULL, 'Kenya Railways SGR', 'kenya-railways-sgr', 'Standard Gauge Railway services', 'transport', 'active', NULL, 'info@kenyarailways.co.ke', '+254700000012', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('fed2b8f5-094a-4c4c-9be8-252967499c0c', NULL, 'National Stadium', 'national-stadium', 'Premier sports venue', 'facility', 'active', NULL, 'info@nationalstadium.co.tz', '+255767000004', '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `currencies`
--

CREATE TABLE `currencies` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `exchange_rate` decimal(15,6) NOT NULL DEFAULT 1.000000,
  `is_base` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `symbol`, `exchange_rate`, `is_base`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
('20cca8ef-bbd4-4f0e-903c-2ecce209e536', 'USD', 'US Dollar', '$', 0.000420, 0, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('37735ad4-792f-4826-acf5-70b139a2762a', 'GBP', 'British Pound', '£', 0.000330, 0, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('6f14bc33-0a8c-417c-a336-4303ba3a5688', 'TZS', 'Tanzanian Shilling', 'TZS', 1.000000, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('9e6136b0-882e-4433-8f3a-c7d510c17f2a', 'EUR', 'Euro', '€', 0.000380, 0, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('cd83c806-709a-4847-bf41-74e12f406b17', 'ZAR', 'South African Rand', 'R', 0.008200, 0, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `facilities`
--

CREATE TABLE `facilities` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `facility_type_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`location`)),
  `capacity` int(11) NOT NULL DEFAULT 0,
  `base_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sitting_plan` varchar(100) DEFAULT NULL,
  `sitting_length` int(11) NOT NULL DEFAULT 0,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `facilities`
--

INSERT INTO `facilities` (`id`, `company_id`, `facility_type_id`, `name`, `slug`, `category`, `description`, `location`, `capacity`, `base_price`, `sitting_plan`, `sitting_length`, `features`, `images`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('14b985a4-2dad-4daa-8157-6f0ed3fcfa79', 'a0b792b9-d68d-477e-8f2e-e30a64b0e2f7', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Cinemax IMAX', 'cinemax-imax', 'entertainment', 'Luxury IMAX cinema experience', '{\"address\":\"CBD\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 200, 15000.00, '5-5', 20, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('209fc6f0-464d-45b3-9950-2175605f2263', 'a0b792b9-d68d-477e-8f2e-e30a64b0e2f7', '60693cc3-2705-4b6e-8e43-35390d14e8a7', 'Concert Arena', 'concert-arena', 'events', 'Live music and concert venue', '{\"address\":\"CBD\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 2000, 35000.00, '10-10', 50, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('227649bb-0933-45c8-9314-dab483aa3c2e', '1854ba9d-673c-4afd-b6fe-5a1cd742aab0', 'bb5eadbf-6643-4991-ba97-de37c29182fb', 'Kilimanjaro Suites', 'kilimanjaro-suites', 'housing', 'Premium city hotel', '{\"address\":\"CBD\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 100, 150000.00, 'rooms', 0, NULL, NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('2e37d110-b22a-466c-8996-adeaad877679', '8f25acd6-e4c3-4c07-8948-5b919c01e87e', 'c2d43743-9029-4a4b-a5ca-e41620d72bb9', 'Ngorongoro Crater Camp', 'ngorongoro-crater-camp', 'housing', 'Eco-camping experience', '{\"address\":\"Ngorongoro\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 20, 120000.00, 'tents', 0, NULL, NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('31b87f47-20fe-4e0f-ad72-9f1eb3c8160e', 'a0b792b9-d68d-477e-8f2e-e30a64b0e2f7', '98a637f9-c8f4-4cb5-bad1-743da291d6a8', 'Exhibition Center', 'exhibition-center', 'events', 'Art and culture exhibitions', '{\"address\":\"CBD\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 1000, 15000.00, 'open', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('4b35bdf9-38fe-49a3-bc71-c4d912d4cb99', 'e6156441-975b-4c8e-9327-e087b0e37579', 'e13293dc-00f0-4a4c-aff6-1d3d7c01b7b3', 'Selous Game Reserve', 'selous-game-reserve', 'outdoor', 'River wildlife exploration', '{\"address\":\"Selous\",\"city\":\"Morogoro\",\"country\":\"Tanzania\"}', 25, 180000.00, 'safari_vehicle', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('519e54a2-2ecc-4135-9d92-de6c2d70bdd2', '859f5d54-beb5-4369-9e9f-e5e10babcd3c', 'e13293dc-00f0-4a4c-aff6-1d3d7c01b7b3', 'Serengeti Migration Tour', 'serengeti-migration-tour', 'outdoor', 'Witness the great migration', '{\"address\":\"Serengeti\",\"city\":\"Mara\",\"country\":\"Tanzania\"}', 35, 450000.00, 'safari_vehicle', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('64ca135d-dce7-4d5a-b4c1-cf3c22414630', 'fed2b8f5-094a-4c4c-9be8-252967499c0c', '928ae003-a2ab-414d-abd7-543b21b7785d', 'Main Arena', 'main-arena', 'sports', 'Premier sports venue for major events', '{\"address\":\"Uhuru Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 5000, 20000.00, '10-10', 25, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('6bd7f46a-c96f-4bde-8027-32ca84d4634f', '283d03e2-1f13-473b-a6e2-4b6c7afa27b4', '12d3a03c-e8c0-481e-ba9b-3a649a994cca', 'Grand Conference Hall', 'grand-conference-hall', 'events', 'Large event hall for conferences and seminars', '{\"address\":\"Njiro Road\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 500, 50000.00, '5-5', 50, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('7179207a-54bb-4fd8-9661-1b98ca40421f', '9f1aa03b-4e10-4ea2-891e-a8d407de5433', 'bb5eadbf-6643-4991-ba97-de37c29182fb', 'Stone Town Hotel', 'stone-town-hotel', 'housing', 'Cultural immersion hotel', '{\"address\":\"Stone Town\",\"city\":\"Zanzibar\",\"country\":\"Tanzania\"}', 50, 180000.00, 'rooms', 0, NULL, NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('80f27540-8083-458e-a527-48c406dc27fd', '78a41474-a439-4660-bb47-bc2d0f70b7a3', '928ae003-a2ab-414d-abd7-543b21b7785d', 'Uhuru Ground', 'uhuru-ground', 'sports', 'Historic sports venue', '{\"address\":\"Uhuru Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 20000, 15000.00, '12-12', 50, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('898dcdb3-ba35-4cae-835a-1585ee30605a', '8f25acd6-e4c3-4c07-8948-5b919c01e87e', 'e209d66d-62cd-4c32-b6c3-5d5ed4fefc04', 'Serengeti Luxury Lodge', 'serengeti-luxury-lodge', 'housing', 'Luxury safari lodge near the national park', '{\"address\":\"Serengeti Road\",\"city\":\"Serengeti\",\"country\":\"Tanzania\"}', 40, 350000.00, 'rooms', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('9722e08e-8761-4adc-ba20-58df490acad5', '46e8314f-d902-4822-b3f5-4ff7825f86c5', '12d3a03c-e8c0-481e-ba9b-3a649a994cca', 'Arusha Summit Hall', 'arusha-summit-hall', 'events', 'International conference facility', '{\"address\":\"Arusha CBD\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 800, 75000.00, '8-8', 50, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('9b0d1f5e-96fb-4c67-afec-f941d21972c2', '285d9a1d-f28b-4064-a454-221254d4ada2', 'e3a9d110-35df-424b-9ae3-78e668745a1a', 'Mount Meru Summit Trek', 'mount-meru-summit-trek', 'outdoor', 'Guided mountain expedition', '{\"address\":\"Mount Meru\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 30, 480000.00, 'hiking_group', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('9fdc4134-ebb5-4dd2-8eee-6d4c94357c71', '6ff00e5a-d84f-4757-a0b5-7ddc74ed481e', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Cinema Hall 2', 'cinema-hall-2', 'entertainment', 'Comfort cinema with VIP seating', '{\"address\":\"Mwananyamala\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 120, 10000.00, '4-4', 15, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('a1774fe1-fe62-4d62-9034-0d5c793d497e', 'a0b792b9-d68d-477e-8f2e-e30a64b0e2f7', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Cinemax Premium', 'cinemax-premium', 'entertainment', 'Premium cinema hall', '{\"address\":\"CBD\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 80, 13000.00, '2-2', 20, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('a44cce97-fe6d-474c-9326-1cfa77e95c2d', '6f2774af-59a6-4701-8b5d-c0bc9436a020', '339b8477-ae1b-4a49-84bb-eb966fb1a9ae', 'Sports Complex Indoor', 'sports-complex-indoor', 'sports', 'Indoor sports complex', '{\"address\":\"Benjamin Mkapa Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 3000, 18000.00, '8-8', 30, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('aabf2345-8a2c-4cfa-9281-893343b00970', '9684f202-f0e0-47a6-9337-4e20ebb4b03e', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Mlimani Screen 2', 'mlimani-screen-2', 'entertainment', 'Second screen in Mlimani City', '{\"address\":\"Mlimani City\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 90, 10000.00, '3-3', 15, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('b4fa25f2-68da-4ab4-a8bd-681b6a91fff5', '78a41474-a439-4660-bb47-bc2d0f70b7a3', '9d7d9b4e-894f-4660-83ec-767355d3109f', 'Basketball Court', 'basketball-court', 'sports', 'Dedicated basketball court', '{\"address\":\"Uhuru Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 500, 10000.00, '5-5', 10, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('b6e2e80d-318f-4574-bf41-2932a93aeebf', '859f5d54-beb5-4369-9e9f-e5e10babcd3c', 'e13293dc-00f0-4a4c-aff6-1d3d7c01b7b3', 'Ngorongoro Crater Tour', 'ngorongoro-crater-tour', 'outdoor', 'Wildlife safari experience', '{\"address\":\"Ngorongoro\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 50, 200000.00, 'safari_vehicle', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('c3d36fd1-8b78-446c-a34e-4ac0eb053413', '6ff00e5a-d84f-4757-a0b5-7ddc74ed481e', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Cinema Hall 1', 'cinema-hall-1', 'entertainment', 'Premium cinema with Dolby sound and reclining seats', '{\"address\":\"Kariakoo Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 150, 12000.00, '3-3', 25, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('cd7325c0-01d7-4e92-b755-76cbbee36b18', 'e6156441-975b-4c8e-9327-e087b0e37579', 'e13293dc-00f0-4a4c-aff6-1d3d7c01b7b3', 'Saadani Beach Safari', 'saadani-beach-safari', 'outdoor', 'Coastal wildlife adventure', '{\"address\":\"Saadani\",\"city\":\"Tanga\",\"country\":\"Tanzania\"}', 40, 150000.00, 'safari_vehicle', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('ce879e74-e40e-400c-a79c-550a2220ec72', '9f1aa03b-4e10-4ea2-891e-a8d407de5433', 'b3cb62bf-8191-4921-865e-88338b6ffa89', 'Zanzibar Beach Bungalows', 'zanzibar-beach-bungalows', 'housing', 'Beachfront accommodation', '{\"address\":\"Nungwi\",\"city\":\"Zanzibar\",\"country\":\"Tanzania\"}', 60, 480000.00, 'rooms', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d136698c-5e6c-45ff-8691-2add35db96f5', '285d9a1d-f28b-4064-a454-221254d4ada2', 'e3a9d110-35df-424b-9ae3-78e668745a1a', 'Kilimanjaro Marangu Route', 'kilimanjaro-marangu-route', 'outdoor', 'Summit Africa\'s highest peak', '{\"address\":\"Kilimanjaro\",\"city\":\"Moshi\",\"country\":\"Tanzania\"}', 60, 960000.00, 'hiking_group', 0, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d1e88b3d-9fee-4c74-a61b-89f22d97bd01', '6f2774af-59a6-4701-8b5d-c0bc9436a020', '928ae003-a2ab-414d-abd7-543b21b7785d', 'Benjamin Mkapa Field', 'benjamin-mkapa-field', 'sports', 'National stadium for international matches', '{\"address\":\"Benjamin Mkapa Road\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 60000, 25000.00, '15-15', 100, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('f300aeec-7045-4045-a694-186b3ea83c47', '1854ba9d-673c-4afd-b6fe-5a1cd742aab0', 'bb5eadbf-6643-4991-ba97-de37c29182fb', 'Dar es Salaam Grand', 'dar-es-salaam-grand', 'housing', 'Luxury city accommodation', '{\"address\":\"CBD\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 150, 420000.00, 'rooms', 0, NULL, NULL, 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f5ba1271-c5a3-44f8-9c77-fd4f1a45838b', '46e8314f-d902-4822-b3f5-4ff7825f86c5', '7473f870-399d-4f84-b1b9-4c6b27fb06ba', 'Business Meeting Room', 'business-meeting-room', 'events', 'Executive meeting room', '{\"address\":\"Arusha CBD\",\"city\":\"Arusha\",\"country\":\"Tanzania\"}', 100, 20000.00, '5-5', 10, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('ff874a27-3eff-49c4-b000-17021b8e3b7d', '9684f202-f0e0-47a6-9337-4e20ebb4b03e', 'd9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Mlimani Screen 1', 'mlimani-screen-1', 'entertainment', 'Modern cinema in shopping mall', '{\"address\":\"Mlimani City\",\"city\":\"Dar es Salaam\",\"country\":\"Tanzania\"}', 100, 11000.00, '3-3', 17, NULL, NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `facility_types`
--

CREATE TABLE `facility_types` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `facility_types`
--

INSERT INTO `facility_types` (`id`, `name`, `slug`, `category`, `description`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
('12d3a03c-e8c0-481e-ba9b-3a649a994cca', 'Conference Hall', 'conference_hall', 'events', 'Conference and meeting spaces', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('15d11023-d507-44e2-98ed-cfab46f03300', 'Parking Lot', 'parking_lot', 'outdoor', 'Vehicle parking and storage', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('339b8477-ae1b-4a49-84bb-eb966fb1a9ae', 'Arena', 'arena', 'sports', 'Indoor and outdoor sports arena', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('60693cc3-2705-4b6e-8e43-35390d14e8a7', 'Concert Hall', 'concert_hall', 'events', 'Concert venues for live music', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('7473f870-399d-4f84-b1b9-4c6b27fb06ba', 'Meeting Room', 'meeting_room', 'events', 'Meeting rooms for business and private events', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('928ae003-a2ab-414d-abd7-543b21b7785d', 'Stadium', 'stadium', 'sports', 'Sports and arena venues', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('98a637f9-c8f4-4cb5-bad1-743da291d6a8', 'Exhibition Hall', 'exhibition_hall', 'events', 'Exhibition and trade show spaces', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('9d7d9b4e-894f-4660-83ec-767355d3109f', 'Court', 'court', 'sports', 'Sports courts for basketball and tennis', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('b3cb62bf-8191-4921-865e-88338b6ffa89', 'Resort', 'resort', 'housing', 'Resorts and leisure stays', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('bb5eadbf-6643-4991-ba97-de37c29182fb', 'Hotel', 'hotel', 'housing', 'Hotel rooms and accommodations', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('bdd7819c-bda1-41a1-855c-5fa55f6be927', 'Restaurant', 'restaurant', 'outdoor', 'Dining and culinary experiences', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('c2d43743-9029-4a4b-a5ca-e41620d72bb9', 'Camp', 'camp', 'outdoor', 'Camping and expedition sites', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('d9cf6151-c1d6-4226-8af9-2b36ce6feb04', 'Movie Theatre', 'movie_theatre', 'entertainment', 'Cinema and screenings', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('e13293dc-00f0-4a4c-aff6-1d3d7c01b7b3', 'Safari Park', 'safari_park', 'outdoor', 'Safari park reservations and tours', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('e209d66d-62cd-4c32-b6c3-5d5ed4fefc04', 'Lodge', 'lodge', 'housing', 'Safari lodges and camps', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('e3a9d110-35df-424b-9ae3-78e668745a1a', 'Mountain Lodge', 'mountain', 'outdoor', 'Mountain hiking and expedition lodges', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('fec14e6e-9e26-46b2-8946-98aed2d8c796', 'Park', 'park', 'outdoor', 'Outdoor recreation areas', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `journeys`
--

CREATE TABLE `journeys` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `timetable_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `transport_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `route_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `journey_date` date NOT NULL,
  `departure_at` datetime NOT NULL,
  `arrival_at` datetime NOT NULL,
  `status` enum('scheduled','boarding','departed','delayed','cancelled','completed') NOT NULL DEFAULT 'scheduled',
  `available_seats` int(11) NOT NULL DEFAULT 0,
  `booked_seats` int(11) NOT NULL DEFAULT 0,
  `held_seats` int(11) NOT NULL DEFAULT 0,
  `delay_minutes` int(11) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `journeys`
--

INSERT INTO `journeys` (`id`, `timetable_id`, `transport_id`, `route_id`, `journey_date`, `departure_at`, `arrival_at`, `status`, `available_seats`, `booked_seats`, `held_seats`, `delay_minutes`, `cancellation_reason`, `created_at`, `updated_at`, `deleted_at`) VALUES
('04a81d16-95d1-4f3a-a123-b4c40730ac0a', '9d4d651d-cb61-43dc-8a03-9863e6bd96bc', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '2026-05-10', '2026-05-10 09:00:00', '2026-05-10 11:30:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('07912e60-60da-4588-9f7a-2c9bfbb36016', '89b06538-e7b1-4b62-bf0c-9a4460b9db63', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '2026-05-10', '2026-05-10 15:00:00', '2026-05-10 17:30:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('2d5304e2-c3f8-41c2-a824-bfb55744cc0c', '5fce00ce-e8ae-4cbb-a814-3ab87a2613ce', 'e1631ec7-ab84-417e-b102-f2fbe2b7d5f3', 'd9917d42-4fcf-4dca-94fc-04a3e79d0097', '2026-05-13', '2026-05-13 09:00:00', '2026-05-13 16:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('4cac54f4-2cec-4621-90af-8527ab37a74e', '170bfcdd-4893-4462-88f3-17eb18ced170', 'b5e8ddc1-52e4-423f-ba1f-790314618812', 'aaf964bc-b926-4362-a6bc-1fc0cb4f18c2', '2026-05-14', '2026-05-14 07:00:00', '2026-05-14 08:30:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('52416b18-87c3-4790-b2b8-45d368fe69f0', 'de8849c9-e83c-43c2-b086-e163cdec6e75', 'a44bed9f-785f-4d3d-9b5f-2cf76cca0e05', 'fddb4907-a5e6-45e9-9efd-74032e79b3a0', '2026-05-16', '2026-05-16 07:00:00', '2026-05-16 14:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('586ac6e2-bf95-439f-8a55-4a079e5292f1', '16201d70-4489-4055-8535-69f0668cd227', 'b9685f74-73ac-4a51-8534-66e7fe8025e9', 'bbf9faee-7fd5-4228-801c-90c505b868a5', '2026-05-11', '2026-05-11 08:00:00', '2026-05-11 13:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('5a7231b9-f69e-4218-865e-a68f4edd9f7e', 'c34e5030-cca1-4aec-b24d-64e24b064ee2', '1951cb01-9839-4e28-bcf5-fcad0da8257f', '902469a7-be1f-445a-8f66-bd3d2ae2390c', '2026-05-12', '2026-05-12 20:00:00', '2026-05-12 08:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('6c6c0da6-10f4-4a82-99ad-15eeb967f1c2', '7016bead-30aa-47de-bbbd-7e30afb252de', '5aa5533c-e7d9-4901-b725-63f4d29d14d3', '835d1115-810e-4bf8-84af-259891b45a41', '2026-05-11', '2026-05-11 08:00:00', '2026-05-11 16:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('74594d67-68be-42b5-a296-021fec96c10d', '6dbda969-b4dd-43d9-9e15-b3af13d20176', 'b9e1cf8d-7f6b-4ead-8ea3-081af7d06e35', '07776dce-8150-4e52-bcfd-04509f9b066b', '2026-05-12', '2026-05-12 10:00:00', '2026-05-12 11:30:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('87b047f0-2436-4164-b16a-5cb4e1892d99', '8da809a6-0411-48ba-a78f-c6c730dd9c82', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', '990797f5-6d66-40dd-8a48-b1b0e8a9e1f1', '2026-05-10', '2026-05-10 06:00:00', '2026-05-10 14:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('8f3943d8-8255-4c1a-86f1-571838832efd', 'be381ecc-3bfa-4ef0-a344-e6f90c7e36f7', '7248ed00-9c10-4ea3-9252-0c7c193d31f0', 'b899c468-de34-4253-a4d4-5506022b9809', '2026-05-11', '2026-05-11 08:00:00', '2026-05-11 13:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('91b9916a-91e5-4b48-95bb-cf34151a1470', '1f9403bd-8315-4101-9b1e-4ebfc44e405d', '88f4e196-d19b-4baf-91cc-58a0ffbf1ba0', 'e0f80d26-f028-401b-ad9e-06e4c6b92783', '2026-05-13', '2026-05-13 11:00:00', '2026-05-13 13:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('9476a259-9eb9-4b94-b606-f2f68830d530', '8481b2d2-2b40-49dc-8096-feb4aad5a5dd', 'b5e8ddc1-52e4-423f-ba1f-790314618812', 'aaf964bc-b926-4362-a6bc-1fc0cb4f18c2', '2026-05-15', '2026-05-15 06:00:00', '2026-05-15 18:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('a36d372b-ce05-417d-a648-34888ec95110', '323e925a-c7b9-44d5-83f1-eac0856a6059', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', '990797f5-6d66-40dd-8a48-b1b0e8a9e1f1', '2026-05-10', '2026-05-10 14:00:00', '2026-05-10 22:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('acc5e243-7a62-4650-b76f-e16f8d3159fe', '6df98b9e-b237-4232-a1cf-4253a3f99a77', '5fc5baf0-c243-42a6-89b3-1bfd0c25a8c9', '9e4fdeb8-4a2a-4821-886c-89e71affaf12', '2026-05-10', '2026-05-10 18:00:00', '2026-05-10 08:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('bce58ea6-febb-4f06-bf6c-1e4498012604', '03904bc2-1a47-4b14-93ed-793c7d4fae60', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '2026-05-13', '2026-05-13 14:00:00', '2026-05-13 14:30:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('c51f3640-a4a0-42c2-a226-cf6c12c8a491', '061510f6-fc64-4b3c-8279-a4e210778339', '58dd6ead-8741-4133-a246-bb93f4125293', '7eaec9ca-6428-46f6-bfdf-d8c9ef8dad47', '2026-05-12', '2026-05-12 07:00:00', '2026-05-12 11:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d175962e-5853-479c-9d3f-03dd0b868ad0', '7ffa814c-da17-4dae-b2d3-b28a734a8803', '311deba5-0079-45b4-8d33-564d05aeb375', '8a038103-b3b4-4d18-9062-9c93b737e74e', '2026-05-14', '2026-05-14 10:00:00', '2026-05-14 12:00:00', 'scheduled', 50, 0, 0, NULL, NULL, '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `payments`
--

CREATE TABLE `payments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `booking_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `method` varchar(100) NOT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `exchange_rate_snapshot` decimal(15,6) NOT NULL DEFAULT 1.000000,
  `response_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_json`)),
  `status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `transaction_reference`, `method`, `provider`, `amount`, `currency_id`, `exchange_rate_snapshot`, `response_json`, `status`, `paid_at`, `refunded_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
('8d9eb904-9daf-497d-918f-f35d7d47215e', '683b71be-d995-4eab-97aa-1dc989e1d2de', 'PAY-TRANSPORT-001', 'mpesa', 'mpesa', 60000.00, '6f14bc33-0a8c-417c-a336-4303ba3a5688', 1.000000, '{\"stub\":true}', 'completed', '2026-05-15 12:15:50', NULL, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('e61def1f-b661-41b6-b1e4-b1f79dc45ec6', '1499e9a8-be52-4627-ba29-0ada4cab5c13', 'PAY-FACILITY-001', 'card', 'stripe', 12000.00, '6f14bc33-0a8c-417c-a336-4303ba3a5688', 1.000000, '{\"stub\":true}', 'completed', '2026-05-15 12:15:50', NULL, '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `roles`
--

CREATE TABLE `roles` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions_json`)),
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `permissions_json`, `is_system`, `created_at`, `updated_at`, `deleted_at`) VALUES
('10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', 'Company Admin', 'company_admin', NULL, '{}', 0, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('1617c503-bf3b-4f1f-821f-d5931d56e9a8', 'Customer', 'customer', NULL, '{}', 0, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('4bc0f53f-09f8-467c-a3f9-e8cb9f7b45a8', 'Developer', 'developer', NULL, '{}', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('5fcf891c-9592-4ff3-816d-d3927a314724', 'Super Admin', 'super_admin', NULL, '{}', 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('8af37e84-0da9-4ce9-baf1-9e1127c6de93', 'Staff', 'staff', NULL, '{}', 0, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `routes`
--

CREATE TABLE `routes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `transport_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `origin_station_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `destination_station_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `base_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `status` enum('draft','active','inactive') NOT NULL DEFAULT 'draft',
  `is_sub_route` tinyint(1) DEFAULT 0,
  `parent_route_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `routes`
--

INSERT INTO `routes` (`id`, `company_id`, `transport_id`, `name`, `description`, `origin_station_id`, `destination_station_id`, `base_price`, `distance_km`, `status`, `is_sub_route`, `parent_route_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
('07776dce-8150-4e52-bcfd-04509f9b066b', '133109d3-e8a6-41ef-acf4-9d8c158d51b2', 'b9e1cf8d-7f6b-4ead-8ea3-081af7d06e35', 'Dar es Salaam to Kilimanjaro', 'Domestic flight from Dar es Salaam to Kilimanjaro Airport', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '502361f0-5024-4dc3-8f1c-220ee7a30904', 180000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7eaec9ca-6428-46f6-bfdf-d8c9ef8dad47', '0ac6f796-e400-4e18-bda1-3a0597c0070a', '58dd6ead-8741-4133-a246-bb93f4125293', 'Nairobi to Arusha', 'Cross-border service from Nairobi to Arusha', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '502361f0-5024-4dc3-8f1c-220ee7a30904', 35000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('835d1115-810e-4bf8-84af-259891b45a41', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '5aa5533c-e7d9-4901-b725-63f4d29d14d3', 'Arusha to Dar es Salaam', 'Arusha to Dar es Salaam via Same, Korogwe, Morogoro', '502361f0-5024-4dc3-8f1c-220ee7a30904', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', 50000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('8a038103-b3b4-4d18-9062-9c93b737e74e', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '311deba5-0079-45b4-8d33-564d05aeb375', 'Dar es Salaam to Bagamoyo', 'Short route shuttle service', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '916c61a7-80fb-4d94-8edd-9a738169ff31', 15000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('902469a7-be1f-445a-8f66-bd3d2ae2390c', 'c61567de-9ad4-473b-bca4-f556ee719496', '1951cb01-9839-4e28-bcf5-fcad0da8257f', 'Mwanza to Bukoba', 'Lake Victoria passenger ship service', '73287589-e6ac-40e1-a171-5b557182a3ae', '08c9762c-c359-409e-ab76-8c9099d6c428', 30000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('990797f5-6d66-40dd-8a48-b1b0e8a9e1f1', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', 'Dar es Salaam to Mwanza', 'Dar es Salaam to Mwanza via Morogoro, Dodoma, Singida', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '73287589-e6ac-40e1-a171-5b557182a3ae', 60000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('9e4fdeb8-4a2a-4821-886c-89e71affaf12', '8921c3b0-d1dd-409b-880b-07354761b6b1', '5fc5baf0-c243-42a6-89b3-1bfd0c25a8c9', 'Dar es Salaam to Kigoma', 'Cross-country train service to Kigoma via Morogoro, Dodoma, Tabora', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '73287589-e6ac-40e1-a171-5b557182a3ae', 45000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('aaf964bc-b926-4362-a6bc-1fc0cb4f18c2', '53b0068d-d467-4130-ae8e-ec04ef71a41f', 'b5e8ddc1-52e4-423f-ba1f-790314618812', 'Arusha to Serengeti', 'Safari transfer from Arusha to Serengeti National Park', '502361f0-5024-4dc3-8f1c-220ee7a30904', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', 250000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('ae622ea8-17e5-4b65-a8f9-7a98fc734609', 'a910bb07-21e2-45dc-9ded-44294e63f4ad', '32626167-fd12-4477-96ef-984fd0bebbf4', 'Arusha to Serengeti', 'Safari flight to Serengeti airstrip', '502361f0-5024-4dc3-8f1c-220ee7a30904', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', 350000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '133109d3-e8a6-41ef-acf4-9d8c158d51b2', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', 'Dar es Salaam to Zanzibar', 'Domestic flight from Dar es Salaam to Zanzibar', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '08c9762c-c359-409e-ab76-8c9099d6c428', 120000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b899c468-de34-4253-a4d4-5506022b9809', '9baa7648-bf7f-4983-bab0-7f1fc617e6ac', '7248ed00-9c10-4ea3-9252-0c7c193d31f0', 'Dar es Salaam to Pemba', 'Ferry service from Dar es Salaam to Pemba Island', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '7d3c3649-45f5-4d6e-adb4-e355e39ec16f', 50000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('bbf9faee-7fd5-4228-801c-90c505b868a5', 'f9308b9f-4ac1-4ce9-9b85-9660c93a7216', 'b9685f74-73ac-4a51-8534-66e7fe8025e9', 'Nairobi to Mombasa', 'Standard Gauge Railway from Nairobi to Mombasa', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '08c9762c-c359-409e-ab76-8c9099d6c428', 50000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('d9917d42-4fcf-4dca-94fc-04a3e79d0097', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'e1631ec7-ab84-417e-b102-f2fbe2b7d5f3', 'Dodoma to Mbeya', 'Dodoma to Mbeya via Iringa', '675aa51a-bc54-4df1-a648-859436de7687', '73287589-e6ac-40e1-a171-5b557182a3ae', 40000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('e0f80d26-f028-401b-ad9e-06e4c6b92783', '4ee88927-ef8c-4cf3-a15c-903dde3f6711', '88f4e196-d19b-4baf-91cc-58a0ffbf1ba0', 'Zanzibar to Prison Island', 'Speed boat transfer to Prison Island', '08c9762c-c359-409e-ab76-8c9099d6c428', '7d3c3649-45f5-4d6e-adb4-e355e39ec16f', 25000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('fa59410c-bd06-4dd2-a86a-9421981d85fc', '4ee88927-ef8c-4cf3-a15c-903dde3f6711', '886b4347-8ffb-498a-95d9-07e982f88630', 'Dar es Salaam to Zanzibar', 'High-speed ferry service to Zanzibar', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '08c9762c-c359-409e-ab76-8c9099d6c428', 35000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('fddb4907-a5e6-45e9-9efd-74032e79b3a0', 'bfd28fc3-e63f-42d7-9425-8605fa6d919a', 'a44bed9f-785f-4d3d-9b5f-2cf76cca0e05', 'Arusha to Ngorongoro', 'Safari transfer to Ngorongoro Crater', '502361f0-5024-4dc3-8f1c-220ee7a30904', 'dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', 180000.00, 120.00, 'active', 0, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `route_stations`
--

CREATE TABLE `route_stations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `route_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `station_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sequence_order` int(11) NOT NULL,
  `distance_from_origin` decimal(10,2) DEFAULT NULL,
  `cumulative_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_break_stop` tinyint(1) DEFAULT 0,
  `stop_duration_minutes` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `seats`
--

CREATE TABLE `seats` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `seat_layout_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `seat_type` enum('standard','window','aisle','wheelchair','operator','driver','spot','table','room','vip','economy','business') NOT NULL DEFAULT 'standard',
  `row` int(11) DEFAULT NULL,
  `column` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `seat_holds`
--

CREATE TABLE `seat_holds` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `journey_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `activity_instance_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `seat_code` varchar(100) NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `booking_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `held_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `status` enum('holding','confirmed','released','converted','expired') NOT NULL DEFAULT 'holding',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `seat_holds`
--

INSERT INTO `seat_holds` (`id`, `journey_id`, `activity_instance_id`, `seat_code`, `user_id`, `booking_id`, `session_id`, `held_at`, `expires_at`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('2a7d35e9-9963-4e49-8864-42c2da139afe', '87b047f0-2436-4164-b16a-5cb4e1892d99', NULL, 'A1', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', '683b71be-d995-4eab-97aa-1dc989e1d2de', NULL, '2026-05-15 12:15:50', '2026-05-16 12:15:50', 'confirmed', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('747b990f-cc1f-440a-9af8-96f57ce29ac0', '87b047f0-2436-4164-b16a-5cb4e1892d99', NULL, 'A2', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', '683b71be-d995-4eab-97aa-1dc989e1d2de', NULL, '2026-05-15 12:15:50', '2026-05-16 12:15:50', 'confirmed', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `seat_layouts`
--

CREATE TABLE `seat_layouts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `layoutable_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `layoutable_type` enum('transport','facility') NOT NULL DEFAULT 'transport',
  `layout_type` enum('seat','spot','table','room','mixed') NOT NULL DEFAULT 'seat',
  `pattern` varchar(100) NOT NULL,
  `rows` int(11) NOT NULL DEFAULT 0,
  `total_units` int(11) NOT NULL DEFAULT 0,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config`)),
  `status` enum('draft','active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `seat_layouts`
--

INSERT INTO `seat_layouts` (`id`, `layoutable_id`, `layoutable_type`, `layout_type`, `pattern`, `rows`, `total_units`, `config`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('00287eff-3e56-4e64-a755-6cd025af7e51', '56df1c72-86af-4adb-9ae2-f6b46db41a07', 'transport', 'seat', '3-4', 18, 126, '{\"layout_pattern\":\"3-4\",\"rows\":18,\"seats_per_row\":7}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('03cfd979-0457-481b-87bf-a6f09813769f', 'b9e1cf8d-7f6b-4ead-8ea3-081af7d06e35', 'transport', 'seat', '3-3', 20, 120, '{\"layout_pattern\":\"3-3\",\"rows\":20,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('051d5f39-6be3-455c-997a-e14a37469724', '4f572d60-7c24-409a-9ca0-a79227badc40', 'transport', 'seat', '1-2', 2, 6, '{\"layout_pattern\":\"1-2\",\"rows\":2,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('0e3de766-616b-4db2-9bbf-2eebea829b25', 'a1774fe1-fe62-4d62-9034-0d5c793d497e', 'facility', 'seat', '2-2', 20, 80, '{\"layout_pattern\":\"2-2\",\"rows\":20,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('0f952ffb-d9f2-449f-91f2-3a7d796b7e97', '5fc5baf0-c243-42a6-89b3-1bfd0c25a8c9', 'transport', 'seat', '3-2', 20, 100, '{\"layout_pattern\":\"3-2\",\"rows\":20,\"seats_per_row\":5}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('1201169f-2059-4d3b-9497-deab59033ef2', '7ecf9ed6-ee65-41a4-9052-4a5e684df97e', 'transport', 'seat', '2-2', 7, 28, '{\"layout_pattern\":\"2-2\",\"rows\":7,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('1323fa2e-c464-4034-8421-e07cf4390898', 'a44cce97-fe6d-474c-9326-1cfa77e95c2d', 'facility', 'seat', '8-8', 30, 480, '{\"layout_pattern\":\"8-8\",\"rows\":30,\"seats_per_row\":16}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('13c33a5e-3cb8-4807-91af-70335dad925f', 'd1e88b3d-9fee-4c74-a61b-89f22d97bd01', 'facility', 'seat', '15-15', 100, 3000, '{\"layout_pattern\":\"15-15\",\"rows\":100,\"seats_per_row\":30}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1d7ab378-1cfb-4ed8-bd78-bbbaca14a52f', '2e37d110-b22a-466c-8996-adeaad877679', 'facility', 'seat', 'tents', 0, 20, '{\"layout_pattern\":\"tents\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('1e87d89f-bf5e-4200-b9f1-6d14b612650d', '9b0d1f5e-96fb-4c67-afec-f941d21972c2', 'facility', 'seat', 'hiking_group', 0, 30, '{\"layout_pattern\":\"hiking_group\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('2f688132-1ba8-48c8-9fa0-6a6927fa1430', '88f4e196-d19b-4baf-91cc-58a0ffbf1ba0', 'transport', 'seat', '2-2', 8, 32, '{\"layout_pattern\":\"2-2\",\"rows\":8,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('33a886b0-cced-4848-9a78-4004a8a5c67a', '22510f28-e382-4ba8-b0a9-5fc1fec99bed', 'transport', 'seat', '3-2', 24, 120, '{\"layout_pattern\":\"3-2\",\"rows\":24,\"seats_per_row\":5}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('37bae569-f5a1-4828-8828-86eb99c12caf', '2e99a924-6581-496d-97d4-9e110f21cad7', 'transport', 'seat', '1-2', 11, 33, '{\"layout_pattern\":\"1-2\",\"rows\":11,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('3b935525-892c-4d14-a7c1-1f8681f3d2e7', '64ca135d-dce7-4d5a-b4c1-cf3c22414630', 'facility', 'seat', '10-10', 25, 500, '{\"layout_pattern\":\"10-10\",\"rows\":25,\"seats_per_row\":20}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4263e7ee-b33e-48ba-8485-fb33d0433b34', '7248ed00-9c10-4ea3-9252-0c7c193d31f0', 'transport', 'seat', '4-4', 20, 160, '{\"layout_pattern\":\"4-4\",\"rows\":20,\"seats_per_row\":8}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('45eccd85-8bb2-435c-9fc8-fa80d337f907', 'b9685f74-73ac-4a51-8534-66e7fe8025e9', 'transport', 'seat', '3-2', 25, 125, '{\"layout_pattern\":\"3-2\",\"rows\":25,\"seats_per_row\":5}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('469e3037-065a-4230-bb2e-dbec51b40974', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', 'transport', 'seat', '2-2', 12, 48, '{\"layout_pattern\":\"2-2\",\"rows\":12,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('4811c43d-00b6-498c-9feb-9339f230067b', 'aabf2345-8a2c-4cfa-9281-893343b00970', 'facility', 'seat', '3-3', 15, 90, '{\"layout_pattern\":\"3-3\",\"rows\":15,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('48bfbc90-62fc-4f92-87d0-9844a237e08a', '7179207a-54bb-4fd8-9661-1b98ca40421f', 'facility', 'seat', 'rooms', 0, 50, '{\"layout_pattern\":\"rooms\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('4b6c0e05-da28-4933-8c46-f81ebec6244c', 'cd7325c0-01d7-4e92-b755-76cbbee36b18', 'facility', 'seat', 'safari_vehicle', 0, 40, '{\"layout_pattern\":\"safari_vehicle\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('538cf87a-ce7e-4bd5-b083-c1f6e98c6594', '209fc6f0-464d-45b3-9950-2175605f2263', 'facility', 'seat', '10-10', 50, 1000, '{\"layout_pattern\":\"10-10\",\"rows\":50,\"seats_per_row\":20}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('56bf63e2-6a8a-4ec7-9345-5480693cd7d4', 'b8e8dd97-c991-4cba-ae99-8342d9987284', 'transport', 'seat', '5-5', 35, 350, '{\"layout_pattern\":\"5-5\",\"rows\":35,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('5930c5b1-7ded-4db0-821f-b7d959d0df47', '4b35bdf9-38fe-49a3-bc71-c4d912d4cb99', 'facility', 'seat', 'safari_vehicle', 0, 25, '{\"layout_pattern\":\"safari_vehicle\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('597474af-3c39-473d-b8fc-dfa9f0be8e59', 'e1631ec7-ab84-417e-b102-f2fbe2b7d5f3', 'transport', 'seat', '2-2', 13, 52, '{\"layout_pattern\":\"2-2\",\"rows\":13,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('5b7ad585-52bf-4c79-8655-82004d0873e4', 'ce879e74-e40e-400c-a79c-550a2220ec72', 'facility', 'seat', 'rooms', 0, 60, '{\"layout_pattern\":\"rooms\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('5bde44f3-b7fd-41b7-85af-e358b034f514', '898dcdb3-ba35-4cae-835a-1585ee30605a', 'facility', 'seat', 'rooms', 0, 40, '{\"layout_pattern\":\"rooms\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('5d178d09-48db-4022-9fde-cea9fd05fc7e', '886b4347-8ffb-498a-95d9-07e982f88630', 'transport', 'seat', '3-3', 15, 90, '{\"layout_pattern\":\"3-3\",\"rows\":15,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('708126cd-5706-461a-8ec8-c6437c1ee562', '3c898bd1-465c-4cf0-aff2-35284ecbd994', 'transport', 'seat', '2-3', 8, 40, '{\"layout_pattern\":\"2-3\",\"rows\":8,\"seats_per_row\":5}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('7484979a-7b29-461f-9ffe-c4b7da4dc68e', 'b5e8ddc1-52e4-423f-ba1f-790314618812', 'transport', 'seat', '1-2', 2, 6, '{\"layout_pattern\":\"1-2\",\"rows\":2,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('7bd3d78d-e97f-411e-8955-5f6645873314', '58dd6ead-8741-4133-a246-bb93f4125293', 'transport', 'seat', '2-2', 11, 44, '{\"layout_pattern\":\"2-2\",\"rows\":11,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7e04e3f1-c0ac-45a4-8ae1-f97ccd54d748', 'f300aeec-7045-4045-a694-186b3ea83c47', 'facility', 'seat', 'rooms', 0, 150, '{\"layout_pattern\":\"rooms\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('8419fa34-2698-478b-b853-997e6a2c4997', '9722e08e-8761-4adc-ba20-58df490acad5', 'facility', 'seat', '8-8', 50, 800, '{\"layout_pattern\":\"8-8\",\"rows\":50,\"seats_per_row\":16}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('88a72b37-e7fc-4679-98cc-7fce4cdcbdf4', 'f5ba1271-c5a3-44f8-9c77-fd4f1a45838b', 'facility', 'seat', '5-5', 10, 100, '{\"layout_pattern\":\"5-5\",\"rows\":10,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('891f9026-8d2c-43f7-b860-2bdfcfb7519c', 'd136698c-5e6c-45ff-8691-2add35db96f5', 'facility', 'seat', 'hiking_group', 0, 60, '{\"layout_pattern\":\"hiking_group\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('906163dc-82ab-4488-95c9-6f4a5c984ea6', '519e54a2-2ecc-4135-9d92-de6c2d70bdd2', 'facility', 'seat', 'safari_vehicle', 0, 35, '{\"layout_pattern\":\"safari_vehicle\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('90f6e4e9-f543-465d-8c99-0eacef23190c', '14b985a4-2dad-4daa-8157-6f0ed3fcfa79', 'facility', 'seat', '5-5', 20, 200, '{\"layout_pattern\":\"5-5\",\"rows\":20,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('a7becf8f-39d1-49c5-b2ef-9fe24fbcf476', '1951cb01-9839-4e28-bcf5-fcad0da8257f', 'transport', 'seat', '5-5', 40, 400, '{\"layout_pattern\":\"5-5\",\"rows\":40,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('abc74e2b-f408-46ee-a06c-07dea27c15c7', 'b6e2e80d-318f-4574-bf41-2932a93aeebf', 'facility', 'seat', 'safari_vehicle', 0, 50, '{\"layout_pattern\":\"safari_vehicle\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('ad4e96ca-5096-4009-9798-7ef0566676e8', '6bd7f46a-c96f-4bde-8027-32ca84d4634f', 'facility', 'seat', '5-5', 50, 500, '{\"layout_pattern\":\"5-5\",\"rows\":50,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('b8381bfa-987f-4597-9ee7-c3fe15acba3b', '311deba5-0079-45b4-8d33-564d05aeb375', 'transport', 'seat', '1-2', 8, 24, '{\"layout_pattern\":\"1-2\",\"rows\":8,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('b9efd62a-71c8-4070-ba56-9aebc2f5face', '9fdc4134-ebb5-4dd2-8eee-6d4c94357c71', 'facility', 'seat', '4-4', 15, 120, '{\"layout_pattern\":\"4-4\",\"rows\":15,\"seats_per_row\":8}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('bcd7ab48-436e-4688-bc19-72e30301f11e', 'b4fa25f2-68da-4ab4-a8bd-681b6a91fff5', 'facility', 'seat', '5-5', 10, 100, '{\"layout_pattern\":\"5-5\",\"rows\":10,\"seats_per_row\":10}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('bf7b3b8a-a94f-4a06-b7a9-3b32079119dd', 'f4ec399b-5ceb-444b-b865-a18ec2047896', 'transport', 'seat', '1-2', 6, 18, '{\"layout_pattern\":\"1-2\",\"rows\":6,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('bf8b53dd-6911-4293-bda1-c8547d71a2f8', '32626167-fd12-4477-96ef-984fd0bebbf4', 'transport', 'seat', '1-1', 6, 12, '{\"layout_pattern\":\"1-1\",\"rows\":6,\"seats_per_row\":2}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('bfce1f21-2a73-40c8-b684-d24866afbdbf', '80f27540-8083-458e-a527-48c406dc27fd', 'facility', 'seat', '12-12', 50, 1200, '{\"layout_pattern\":\"12-12\",\"rows\":50,\"seats_per_row\":24}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('c8bdeaef-65c8-49d4-8284-87095db572b8', '31b87f47-20fe-4e0f-ad72-9f1eb3c8160e', 'facility', 'seat', 'open', 0, 1000, '{\"layout_pattern\":\"open\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('cf247213-9fde-46af-9bcb-cffd39ee18fe', 'a44bed9f-785f-4d3d-9b5f-2cf76cca0e05', 'transport', 'seat', '2-2', 2, 8, '{\"layout_pattern\":\"2-2\",\"rows\":2,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d38e1d3b-4c63-4d88-b20a-089a1ec0fc7d', 'd1c62d18-730c-4ea5-a82c-ac514d3b7a53', 'transport', 'seat', '3-3', 12, 72, '{\"layout_pattern\":\"3-3\",\"rows\":12,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d72fcbd8-1db8-4215-aa8a-27d0b6d26924', 'ff874a27-3eff-49c4-b000-17021b8e3b7d', 'facility', 'seat', '3-3', 17, 102, '{\"layout_pattern\":\"3-3\",\"rows\":17,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('d7413dab-d44e-4dad-96e2-ff70be56c381', 'd78059fd-a1bc-4649-b919-e31a3a67fd3c', 'transport', 'seat', '3-2', 18, 90, '{\"layout_pattern\":\"3-2\",\"rows\":18,\"seats_per_row\":5}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('d9c96508-1dfe-4f60-9153-ac4d2ab84440', 'ba623299-c493-4f17-a60a-00d4422fb78b', 'transport', 'seat', '2-2', 5, 20, '{\"layout_pattern\":\"2-2\",\"rows\":5,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('e19f4b97-593b-4d35-9474-0a76608ebe89', 'c3d36fd1-8b78-446c-a34e-4ac0eb053413', 'facility', 'seat', '3-3', 25, 150, '{\"layout_pattern\":\"3-3\",\"rows\":25,\"seats_per_row\":6}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('e2e16e54-a1d5-43e1-b7e7-0dccc7e1c832', '5aa5533c-e7d9-4901-b725-63f4d29d14d3', 'transport', 'seat', '2-1', 13, 39, '{\"layout_pattern\":\"2-1\",\"rows\":13,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('eeb5eb25-4874-43b0-9366-b2a659b65296', '227649bb-0933-45c8-9314-dab483aa3c2e', 'facility', 'seat', 'rooms', 0, 100, '{\"layout_pattern\":\"rooms\",\"rows\":0,\"seats_per_row\":null}', 'active', '2026-05-15 12:15:50', '2026-05-15 12:15:50', NULL),
('f403ac06-f413-4e7a-ae57-ce2763afe228', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', 'transport', 'seat', '2-2', 12, 48, '{\"layout_pattern\":\"2-2\",\"rows\":12,\"seats_per_row\":4}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('f72d376d-4e49-4f1e-9f91-f92bdf59147c', 'b16d718d-83c7-49ca-ae5c-7a9128178c74', 'transport', 'seat', '1-2', 2, 6, '{\"layout_pattern\":\"1-2\",\"rows\":2,\"seats_per_row\":3}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('fb5bf603-0aff-465b-9241-22b73d290743', '7ea1967e-4480-4129-b641-ddba83b5a13a', 'transport', 'seat', '1-1', 3, 6, '{\"layout_pattern\":\"1-1\",\"rows\":3,\"seats_per_row\":2}', 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `settings`
--

CREATE TABLE `settings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `stations`
--

CREATE TABLE `stations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `type` enum('origin','destination','intermediate','terminal') NOT NULL DEFAULT 'intermediate',
  `facilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`facilities`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `stations`
--

INSERT INTO `stations` (`id`, `company_id`, `name`, `code`, `description`, `address`, `city`, `country`, `latitude`, `longitude`, `type`, `facilities`, `created_at`, `updated_at`, `deleted_at`) VALUES
('08c9762c-c359-409e-ab76-8c9099d6c428', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Zanzibar', 'ZNZ', NULL, 'Stone Town Port', 'Zanzibar', 'Tanzania', NULL, NULL, 'destination', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('502361f0-5024-4dc3-8f1c-220ee7a30904', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Arusha', 'ARU', NULL, 'Arusha Terminal', 'Arusha', 'Tanzania', NULL, NULL, 'destination', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('675aa51a-bc54-4df1-a648-859436de7687', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Dodoma', 'DDM', NULL, 'Dodoma Terminal', 'Dodoma', 'Tanzania', NULL, NULL, 'intermediate', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('73287589-e6ac-40e1-a171-5b557182a3ae', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Mbeya', 'MBY', NULL, 'Mbeya Station', 'Mbeya', 'Tanzania', NULL, NULL, 'destination', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7d3c3649-45f5-4d6e-adb4-e355e39ec16f', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Pemba', 'PMB', NULL, 'Pemba Port', 'Pemba', 'Tanzania', NULL, NULL, 'destination', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('84ae5b27-d6e2-4ad0-9f91-ac58ab10eb0c', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Iringa', 'IRG', NULL, 'Iringa Terminal', 'Iringa', 'Tanzania', NULL, NULL, 'intermediate', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('916c61a7-80fb-4d94-8edd-9a738169ff31', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Morogoro', 'MGO', NULL, 'Morogoro Stop', 'Morogoro', 'Tanzania', NULL, NULL, 'intermediate', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('dd84c46f-92c5-4e21-be32-1a2ecf7ac27c', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', 'Dar es Salaam', 'DSM', NULL, 'Dar es Salaam Station', 'Dar es Salaam', 'Tanzania', NULL, NULL, 'origin', '{}', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `timetables`
--

CREATE TABLE `timetables` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `route_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `transport_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `activity_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `facility_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `date` date DEFAULT NULL,
  `available_seats` int(11) DEFAULT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `frequency_type` enum('once','daily','weekly','custom') NOT NULL DEFAULT 'once',
  `frequency_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`frequency_config`)),
  `effective_from` date NOT NULL,
  `effective_until` date DEFAULT NULL,
  `status` enum('draft','active','inactive','sold_out') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `timetables`
--

INSERT INTO `timetables` (`id`, `route_id`, `transport_id`, `activity_id`, `facility_id`, `date`, `available_seats`, `departure_time`, `arrival_time`, `frequency_type`, `frequency_config`, `effective_from`, `effective_until`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('03904bc2-1a47-4b14-93ed-793c7d4fae60', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', NULL, NULL, '2026-05-13', 48, '14:00:00', '14:30:00', 'once', '{}', '2026-05-13', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('061510f6-fc64-4b3c-8279-a4e210778339', '7eaec9ca-6428-46f6-bfdf-d8c9ef8dad47', '58dd6ead-8741-4133-a246-bb93f4125293', NULL, NULL, '2026-05-12', 45, '07:00:00', '11:00:00', 'once', '{}', '2026-05-12', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('16201d70-4489-4055-8535-69f0668cd227', 'bbf9faee-7fd5-4228-801c-90c505b868a5', 'b9685f74-73ac-4a51-8534-66e7fe8025e9', NULL, NULL, '2026-05-11', 280, '08:00:00', '13:00:00', 'once', '{}', '2026-05-11', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('170bfcdd-4893-4462-88f3-17eb18ced170', 'aaf964bc-b926-4362-a6bc-1fc0cb4f18c2', 'b5e8ddc1-52e4-423f-ba1f-790314618812', NULL, NULL, '2026-05-14', 12, '07:00:00', '08:30:00', 'once', '{}', '2026-05-14', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('1f9403bd-8315-4101-9b1e-4ebfc44e405d', 'e0f80d26-f028-401b-ad9e-06e4c6b92783', '88f4e196-d19b-4baf-91cc-58a0ffbf1ba0', NULL, NULL, '2026-05-13', 30, '11:00:00', '13:00:00', 'once', '{}', '2026-05-13', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('323e925a-c7b9-44d5-83f1-eac0856a6059', '990797f5-6d66-40dd-8a48-b1b0e8a9e1f1', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', NULL, NULL, '2026-05-10', 48, '14:00:00', '22:00:00', 'once', '{}', '2026-05-10', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('5fce00ce-e8ae-4cbb-a814-3ab87a2613ce', 'd9917d42-4fcf-4dca-94fc-04a3e79d0097', 'e1631ec7-ab84-417e-b102-f2fbe2b7d5f3', NULL, NULL, '2026-05-13', 52, '09:00:00', '16:00:00', 'once', '{}', '2026-05-13', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('6dbda969-b4dd-43d9-9e15-b3af13d20176', '07776dce-8150-4e52-bcfd-04509f9b066b', 'b9e1cf8d-7f6b-4ead-8ea3-081af7d06e35', NULL, NULL, '2026-05-12', 120, '10:00:00', '11:30:00', 'once', '{}', '2026-05-12', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('6df98b9e-b237-4232-a1cf-4253a3f99a77', '9e4fdeb8-4a2a-4821-886c-89e71affaf12', '5fc5baf0-c243-42a6-89b3-1bfd0c25a8c9', NULL, NULL, '2026-05-10', 200, '18:00:00', '08:00:00', 'once', '{}', '2026-05-10', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('7016bead-30aa-47de-bbbd-7e30afb252de', '835d1115-810e-4bf8-84af-259891b45a41', '5aa5533c-e7d9-4901-b725-63f4d29d14d3', NULL, NULL, '2026-05-11', 40, '08:00:00', '16:00:00', 'once', '{}', '2026-05-11', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('7ffa814c-da17-4dae-b2d3-b28a734a8803', '8a038103-b3b4-4d18-9062-9c93b737e74e', '311deba5-0079-45b4-8d33-564d05aeb375', NULL, NULL, '2026-05-14', 25, '10:00:00', '12:00:00', 'once', '{}', '2026-05-14', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('8481b2d2-2b40-49dc-8096-feb4aad5a5dd', 'aaf964bc-b926-4362-a6bc-1fc0cb4f18c2', 'b5e8ddc1-52e4-423f-ba1f-790314618812', NULL, NULL, '2026-05-15', 7, '06:00:00', '18:00:00', 'once', '{}', '2026-05-15', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('89b06538-e7b1-4b62-bf0c-9a4460b9db63', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', NULL, NULL, '2026-05-10', 150, '15:00:00', '17:30:00', 'once', '{}', '2026-05-10', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('8da809a6-0411-48ba-a78f-c6c730dd9c82', '990797f5-6d66-40dd-8a48-b1b0e8a9e1f1', '9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', NULL, NULL, '2026-05-10', 50, '06:00:00', '14:00:00', 'once', '{}', '2026-05-10', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('9d4d651d-cb61-43dc-8a03-9863e6bd96bc', 'afd1a39e-3a34-4d5f-a45c-25ada2ff3c6c', '3475a42a-5ce2-4aa2-8a3a-b75c5112b033', NULL, NULL, '2026-05-10', 150, '09:00:00', '11:30:00', 'once', '{}', '2026-05-10', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('be381ecc-3bfa-4ef0-a344-e6f90c7e36f7', 'b899c468-de34-4253-a4d4-5506022b9809', '7248ed00-9c10-4ea3-9252-0c7c193d31f0', NULL, NULL, '2026-05-11', 200, '08:00:00', '13:00:00', 'once', '{}', '2026-05-11', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('c34e5030-cca1-4aec-b24d-64e24b064ee2', '902469a7-be1f-445a-8f66-bd3d2ae2390c', '1951cb01-9839-4e28-bcf5-fcad0da8257f', NULL, NULL, '2026-05-12', 400, '20:00:00', '08:00:00', 'once', '{}', '2026-05-12', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL),
('de8849c9-e83c-43c2-b086-e163cdec6e75', 'fddb4907-a5e6-45e9-9efd-74032e79b3a0', 'a44bed9f-785f-4d3d-9b5f-2cf76cca0e05', NULL, NULL, '2026-05-16', 8, '07:00:00', '14:00:00', 'once', '{}', '2026-05-16', NULL, 'active', '2026-05-15 12:15:49', '2026-05-15 12:15:49', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `transports`
--

CREATE TABLE `transports` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `transport_type_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `registration_number` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 0,
  `sitting_plan` varchar(100) DEFAULT NULL,
  `sitting_length` int(11) NOT NULL DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `status` enum('draft','active','maintenance','retired') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `transports`
--

INSERT INTO `transports` (`id`, `company_id`, `transport_type_id`, `name`, `registration_number`, `description`, `capacity`, `sitting_plan`, `sitting_length`, `images`, `features`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('1951cb01-9839-4e28-bcf5-fcad0da8257f', 'c61567de-9ad4-473b-bca4-f556ee719496', '7b8757f2-f33d-47f6-b65b-a45edb056cd9', 'MV Victoria', 'S-001-LVC', 'Lake Victoria passenger ship', 400, '5-5', 40, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('22510f28-e382-4ba8-b0a9-5fc1fec99bed', 'f9308b9f-4ac1-4ce9-9b85-9660c93a7216', '912738d1-6575-455f-9ee7-790b8d20cc6d', 'SGR Intercity', 'TR-004-KEN', 'Intercity SGR service', 280, '3-2', 24, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('2e99a924-6581-496d-97d4-9e110f21cad7', '0ac6f796-e400-4e18-bda1-3a0597c0070a', '2cfc358e-16dc-4e95-834a-a615feb852bd', 'Cross Border VIP', 'T-004-NRB', 'VIP cross-border service', 35, '1-2', 11, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('311deba5-0079-45b4-8d33-564d05aeb375', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '7eddaa1b-64f7-499c-89cd-123df8352796', 'Mini Express 003', 'T-006-KLM', 'Airport shuttle and short-route service', 25, '1-2', 8, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('32626167-fd12-4477-96ef-984fd0bebbf4', 'a910bb07-21e2-45dc-9ded-44294e63f4ad', '0062404d-76b4-47dc-ae53-0c830f869f45', 'Coastal Caravan', 'P-003-COA', 'Light aircraft for safari flights', 12, '1-1', 6, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('3475a42a-5ce2-4aa2-8a3a-b75c5112b033', '133109d3-e8a6-41ef-acf4-9d8c158d51b2', '0062404d-76b4-47dc-ae53-0c830f869f45', 'PA ATR 42', 'P-002-AER', 'Regional turboprop aircraft', 48, '2-2', 12, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('3c898bd1-465c-4cf0-aff2-35284ecbd994', 'c61567de-9ad4-473b-bca4-f556ee719496', 'ebbe20ea-271e-4fa9-9cdf-f9837aa63a68', 'Lake Cruiser', 'B-003-LVC', 'Lake cruiser boat', 40, '2-3', 8, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('4f572d60-7c24-409a-9ca0-a79227badc40', '53b0068d-d467-4130-ae8e-ec04ef71a41f', 'eb3e87be-fb97-4bc0-8836-456d675167cb', 'Desert Explorer', 'T-012-SAF', 'Desert safari vehicle', 7, '1-2', 2, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('56df1c72-86af-4adb-9ae2-f6b46db41a07', '9baa7648-bf7f-4983-bab0-7f1fc617e6ac', 'bd6113b5-ee5b-4cf4-97ac-e53b647eaa9d', 'Kilimanjaro IV', 'F-003-AZM', 'Coastal ferry service', 180, '3-4', 18, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('58dd6ead-8741-4133-a246-bb93f4125293', '0ac6f796-e400-4e18-bda1-3a0597c0070a', '2cfc358e-16dc-4e95-834a-a615feb852bd', 'Nairobi Express', 'T-003-NRB', 'Cross-border bus service', 45, '2-2', 11, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('5aa5533c-e7d9-4901-b725-63f4d29d14d3', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '2cfc358e-16dc-4e95-834a-a615feb852bd', 'Luxury 002', 'T-002-KLM', 'Premium intercity coach', 40, '2-1', 13, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('5fc5baf0-c243-42a6-89b3-1bfd0c25a8c9', '8921c3b0-d1dd-409b-880b-07354761b6b1', '912738d1-6575-455f-9ee7-790b8d20cc6d', 'Central Line Express', 'TR-001-TRZ', 'Intercity train service', 200, '3-2', 20, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7248ed00-9c10-4ea3-9252-0c7c193d31f0', '9baa7648-bf7f-4983-bab0-7f1fc617e6ac', 'bd6113b5-ee5b-4cf4-97ac-e53b647eaa9d', 'Azam Star', 'F-002-AZM', 'Zanzibar ferry with passenger service', 200, '4-4', 20, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7ea1967e-4480-4129-b641-ddba83b5a13a', 'a910bb07-21e2-45dc-9ded-44294e63f4ad', '0062404d-76b4-47dc-ae53-0c830f869f45', 'Safari Air Cessna', 'P-004-COA', 'Small safari aircraft', 6, '1-1', 3, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('7ecf9ed6-ee65-41a4-9052-4a5e684df97e', '9baa7648-bf7f-4983-bab0-7f1fc617e6ac', 'ebbe20ea-271e-4fa9-9cdf-f9837aa63a68', 'Express Dhow', 'B-002-AZM', 'Traditional boat service', 25, '2-2', 7, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('886b4347-8ffb-498a-95d9-07e982f88630', '4ee88927-ef8c-4cf3-a15c-903dde3f6711', 'bd6113b5-ee5b-4cf4-97ac-e53b647eaa9d', 'Ocean Jet', 'F-001-ISL', 'High-speed ferry service', 150, '3-3', 15, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('88f4e196-d19b-4baf-91cc-58a0ffbf1ba0', '4ee88927-ef8c-4cf3-a15c-903dde3f6711', 'ebbe20ea-271e-4fa9-9cdf-f9837aa63a68', 'Speed Boat Alpha', 'B-001-ISL', 'Speed boat service', 30, '2-2', 8, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('9a1892e4-553e-4c02-8b89-a6aa54cf8bdb', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '2cfc358e-16dc-4e95-834a-a615feb852bd', 'Express 001', 'T-001-KLM', 'Daily Dar es Salaam to Arusha bus service', 50, '2-2', 12, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('a44bed9f-785f-4d3d-9b5f-2cf76cca0e05', 'bfd28fc3-e63f-42d7-9425-8605fa6d919a', 'eb3e87be-fb97-4bc0-8836-456d675167cb', 'Land Cruiser VX', 'T-010-SER', 'Premium safari vehicle', 8, '2-2', 2, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b16d718d-83c7-49ca-ae5c-7a9128178c74', 'bfd28fc3-e63f-42d7-9425-8605fa6d919a', 'eb3e87be-fb97-4bc0-8836-456d675167cb', 'Safari Ranger', 'T-011-SER', 'Compact safari vehicle', 6, '1-2', 2, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b5e8ddc1-52e4-423f-ba1f-790314618812', '53b0068d-d467-4130-ae8e-ec04ef71a41f', 'eb3e87be-fb97-4bc0-8836-456d675167cb', 'Safari Cruiser', 'T-009-SAF', 'Small safari vehicle for guided tours', 7, '1-2', 2, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b8e8dd97-c991-4cba-ae99-8342d9987284', 'c61567de-9ad4-473b-bca4-f556ee719496', '7b8757f2-f33d-47f6-b65b-a45edb056cd9', 'MV Nyanza', 'S-002-LVC', 'Lake Victoria cruise ship', 350, '5-5', 35, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b9685f74-73ac-4a51-8534-66e7fe8025e9', 'f9308b9f-4ac1-4ce9-9b85-9660c93a7216', '912738d1-6575-455f-9ee7-790b8d20cc6d', 'SGR Madaraka', 'TR-003-KEN', 'Standard Gauge Railway', 300, '3-2', 25, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('b9e1cf8d-7f6b-4ead-8ea3-081af7d06e35', '133109d3-e8a6-41ef-acf4-9d8c158d51b2', '0062404d-76b4-47dc-ae53-0c830f869f45', 'PA Boeing 737', 'P-001-AER', 'Regional passenger airplane', 120, '3-3', 20, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('ba623299-c493-4f17-a60a-00d4422fb78b', '0ac6f796-e400-4e18-bda1-3a0597c0070a', '7eddaa1b-64f7-499c-89cd-123df8352796', 'Urban Commuter', 'T-008-NRB', 'City commuter service', 20, '2-2', 5, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('d1c62d18-730c-4ea5-a82c-ac514d3b7a53', '4ee88927-ef8c-4cf3-a15c-903dde3f6711', 'bd6113b5-ee5b-4cf4-97ac-e53b647eaa9d', 'Island Hopper', 'F-004-ISL', 'Island hopping ferry', 100, '3-3', 12, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('d78059fd-a1bc-4649-b919-e31a3a67fd3c', '8921c3b0-d1dd-409b-880b-07354761b6b1', '912738d1-6575-455f-9ee7-790b8d20cc6d', 'Coastal Express', 'TR-002-TRZ', 'Coastal railway service', 180, '3-2', 18, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('e1631ec7-ab84-417e-b102-f2fbe2b7d5f3', '00725a4a-7094-42ff-b3d4-c5b40f3e4a5f', '2cfc358e-16dc-4e95-834a-a615feb852bd', 'Scania Supreme', 'T-005-KLM', 'Luxury long-distance coach', 52, '2-2', 13, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('f4ec399b-5ceb-444b-b865-a18ec2047896', '53b0068d-d467-4130-ae8e-ec04ef71a41f', '7eddaa1b-64f7-499c-89cd-123df8352796', 'Safari Shuttle', 'T-007-SAF', 'Safari transfer shuttle', 18, '1-2', 6, '[]', '{}', 'active', '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `transport_types`
--

CREATE TABLE `transport_types` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `category` enum('land','air','water') NOT NULL DEFAULT 'land',
  `icon_url` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `requires_routes` tinyint(1) DEFAULT 1,
  `requires_layout` tinyint(1) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `transport_types`
--

INSERT INTO `transport_types` (`id`, `name`, `slug`, `category`, `icon_url`, `description`, `requires_routes`, `requires_layout`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0062404d-76b4-47dc-ae53-0c830f869f45', 'Aeroplane', 'aeroplane', 'air', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('2cfc358e-16dc-4e95-834a-a615feb852bd', 'Bus', 'bus', 'land', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('7b8757f2-f33d-47f6-b65b-a45edb056cd9', 'Ship', 'ship', 'water', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('7eddaa1b-64f7-499c-89cd-123df8352796', 'Mini Bus', 'mini_bus', 'land', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('912738d1-6575-455f-9ee7-790b8d20cc6d', 'Train', 'train', 'land', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('bd6113b5-ee5b-4cf4-97ac-e53b647eaa9d', 'Ferry', 'ferry', 'water', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('eb3e87be-fb97-4bc0-8836-456d675167cb', 'Safari Car', 'safari_car', 'land', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('ebbe20ea-271e-4fa9-9cdf-f9837aa63a68', 'Boat', 'boat', 'water', NULL, NULL, 1, 1, 1, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `preferred_language` varchar(5) DEFAULT 'sw',
  `preferred_currency_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `phone_verified_at` datetime DEFAULT NULL,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `first_name`, `last_name`, `avatar_url`, `preferred_language`, `preferred_currency_id`, `email_verified_at`, `phone_verified_at`, `status`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`, `deleted_at`) VALUES
('2475518a-1099-4bb9-89e1-d3d75c17331e', 'manager@railways.co.tz', '+255787654322', '$2b$12$V3jP0y8md1vQO7aRB74hhujcdoXg3ADkeqG8G7OiIyOQbugzhrvfq', 'Peter', 'Kamau', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:40', '2026-05-15 12:15:40', NULL),
('32d99860-4bd7-41aa-9a25-488c10b9f38f', 'david.mwase@gmail.com', '+255787123456', '$2b$12$l81JVFMpd0Ayk5hS.QbIGuc6lbt/v251JL1Duz5PWv2gKST5yCBhu', 'David', 'Mwase', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:47', '2026-05-15 12:15:47', NULL),
('358c258c-1d1d-4b63-af63-0346ff4ff73e', 'james.mbogo@gmail.com', '+255713456789', '$2b$12$fLrHMlRBfLb3TFBbRRfoHOvzHkBysHQE.d2jY/tRzjHVyllqfeoJK', 'James', 'Mbogo', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:45', '2026-05-15 12:15:45', NULL),
('36be5dab-e106-4281-8ba1-6f1c03b7d1e6', 'dev@system.co.tz', '+255700000001', '$2b$12$CcbGkYvAJeFgzSHbewfkeuCN9WWeYelKHTBwiY5oasq0KC6D6HDEO', 'System', 'Developer', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:34', '2026-05-15 12:15:34', NULL),
('390c8bb1-bec7-4211-9a96-2abca6e6c1f0', 'fatuma.hassan@gmail.com', '+255776000002', '$2b$12$XuekChBObsdxoL9FCnRSvujmV5M3pTUraQLjnK/9yd1lqL0thEP6O', 'Fatuma', 'Hassan', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:46', '2026-05-15 12:15:46', NULL),
('3c179dac-8f17-4bf7-a076-47d5ae9c14e7', 'staff@kiliexpress.co.tz', '+255754333444', '$2b$12$9qGwSKR0RKrpBz510uUmbOE6q2nHRjXkc2dS36JwdU5rZ0kn/M8nu', 'Naomi', 'Ochieng', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:41', '2026-05-15 12:15:41', NULL),
('7aac9f5a-c3f5-4d66-834d-efb55b299a31', 'amina.juma@gmail.com', '+255776000001', '$2b$12$rELq3S363FndWybmSyVzhuCoQxM1Uhq9R5QZi3WZ70deMUP6akBG2', 'Amina', 'Juma', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:43', '2026-05-15 12:15:43', NULL),
('7d926535-efcc-40a8-817f-e18abc708514', 'admin@system.co.tz', '+255700000002', '$2b$12$rZH5kJ9PgQVH9qfX.uWTA.dydlWBwZJAFWwGW6wT9cwpU34dJ76Ea', 'Super', 'Administrator', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:35', '2026-05-15 12:15:35', NULL),
('981b1049-3b11-4d09-9326-87e46464ab55', 'staff@azammarine.co.tz', '+255755000111', '$2b$12$lN1cQorJGwQA4QDC3KI7J.Tfatxb2QaRjUrPLWBunFK8/PHx7sz82', 'Hassan', 'Salim', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:42', '2026-05-15 12:15:42', NULL),
('a1674d57-e4a0-4ff3-99fa-b3c8f4aa4ddf', 'manager@kiliexpress.co.tz', '+255712111222', '$2b$12$Z0rhlRuv.ryfB17lleBJlOppM3cKKC54rmGJcRudqOey4BADAEgXC', 'Baraka', 'Mwenda', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:36', '2026-05-15 12:15:36', NULL),
('ab37a274-f725-49d1-b97b-c2ed7bf1731c', 'manager@darcinema.co.tz', '+255765987654', '$2b$12$g4hfHbxCms81yz9I9bQwS.KkWNVARKAvhqHGIgB89KEnfCW3pCm/C', 'Fatuma', 'Mkono', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:39', '2026-05-15 12:15:39', NULL),
('c6e353d7-bea2-4e0a-9c37-95a2d4455d72', 'staff@darcinema.co.tz', '+255712345678', '$2b$12$dQ9zXiyutSPmhs6CvnadV.vqCqS.pi6CQTssM6s3OG3YTxvFC0qoe', 'Amina', 'Juma', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:43', '2026-05-15 12:15:43', NULL),
('d6884b3d-bd11-4711-9d94-7fe28dacfb7c', 'grace.kimani@gmail.com', '+255776234567', '$2b$12$Et4yYlJk57neZpBLhx.B7.pEukfflMh7Slb1azGEo4WtZRmg8GEvO', 'Grace', 'Kimani', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:44', '2026-05-15 12:15:44', NULL),
('f7b36c05-4c27-4277-ba57-494ae7c136aa', 'manager@serengeti.co.tz', '+255744123456', '$2b$12$os0EGvFhTf8nBaLLooA.0eg5qC30kPn.ske9PtDdRkMURXDoaJWua', 'Neema', 'Oloitipitip', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:38', '2026-05-15 12:15:38', NULL),
('ffefd3d4-f84b-47b2-a106-c53d0965fa55', 'manager@azammarine.co.tz', '+255787654321', '$2b$12$c0mJVIVnhT/Jax.CZ48Wou/n61pC.E2khTV9hKTaKhrpCU5Ex8UT.', 'Ahmed', 'Hassan', NULL, 'en', NULL, NULL, NULL, 'active', NULL, NULL, '2026-05-15 12:15:37', '2026-05-15 12:15:37', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `user_roles`
--

CREATE TABLE `user_roles` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `role_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `company_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `assigned_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `company_id`, `assigned_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('251278bf-5cc5-49b3-a24b-55553fbaa9c8', 'ffefd3d4-f84b-47b2-a106-c53d0965fa55', '10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', NULL, NULL, '2026-05-15 12:15:38', '2026-05-15 12:15:38', NULL),
('46371d11-eb45-4070-8e35-baf341738a94', '36be5dab-e106-4281-8ba1-6f1c03b7d1e6', '4bc0f53f-09f8-467c-a3f9-e8cb9f7b45a8', NULL, NULL, '2026-05-15 12:15:35', '2026-05-15 12:15:35', NULL),
('510c7e8c-ce82-4f7f-9bb9-8f4af3d9771b', '32d99860-4bd7-41aa-9a25-488c10b9f38f', '1617c503-bf3b-4f1f-821f-d5931d56e9a8', NULL, NULL, '2026-05-15 12:15:48', '2026-05-15 12:15:48', NULL),
('561bbbf2-cf77-4b43-ae7d-202dfbc67291', 'a1674d57-e4a0-4ff3-99fa-b3c8f4aa4ddf', '10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', NULL, NULL, '2026-05-15 12:15:37', '2026-05-15 12:15:37', NULL),
('6e50ab9d-59ce-422d-a2fe-b8ca98157916', 'c6e353d7-bea2-4e0a-9c37-95a2d4455d72', '8af37e84-0da9-4ce9-baf1-9e1127c6de93', NULL, NULL, '2026-05-15 12:15:43', '2026-05-15 12:15:43', NULL),
('71ef84ae-9204-4cc6-b6f5-ce703a55b37f', '3c179dac-8f17-4bf7-a076-47d5ae9c14e7', '8af37e84-0da9-4ce9-baf1-9e1127c6de93', NULL, NULL, '2026-05-15 12:15:42', '2026-05-15 12:15:42', NULL),
('89040239-ce35-49e0-b5e5-ef59ef6fc993', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', '1617c503-bf3b-4f1f-821f-d5931d56e9a8', NULL, NULL, '2026-05-15 12:15:44', '2026-05-15 12:15:44', NULL),
('895b5d12-e055-44cb-8edc-4257822432e4', '981b1049-3b11-4d09-9326-87e46464ab55', '8af37e84-0da9-4ce9-baf1-9e1127c6de93', NULL, NULL, '2026-05-15 12:15:43', '2026-05-15 12:15:43', NULL),
('a947a373-91bd-4b09-84b1-68e1a8cfae37', 'd6884b3d-bd11-4711-9d94-7fe28dacfb7c', '1617c503-bf3b-4f1f-821f-d5931d56e9a8', NULL, NULL, '2026-05-15 12:15:45', '2026-05-15 12:15:45', NULL),
('ad6536d4-1877-4ed7-a870-792dce331e4a', '7d926535-efcc-40a8-817f-e18abc708514', '5fcf891c-9592-4ff3-816d-d3927a314724', NULL, NULL, '2026-05-15 12:15:36', '2026-05-15 12:15:36', NULL),
('de58dc9b-0d11-4a24-822c-e9e2e78a7e75', '358c258c-1d1d-4b63-af63-0346ff4ff73e', '1617c503-bf3b-4f1f-821f-d5931d56e9a8', NULL, NULL, '2026-05-15 12:15:46', '2026-05-15 12:15:46', NULL),
('df331a35-8058-4cd2-b121-85685db8d7dd', '390c8bb1-bec7-4211-9a96-2abca6e6c1f0', '1617c503-bf3b-4f1f-821f-d5931d56e9a8', NULL, NULL, '2026-05-15 12:15:47', '2026-05-15 12:15:47', NULL),
('e3e23344-eb8e-4e35-9b97-9636d678e7a5', 'ab37a274-f725-49d1-b97b-c2ed7bf1731c', '10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', NULL, NULL, '2026-05-15 12:15:40', '2026-05-15 12:15:40', NULL),
('ec8fdeb0-b854-4c25-9a07-a26098e8a5fb', '2475518a-1099-4bb9-89e1-d3d75c17331e', '10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', NULL, NULL, '2026-05-15 12:15:41', '2026-05-15 12:15:41', NULL),
('f30246d4-d1f8-4f85-9129-8f19ff85640e', 'f7b36c05-4c27-4277-ba57-494ae7c136aa', '10b1d0af-7e31-43da-ad3c-a6a8e0e2c681', NULL, NULL, '2026-05-15 12:15:39', '2026-05-15 12:15:39', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `refresh_token_hash` varchar(255) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `refresh_token_hash`, `device_info`, `ip_address`, `expires_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
('224d779e-a821-4e34-945d-f009f3cab66e', '7aac9f5a-c3f5-4d66-834d-efb55b299a31', '$2b$12$/TiNs3homqRIEBXg0xI7BePWhM5Ootssdk4PRYu.ZUsm8PPtjvUwi', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.113.0 Chrome/142.0.7444.265 Electron/39.8.3 Safari/537.36', '::1', '2026-05-22 13:09:17', '2026-05-15 12:25:34', '2026-05-15 13:09:17', NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `activities_facility_id` (`facility_id`),
  ADD KEY `activities_slug` (`slug`),
  ADD KEY `activities_category` (`category`),
  ADD KEY `activities_status` (`status`);

--
-- Индексы таблицы `activity_instances`
--
ALTER TABLE `activity_instances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_instances_activity_id` (`activity_id`),
  ADD KEY `activity_instances_facility_id` (`facility_id`),
  ADD KEY `activity_instances_start_at` (`start_at`),
  ADD KEY `activity_instances_status` (`status`);

--
-- Индексы таблицы `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `bookings_booking_code` (`booking_code`),
  ADD KEY `bookings_user_id` (`user_id`),
  ADD KEY `bookings_company_id` (`company_id`),
  ADD KEY `bookings_status` (`status`),
  ADD KEY `bookings_journey_id` (`journey_id`),
  ADD KEY `bookings_activity_instance_id` (`activity_instance_id`),
  ADD KEY `bookings_currency_id` (`currency_id`);

--
-- Индексы таблицы `booking_items`
--
ALTER TABLE `booking_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_items_booking_id` (`booking_id`);

--
-- Индексы таблицы `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `companies_owner_id` (`owner_id`),
  ADD KEY `companies_slug` (`slug`),
  ADD KEY `companies_category` (`category`),
  ADD KEY `companies_status` (`status`);

--
-- Индексы таблицы `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `currencies_active` (`active`);

--
-- Индексы таблицы `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `facilities_company_id` (`company_id`),
  ADD KEY `facilities_facility_type_id` (`facility_type_id`),
  ADD KEY `facilities_category` (`category`),
  ADD KEY `facilities_status` (`status`);

--
-- Индексы таблицы `facility_types`
--
ALTER TABLE `facility_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `facility_types_slug` (`slug`),
  ADD KEY `facility_types_category` (`category`),
  ADD KEY `facility_types_active` (`active`);

--
-- Индексы таблицы `journeys`
--
ALTER TABLE `journeys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journeys_timetable_id` (`timetable_id`),
  ADD KEY `journeys_transport_id` (`transport_id`),
  ADD KEY `journeys_route_id` (`route_id`),
  ADD KEY `journeys_journey_date` (`journey_date`),
  ADD KEY `journeys_status` (`status`);

--
-- Индексы таблицы `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_reference` (`transaction_reference`),
  ADD KEY `currency_id` (`currency_id`),
  ADD KEY `payments_booking_id` (`booking_id`),
  ADD KEY `payments_transaction_reference` (`transaction_reference`),
  ADD KEY `payments_status` (`status`);

--
-- Индексы таблицы `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `roles_slug` (`slug`);

--
-- Индексы таблицы `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `routes_company_id` (`company_id`),
  ADD KEY `routes_transport_id` (`transport_id`),
  ADD KEY `routes_origin_station_id` (`origin_station_id`),
  ADD KEY `routes_destination_station_id` (`destination_station_id`),
  ADD KEY `routes_status` (`status`),
  ADD KEY `routes_parent_route_id` (`parent_route_id`);

--
-- Индексы таблицы `route_stations`
--
ALTER TABLE `route_stations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `route_station_unique` (`route_id`,`station_id`),
  ADD KEY `route_stations_route_id` (`route_id`),
  ADD KEY `route_stations_station_id` (`station_id`),
  ADD KEY `route_stations_sequence_order` (`sequence_order`);

--
-- Индексы таблицы `seats`
--
ALTER TABLE `seats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `layout_code_unique` (`seat_layout_id`,`code`),
  ADD KEY `seats_seat_layout_id` (`seat_layout_id`),
  ADD KEY `seats_code` (`code`),
  ADD KEY `seats_seat_type` (`seat_type`),
  ADD KEY `seats_status` (`status`);

--
-- Индексы таблицы `seat_holds`
--
ALTER TABLE `seat_holds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `seat_holds_journey_id` (`journey_id`),
  ADD KEY `seat_holds_seat_code` (`seat_code`),
  ADD KEY `seat_holds_user_id` (`user_id`),
  ADD KEY `seat_holds_status` (`status`),
  ADD KEY `seat_holds_expires_at` (`expires_at`);

--
-- Индексы таблицы `seat_layouts`
--
ALTER TABLE `seat_layouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seat_layouts_layoutable_id` (`layoutable_id`),
  ADD KEY `seat_layouts_layoutable_type` (`layoutable_type`),
  ADD KEY `seat_layouts_layout_type` (`layout_type`),
  ADD KEY `seat_layouts_status` (`status`);

--
-- Индексы таблицы `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `settings_setting_key` (`setting_key`),
  ADD KEY `settings_group_name` (`group_name`);

--
-- Индексы таблицы `stations`
--
ALTER TABLE `stations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `stations_company_id` (`company_id`),
  ADD KEY `stations_city` (`city`),
  ADD KEY `stations_type` (`type`);

--
-- Индексы таблицы `timetables`
--
ALTER TABLE `timetables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timetables_route_id` (`route_id`),
  ADD KEY `timetables_transport_id` (`transport_id`),
  ADD KEY `timetables_facility_id` (`facility_id`),
  ADD KEY `timetables_activity_id` (`activity_id`),
  ADD KEY `timetables_available_seats` (`available_seats`),
  ADD KEY `timetables_frequency_type` (`frequency_type`),
  ADD KEY `timetables_status` (`status`);

--
-- Индексы таблицы `transports`
--
ALTER TABLE `transports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD KEY `transports_company_id` (`company_id`),
  ADD KEY `transports_transport_type_id` (`transport_type_id`),
  ADD KEY `transports_registration_number` (`registration_number`),
  ADD KEY `transports_status` (`status`);

--
-- Индексы таблицы `transport_types`
--
ALTER TABLE `transport_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `transport_types_slug` (`slug`),
  ADD KEY `transport_types_category` (`category`),
  ADD KEY `transport_types_active` (`active`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `preferred_currency_id` (`preferred_currency_id`),
  ADD KEY `users_status` (`status`);

--
-- Индексы таблицы `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_role_id_user_id_unique` (`user_id`,`role_id`),
  ADD UNIQUE KEY `user_roles_user_id_role_id_company_id` (`user_id`,`role_id`,`company_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `user_roles_user_id` (`user_id`),
  ADD KEY `user_roles_company_id` (`company_id`);

--
-- Индексы таблицы `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_sessions_user_id` (`user_id`),
  ADD KEY `user_sessions_expires_at` (`expires_at`);

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `activity_instances`
--
ALTER TABLE `activity_instances`
  ADD CONSTRAINT `activity_instances_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `activity_instances_ibfk_2` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`activity_instance_id`) REFERENCES `activity_instances` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `booking_items`
--
ALTER TABLE `booking_items`
  ADD CONSTRAINT `booking_items_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `facilities`
--
ALTER TABLE `facilities`
  ADD CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `facilities_ibfk_2` FOREIGN KEY (`facility_type_id`) REFERENCES `facility_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `journeys`
--
ALTER TABLE `journeys`
  ADD CONSTRAINT `journeys_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `timetables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `journeys_ibfk_2` FOREIGN KEY (`transport_id`) REFERENCES `transports` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `journeys_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`);

--
-- Ограничения внешнего ключа таблицы `routes`
--
ALTER TABLE `routes`
  ADD CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `routes_ibfk_2` FOREIGN KEY (`transport_id`) REFERENCES `transports` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `routes_ibfk_3` FOREIGN KEY (`origin_station_id`) REFERENCES `stations` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `routes_ibfk_4` FOREIGN KEY (`destination_station_id`) REFERENCES `stations` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `routes_ibfk_5` FOREIGN KEY (`parent_route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `route_stations`
--
ALTER TABLE `route_stations`
  ADD CONSTRAINT `route_stations_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `route_stations_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `seats`
--
ALTER TABLE `seats`
  ADD CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`seat_layout_id`) REFERENCES `seat_layouts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `seat_holds`
--
ALTER TABLE `seat_holds`
  ADD CONSTRAINT `seat_holds_ibfk_1` FOREIGN KEY (`journey_id`) REFERENCES `journeys` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `seat_holds_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `seat_holds_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `stations`
--
ALTER TABLE `stations`
  ADD CONSTRAINT `stations_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `timetables`
--
ALTER TABLE `timetables`
  ADD CONSTRAINT `timetables_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_2` FOREIGN KEY (`transport_id`) REFERENCES `transports` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_ibfk_3` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
  ADD CONSTRAINT `timetables_ibfk_4` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`);

--
-- Ограничения внешнего ключа таблицы `transports`
--
ALTER TABLE `transports`
  ADD CONSTRAINT `transports_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transports_ibfk_2` FOREIGN KEY (`transport_type_id`) REFERENCES `transport_types` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`preferred_currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `user_roles_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
