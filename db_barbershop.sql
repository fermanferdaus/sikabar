-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 04, 2025 at 05:54 AM
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
  `id_user` int(11) DEFAULT NULL,
  `judul_bonus` varchar(100) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `tanggal_diberikan` date NOT NULL,
  `periode` char(7) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bonus`
--

INSERT INTO `bonus` (`id_bonus`, `id_capster`, `id_user`, `judul_bonus`, `jumlah`, `keterangan`, `tanggal_diberikan`, `periode`, `created_at`) VALUES
(1, 1, NULL, 'Bonus Capster A', 50000.00, NULL, '2025-11-01', '2025-11', '2025-11-02 17:32:46'),
(2, 2, NULL, 'Bonus Capster B', 40000.00, NULL, '2025-11-01', '2025-11', '2025-11-02 17:32:46'),
(3, 3, NULL, 'Bonus Capster C', 30000.00, NULL, '2025-11-01', '2025-11', '2025-11-02 17:32:46'),
(4, NULL, 2, 'Bonus Kasir Palembang', 60000.00, NULL, '2025-11-01', '2025-11', '2025-11-02 17:32:46'),
(5, NULL, 9, 'Bonus Kasir Prabumulih', 40000.00, NULL, '2025-11-01', '2025-11', '2025-11-02 17:32:46'),
(10, 1, NULL, 'Bonus Capster A Oktober', 40000.00, NULL, '2025-10-01', '2025-10', '2025-11-02 17:39:54'),
(11, 2, NULL, 'Bonus Capster B Oktober', 35000.00, NULL, '2025-10-01', '2025-10', '2025-11-02 17:39:54'),
(12, NULL, 2, 'Bonus Kasir Palembang Oktober', 50000.00, NULL, '2025-10-01', '2025-10', '2025-11-02 17:39:54'),
(13, 3, NULL, 'Bonus Capster C Oktober', 25000.00, NULL, '2025-10-01', '2025-10', '2025-11-02 17:39:54'),
(14, NULL, 9, 'Bonus Kasir Prabumulih Oktober', 35000.00, NULL, '2025-10-01', '2025-10', '2025-11-02 17:39:54');

-- --------------------------------------------------------

--
-- Table structure for table `capster`
--

CREATE TABLE `capster` (
  `id_capster` int(11) NOT NULL,
  `nama_capster` varchar(100) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `capster`
--

INSERT INTO `capster` (`id_capster`, `nama_capster`, `id_store`, `id_user`, `status`, `created_at`) VALUES
(1, 'Rizky Gunawan', 1, 5, 'aktif', '2025-10-30 06:56:04'),
(2, 'Andi Saputra', 1, NULL, 'aktif', '2025-10-30 06:56:04'),
(3, 'Budi Haryanto', 2, NULL, 'aktif', '2025-10-30 06:56:04');

-- --------------------------------------------------------

--
-- Table structure for table `gaji_setting`
--

CREATE TABLE `gaji_setting` (
  `id_gaji_setting` int(11) NOT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `gaji_pokok` decimal(12,2) NOT NULL DEFAULT 0.00,
  `periode` enum('Bulanan','Mingguan') DEFAULT 'Bulanan',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gaji_setting`
--

INSERT INTO `gaji_setting` (`id_gaji_setting`, `id_capster`, `id_user`, `gaji_pokok`, `periode`, `updated_at`) VALUES
(1, 1, NULL, 200000.00, 'Bulanan', '2025-10-30 06:57:10'),
(2, 2, NULL, 200000.00, 'Bulanan', '2025-10-30 06:57:10'),
(3, NULL, 2, 200000.00, 'Bulanan', '2025-10-30 06:57:10');

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
(1, 1, 40.00, '2025-10-30 06:57:16'),
(2, 2, 35.00, '2025-10-30 06:57:16'),
(3, 3, 30.00, '2025-10-30 06:57:16');

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
(1, 1, 1, 'Listrik', 'Tagihan listrik November', 50000.00, '2025-11-01', NULL, '2025-11-02 17:32:46'),
(2, 1, 1, 'Air', 'Tagihan PDAM', 30000.00, '2025-11-01', NULL, '2025-11-02 17:32:46'),
(3, 2, 9, 'Perlengkapan', 'Pembelian handuk', 20000.00, '2025-11-01', NULL, '2025-11-02 17:32:46'),
(4, NULL, 1, 'Server Hosting', 'Biaya hosting sistem', 10000.00, '2025-11-01', NULL, '2025-11-02 17:32:46'),
(10, 1, 1, 'Listrik', 'Tagihan listrik Oktober', 40000.00, '2025-10-01', NULL, '2025-11-02 17:39:54'),
(11, 1, 1, 'Air', 'Tagihan PDAM Oktober', 25000.00, '2025-10-01', NULL, '2025-11-02 17:39:54'),
(12, 2, 9, 'Perlengkapan', 'Pembelian shampoo Oktober', 25000.00, '2025-10-01', NULL, '2025-11-02 17:39:54'),
(13, NULL, 1, 'Server Hosting', 'Biaya hosting sistem Oktober', 10000.00, '2025-10-01', NULL, '2025-11-02 17:39:54');

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
(1, 'Haircut Classic', 'Potongan standar pria', 50000.00, '2025-10-30 06:56:15'),
(2, 'Fade Cut', 'Potongan gradasi modern', 60000.00, '2025-10-30 06:56:15'),
(3, 'Coloring', 'Pewarnaan rambut', 120000.00, '2025-10-30 06:56:15'),
(4, 'Beard Trim', 'Cukur jenggot', 30000.00, '2025-10-30 06:56:15');

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
(1, 'Pomade Strong Hold', 35000.00, 60000.00, '2025-10-30 06:56:22'),
(2, 'Shampoo Herbal', 20000.00, 40000.00, '2025-10-30 06:56:22'),
(3, 'Cat Rambut', 25000.00, 45000.00, '2025-10-30 06:56:22');

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
(1, 1, 1, 50, 43, '2025-11-01 01:27:44'),
(2, 2, 1, 40, 30, '2025-11-01 01:27:44'),
(3, 3, 2, 30, 29, '2025-11-02 00:10:04'),
(4, 2, 2, 10, 10, '2025-11-04 11:49:28');

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
(1, 'FreshCut - Palembang', 'Jl. Sudirman No.45, Palembang', '2025-10-30 06:55:57'),
(2, 'FreshCut - Prabumulih', 'Jl. Jend. A. Yani No.17, Prabumulih', '2025-10-30 06:55:57');

-- --------------------------------------------------------

--
-- Table structure for table `struk`
--

CREATE TABLE `struk` (
  `id_struk` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `nomor_struk` varchar(30) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `struk`
--

INSERT INTO `struk` (`id_struk`, `id_transaksi`, `nomor_struk`, `file_path`, `created_at`) VALUES
(1, 1, 'STRK-DMY-001', NULL, '2025-11-02 17:32:46'),
(2, 2, 'STRK-DMY-002', NULL, '2025-11-02 17:32:46'),
(3, 3, 'STRK-DMY-003', NULL, '2025-11-02 17:32:46'),
(4, 4, 'STRK-DMY-004', '/uploads/struk/STRK-DMY-004.pdf', '2025-11-02 17:32:46'),
(5, 5, 'STRK-DMY-005', NULL, '2025-11-02 17:32:46'),
(6, 15, 'STRK251102718', '/uploads/struk/STRK251102718.pdf', '2025-11-03 00:01:06');

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
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_store`, `id_user`, `tipe_transaksi`, `metode_bayar`, `subtotal`, `jumlah_bayar`, `kembalian`, `created_at`) VALUES
(1, 1, 2, 'service', 'cash', 100000.00, 100000.00, 0.00, '2025-11-01 09:00:00'),
(2, 1, 2, 'produk', 'cash', 60000.00, 60000.00, 0.00, '2025-11-01 10:00:00'),
(3, 1, 2, 'campuran', 'cash', 160000.00, 160000.00, 0.00, '2025-11-01 11:00:00'),
(4, 2, 9, 'service', 'cash', 80000.00, 80000.00, 0.00, '2025-11-01 09:30:00'),
(5, 2, 9, 'produk', 'cash', 40000.00, 40000.00, 0.00, '2025-11-01 11:00:00'),
(10, 1, 2, 'service', 'cash', 90000.00, 90000.00, 0.00, '2025-10-05 09:00:00'),
(11, 1, 2, 'produk', 'cash', 70000.00, 70000.00, 0.00, '2025-10-05 10:00:00'),
(12, 1, 2, 'campuran', 'cash', 180000.00, 180000.00, 0.00, '2025-10-06 11:00:00'),
(13, 2, 9, 'service', 'cash', 85000.00, 85000.00, 0.00, '2025-10-05 09:30:00'),
(14, 2, 9, 'produk', 'cash', 45000.00, 45000.00, 0.00, '2025-10-05 11:00:00'),
(15, 1, 2, 'service', 'cash', 120000.00, 120000.00, 0.00, '2025-11-03 00:01:06');

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
(1, 2, 1, 1, 35000.00, 60000.00, 60000.00, 35000.00, 25000.00, '2025-11-02 17:32:46'),
(2, 3, 2, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-11-02 17:32:46'),
(3, 5, 2, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-11-02 17:32:46'),
(10, 11, 1, 1, 35000.00, 70000.00, 70000.00, 35000.00, 35000.00, '2025-10-05 10:00:00'),
(11, 12, 2, 1, 20000.00, 40000.00, 40000.00, 20000.00, 20000.00, '2025-10-06 11:00:00'),
(12, 14, 2, 1, 20000.00, 45000.00, 45000.00, 20000.00, 25000.00, '2025-10-05 11:00:00');

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
(1, 1, 1, 1, 50000.00, 40.00, 20000.00, '2025-11-02 17:32:46'),
(2, 1, 4, 1, 50000.00, 40.00, 20000.00, '2025-11-02 17:32:46'),
(3, 3, 3, 2, 120000.00, 35.00, 42000.00, '2025-11-02 17:32:46'),
(4, 4, 1, 3, 80000.00, 30.00, 24000.00, '2025-11-02 17:32:46'),
(10, 10, 1, 1, 45000.00, 40.00, 18000.00, '2025-10-05 09:00:00'),
(11, 12, 3, 2, 130000.00, 35.00, 45500.00, '2025-10-06 11:00:00'),
(12, 13, 1, 3, 85000.00, 30.00, 25500.00, '2025-10-05 09:30:00'),
(13, 15, 3, 1, 120000.00, 40.00, 48000.00, '2025-11-03 00:01:06');

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
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nama_user`, `username`, `password`, `role`, `id_store`, `id_capster`, `created_at`) VALUES
(1, 'Admin Pusat', 'admin', '$2b$10$ACMpaGZ/YLmU3slbyNDpVe.jQYuiEMRVqW06q1ZLSjDsRcYV.TYuW', 'admin', NULL, NULL, '2025-10-10 23:38:41'),
(2, 'Kasir Palembang', 'kasir', '$2b$10$kb5OTrRCnuDmcwr5pU8/ueujw/Blh/fz/K1vTrRkgN5Pg0lgq6p1C', 'kasir', 1, NULL, '2025-10-10 23:38:41'),
(5, 'Rizky Gunawan', 'rizky', '$2b$10$kb5OTrRCnuDmcwr5pU8/ueujw/Blh/fz/K1vTrRkgN5Pg0lgq6p1C', 'capster', 1, 1, '2025-10-10 23:38:41'),
(9, 'mboh', 'karbu', '$2b$10$Gdi77r///dmK5KhebFLUR.Jc3T/N0r/ht3i4Bk.DvloQx0XTHVDcu', 'kasir', 2, NULL, '2025-10-22 15:56:47'),
(15, 'Adit Barbers', 'adit', '$2b$10$8VXqwVvWd3NE/BUpqCjCte8RTcAAJcabTxC2v2NCMDk/C7QLDgt8u', 'capster', 1, 11, '2025-10-24 16:31:25');

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
  ADD KEY `fk_bonus_user` (`id_user`);

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
-- Indexes for table `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD PRIMARY KEY (`id_stok`),
  ADD UNIQUE KEY `unique_store_produk` (`id_store`,`id_produk`),
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
  ADD KEY `fk_user_capster` (`id_capster`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bonus`
--
ALTER TABLE `bonus`
  MODIFY `id_bonus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `capster`
--
ALTER TABLE `capster`
  MODIFY `id_capster` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gaji_setting`
--
ALTER TABLE `gaji_setting`
  MODIFY `id_gaji_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `komisi_setting`
--
ALTER TABLE `komisi_setting`
  MODIFY `id_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  MODIFY `id_pengeluaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `pricelist`
--
ALTER TABLE `pricelist`
  MODIFY `id_pricelist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stok_produk`
--
ALTER TABLE `stok_produk`
  MODIFY `id_stok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `store`
--
ALTER TABLE `store`
  MODIFY `id_store` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `struk`
--
ALTER TABLE `struk`
  MODIFY `id_struk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bonus`
--
ALTER TABLE `bonus`
  ADD CONSTRAINT `fk_bonus_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
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
  ADD CONSTRAINT `fk_user_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
