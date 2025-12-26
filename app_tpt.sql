-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 26, 2025 lúc 10:26 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `app_tpt`
--
CREATE DATABASE IF NOT EXISTS `app_tpt` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `app_tpt`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:4:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:5:\"admin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:7:\"quankho\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:2;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:6:\"dichvu\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:6:\"ketoan\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:4;}}}s:5:\"roles\";a:4:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:5:\"Admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:14:\"Quản lý kho\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:11:\"Bảo hành\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:10:\"Kế toán\";s:1:\"c\";s:3:\"web\";}}}', 1766641258);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) NOT NULL DEFAULT 0,
  `customer_code` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tax_code` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `group_id`, `customer_code`, `customer_name`, `address`, `contact_person`, `phone`, `email`, `tax_code`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 'KH00001', 'Nguyễn Văn An', '123 Lê Lợi, Q.1, TP.HCM', NULL, '0909123456', 'an.nguyen@gmail.com', NULL, 'Khách quen, hay mua iPhone', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 1, 'KH00002', 'Trần Thị Bé', '45 Nguyễn Trãi, Q.5, TP.HCM', NULL, '0918234567', NULL, NULL, 'Mua MacBook trả góp', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(3, 1, 'KH00003', 'Lê Hoàng Cường', '78 Trần Hưng Đạo, Hà Nội', NULL, '0388123456', 'cuong.le@hotmail.com', NULL, 'Yêu cầu bảo hành nhanh', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(4, 1, 'KH00004', 'Phạm Minh Đức', '56 Nguyễn Huệ, Đà Nẵng', NULL, '0935123456', NULL, NULL, 'Thích màu Titan Black', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(5, 1, 'KH00005', 'Vũ Thị Hương', '12 Hàng Bông, Hà Nội', NULL, '0977234567', 'huongvu90@yahoo.com', NULL, 'Mua tặng sinh nhật chồng', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(6, 2, 'VIP001', 'Đỗ Quang Huy (VIP)', 'Penthouse Landmark 81, TP.HCM', NULL, '0913888999', 'huy.dq@vip.com', NULL, 'VIP – Đã mua > 500 triệu', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(7, 2, 'VIP002', 'Nguyễn Ngọc Lan Anh', 'Villa Ecopark, Hà Nội', NULL, '0905111222', 'lananh.ceo@gmail.com', NULL, 'CEO, mua quà đối tác', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(8, 2, 'VIP003', 'Trần Quốc Bảo', 'Khu đô thị Sala, Q.2, TP.HCM', NULL, '0988111333', NULL, NULL, 'Mua 3 MacBook Pro M3 Max cùng lúc', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(9, 3, 'CTY001', 'Công ty CP Công nghệ ABC', 'Tầng 15, Bitexco, Q.1, TP.HCM', NULL, '02873009999', 'purchase@abc.com.vn', '0312345678', 'Mua số lượng lớn laptop văn phòng', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(10, 3, 'CTY002', 'Tập đoàn XYZ', 'Tòa nhà Keangnam, Hà Nội', NULL, '02473008888', 'it@xyzgroup.vn', '0101234567', 'Đối tác chiến lược', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(11, 3, 'CTY003', 'Trường THPT Chuyên Hà Nội - Amsterdam', 'Hoàng Minh Giám, Cầu Giấy, HN', NULL, '0243834567', NULL, NULL, 'Mua iMac cho phòng tin học', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(12, 4, 'SI001', 'Cửa hàng Di Động Minh Phát', 'Chợ Tân Bình, TP.HCM', NULL, '0938123123', 'minhphat.mobile@gmail.com', NULL, 'Đại lý cấp 2 – lấy sỉ iPhone', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(13, 4, 'SI002', 'Shop Laptop Cũ 24h', '123 Phạm Văn Đồng, Hà Nội', NULL, '0975123456', NULL, NULL, 'Chuyên thu cũ đổi mới', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(14, 4, 'SI003', 'Điện thoại Joy – Đà Nẵng', '45 Lê Duẩn, Đà Nẵng', NULL, '0905123456', 'joyphone@gmail.com', NULL, 'Đại lý Samsung chính hãng', '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(15, 2, 'KH99999', 'Nguyễn Thị Kim Ngân', NULL, NULL, '0914111222', NULL, NULL, 'Khách lâu năm, hay mua quà biếu', '2025-12-24 05:39:22', '2025-12-26 04:24:37'),
(16, 3, 'KH88888', 'Trần Văn Tèo (Test)', '123 Đường Test, Q.Test', NULL, '0123456789', 'test@gmail.com', NULL, 'Dùng để test hệ thống', '2025-12-24 05:39:22', '2025-12-26 04:24:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `exports`
--

CREATE TABLE `exports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `export_code` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `date_create` datetime NOT NULL,
  `customer_id` int(11) NOT NULL,
  `contact_person` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `groups`
--

CREATE TABLE `groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_type_id` int(11) NOT NULL,
  `group_code` varchar(255) NOT NULL,
  `group_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `groups`
--

INSERT INTO `groups` (`id`, `group_type_id`, `group_code`, `group_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'G01001', 'Khách hàng VIP', 'Mô tả cho nhóm Khách hàng VIP', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(2, 1, 'G01002', 'Khách hàng thân thiết', 'Mô tả cho nhóm Khách hàng thân thiết', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(3, 1, 'G01003', 'Khách hàng mới', 'Mô tả cho nhóm Khách hàng mới', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(4, 1, 'G01004', 'Khách hàng doanh nghiệp', 'Mô tả cho nhóm Khách hàng doanh nghiệp', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(5, 1, 'G01005', 'Khách hàng cá nhân', 'Mô tả cho nhóm Khách hàng cá nhân', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(6, 2, 'G02006', 'Nhà cung cấp nguyên liệu', 'Mô tả cho nhóm Nhà cung cấp nguyên liệu', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(7, 2, 'G02007', 'Nhà cung cấp thiết bị', 'Mô tả cho nhóm Nhà cung cấp thiết bị', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(8, 2, 'G02008', 'Nhà cung cấp dịch vụ', 'Mô tả cho nhóm Nhà cung cấp dịch vụ', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(9, 2, 'G02009', 'Nhà cung cấp nhập khẩu', 'Mô tả cho nhóm Nhà cung cấp nhập khẩu', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(10, 2, 'G02010', 'Nhà cung cấp địa phương', 'Mô tả cho nhóm Nhà cung cấp địa phương', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(11, 3, 'G03011', 'Điện thoại di động', 'Mô tả cho nhóm Điện thoại di động', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(12, 3, 'G03012', 'Máy tính xách tay', 'Mô tả cho nhóm Máy tính xách tay', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(13, 3, 'G03013', 'Phụ kiện điện tử', 'Mô tả cho nhóm Phụ kiện điện tử', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(14, 3, 'G03014', 'Đồ gia dụng', 'Mô tả cho nhóm Đồ gia dụng', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(15, 3, 'G03015', 'Hàng tiêu dùng', 'Mô tả cho nhóm Hàng tiêu dùng', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(16, 4, 'G04016', 'Bộ phận bán hàng', 'Mô tả cho nhóm Bộ phận bán hàng', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(17, 4, 'G04017', 'Bộ phận kế toán', 'Mô tả cho nhóm Bộ phận kế toán', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(18, 4, 'G04018', 'Bộ phận kho vận', 'Mô tả cho nhóm Bộ phận kho vận', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(19, 4, 'G04019', 'Bộ phận IT', 'Mô tả cho nhóm Bộ phận IT', '2025-12-26 03:00:00', '2025-12-26 03:00:00'),
(20, 4, 'G04020', 'Bộ phận nhân sự', 'Mô tả cho nhóm Bộ phận nhân sự', '2025-12-26 03:00:00', '2025-12-26 03:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_types`
--

CREATE TABLE `group_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `group_types`
--

INSERT INTO `group_types` (`id`, `group_name`, `created_at`, `updated_at`) VALUES
(1, 'Khách hàng', NULL, NULL),
(2, 'Nhà cung cấp', NULL, NULL),
(3, 'Hàng hóa', NULL, NULL),
(4, 'Nhân viên', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `imports`
--

CREATE TABLE `imports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `import_code` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `date_create` datetime NOT NULL,
  `provider_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_person` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `imports`
--

INSERT INTO `imports` (`id`, `import_code`, `user_id`, `phone`, `date_create`, `provider_id`, `address`, `contact_person`, `note`, `created_at`, `updated_at`, `warehouse_id`) VALUES
(1, 'NK20251226001', 2, '0914 994 997', '2025-12-26 00:00:00', 6, '123 Đường ABC, Quận 1, TP.HCM', 'Nguyễn Văn A', 'Nhập lô nguyên liệu điện thoại Samsung mới', '2025-12-26 01:00:00', '2025-12-26 01:00:00', 1),
(2, 'NK20251226002', 8, '0386 068 693', '2025-12-26 00:00:00', 7, '456 Đường Lê Lợi, Hà Nội', 'Trần Thị B', 'Nhập thiết bị máy tính Dell và phụ kiện', '2025-12-26 02:30:00', '2025-12-26 02:30:00', 1),
(3, 'NK20251225003', 2, '0914 994 997', '2025-12-25 00:00:00', 8, '789 Đường Nguyễn Huệ, Đà Nẵng', 'Lê Văn C', 'Nhập dịch vụ bảo hành từ đối tác', '2025-12-25 07:00:00', '2025-12-25 07:00:00', 2),
(4, 'NK20251224004', 8, '0386 068 693', '2025-12-24 00:00:00', 9, '101 Đường Phạm Văn Đồng, TP.HCM', 'Phạm Thị D', 'Nhập hàng nhập khẩu iPhone từ Apple phân phối', '2025-12-24 03:15:00', '2025-12-24 03:15:00', 1),
(5, 'NK20251223005', 2, '0914 994 997', '2025-12-23 00:00:00', 10, '202 Đường Trần Phú, Nha Trang', 'Hoàng Văn E', 'Nhập lô phụ kiện địa phương (sạc, tai nghe)', '2025-12-23 04:45:00', '2025-12-23 04:45:00', 2),
(6, 'PN001', 1, '', '2025-12-20 00:00:00', 1, '', '', 'Nhập đợt 1', '2025-12-26 08:25:33', '2025-12-26 08:25:33', 1),
(7, 'PN002', 1, '', '2025-12-21 00:00:00', 2, '', '', 'Nhập đợt 2', '2025-12-26 08:25:33', '2025-12-26 08:25:33', 1),
(8, 'PN4229', 1, NULL, '2025-12-26 00:00:00', 10, NULL, NULL, NULL, '2025-12-26 08:26:40', '2025-12-26 08:26:40', 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_history`
--

CREATE TABLE `inventory_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `inventory_lookup_id` int(11) NOT NULL,
  `import_date` datetime NOT NULL,
  `storage_duration` int(11) NOT NULL,
  `warranty_date` datetime DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_lookup`
--

CREATE TABLE `inventory_lookup` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `sn_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `import_date` datetime NOT NULL,
  `storage_duration` int(11) NOT NULL COMMENT 'Thời gian tồn',
  `status` int(11) NOT NULL,
  `warranty_date` datetime DEFAULT NULL COMMENT 'Ngày bảo hành',
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `remaining_quantity` int(11) NOT NULL DEFAULT 0,
  `import_id` int(11) NOT NULL DEFAULT 0,
  `warehouse_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory_lookup`
--

INSERT INTO `inventory_lookup` (`id`, `product_id`, `sn_id`, `provider_id`, `import_date`, `storage_duration`, `status`, `warranty_date`, `note`, `created_at`, `updated_at`, `remaining_quantity`, `import_id`, `warehouse_id`) VALUES
(1, 1, 1001, 1, '2024-07-10 14:30:00', -533, 1, '2026-07-10 23:59:59', 'Nhập lô tháng 7 từ FPT', '2025-12-24 05:39:22', '2025-12-24 05:39:22', 5, 501, 1),
(2, 3, 2001, 2, '2024-10-05 09:15:00', 0, 2, '2025-10-05 23:59:59', 'Bán cho chị Lan - HĐ: HD241005', '2025-12-24 05:39:22', '2025-12-24 05:39:22', 0, 502, 1),
(3, 4, 3001, 1, '2024-06-01 11:00:00', -572, 1, '2026-06-01 23:59:59', 'TỒN LÂU - Cần giảm giá bán', '2025-12-24 05:39:22', '2025-12-24 05:39:22', 1, 503, 2),
(4, 2, 4001, 3, '2024-09-20 16:45:00', 0, 3, '2026-09-20 23:59:59', 'Khách gửi sửa mainboard', '2025-12-24 05:39:22', '2025-12-24 05:39:22', 0, 504, 1),
(5, 5, 5001, 2, '2023-11-15 08:00:00', -771, 4, '2024-11-15 00:00:00', 'Lỗi panel, đang chờ trả hãng', '2025-12-24 05:39:22', '2025-12-24 05:39:22', 0, 505, 1),
(6, 1, 0, 1, '2025-12-20 00:00:00', 0, 1, NULL, 'Import Excel', '2025-12-26 08:25:33', '2025-12-26 08:25:33', 10, 6, 1),
(7, 3, 0, 1, '2025-12-20 00:00:00', 0, 1, NULL, 'Import Excel', '2025-12-26 08:25:33', '2025-12-26 08:25:33', 5, 6, 3),
(8, 5, 0, 2, '2025-12-21 00:00:00', 0, 1, NULL, 'Import Excel', '2025-12-26 08:25:33', '2025-12-26 08:25:33', 20, 7, 1),
(9, 7, 0, 10, '2025-12-26 00:00:00', 0, 1, NULL, NULL, '2025-12-26 08:26:40', '2025-12-26 08:26:40', 1, 8, 3),
(10, 6, 0, 10, '2025-12-26 00:00:00', 0, 1, NULL, NULL, '2025-12-26 08:26:40', '2025-12-26 08:26:40', 1, 8, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_12_04_094655_create_groups_table', 1),
(5, '2024_12_04_095638_create_group_types_table', 1),
(6, '2024_12_04_095815_create_warehouses_table', 1),
(7, '2024_12_04_100132_create_customers_table', 1),
(8, '2024_12_04_100402_create_providers_table', 1),
(9, '2024_12_04_100604_create_products_table', 1),
(10, '2024_12_05_083544_create_permission_tables', 1),
(11, '2024_12_06_020520_create_imports_table', 1),
(12, '2024_12_06_021321_create_product_import_table', 1),
(13, '2024_12_06_032927_create_receiving_table', 1),
(14, '2024_12_08_045422_create_serial_numbers_table', 1),
(15, '2024_12_09_092026_create_exports_table', 1),
(16, '2024_12_10_041306_create_inventory_lookup_table', 1),
(17, '2024_12_12_034124_create_product_export_table', 1),
(18, '2024_12_12_041030_create_received_products_table', 1),
(19, '2024_12_13_082530_create_quotations_table', 1),
(20, '2024_12_16_024132_create_quotation_services_table', 1),
(21, '2024_12_17_025223_create_inventory_history_table', 1),
(22, '2024_12_17_082842_create_return_form_table', 1),
(23, '2024_12_18_015840_create_notification_table', 1),
(24, '2024_12_18_022223_create_product_returns_table', 1),
(25, '2024_12_19_032529_add_two_factor_columns_to_users_table', 1),
(26, '2024_12_19_035038_create_warranty_lookup_table', 1),
(27, '2024_12_19_040837_create_warranty_history_table', 1),
(28, '2025_01_08_125517_create_notifications_table', 1),
(29, '2025_01_20_041344_update_imports_and_inventory_lookup_tables', 1),
(30, '2025_01_22_101110_update_struct_status_warranty_lookup', 1),
(31, '2025_01_22_163623_add_name_status_warranty_lookup', 1),
(32, '2025_02_05_074628_create_warranty_received_table', 1),
(33, '2025_02_17_153317_create_warehouse_transfers_table', 1),
(34, '2025_02_17_154218_create_warehouse_transfer_items_table', 1),
(35, '2025_02_25_162933_create_product_warranties_table', 1),
(36, '2025_03_03_171952_update_product_export_table', 1),
(37, '2025_03_04_094951_create_quotation_form_table', 1),
(38, '2025_04_15_092959_update_col_inventory_lookup', 1),
(39, '2025_05_06_084248_update_sn_table', 1),
(40, '2025_12_10_092644_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(1, 'App\\Models\\User', 2),
(1, 'App\\Models\\User', 3),
(1, 'App\\Models\\User', 4),
(1, 'App\\Models\\User', 5),
(2, 'App\\Models\\User', 7),
(2, 'App\\Models\\User', 8),
(3, 'App\\Models\\User', 9),
(3, 'App\\Models\\User', 10),
(4, 'App\\Models\\User', 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification`
--

CREATE TABLE `notification` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` int(11) NOT NULL COMMENT '1 tồn kho, 2 tiếp nhận',
  `type_id` int(11) NOT NULL COMMENT 'Id của phiếu',
  `status` int(11) NOT NULL COMMENT '1 chưa đọc, 2 đã đọc',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2025-12-24 05:39:19', '2025-12-24 05:39:19'),
(2, 'quankho', 'web', '2025-12-24 05:39:20', '2025-12-24 05:39:20'),
(3, 'dichvu', 'web', '2025-12-24 05:39:20', '2025-12-24 05:39:20'),
(4, 'ketoan', 'web', '2025-12-24 05:39:20', '2025-12-24 05:39:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) NOT NULL DEFAULT 0,
  `product_code` varchar(255) NOT NULL,
  `product_name` text DEFAULT NULL,
  `brand` text DEFAULT NULL,
  `warranty` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `group_id`, `product_code`, `product_name`, `brand`, `warranty`, `created_at`, `updated_at`) VALUES
(1, 12, 'LAP001', 'Laptop Dell Inspiron 15 3511', 'Dell', 24, NULL, '2025-12-26 05:12:08'),
(2, 12, 'LAP002', 'MacBook Air M2 2022', 'Apple', 12, NULL, '2025-12-26 05:12:06'),
(3, 11, 'PHN001', 'iPhone 15 Pro Max', 'Apple', 12, NULL, '2025-12-26 05:12:03'),
(4, 13, 'PHN002', 'Samsung Galaxy S24 Ultra', 'Samsung', 12, NULL, '2025-12-26 05:11:57'),
(5, 13, 'TV001', 'Smart TV Sony 55 inch 4K', 'Sony', 36, NULL, '2025-12-26 05:11:54'),
(6, 11, 'IPHONE15', 'iPhone 15 Pro Max', NULL, 0, '2025-12-24 05:39:22', '2025-12-26 05:11:49'),
(7, 11, 'SAMSUNG_S24', 'Samsung Galaxy S24', NULL, 24, '2025-12-24 05:39:22', '2025-12-26 05:43:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_export`
--

CREATE TABLE `product_export` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `export_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `sn_id` int(11) NOT NULL,
  `warranty` text NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_import`
--

CREATE TABLE `product_import` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `import_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `sn_id` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_import`
--

INSERT INTO `product_import` (`id`, `import_id`, `product_id`, `quantity`, `sn_id`, `note`, `created_at`, `updated_at`) VALUES
(1, 6, 1, 10, 0, NULL, '2025-12-26 08:25:33', '2025-12-26 08:25:33'),
(2, 6, 3, 5, 0, NULL, '2025-12-26 08:25:33', '2025-12-26 08:25:33'),
(3, 7, 5, 20, 0, NULL, '2025-12-26 08:25:33', '2025-12-26 08:25:33'),
(4, 8, 7, 1, 0, NULL, '2025-12-26 08:26:40', '2025-12-26 08:26:40'),
(5, 8, 6, 1, 0, NULL, '2025-12-26 08:26:40', '2025-12-26 08:26:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_returns`
--

CREATE TABLE `product_returns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID phiếu trả hàng',
  `product_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID hàng hóa',
  `quantity` int(11) NOT NULL COMMENT 'Số lượng',
  `serial_number_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID số serial',
  `replacement_code` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID SP đổi',
  `replacement_serial_number_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID số serial hàng đổi',
  `extra_warranty` int(11) DEFAULT NULL COMMENT 'Bảo hành thêm (tháng)',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_returns`
--

INSERT INTO `product_returns` (`id`, `return_form_id`, `product_id`, `quantity`, `serial_number_id`, `replacement_code`, `replacement_serial_number_id`, `extra_warranty`, `notes`, `created_at`, `updated_at`) VALUES
(1, 90001, 1, 1, 1001, NULL, NULL, NULL, 'Lỗi màn hình nhấp nháy, đã hoàn tiền', NULL, NULL),
(2, 90002, 3, 1, 2001, 0, 3001, 6, 'Khách đổi sang Samsung, tặng thêm 6 tháng bảo hành', NULL, NULL),
(3, 90003, 2, 1, 1002, NULL, NULL, NULL, 'Sửa mainboard trong bảo hành', NULL, NULL),
(4, 90004, 4, 1, 3002, NULL, NULL, 12, 'Mua thêm gói bảo hành mở rộng 1 năm', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_warranties`
--

CREATE TABLE `product_warranties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `info` varchar(255) DEFAULT NULL,
  `warranty` int(11) NOT NULL DEFAULT 12,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_warranties`
--

INSERT INTO `product_warranties` (`id`, `product_id`, `info`, `warranty`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bought at FPT Shop - Invoice 001234', 24, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 1, 'Bought online - Shopee order 240615001', 24, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(3, 3, 'Apple Care+ included', 24, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(4, 4, 'Samsung Care+ 2 years', 24, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(5, 5, 'Warranty extended to 48 months', 48, '2025-12-24 05:39:22', '2025-12-24 05:39:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `providers`
--

CREATE TABLE `providers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) NOT NULL DEFAULT 0,
  `provider_code` varchar(255) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tax_code` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `providers`
--

INSERT INTO `providers` (`id`, `group_id`, `provider_code`, `provider_name`, `address`, `contact_person`, `phone`, `email`, `tax_code`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 'NCC001', 'Công ty TNHH FPT Shop', '260 Nguyễn Văn Linh, Q.7, TP.HCM', NULL, '19006600', 'cskh@fptshop.com.vn', NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 1, 'NCC002', 'Thế Giới Di Động', '222 Lê Duẩn, Q.1, TP.HCM', NULL, '18001060', 'cskh@thegioididong.com', NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(3, 1, 'NCC003', 'CellphoneS', '117 Lý Nam Đế, Hà Nội', NULL, '18002097', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(4, 2, 'NCC004', 'Apple Việt Nam (Synnex FPT)', 'Tầng 15, Tòa nhà Viettel, Hà Nội', NULL, '18001123', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(5, 2, 'NCC005', 'Samsung Electronics VN', 'Lô CN6, KCN Yên Phong, Bắc Ninh', NULL, '1800588889', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(6, 3, 'NCC006', 'Công ty Sony Việt Nam', 'Tầng 12, Tòa nhà Keangnam, HN', NULL, '1800588851', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(7, 1, 'NCC007', 'Hoàng Hà Mobile', '260 Cầu Giấy, Hà Nội', NULL, '19002098', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(8, 7, 'NCC008', 'Di Động Việt', '192 Trần Phú, Q.5, TP.HCM', NULL, '180011122', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-26 04:51:43'),
(9, 9, 'NCC009', 'Viettel Store', 'Tầng 1, Tòa nhà Viettel, HN', NULL, '18008098', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-26 04:50:17'),
(10, 10, 'NCC010', 'Phong Vũ Computer', '264 Nguyễn Thị Minh Khai, Q.3', NULL, '18006866', NULL, NULL, NULL, '2025-12-24 05:39:22', '2025-12-26 04:54:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotations`
--

CREATE TABLE `quotations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reception_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID phiếu tiếp nhận',
  `quotation_code` varchar(255) NOT NULL COMMENT 'Mã phiếu',
  `customer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID khách hàng',
  `address` varchar(255) DEFAULT NULL COMMENT 'Địa chỉ khách hàng',
  `quotation_date` date NOT NULL COMMENT 'Ngày lập phiếu',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Người liên hệ',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Người lập phiếu',
  `contact_phone` varchar(255) DEFAULT NULL COMMENT 'Số điện thoại liên hệ',
  `total_amount` decimal(20,2) NOT NULL COMMENT 'Tổng tiền',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quotations`
--

INSERT INTO `quotations` (`id`, `reception_id`, `quotation_code`, `customer_id`, `address`, `quotation_date`, `contact_person`, `notes`, `user_id`, `contact_phone`, `total_amount`, `created_at`, `updated_at`) VALUES
(1, 1, 'QT-LSWCVE0L', 4, '60849 Bradtke Oval\nCarloborough, CO 83377-7530', '1994-05-08', 'Dr. Christina McGlynn', 'Quas magni et corporis iusto placeat inventore.', 9, '+1-947-502-0847', 20247859.68, '2025-12-24 05:39:23', '2025-12-24 05:39:23'),
(2, 2, 'QT-BYUAD85C', 6, '863 Zemlak Road\nLake Brenden, DE 87874-7161', '1986-10-29', 'Annabelle Lueilwitz V', 'Magni ut quasi in esse aut ut cupiditate blanditiis.', 5, '+1-682-549-6313', 13463077.50, '2025-12-24 05:39:23', '2025-12-24 05:39:23'),
(3, 2, 'QT-KHD9FEW5', 2, '5183 Dibbert Well\nEmardhaven, GA 66520', '2017-07-22', 'Dr. Noble O\'Kon', 'Exercitationem aliquam placeat explicabo asperiores sunt velit quia corporis cupiditate dolorem saepe.', 4, '1-334-338-1172', 16689033.55, '2025-12-24 05:39:23', '2025-12-24 05:39:23'),
(4, 2, 'QT-PEMG1SNY', 13, '9378 Jayden Courts\nBirdiestad, SC 37683', '1996-09-06', 'Ines Carroll', 'Perspiciatis est odit maxime vero sed quia sed soluta rerum tempora.', 1, '337.623.2823', 5705595.40, '2025-12-24 05:39:23', '2025-12-24 05:39:23'),
(5, 1, 'QT-AKNLOXI1', 5, '606 Paucek Passage\nNew Kaceyburgh, UT 23257', '2011-05-15', 'Zack Streich V', 'Quibusdam qui nihil qui cupiditate possimus adipisci non et ex dolorem alias.', 1, '+1-732-531-7272', 13336916.84, '2025-12-24 05:39:23', '2025-12-24 05:39:23');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotation_form`
--

CREATE TABLE `quotation_form` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `content` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quotation_services`
--

CREATE TABLE `quotation_services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quotation_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID quotations',
  `service_name` varchar(255) NOT NULL COMMENT 'Tên',
  `unit` varchar(255) DEFAULT NULL COMMENT 'Đơn vị tính',
  `brand` varchar(255) DEFAULT NULL COMMENT 'Hãng',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng',
  `unit_price` decimal(20,2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Thuế(%)',
  `total` decimal(20,2) NOT NULL COMMENT 'Thành tiền (bao gồm thuế)',
  `note` text DEFAULT NULL COMMENT 'Ghi chú',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `received_products`
--

CREATE TABLE `received_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reception_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID phiếu tiếp nhận',
  `product_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID hàng hóa',
  `quantity` int(11) NOT NULL COMMENT 'Số lượng',
  `serial_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Serial Id',
  `status` text DEFAULT NULL COMMENT 'Tình trạng tiếp nhận',
  `note` text DEFAULT NULL COMMENT 'Ghi chú',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `received_products`
--

INSERT INTO `received_products` (`id`, `reception_id`, `product_id`, `quantity`, `serial_id`, `status`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 1, 17, '1', NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 2, 7, 1, 18, '1', NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `receiving`
--

CREATE TABLE `receiving` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Hãng tiếp nhận',
  `form_type` int(10) UNSIGNED NOT NULL COMMENT 'Loại phiếu',
  `form_code_receiving` varchar(255) NOT NULL COMMENT 'Mã phiếu',
  `customer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Khách hàng',
  `address` text DEFAULT NULL COMMENT 'Địa chỉ',
  `date_created` datetime NOT NULL COMMENT 'Ngày lập phiếu',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Người liên hệ',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Người lập phiếu',
  `phone` varchar(255) DEFAULT NULL COMMENT 'Số điện thoại',
  `closed_at` datetime DEFAULT NULL COMMENT 'Ngày đóng phiếu',
  `status` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Tình trạng, 1:Tiếp nhận,2:Xử lí,3:Hoàn thành,4:Khách không đồng ý',
  `state` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Trạng thái, 0: Trống,1: Chưa xử lý vàng, 2: Quá hạn nền đỏ',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `receiving`
--

INSERT INTO `receiving` (`id`, `branch_id`, `form_type`, `form_code_receiving`, `customer_id`, `address`, `date_created`, `contact_person`, `notes`, `user_id`, `phone`, `closed_at`, `status`, `state`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'PN000001', 1, '123 Đường Test, Hà Nội', '2025-12-24 12:39:22', 'Nguyễn Văn Test', 'Máy bị vỡ màn hình', 7, '0901234567', NULL, 1, 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 1, 2, 'PN000002', 1, '456 Đường Demo, TP.HCM', '2025-12-22 12:39:22', 'Trần Thị Demo', 'Máy không lên nguồn, khách cần gấp', 7, '0987654321', '2025-12-24 12:39:22', 2, 1, '2025-12-22 05:39:22', '2025-12-24 05:39:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `return_form`
--

CREATE TABLE `return_form` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reception_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Id tiếp nhận',
  `return_code` varchar(255) NOT NULL COMMENT 'Mã phiếu',
  `customer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID khách hàng',
  `address` varchar(255) DEFAULT NULL COMMENT 'Địa chỉ',
  `date_created` date NOT NULL COMMENT 'Ngày lập phiếu',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'Người liên h',
  `return_method` varchar(255) NOT NULL COMMENT 'Phương thức trả hàng',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Người lập phiếu',
  `phone_number` varchar(255) DEFAULT NULL COMMENT 'Số điện thoại',
  `notes` text DEFAULT NULL COMMENT 'Ghi',
  `status` varchar(255) NOT NULL DEFAULT '1' COMMENT '1: Hoàn thành, 2 Khách không đồng ý',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'web', '2025-12-24 05:39:19', '2025-12-24 05:39:19'),
(2, 'Quản lý kho', 'web', '2025-12-24 05:39:19', '2025-12-24 05:39:19'),
(3, 'Bảo hành', 'web', '2025-12-24 05:39:19', '2025-12-24 05:39:19'),
(4, 'Kế toán', 'web', '2025-12-24 05:39:19', '2025-12-24 05:39:19'),
(5, 'Nhân viên bán hàng', 'web', '2025-12-26 03:37:18', '2025-12-26 03:37:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `serial_numbers`
--

CREATE TABLE `serial_numbers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `serial_code` varchar(100) NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1: Nhập hàng, 2: Xuất hàng, 3: Tiếp nhận, 4: Trả hàng, 5: Đang mượn',
  `note` varchar(255) DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `serial_numbers`
--

INSERT INTO `serial_numbers` (`id`, `serial_code`, `product_id`, `status`, `note`, `warehouse_id`, `created_at`, `updated_at`) VALUES
(1, 'DELL3511-001A', 1, 1, 'Nhập kho Hà Nội 15/07/2024', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(2, 'DELL3511-002B', 1, 2, 'Đã xuất bán - HD2408012', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(3, 'DELL3511-003C', 1, 3, 'Khách gửi bảo hành lỗi màn hình', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(4, 'DELL3511-004D', 1, 5, 'Đang cho mượn trưng bày cửa hàng TP.HCM', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(5, 'MACM2-2024-01', 2, 1, 'Tồn kho TP.HCM', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(6, 'MACM2-2024-02', 2, 2, 'Bán ngày 01/11/2024', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(7, 'IPH15PM256-001', 3, 1, 'Màu Titan Black', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(8, 'IPH15PM256-002', 3, 1, 'Màu Titan Blue', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(9, 'IPH15PM256-003', 3, 4, 'Khách trả hàng do đổi màu', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(10, 'IPH15PM1TB-001', 3, 2, 'Bán VIP - HĐ2411005', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(11, 'S24U512GB-GRAY01', 4, 1, 'Tồn lâu >120 ngày', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(12, 'S24U512GB-BLACK02', 4, 3, 'Đang sửa camera tại TTBH Samsung', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(13, 'SONY55X90L-001', 5, 1, 'Nhập kho trưng bày', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(14, 'SONY55X90L-002', 5, 2, 'Bán kèm giá treo tường', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(15, 'DELL-OLD-2023-01', 1, 1, 'Tồn từ 2023 - cần thanh lý', 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(16, 'IPH14PM-OLD001', 3, 1, 'iPhone 14 Pro Max cũ, tồn kho', 2, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(17, 'SN111111', 6, 1, NULL, 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(18, 'SN222222', 7, 1, NULL, 1, '2025-12-24 05:39:22', '2025-12-24 05:39:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('voFRFOip4JDJ5pmprFj2iQp5KVXJ38jxV4yl175L', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVU1QdG1FSFZTWFhEck9XYWtNaXYwdlNadm1Zb0tOakE0QUtadWpOQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9yZXBvcnRPdmVydmlldyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1766558398);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `group_id` int(11) NOT NULL DEFAULT 0,
  `employee_code` varchar(255) DEFAULT NULL,
  `role` int(11) NOT NULL DEFAULT 0,
  `address` text DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `group_id`, `employee_code`, `role`, `address`, `phone`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Văn Thiên', 'thiennv@thienphattien.com', NULL, '$2y$12$FD7o1EIBhYI1nFOG1p4oxueBwQNi1kyzAcVKWnWmLoMm.fTEtXRpu', NULL, NULL, NULL, 19, '--', 4, '--', '0908 779 167', 0, NULL, '2025-12-24 05:39:20', '2025-12-26 03:53:31'),
(2, 'Nguyễn Đình Thành', 'thanhnd@thienphattien.com', NULL, '$2y$12$sK1LG.sOVFptuIz7Y.P03OESsLnRGaljRC39TFrW9rIeNnWTOM25C', NULL, NULL, NULL, 18, NULL, 2, NULL, '0914 994 997', 0, NULL, '2025-12-24 05:39:20', '2025-12-24 05:39:20'),
(3, 'Đoàn Thanh Trang', 'trangdt@thienphattien.com', NULL, '$2y$12$jw5vkuyd32BdrB95OsQ1l.F7Q183RDb2f5GcX.aNIhct69i92TAFm', NULL, NULL, NULL, 19, NULL, 3, NULL, '0911 788 488', 0, NULL, '2025-12-24 05:39:21', '2025-12-24 05:39:21'),
(4, 'Đoàn Thanh Giang', 'giangdt@thienphattien.com', NULL, '$2y$12$C.q29VHjOAvpNwvaSLy6WODN6XzKAUM0BvFV.xawBsOymUvPElSmy', NULL, NULL, NULL, 20, NULL, 5, NULL, '0915 779 167', 0, NULL, '2025-12-24 05:39:21', '2025-12-24 05:39:21'),
(5, 'Trần Lê Thục Uyên', 'thucuyen.tran@thienphattien.com', NULL, '$2y$12$YyFUGhvw5.YRUcaJiIJo8epf9Evverf9Cp6Tbt7QyCutqOm0pcB6q', NULL, NULL, NULL, 20, NULL, 5, NULL, '0906 146 426', 0, NULL, '2025-12-24 05:39:21', '2025-12-24 05:39:21'),
(6, 'Nguyễn Thị Xuân Hậu', 'hauntx@thienphattien.com', NULL, '$2y$12$NpuEUmsKLFv3OOVe4xtaIeDzdcaMA4B8C624PFnAEKiQKOipVbX6y', NULL, NULL, NULL, 20, NULL, 5, NULL, '0345 051 482', 0, NULL, '2025-12-24 05:39:21', '2025-12-24 05:39:21'),
(7, 'Thạch Hoài Bảo', 'bao.thach@thienphattien.com', NULL, '$2y$12$NXnJTKZ.QUpgaqgGQXieZ.bEwYOdqUW7Ov/Hso6BSVCePtM2LVD96', NULL, NULL, NULL, 20, NULL, 5, NULL, '0387 823 982', 0, NULL, '2025-12-24 05:39:21', '2025-12-24 05:39:21'),
(8, 'Phạm Lê Quốc Khởi', 'khoi.pham@thienphattien.com', NULL, '$2y$12$obRG4G54XA/6uqFY5P7a9eq40iKFcWeJTNKHIw5bCITZ25ZCUAq.C', NULL, NULL, NULL, 18, 'NV0010', 2, '--', '0386 068 693', 0, NULL, '2025-12-24 05:39:22', '2025-12-26 03:09:24'),
(9, 'Huỳnh Lê Thiên Phúc', 'phuc.huynh@thienphattien.com', NULL, '$2y$12$mN9s/8jMw86gXBtkftdjb.75aOCA0lPovpKemRwSTb5D9xxLibJJC', NULL, NULL, NULL, 20, NULL, 5, NULL, '0983 468 473', 0, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22'),
(10, 'Phan Thành Nhân', 'nhanpt@thienphattien.com', NULL, '$2y$12$G8iupJ5zcFAwE6aMiedqKeJ9xwP8XnzdDNF.d7uZ2rSicT.dyE.3a', NULL, NULL, NULL, 20, NULL, 5, NULL, '0867 551 488', 0, NULL, '2025-12-24 05:39:22', '2025-12-24 05:39:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warehouses`
--

CREATE TABLE `warehouses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `warehouse_code` varchar(255) NOT NULL,
  `warehouse_name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `warehouses`
--

INSERT INTO `warehouses` (`id`, `type`, `warehouse_code`, `warehouse_name`, `address`, `created_at`, `updated_at`) VALUES
(1, 1, 'KHM', 'Kho Hàng Mới', NULL, NULL, NULL),
(2, 2, 'KBH', 'Kho Bảo Hành', NULL, NULL, NULL),
(3, 1, 'KH003', 'Kho Chinh', 'Võ Văn Ngân, P.Linh Chiểu, Thành Phố Thủ Đức', '2025-12-26 07:04:08', '2025-12-26 07:04:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warehouse_transfers`
--

CREATE TABLE `warehouse_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `from_warehouse_id` int(11) NOT NULL,
  `to_warehouse_id` int(11) NOT NULL,
  `transfer_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1: Hoàn thành, 0: Hủy',
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warehouse_transfer_items`
--

CREATE TABLE `warehouse_transfer_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transfer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `serial_number_id` int(11) NOT NULL,
  `sn_id_borrow` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranty_history`
--

CREATE TABLE `warranty_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `warranty_lookup_id` int(11) DEFAULT NULL COMMENT 'id tra cứu bảo hành',
  `receiving_id` int(11) DEFAULT NULL COMMENT 'id phiếu tiếp nhận',
  `return_id` int(11) DEFAULT NULL COMMENT 'id phiếu trả hàng',
  `product_return_id` int(11) DEFAULT NULL COMMENT 'id sản phẩm trả',
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranty_lookup`
--

CREATE TABLE `warranty_lookup` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `sn_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `name_warranty` varchar(255) DEFAULT NULL,
  `name_status` varchar(255) DEFAULT NULL,
  `export_return_date` datetime DEFAULT NULL,
  `warranty` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `name_expire_date` varchar(255) DEFAULT NULL COMMENT 'Thông tin bảo hành thêm',
  `warranty_expire_date` datetime DEFAULT NULL COMMENT 'Ngày hết hạn bảo hành',
  `warranty_extra` int(11) DEFAULT NULL,
  `return_date` datetime DEFAULT NULL COMMENT 'Ngày trả hàng',
  `service_warranty_expired` datetime DEFAULT NULL COMMENT 'Ngày hết hạn bảo hành dịch vụ',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `export_id` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `warranty_lookup`
--

INSERT INTO `warranty_lookup` (`id`, `product_id`, `sn_id`, `customer_id`, `name_warranty`, `name_status`, `export_return_date`, `warranty`, `status`, `name_expire_date`, `warranty_expire_date`, `warranty_extra`, `return_date`, `service_warranty_expired`, `created_at`, `updated_at`, `export_id`) VALUES
(1, 1, 1, 1, 'Bảo hành chính hãng Dell', NULL, '2024-07-15 10:30:00', 24, '0', 'Bảo hành chính hãng', '2026-07-15 23:59:59', NULL, NULL, NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(2, 1, 1, 1, 'Gia hạn bảo hành thêm', NULL, '2026-06-01 14:20:00', 12, '0', 'Gia hạn thêm 12 tháng', '2027-07-15 23:59:59', 12, NULL, NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(3, 1, 1, 1, 'Sửa màn hình – Dịch vụ', NULL, '2025-11-10 09:15:00', NULL, '1', NULL, NULL, NULL, '2025-11-15 16:30:00', NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(4, 3, 2, 6, 'AppleCare+', NULL, '2024-10-10 09:00:00', 36, '0', 'Bảo hành AppleCare+', '2027-10-10 23:59:59', NULL, NULL, NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(5, 3, 2, 6, 'Đổi máy mới do lỗi camera', NULL, '2025-02-20 11:30:00', 36, '2', 'Bảo hành máy đổi mới', '2028-02-20 23:59:59', NULL, NULL, NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(6, 4, 3, 4, 'Sửa mainboard – Có phí', NULL, '2025-03-15 14:00:00', NULL, '1', NULL, NULL, NULL, '2025-03-20 17:00:00', NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0),
(7, 2, 4, 2, 'Bảo hành Apple 12 tháng', NULL, '2024-09-20 15:00:00', 12, '0', 'Bảo hành chính hãng', '2025-09-20 23:59:59', NULL, NULL, NULL, '2025-12-24 05:39:23', '2025-12-24 05:39:23', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warranty_received`
--

CREATE TABLE `warranty_received` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_received_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_return_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name_warranty` varchar(255) NOT NULL,
  `state_recei` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `exports`
--
ALTER TABLE `exports`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Chỉ mục cho bảng `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `group_types`
--
ALTER TABLE `group_types`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `imports`
--
ALTER TABLE `imports`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `inventory_history`
--
ALTER TABLE `inventory_history`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `inventory_lookup`
--
ALTER TABLE `inventory_lookup`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Chỉ mục cho bảng `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Chỉ mục cho bảng `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Chỉ mục cho bảng `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Chỉ mục cho bảng `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_export`
--
ALTER TABLE `product_export`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_import`
--
ALTER TABLE `product_import`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_returns`
--
ALTER TABLE `product_returns`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_warranties`
--
ALTER TABLE `product_warranties`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotations_quotation_code_unique` (`quotation_code`);

--
-- Chỉ mục cho bảng `quotation_form`
--
ALTER TABLE `quotation_form`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `quotation_services`
--
ALTER TABLE `quotation_services`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `received_products`
--
ALTER TABLE `received_products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `receiving`
--
ALTER TABLE `receiving`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `return_form`
--
ALTER TABLE `return_form`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `return_form_return_code_unique` (`return_code`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Chỉ mục cho bảng `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Chỉ mục cho bảng `serial_numbers`
--
ALTER TABLE `serial_numbers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Chỉ mục cho bảng `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `warehouse_transfers`
--
ALTER TABLE `warehouse_transfers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `warehouse_transfer_items`
--
ALTER TABLE `warehouse_transfer_items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `warranty_history`
--
ALTER TABLE `warranty_history`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `warranty_lookup`
--
ALTER TABLE `warranty_lookup`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `warranty_received`
--
ALTER TABLE `warranty_received`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `exports`
--
ALTER TABLE `exports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `groups`
--
ALTER TABLE `groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `group_types`
--
ALTER TABLE `group_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `imports`
--
ALTER TABLE `imports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `inventory_history`
--
ALTER TABLE `inventory_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventory_lookup`
--
ALTER TABLE `inventory_lookup`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT cho bảng `notification`
--
ALTER TABLE `notification`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `product_export`
--
ALTER TABLE `product_export`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `product_import`
--
ALTER TABLE `product_import`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `product_returns`
--
ALTER TABLE `product_returns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `product_warranties`
--
ALTER TABLE `product_warranties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `providers`
--
ALTER TABLE `providers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `quotation_form`
--
ALTER TABLE `quotation_form`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quotation_services`
--
ALTER TABLE `quotation_services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `received_products`
--
ALTER TABLE `received_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `receiving`
--
ALTER TABLE `receiving`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `return_form`
--
ALTER TABLE `return_form`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `serial_numbers`
--
ALTER TABLE `serial_numbers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `warehouse_transfers`
--
ALTER TABLE `warehouse_transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `warehouse_transfer_items`
--
ALTER TABLE `warehouse_transfer_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `warranty_history`
--
ALTER TABLE `warranty_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `warranty_lookup`
--
ALTER TABLE `warranty_lookup`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `warranty_received`
--
ALTER TABLE `warranty_received`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
