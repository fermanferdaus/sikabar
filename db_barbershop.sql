-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 06, 2025 at 07:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_barbershop`
--

-- --------------------------------------------------------

--
-- Table structure for table `bonus`
--

CREATE TABLE `bonus` (
  `id_bonus` int(11) NOT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `judul_bonus` varchar(100) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `tanggal_diberikan` date NOT NULL,
  `periode` char(7) NOT NULL,
  `status` enum('belum_diberikan','sudah_diberikan') DEFAULT 'belum_diberikan',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bonus`
--

INSERT INTO `bonus` (`id_bonus`, `id_capster`, `id_kasir`, `id_user`, `judul_bonus`, `jumlah`, `keterangan`, `tanggal_diberikan`, `periode`, `status`, `created_at`) VALUES
(5, NULL, 2, NULL, 'THR', 10000.00, 'ds', '2025-11-14', '2025-11', 'belum_diberikan', '2025-11-14 03:44:53'),
(6, 2, NULL, NULL, 'THRHRHRH', 10000.00, 'dfsads', '2025-11-14', '2025-11', 'belum_diberikan', '2025-11-14 03:45:12');

-- --------------------------------------------------------

--
-- Table structure for table `capster`
--

CREATE TABLE `capster` (
  `id_capster` int(11) NOT NULL,
  `nama_capster` varchar(100) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `capster`
--

INSERT INTO `capster` (`id_capster`, `nama_capster`, `id_store`, `id_user`, `telepon`, `email`, `alamat`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `created_at`) VALUES
(1, 'Budi', 1, 11, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-11 02:18:05'),
(2, 'Rian', 1, 10, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-11 02:18:05'),
(3, 'Andi', 2, 20, '085896111717', 'andi@gmail.com', 'Jl. Jend. Suprapto No.88, Tj. Karang, Engal, Kota Bandar Lampung, Lampung 35127\n', 'Laki-laki', 'Bandar Lampung', '1999-06-02', '2025-11-11 02:18:05'),
(4, 'Tono', 3, NULL, '082276768908', 'tono12@gmail.com', 'Jl.bima Gg.Mushola, Rajabasa Jaya, Rajabasa, Bandar Lampung, Lampung', 'Laki-laki', 'Palembang', '2000-06-15', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `gaji_setting`
--

CREATE TABLE `gaji_setting` (
  `id_gaji_setting` int(11) NOT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `gaji_pokok` decimal(12,2) NOT NULL DEFAULT 0.00,
  `periode` enum('Bulanan','Mingguan') DEFAULT 'Bulanan',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gaji_setting`
--

INSERT INTO `gaji_setting` (`id_gaji_setting`, `id_capster`, `id_kasir`, `id_user`, `gaji_pokok`, `periode`, `updated_at`) VALUES
(7, NULL, 2, NULL, 2000000.00, 'Bulanan', '2025-11-22 12:32:57');

-- --------------------------------------------------------

--
-- Table structure for table `kasbon`
--

CREATE TABLE `kasbon` (
  `id_kasbon` int(11) NOT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `jumlah_total` decimal(12,2) NOT NULL,
  `sisa_kasbon` decimal(12,2) NOT NULL,
  `jumlah_cicilan` int(11) DEFAULT 0,
  `cicilan_terbayar` int(11) DEFAULT 0,
  `keterangan` varchar(255) DEFAULT NULL,
  `status` enum('aktif','lunas') DEFAULT 'aktif',
  `tanggal_pinjam` date DEFAULT curdate(),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kasbon`
--

INSERT INTO `kasbon` (`id_kasbon`, `id_capster`, `id_kasir`, `jumlah_total`, `sisa_kasbon`, `jumlah_cicilan`, `cicilan_terbayar`, `keterangan`, `status`, `tanggal_pinjam`, `created_at`, `updated_at`) VALUES
(4, NULL, 2, 500000.00, 250000.00, 2, 1, 'Beli Obat (Periode November 2025)', 'lunas', '2025-11-01', '2025-11-15 00:42:05', '2025-12-01 16:41:41'),
(6, NULL, 2, 200000.00, 100000.00, 2, 1, 'Bayar Kost (Periode November 2025)', 'lunas', '2025-11-01', '2025-11-15 01:10:42', '2025-12-04 17:24:04'),
(7, NULL, 2, 200000.00, 0.00, 2, 2, 'keperluan pribadi (Periode December 2025)', 'aktif', '2025-12-01', '2025-11-15 01:10:42', '2025-12-04 17:22:41'),
(8, 2, NULL, 400000.00, 266666.00, 3, 1, 'beli baju (Periode November 2025)', 'lunas', '2025-11-01', '2025-11-15 02:24:46', '2025-12-01 16:41:41'),
(9, 2, NULL, 300000.00, 100000.00, 3, 2, 'beli baju (Periode December 2025)', 'aktif', '2025-12-01', '2025-11-15 02:24:46', '2025-12-04 17:25:06'),
(10, 2, NULL, 300000.00, 0.00, 3, 3, 'beli baju (Periode January 2026)', 'aktif', '2026-01-01', '2025-11-15 02:24:46', '2025-12-02 16:21:59'),
(19, 4, NULL, 200000.00, 100000.00, 2, 1, 'pulang kampung (Periode December 2025)', 'aktif', '2025-12-01', '2025-12-02 16:02:27', '2025-12-02 16:02:27'),
(20, 4, NULL, 200000.00, 0.00, 2, 2, 'pulang kampung (Periode January 2026)', 'aktif', '2026-01-01', '2025-12-02 16:02:27', '2025-12-02 16:02:27'),
(23, NULL, 2, 200000.00, 0.00, 2, 2, '- (Periode January 2026)', 'aktif', '2026-01-01', '2025-12-02 16:05:37', '2025-12-04 17:31:33');

-- --------------------------------------------------------

--
-- Table structure for table `kasir`
--

CREATE TABLE `kasir` (
  `id_kasir` int(11) NOT NULL,
  `nama_kasir` varchar(100) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kasir`
--

INSERT INTO `kasir` (`id_kasir`, `nama_kasir`, `id_store`, `id_user`, `telepon`, `email`, `alamat`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `created_at`) VALUES
(2, 'Dedi', 2, 17, '085809584444', 'dedi@gmail.com', 'Jl. ZA. Pagar Alam, Rajabasa, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35114', 'Laki-laki', 'Bandar Lampung', '2000-08-16', '2025-11-13 23:08:14'),
(3, 'Agus', 1, 19, '082234557698', 'Agus@gmail.com', 'Jl. Airan Raya No.88, RT.18a/RW.Dusun 5, Way Huwi, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung 35131', 'Laki-laki', 'Bandar Lampung', '2000-09-25', '2025-11-25 15:35:52');

-- --------------------------------------------------------

--
-- Table structure for table `komisi_setting`
--

CREATE TABLE `komisi_setting` (
  `id_setting` int(11) NOT NULL,
  `id_capster` int(11) NOT NULL,
  `persentase_capster` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `komisi_setting`
--

INSERT INTO `komisi_setting` (`id_setting`, `id_capster`, `persentase_capster`, `updated_at`) VALUES
(1, 1, 10.00, '2025-11-11 02:18:05'),
(2, 2, 10.00, '2025-11-11 02:18:05'),
(3, 3, 10.00, '2025-11-11 02:18:05'),
(4, 4, 10.00, '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `pengeluaran`
--

CREATE TABLE `pengeluaran` (
  `id_pengeluaran` int(11) NOT NULL,
  `id_store` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `kategori` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `jumlah` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tanggal` date NOT NULL,
  `bukti_path` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengeluaran`
--

INSERT INTO `pengeluaran` (`id_pengeluaran`, `id_store`, `id_user`, `kategori`, `deskripsi`, `jumlah`, `tanggal`, `bukti_path`, `created_at`) VALUES
(1, 1, 1, 'Operasional', 'Beli tissue dan minuman pelanggan', 150000.00, '2025-11-02', NULL, '2025-11-11 02:18:05'),
(2, 2, 1, 'Perawatan', 'Servis alat cukur', 200000.00, '2025-11-01', NULL, '2025-11-11 02:18:05'),
(3, 3, 1, 'Perlengkapan', 'Perawatan kursi dan meja', 250000.00, '2025-11-03', NULL, '2025-11-11 02:18:05'),
(4, 2, 17, 'Air', 'bayar air', 20000.00, '2025-11-11', '/uploads/pengeluaran/1763147736507-821745900.png', '2025-11-15 02:15:36'),
(5, NULL, 1, 'Operasional', 'Biaya Pembelian Tablet', 2000000.00, '2025-11-20', '/uploads/pengeluaran/1763654699556-41193705.png', '2025-11-20 23:04:59');

-- --------------------------------------------------------

--
-- Table structure for table `potongan_kasbon`
--

CREATE TABLE `potongan_kasbon` (
  `id_potongan` int(11) NOT NULL,
  `id_kasbon` int(11) DEFAULT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `periode` char(7) NOT NULL,
  `jumlah_potongan` decimal(12,2) NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `tanggal_potong` date DEFAULT curdate(),
  `tipe_potongan` enum('kasbon','umum') DEFAULT 'kasbon'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `potongan_kasbon`
--

INSERT INTO `potongan_kasbon` (`id_potongan`, `id_kasbon`, `id_capster`, `id_kasir`, `periode`, `jumlah_potongan`, `keterangan`, `tanggal_potong`, `tipe_potongan`) VALUES
(6, 4, NULL, 2, '2025-11', 250000.00, 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(8, 6, NULL, 2, '2025-11', 100000.00, 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(9, 7, NULL, 2, '2025-12', 100000.00, 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(10, 8, 2, NULL, '2025-11', 133334.00, 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(11, 9, 2, NULL, '2025-12', 133334.00, 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(12, 10, 2, NULL, '2026-01', 133334.00, 'Potongan otomatis kasbon bulan January 2026', '2026-01-01', 'kasbon'),
(15, 19, 4, NULL, '2025-12', 100000.00, 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(16, 20, 4, NULL, '2026-01', 100000.00, 'Potongan otomatis kasbon bulan January 2026', '2026-01-01', 'kasbon'),
(18, 23, NULL, 2, '2026-01', 100000.00, 'Potongan otomatis kasbon bulan January 2026', '2026-01-01', 'kasbon');

-- --------------------------------------------------------

--
-- Table structure for table `pricelist`
--

CREATE TABLE `pricelist` (
  `id_pricelist` int(11) NOT NULL,
  `service` varchar(100) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `harga` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricelist`
--

INSERT INTO `pricelist` (`id_pricelist`, `service`, `keterangan`, `harga`, `created_at`) VALUES
(1, 'Haircut', 'Cukur rambut standar', 30000.00, '2025-11-11 02:18:05'),
(2, 'Hairwash', 'Cuci rambut dan pijat ringan', 10000.00, '2025-11-11 02:18:05'),
(3, 'Haircut + Styling', 'Cukur dan penataan rambut', 40000.00, '2025-11-11 02:18:05'),
(4, 'Haircut Premium', 'Cukur + pijat kepala', 50000.00, '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(11) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `harga_awal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `harga_jual` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id_produk`, `nama_produk`, `harga_awal`, `harga_jual`, `created_at`) VALUES
(4, 'Wax Strong Hold', 25000.00, 45000.00, '2025-11-11 02:18:05'),
(5, 'Waxing Gel', 30000.00, 35000.00, '2025-11-11 02:26:34'),
(6, 'Pomade Clay', 35000.00, 41000.00, '2025-11-11 02:32:23'),
(7, 'asa', 30000.00, 50000.00, '2025-11-11 02:40:39'),
(8, 'Cat Rambut', 20000.00, 25000.00, '2025-11-11 13:18:40'),
(9, 'Pomade Oil Based', 20000.00, 40000.00, '2025-11-11 13:20:16'),
(10, 'Pomade Clay', 25000.00, 30000.00, '2025-11-11 13:45:49'),
(11, 'Air Mineral', 3000.00, 5000.00, '2025-12-02 15:50:04'),
(12, 'Nescaffe', 8000.00, 10000.00, '2025-12-02 15:51:07'),
(13, 'Lasegar', 6000.00, 8000.00, '2025-12-02 15:52:07');

-- --------------------------------------------------------

--
-- Table structure for table `profil`
--

CREATE TABLE `profil` (
  `id_profil` int(11) NOT NULL,
  `nama_barbershop` varchar(150) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `tiktok` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profil`
--

INSERT INTO `profil` (`id_profil`, `nama_barbershop`, `logo`, `telepon`, `instagram`, `tiktok`, `created_at`) VALUES
(1, 'LE MUANI BARBERSHOP', 'uploads/logo/logo-1763622753376.png', '08123456789', '@lemuani_barbershop', '@lemuani_barbershop', '2025-11-20 00:11:12');

-- --------------------------------------------------------

--
-- Table structure for table `stok_produk`
--

CREATE TABLE `stok_produk` (
  `id_stok` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `id_store` int(11) NOT NULL,
  `jumlah_stok` int(11) NOT NULL DEFAULT 0,
  `stok_akhir` int(11) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stok_produk`
--

INSERT INTO `stok_produk` (`id_stok`, `id_produk`, `id_store`, `jumlah_stok`, `stok_akhir`, `updated_at`) VALUES
(8, 4, 2, 20, 16, '2025-12-05 22:38:52'),
(15, 5, 2, 110, 105, '2025-12-05 22:38:52'),
(34, 8, 1, 30, 29, '2025-11-16 21:58:33'),
(37, 9, 1, 40, 39, '2025-11-20 23:01:29'),
(38, 10, 3, 10, 10, '2025-11-11 13:45:49'),
(41, 9, 2, 20, 8, '2025-12-06 01:24:38'),
(44, 6, 1, 100, 89, '2025-11-20 23:01:16'),
(49, 11, 2, 20, 19, '2025-12-05 21:50:37'),
(50, 12, 2, 10, 2, '2025-12-05 23:27:28'),
(51, 13, 2, 10, 7, '2025-12-05 23:45:22');

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

CREATE TABLE `store` (
  `id_store` int(11) NOT NULL,
  `nama_store` varchar(100) NOT NULL,
  `alamat_store` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store`
--

INSERT INTO `store` (`id_store`, `nama_store`, `alamat_store`, `created_at`) VALUES
(1, 'Le Muani Barbershop', 'Jl. Imam Bonjol No.176, Suka Jawa, Kec. Tj. Karang Barat, Kota Bandar Lampung', '2025-11-11 02:18:05'),
(2, 'Le Muani Barbershop 2', 'Jl. ZA. Pagar Alam, Rajabasa, Kec. Rajabasa, Kota Bandar Lampung', '2025-11-11 02:18:05'),
(3, 'Le Muani Barbershop 3', 'Jl. Airan Raya No.88, RT.18a/RW.Dusun 5, Way Huwi, Kec. Jati Agung, Kabupaten Lampung Selatan', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `struk`
--

CREATE TABLE `struk` (
  `id_struk` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `nomor_struk` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `struk`
--

INSERT INTO `struk` (`id_struk`, `id_transaksi`, `nomor_struk`, `created_at`) VALUES
(1, 1, 'STRK-001', '2025-11-11 02:18:05'),
(2, 2, 'STRK-002', '2025-11-11 02:18:05'),
(3, 3, 'STRK-003', '2025-11-11 02:18:05'),
(4, 4, 'STRK-004', '2025-11-11 02:18:05'),
(5, 5, 'STRK-005', '2025-11-11 02:18:05'),
(6, 6, 'STRK251110158', '2025-11-11 02:22:16'),
(8, 1, 'STRK251110198', '2025-11-11 02:35:02'),
(10, 2, 'STRK251110990', '2025-11-11 02:35:46'),
(12, 1, 'STRK251110404', '2025-11-11 02:39:23'),
(14, 2, 'STRK251110548', '2025-11-11 02:40:08'),
(17, 3, 'STRK251110899', '2025-11-11 03:06:01'),
(18, 4, 'STRK251110699', '2025-11-11 03:08:54'),
(19, 5, 'STRK251110122', '2025-11-11 03:15:25'),
(20, 6, 'STRK251110310', '2025-11-11 03:18:53'),
(21, 7, 'STRK251110015', '2025-11-11 03:21:36'),
(22, 8, 'STRK251111016', '2025-11-11 13:29:57'),
(23, 9, 'STRK251111017', '2025-11-11 14:50:20'),
(24, 10, 'STRK251111018', '2025-11-11 14:52:13'),
(25, 11, 'STRK251115001', '2025-11-15 23:34:48'),
(26, 12, 'STRK251119001', '2025-11-19 22:05:27'),
(27, 13, 'STRK251202001', '2025-12-02 14:50:54'),
(28, 14, 'STRK251202002', '2025-12-02 14:59:13'),
(29, 15, 'STRK251202003', '2025-12-02 15:00:54'),
(30, 16, 'STRK251202004', '2025-12-02 16:50:34'),
(31, 17, 'STRK251202005', '2025-12-02 16:53:59'),
(32, 18, 'STRK251204001', '2025-12-04 12:34:39'),
(33, 19, 'STRK251204002', '2025-12-04 12:36:24'),
(34, 20, 'STRK251204003', '2025-12-04 12:41:38'),
(35, 21, 'STRK251204004', '2025-12-04 12:43:47'),
(36, 22, 'STRK251204005', '2025-12-04 12:46:22'),
(37, 23, 'STRK251204006', '2025-12-04 12:47:23'),
(38, 24, 'STRK251204007', '2025-12-04 12:53:54'),
(39, 25, 'STRK251204008', '2025-12-04 13:06:00'),
(40, 26, 'STRK251204009', '2025-12-04 13:37:35'),
(41, 27, 'STRK251204010', '2025-12-04 13:38:03'),
(42, 28, 'INV251204011', '2025-12-04 13:43:56'),
(43, 29, 'INV251205001', '2025-12-05 21:45:59'),
(44, 30, 'INV251205002', '2025-12-05 21:50:37'),
(45, 31, 'INV251205003', '2025-12-05 21:54:31'),
(46, 32, 'INV251205004', '2025-12-05 22:01:19'),
(47, 33, 'INV251205005', '2025-12-05 22:06:31'),
(49, 35, 'INV251205006', '2025-12-05 22:10:10'),
(52, 38, 'INV251205007', '2025-12-05 22:20:28'),
(53, 39, 'INV251205008', '2025-12-05 22:23:23'),
(54, 40, 'INV251205009', '2025-12-05 22:24:22'),
(55, 41, 'INV251205010', '2025-12-05 22:29:42'),
(56, 42, 'INV251205011', '2025-12-05 22:34:33'),
(57, 43, 'INV251205012', '2025-12-05 22:38:52'),
(58, 44, 'INV251205013', '2025-12-05 22:39:20'),
(59, 45, 'INV251205014', '2025-12-05 22:43:21'),
(60, 46, 'INV251205015', '2025-12-05 22:45:39'),
(61, 47, 'INV251205016', '2025-12-05 22:50:15'),
(62, 48, 'INV251205017', '2025-12-05 23:01:16'),
(64, 50, 'INV251205018', '2025-12-05 23:06:00'),
(66, 52, 'INV02-251205-0019', '2025-12-05 23:27:28'),
(67, 53, 'INV2/251205/0020', '2025-12-05 23:28:49'),
(68, 54, 'INV2/251205/021', '2025-12-05 23:30:57'),
(69, 55, 'NO02/251205/022', '2025-12-05 23:32:36'),
(70, 56, 'NO2/251205/023', '2025-12-05 23:33:09'),
(71, 57, 'INV2/251205/024', '2025-12-05 23:34:59'),
(72, 58, '02/251205/0025', '2025-12-05 23:36:06'),
(73, 59, '02/251205/0026', '2025-12-05 23:45:22'),
(74, 60, '02/251205/0001', '2025-12-06 01:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(11) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `tipe_transaksi` enum('service','produk','campuran') NOT NULL,
  `metode_bayar` varchar(20) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `jumlah_bayar` decimal(12,2) NOT NULL DEFAULT 0.00,
  `kembalian` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `bukti_qris` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_store`, `id_user`, `tipe_transaksi`, `metode_bayar`, `subtotal`, `jumlah_bayar`, `kembalian`, `created_at`, `bukti_qris`) VALUES
(1, 1, 2, 'produk', 'cash', 35000.00, 50000.00, 15000.00, '2025-11-11 02:39:23', NULL),
(2, 1, 2, 'produk', 'cash', 140000.00, 150000.00, 10000.00, '2025-11-11 02:40:08', NULL),
(3, 1, 2, 'campuran', 'cash', 75000.00, 100000.00, 25000.00, '2025-11-11 03:06:01', NULL),
(4, 1, 2, 'service', 'cash', 50000.00, 50000.00, 0.00, '2025-11-11 03:08:54', NULL),
(5, 1, 2, 'produk', 'cash', 140000.00, 150000.00, 10000.00, '2025-11-11 03:15:25', NULL),
(6, 1, 2, 'produk', 'cash', 35000.00, 40000.00, 5000.00, '2025-11-11 03:18:53', NULL),
(7, 1, 2, 'service', 'cash', 50000.00, 50000.00, 0.00, '2025-11-11 03:21:36', NULL),
(8, 1, 2, 'produk', 'cash', 65000.00, 70000.00, 5000.00, '2025-11-11 13:29:57', NULL),
(9, 2, 6, 'produk', 'qris', 45000.00, 45000.00, 0.00, '2025-11-11 14:50:20', NULL),
(10, 2, 6, 'produk', 'cash', 80000.00, 100000.00, 20000.00, '2025-11-11 14:52:13', NULL),
(11, 2, 17, 'produk', 'cash', 45000.00, 50000.00, 5000.00, '2025-11-15 23:34:48', NULL),
(12, 2, 17, 'service', 'cash', 50000.00, 50000.00, 0.00, '2025-11-19 22:05:27', 'test123'),
(13, 2, 17, 'produk', 'cash', 40000.00, 50000.00, 10000.00, '2025-12-02 14:50:54', NULL),
(14, 2, 17, 'produk', 'cash', 85000.00, 100000.00, 15000.00, '2025-12-02 14:59:13', NULL),
(15, 2, 17, 'produk', 'qris', 80000.00, 100000.00, 20000.00, '2025-12-02 15:00:54', NULL),
(16, 2, 17, 'service', 'qris', 40000.00, 50000.00, 10000.00, '2025-12-02 16:50:34', NULL),
(17, 2, 17, 'produk', 'cash', 50000.00, 100000.00, 50000.00, '2025-12-02 16:53:59', NULL),
(18, 2, 17, 'produk', 'qris', 10000.00, 10000.00, 0.00, '2025-12-04 12:34:39', NULL),
(19, 2, 17, 'produk', 'qris', 40000.00, 40000.00, 0.00, '2025-12-04 12:36:24', NULL),
(20, 2, 17, 'service', 'qris', 30000.00, 30000.00, 0.00, '2025-12-04 12:41:38', NULL),
(21, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-04 12:43:47', NULL),
(22, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-04 12:46:22', NULL),
(23, 2, 17, 'produk', 'qris', 8000.00, 8000.00, 0.00, '2025-12-04 12:47:23', NULL),
(24, 2, 17, 'campuran', 'qris', 40000.00, 40000.00, 0.00, '2025-12-04 12:53:54', NULL),
(25, 2, 17, 'produk', 'qris', 48000.00, 48000.00, 0.00, '2025-12-04 13:06:00', NULL),
(26, 2, 17, 'produk', 'qris', 40000.00, 40000.00, 0.00, '2025-12-04 13:37:35', NULL),
(27, 2, 17, 'produk', 'cash', 10000.00, 10000.00, 0.00, '2025-12-04 13:38:03', NULL),
(28, 2, 17, 'produk', 'qris', 40000.00, 40000.00, 0.00, '2025-12-04 13:43:56', NULL),
(29, 2, 17, 'produk', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 21:45:59', NULL),
(30, 2, 17, 'produk', 'qris', 15000.00, 15000.00, 0.00, '2025-12-05 21:50:37', NULL),
(31, 2, 17, 'service', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 21:54:31', NULL),
(32, 2, 17, 'produk', 'qris', 45000.00, 45000.00, 0.00, '2025-12-05 22:01:19', NULL),
(33, 2, 17, 'produk', 'qris', 70000.00, 70000.00, 0.00, '2025-12-05 22:06:31', '/uploads/qris/1764947202332-180996173.png'),
(35, 2, 17, 'produk', 'qris', 35000.00, 35000.00, 0.00, '2025-12-05 22:10:10', '/uploads/qris/1764947422994-422394920.png'),
(38, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-05 22:20:28', 'uploads/qris/1764948040521-644762455.jpeg'),
(39, 2, 17, 'service', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 22:23:23', 'uploads/qris/1764948210441-662324594.jpeg'),
(40, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-05 22:24:22', 'uploads/qris/1764948270441-978548496.jpeg'),
(41, 2, 17, 'service', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 22:29:42', 'uploads/qris/1764948591703-661969176.jpeg'),
(42, 2, 17, 'service', 'qris', 30000.00, 30000.00, 0.00, '2025-12-05 22:34:33', '/uploads/qris/1764948880106-650121221.png'),
(43, 2, 17, 'produk', 'qris', 120000.00, 120000.00, 0.00, '2025-12-05 22:38:52', NULL),
(44, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-05 22:39:20', NULL),
(45, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-05 22:43:21', '/uploads/qris/1764949408836-404640835.png'),
(46, 2, 17, 'service', 'qris', 10000.00, 10000.00, 0.00, '2025-12-05 22:45:39', '/uploads/qris/1764949546241-86871799.jpeg'),
(47, 2, 17, 'service', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 22:50:15', NULL),
(48, 2, 17, 'service', 'qris', 50000.00, 50000.00, 0.00, '2025-12-05 23:01:16', '/uploads/qris/1764950680561-970453267.jpeg'),
(50, 2, 17, 'campuran', 'qris', 40000.00, 40000.00, 0.00, '2025-12-05 23:06:00', '/uploads/qris/1764950906364-186553309.png'),
(52, 2, 17, 'produk', 'cash', 10000.00, 10000.00, 0.00, '2025-12-05 23:27:28', NULL),
(53, 2, 17, 'service', 'cash', 50000.00, 50000.00, 0.00, '2025-12-05 23:28:49', NULL),
(54, 2, 17, 'service', 'cash', 40000.00, 40000.00, 0.00, '2025-12-05 23:30:57', NULL),
(55, 2, 17, 'service', 'cash', 10000.00, 10000.00, 0.00, '2025-12-05 23:32:36', NULL),
(56, 2, 17, 'service', 'cash', 30000.00, 30000.00, 0.00, '2025-12-05 23:33:09', NULL),
(57, 2, 17, 'service', 'cash', 30000.00, 30000.00, 0.00, '2025-12-05 23:34:59', NULL),
(58, 2, 17, 'service', 'cash', 40000.00, 40000.00, 0.00, '2025-12-05 23:36:06', NULL),
(59, 2, 17, 'produk', 'qris', 8000.00, 8000.00, 0.00, '2025-12-05 23:45:22', '/uploads/qris/1764953145744-521729928.jpg'),
(60, 2, 17, 'produk', 'qris', 40000.00, 40000.00, 0.00, '2025-12-06 01:24:38', '/uploads/qris/1764959094214-702632000.png');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi_produk_detail`
--

CREATE TABLE `transaksi_produk_detail` (
  `id_detail` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `harga_awal` decimal(12,2) DEFAULT 0.00,
  `harga_jual` decimal(12,2) DEFAULT 0.00,
  `total_penjualan` decimal(12,2) DEFAULT 0.00,
  `total_modal` decimal(12,2) DEFAULT 0.00,
  `laba_rugi` decimal(12,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi_produk_detail`
--

INSERT INTO `transaksi_produk_detail` (`id_detail`, `id_transaksi`, `id_produk`, `jumlah`, `harga_awal`, `harga_jual`, `total_penjualan`, `total_modal`, `laba_rugi`, `created_at`) VALUES
(1, 1, 6, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-11-11 02:39:23'),
(2, 2, 6, 4, 30000.00, 35000.00, 140000.00, 120000.00, 20000.00, '2025-11-11 02:40:08'),
(3, 3, 6, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-11-11 03:06:02'),
(4, 5, 6, 4, 30000.00, 35000.00, 140000.00, 120000.00, 20000.00, '2025-11-11 03:15:25'),
(5, 6, 6, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-11-11 03:18:53'),
(6, 8, 8, 1, 20000.00, 25000.00, 25000.00, 20000.00, 5000.00, '2025-11-11 13:29:57'),
(7, 8, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-11-11 13:29:57'),
(8, 9, 4, 1, 22000.00, 45000.00, 45000.00, 22000.00, 23000.00, '2025-11-11 14:50:20'),
(9, 10, 4, 1, 25000.00, 45000.00, 45000.00, 25000.00, 20000.00, '2025-11-11 14:52:13'),
(10, 10, 5, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-11-11 14:52:13'),
(11, 11, 4, 1, 25000.00, 45000.00, 45000.00, 25000.00, 20000.00, '2025-11-15 23:34:48'),
(12, 13, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-02 14:50:54'),
(13, 14, 4, 1, 25000.00, 45000.00, 45000.00, 25000.00, 20000.00, '2025-12-02 14:59:13'),
(14, 14, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-02 14:59:13'),
(15, 15, 9, 2, 20000.00, 40000.00, 80000.00, 40000.00, 40000.00, '2025-12-02 15:00:54'),
(16, 17, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-02 16:53:59'),
(17, 17, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-02 16:53:59'),
(18, 18, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-04 12:34:39'),
(19, 19, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-04 12:36:24'),
(20, 23, 13, 1, 6000.00, 8000.00, 8000.00, 6000.00, 2000.00, '2025-12-04 12:47:23'),
(21, 24, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-04 12:53:54'),
(22, 25, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-04 13:06:00'),
(23, 25, 13, 1, 6000.00, 8000.00, 8000.00, 6000.00, 2000.00, '2025-12-04 13:06:00'),
(24, 26, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-04 13:37:35'),
(25, 27, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-04 13:38:03'),
(26, 28, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-04 13:43:56'),
(27, 29, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-05 21:45:59'),
(28, 30, 11, 1, 3000.00, 5000.00, 5000.00, 3000.00, 2000.00, '2025-12-05 21:50:37'),
(29, 30, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-05 21:50:37'),
(30, 32, 5, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-12-05 22:01:19'),
(31, 32, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-05 22:01:19'),
(32, 33, 5, 2, 30000.00, 35000.00, 70000.00, 60000.00, 10000.00, '2025-12-05 22:06:31'),
(33, 35, 5, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-12-05 22:10:10'),
(34, 43, 4, 1, 25000.00, 45000.00, 45000.00, 25000.00, 20000.00, '2025-12-05 22:38:52'),
(35, 43, 5, 1, 30000.00, 35000.00, 35000.00, 30000.00, 5000.00, '2025-12-05 22:38:52'),
(36, 43, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-05 22:38:52'),
(37, 50, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-05 23:06:00'),
(38, 52, 12, 1, 8000.00, 10000.00, 10000.00, 8000.00, 2000.00, '2025-12-05 23:27:28'),
(39, 59, 13, 1, 6000.00, 8000.00, 8000.00, 6000.00, 2000.00, '2025-12-05 23:45:22'),
(40, 60, 9, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-12-06 01:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi_service_detail`
--

CREATE TABLE `transaksi_service_detail` (
  `id_detail` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `id_pricelist` int(11) NOT NULL,
  `id_capster` int(11) NOT NULL,
  `harga` decimal(12,2) NOT NULL,
  `persentase_capster` decimal(5,2) DEFAULT NULL,
  `komisi_capster` decimal(12,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi_service_detail`
--

INSERT INTO `transaksi_service_detail` (`id_detail`, `id_transaksi`, `id_pricelist`, `id_capster`, `harga`, `persentase_capster`, `komisi_capster`, `created_at`) VALUES
(1, 3, 3, 2, 40000.00, 10.00, 4000.00, '2025-11-11 03:06:02'),
(2, 4, 4, 2, 50000.00, 10.00, 5000.00, '2025-11-11 03:08:54'),
(3, 7, 4, 1, 50000.00, 10.00, 5000.00, '2025-11-11 03:21:36'),
(4, 12, 4, 3, 50000.00, 10.00, 5000.00, '2025-11-19 22:05:27'),
(5, 16, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-02 16:50:34'),
(6, 20, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-04 12:41:38'),
(7, 21, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-04 12:43:47'),
(8, 22, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-04 12:46:22'),
(9, 24, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-04 12:53:54'),
(10, 31, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 21:54:31'),
(11, 38, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 22:20:28'),
(12, 39, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 22:23:23'),
(13, 40, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 22:24:22'),
(14, 41, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 22:29:42'),
(15, 42, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-05 22:34:33'),
(16, 44, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 22:39:20'),
(17, 45, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 22:43:21'),
(18, 46, 2, 3, 10000.00, 10.00, 1000.00, '2025-12-05 22:45:39'),
(19, 47, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 22:50:15'),
(20, 48, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 23:01:16'),
(21, 50, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-05 23:06:00'),
(22, 53, 4, 3, 50000.00, 10.00, 5000.00, '2025-12-05 23:28:49'),
(23, 54, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 23:30:57'),
(24, 55, 2, 3, 10000.00, 10.00, 1000.00, '2025-12-05 23:32:36'),
(25, 56, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-05 23:33:09'),
(26, 57, 1, 3, 30000.00, 10.00, 3000.00, '2025-12-05 23:34:59'),
(27, 58, 3, 3, 40000.00, 10.00, 4000.00, '2025-12-05 23:36:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nama_user` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir','capster') NOT NULL,
  `id_store` int(11) DEFAULT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `id_kasir` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nama_user`, `username`, `password`, `role`, `id_store`, `id_capster`, `created_at`, `id_kasir`) VALUES
(1, 'I Made Desta Arwan', 'admin', '$2b$10$INGIMHQp7g3VqnkpuUEQd.eC/7AsfJ4ZTOENfR2wnHohkYUC69GA.', 'admin', NULL, NULL, '2025-11-11 02:18:05', NULL),
(2, 'Kasir Le Muani 1', 'kasir1', '$2b$10$7veUoYCTbgLISbrbwKCSVuODc4JeWuUyddoV2gyUdsKKdyhB21e.O', 'kasir', 1, NULL, '2025-11-11 02:18:05', NULL),
(6, 'Kasir Le Muani 2', 'dedii', '$2b$10$wKQkAVJRR9AFy9J/Idi.CuBsLXMRWmfSarVvBrOjVoYvRkgcgbr4m', 'kasir', 2, NULL, '2025-11-11 14:00:20', NULL),
(7, 'Kasir Le Muani 3', 'kasir3', '$2b$10$5oNM/IDMpisrhD7abP6rzu2xq0CMoj0XsgLeXE5zP43/aEKuc8QCC', 'kasir', 3, NULL, '2025-11-11 14:01:00', NULL),
(10, 'Rian', 'rian', '$2b$10$qaI2weppHp8WKMZI907Sg.iJeYQAflqWH0LwD8YZ2UBid/.mDqdl2', 'capster', 1, 2, '2025-11-11 14:10:38', NULL),
(11, 'Budi', 'budi', '$2b$10$Uq3bNe6Wjuhmy//JJeJ3y.ZUQy8FISC6npgnZEYvUIbbrYSiJv2U.', 'capster', 1, 1, '2025-11-11 16:23:42', NULL),
(17, 'Dedi', 'dedi', '$2b$10$uaBWA8yuvoYY4tWdAgYVDOO1VvyO6/MPOqKBrK/uwxcyRPP85IGyK', 'kasir', 2, NULL, '2025-11-14 00:05:55', 2),
(19, 'Agus', 'Agus', '$2b$10$hSufLoIBMj90qEalssCl/eaEddrCElmtbZqOrXe0fh4fhRp7RhNMm', 'kasir', 1, NULL, '2025-12-02 16:14:28', 3),
(20, 'Andi', 'andi', '$2b$10$EchYAMJPdVxIqm6dSFRZ5uu0znido8d1Qsd1vsaap076qSJLpYfcy', 'capster', 2, 3, '2025-12-06 00:24:13', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bonus`
--
ALTER TABLE `bonus`
  ADD PRIMARY KEY (`id_bonus`),
  ADD UNIQUE KEY `unique_bonus_periode` (`judul_bonus`,`periode`,`id_capster`,`id_user`),
  ADD KEY `fk_bonus_capster` (`id_capster`),
  ADD KEY `fk_bonus_user` (`id_user`),
  ADD KEY `fk_bonus_kasir` (`id_kasir`);

--
-- Indexes for table `capster`
--
ALTER TABLE `capster`
  ADD PRIMARY KEY (`id_capster`),
  ADD KEY `fk_capster_store` (`id_store`),
  ADD KEY `fk_capster_user` (`id_user`);

--
-- Indexes for table `gaji_setting`
--
ALTER TABLE `gaji_setting`
  ADD PRIMARY KEY (`id_gaji_setting`),
  ADD KEY `fk_gaji_capster` (`id_capster`),
  ADD KEY `fk_gaji_user` (`id_user`);

--
-- Indexes for table `kasbon`
--
ALTER TABLE `kasbon`
  ADD PRIMARY KEY (`id_kasbon`),
  ADD KEY `idx_kasbon_capster` (`id_capster`),
  ADD KEY `fk_kasbon_kasir` (`id_kasir`);

--
-- Indexes for table `kasir`
--
ALTER TABLE `kasir`
  ADD PRIMARY KEY (`id_kasir`),
  ADD KEY `fk_kasir_store` (`id_store`),
  ADD KEY `fk_kasir_user` (`id_user`);

--
-- Indexes for table `komisi_setting`
--
ALTER TABLE `komisi_setting`
  ADD PRIMARY KEY (`id_setting`),
  ADD KEY `fk_komisi_capster` (`id_capster`);

--
-- Indexes for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD PRIMARY KEY (`id_pengeluaran`),
  ADD KEY `fk_pengeluaran_store` (`id_store`),
  ADD KEY `fk_pengeluaran_user` (`id_user`);

--
-- Indexes for table `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  ADD PRIMARY KEY (`id_potongan`),
  ADD KEY `id_kasbon` (`id_kasbon`),
  ADD KEY `idx_potongan_periode` (`periode`),
  ADD KEY `fk_potongan_capster` (`id_capster`),
  ADD KEY `fk_potkasbon_kasir` (`id_kasir`);

--
-- Indexes for table `pricelist`
--
ALTER TABLE `pricelist`
  ADD PRIMARY KEY (`id_pricelist`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`),
  ADD UNIQUE KEY `unik_nama_harga` (`nama_produk`,`harga_awal`,`harga_jual`);

--
-- Indexes for table `profil`
--
ALTER TABLE `profil`
  ADD PRIMARY KEY (`id_profil`);

--
-- Indexes for table `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD PRIMARY KEY (`id_stok`),
  ADD UNIQUE KEY `unique_store_produk` (`id_store`,`id_produk`),
  ADD UNIQUE KEY `unik_store_produk` (`id_store`,`id_produk`),
  ADD KEY `fk_stok_produk` (`id_produk`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`id_store`);

--
-- Indexes for table `struk`
--
ALTER TABLE `struk`
  ADD PRIMARY KEY (`id_struk`),
  ADD UNIQUE KEY `nomor_struk` (`nomor_struk`),
  ADD KEY `fk_struk_transaksi` (`id_transaksi`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `fk_transaksi_store` (`id_store`),
  ADD KEY `fk_transaksi_user` (`id_user`);

--
-- Indexes for table `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_produk_transaksi` (`id_transaksi`),
  ADD KEY `fk_produk_master` (`id_produk`);

--
-- Indexes for table `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_service_transaksi` (`id_transaksi`),
  ADD KEY `fk_service_pricelist` (`id_pricelist`),
  ADD KEY `fk_service_capster` (`id_capster`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_user_store` (`id_store`),
  ADD KEY `fk_user_capster` (`id_capster`),
  ADD KEY `fk_user_kasir` (`id_kasir`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bonus`
--
ALTER TABLE `bonus`
  MODIFY `id_bonus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `capster`
--
ALTER TABLE `capster`
  MODIFY `id_capster` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `gaji_setting`
--
ALTER TABLE `gaji_setting`
  MODIFY `id_gaji_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `kasbon`
--
ALTER TABLE `kasbon`
  MODIFY `id_kasbon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `kasir`
--
ALTER TABLE `kasir`
  MODIFY `id_kasir` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `komisi_setting`
--
ALTER TABLE `komisi_setting`
  MODIFY `id_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  MODIFY `id_pengeluaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  MODIFY `id_potongan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `pricelist`
--
ALTER TABLE `pricelist`
  MODIFY `id_pricelist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `profil`
--
ALTER TABLE `profil`
  MODIFY `id_profil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stok_produk`
--
ALTER TABLE `stok_produk`
  MODIFY `id_stok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `id_store` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `struk`
--
ALTER TABLE `struk`
  MODIFY `id_struk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bonus`
--
ALTER TABLE `bonus`
  ADD CONSTRAINT `fk_bonus_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bonus_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bonus_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `capster`
--
ALTER TABLE `capster`
  ADD CONSTRAINT `fk_capster_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_capster_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `gaji_setting`
--
ALTER TABLE `gaji_setting`
  ADD CONSTRAINT `fk_gaji_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_gaji_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `kasbon`
--
ALTER TABLE `kasbon`
  ADD CONSTRAINT `fk_kasbon_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `kasbon_ibfk_2` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL;

--
-- Constraints for table `kasir`
--
ALTER TABLE `kasir`
  ADD CONSTRAINT `fk_kasir_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_kasir_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `komisi_setting`
--
ALTER TABLE `komisi_setting`
  ADD CONSTRAINT `fk_komisi_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE;

--
-- Constraints for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD CONSTRAINT `fk_pengeluaran_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pengeluaran_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  ADD CONSTRAINT `fk_potkasbon_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_potongan_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `potongan_kasbon_ibfk_1` FOREIGN KEY (`id_kasbon`) REFERENCES `kasbon` (`id_kasbon`) ON DELETE CASCADE;

--
-- Constraints for table `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD CONSTRAINT `fk_stok_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stok_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE;

--
-- Constraints for table `struk`
--
ALTER TABLE `struk`
  ADD CONSTRAINT `fk_struk_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transaksi_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  ADD CONSTRAINT `fk_produk_master` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_produk_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  ADD CONSTRAINT `fk_service_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_service_pricelist` FOREIGN KEY (`id_pricelist`) REFERENCES `pricelist` (`id_pricelist`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_service_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
