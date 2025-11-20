-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 20 Nov 2025 pada 08.24
-- Versi server: 10.4.17-MariaDB
-- Versi PHP: 8.0.0

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
-- Struktur dari tabel `bonus`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `bonus`
--

INSERT INTO `bonus` (`id_bonus`, `id_capster`, `id_kasir`, `id_user`, `judul_bonus`, `jumlah`, `keterangan`, `tanggal_diberikan`, `periode`, `status`, `created_at`) VALUES
(5, NULL, 2, NULL, 'THR', '10000.00', 'ds', '2025-11-14', '2025-11', 'belum_diberikan', '2025-11-14 03:44:53'),
(6, 2, NULL, NULL, 'THRHRHRH', '10000.00', 'dfsads', '2025-11-14', '2025-11', 'belum_diberikan', '2025-11-14 03:45:12');

-- --------------------------------------------------------

--
-- Struktur dari tabel `capster`
--

CREATE TABLE `capster` (
  `id_capster` int(11) NOT NULL,
  `nama_capster` varchar(100) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `capster`
--

INSERT INTO `capster` (`id_capster`, `nama_capster`, `id_store`, `id_user`, `status`, `created_at`) VALUES
(1, 'Budi', 1, 11, 'aktif', '2025-11-11 02:18:05'),
(2, 'Rian', 1, 10, 'aktif', '2025-11-11 02:18:05'),
(3, 'Andi', 2, NULL, 'aktif', '2025-11-11 02:18:05'),
(4, 'Tono', 3, 18, 'aktif', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `gaji_setting`
--

CREATE TABLE `gaji_setting` (
  `id_gaji_setting` int(11) NOT NULL,
  `id_capster` int(11) DEFAULT NULL,
  `id_kasir` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `gaji_pokok` decimal(12,2) NOT NULL DEFAULT 0.00,
  `periode` enum('Bulanan','Mingguan') DEFAULT 'Bulanan',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kasbon`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `kasbon`
--

INSERT INTO `kasbon` (`id_kasbon`, `id_capster`, `id_kasir`, `jumlah_total`, `sisa_kasbon`, `jumlah_cicilan`, `cicilan_terbayar`, `keterangan`, `status`, `tanggal_pinjam`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, '100000.00', '0.00', 1, 1, 'ada deh (Periode November 2025)', 'aktif', '2025-11-01', '2025-11-14 16:03:22', '2025-11-14 16:03:22'),
(4, NULL, 2, '500000.00', '250000.00', 2, 1, 'ap aja lah (Periode November 2025)', 'aktif', '2025-11-01', '2025-11-15 00:42:05', '2025-11-15 00:42:05'),
(5, NULL, 2, '500000.00', '0.00', 2, 2, 'ap aja lah (Periode December 2025)', 'aktif', '2025-12-01', '2025-11-15 00:42:05', '2025-11-15 00:42:05'),
(6, NULL, 2, '200000.00', '100000.00', 2, 1, 'adadadad (Periode November 2025)', 'aktif', '2025-11-01', '2025-11-15 01:10:42', '2025-11-15 01:10:42'),
(7, NULL, 2, '200000.00', '0.00', 2, 2, 'adadadad (Periode December 2025)', 'aktif', '2025-12-01', '2025-11-15 01:10:42', '2025-11-15 01:10:42'),
(8, 2, NULL, '400000.00', '266666.00', 3, 1, 'beli baju (Periode November 2025)', 'aktif', '2025-11-01', '2025-11-15 02:24:46', '2025-11-15 02:24:46'),
(9, 2, NULL, '400000.00', '0.00', 3, 3, 'beli baju (Periode December 2025)', 'lunas', '2025-12-01', '2025-11-15 02:24:46', '2025-11-15 02:25:07'),
(10, 2, NULL, '400000.00', '0.00', 3, 3, 'beli baju (Periode January 2026)', 'aktif', '2026-01-01', '2025-11-15 02:24:46', '2025-11-15 02:24:46');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kasir`
--

CREATE TABLE `kasir` (
  `id_kasir` int(11) NOT NULL,
  `nama_kasir` varchar(100) NOT NULL,
  `id_store` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `kasir`
--

INSERT INTO `kasir` (`id_kasir`, `nama_kasir`, `id_store`, `id_user`, `status`, `created_at`) VALUES
(2, 'Dedi', 2, 17, 'aktif', '2025-11-13 23:08:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `komisi_setting`
--

CREATE TABLE `komisi_setting` (
  `id_setting` int(11) NOT NULL,
  `id_capster` int(11) NOT NULL,
  `persentase_capster` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `komisi_setting`
--

INSERT INTO `komisi_setting` (`id_setting`, `id_capster`, `persentase_capster`, `updated_at`) VALUES
(1, 1, '10.00', '2025-11-11 02:18:05'),
(2, 2, '10.00', '2025-11-11 02:18:05'),
(3, 3, '10.00', '2025-11-11 02:18:05'),
(4, 4, '10.00', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengeluaran`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `pengeluaran`
--

INSERT INTO `pengeluaran` (`id_pengeluaran`, `id_store`, `id_user`, `kategori`, `deskripsi`, `jumlah`, `tanggal`, `bukti_path`, `created_at`) VALUES
(1, 1, 1, 'Operasional', 'Beli tissue dan minuman pelanggan', '150000.00', '2025-11-02', NULL, '2025-11-11 02:18:05'),
(2, 2, 1, 'Perawatan', 'Servis alat cukur', '200000.00', '2025-11-02', NULL, '2025-11-11 02:18:05'),
(3, 3, 1, 'Perlengkapan', 'Perawatan kursi dan meja', '250000.00', '2025-11-03', NULL, '2025-11-11 02:18:05'),
(4, 2, 17, 'Air', 'bayar air', '20000.00', '2025-11-11', '/uploads/pengeluaran/1763147736507-821745900.png', '2025-11-15 02:15:36');

-- --------------------------------------------------------

--
-- Struktur dari tabel `potongan_kasbon`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `potongan_kasbon`
--

INSERT INTO `potongan_kasbon` (`id_potongan`, `id_kasbon`, `id_capster`, `id_kasir`, `periode`, `jumlah_potongan`, `keterangan`, `tanggal_potong`, `tipe_potongan`) VALUES
(1, 1, 2, NULL, '2025-11', '100000.00', 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(6, 4, NULL, 2, '2025-11', '250000.00', 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(7, 5, NULL, 2, '2025-12', '250000.00', 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(8, 6, NULL, 2, '2025-11', '100000.00', 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(9, 7, NULL, 2, '2025-12', '100000.00', 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(10, 8, 2, NULL, '2025-11', '133334.00', 'Potongan otomatis kasbon bulan November 2025', '2025-11-01', 'kasbon'),
(11, 9, 2, NULL, '2025-12', '133334.00', 'Potongan otomatis kasbon bulan December 2025', '2025-12-01', 'kasbon'),
(12, 10, 2, NULL, '2026-01', '133334.00', 'Potongan otomatis kasbon bulan January 2026', '2026-01-01', 'kasbon'),
(13, 9, NULL, NULL, '2025-11', '133334.00', 'Potongan otomatis kasbon bulan November 2025', '2025-11-15', 'kasbon');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pricelist`
--

CREATE TABLE `pricelist` (
  `id_pricelist` int(11) NOT NULL,
  `service` varchar(100) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `harga` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `pricelist`
--

INSERT INTO `pricelist` (`id_pricelist`, `service`, `keterangan`, `harga`, `created_at`) VALUES
(1, 'Haircut', 'Cukur rambut standar', '30000.00', '2025-11-11 02:18:05'),
(2, 'Hairwash', 'Cuci rambut dan pijat ringan', '10000.00', '2025-11-11 02:18:05'),
(3, 'Haircut + Styling', 'Cukur dan penataan rambut', '40000.00', '2025-11-11 02:18:05'),
(4, 'Haircut Premium', 'Cukur + pijat kepala', '50000.00', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(11) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `harga_awal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `harga_jual` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `produk`
--

INSERT INTO `produk` (`id_produk`, `nama_produk`, `harga_awal`, `harga_jual`, `created_at`) VALUES
(4, 'Wax Strong Hold', '25000.00', '45000.00', '2025-11-11 02:18:05'),
(5, 'pomadesdAa', '30000.00', '35000.00', '2025-11-11 02:26:34'),
(6, 'pomadseqasaas', '35000.00', '41000.00', '2025-11-11 02:32:23'),
(7, 'asa', '30000.00', '50000.00', '2025-11-11 02:40:39'),
(8, 'Cat Rambut', '20000.00', '25000.00', '2025-11-11 13:18:40'),
(9, 'pomade', '20000.00', '40000.00', '2025-11-11 13:20:16'),
(10, 'Pomade Clay', '25000.00', '30000.00', '2025-11-11 13:45:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `profil`
--

CREATE TABLE `profil` (
  `id_profil` int(11) NOT NULL,
  `nama_barbershop` varchar(150) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `tiktok` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `profil`
--

INSERT INTO `profil` (`id_profil`, `nama_barbershop`, `logo`, `telepon`, `instagram`, `tiktok`, `created_at`) VALUES
(1, 'LE MUANI BARBERSHOP', 'uploads/logo/logo-1763622753376.png', '08123456789', '@lemuani_barbershop', '@lemuani_barbershop', '2025-11-20 00:11:12');

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok_produk`
--

CREATE TABLE `stok_produk` (
  `id_stok` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `id_store` int(11) NOT NULL,
  `jumlah_stok` int(11) NOT NULL DEFAULT 0,
  `stok_akhir` int(11) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `stok_produk`
--

INSERT INTO `stok_produk` (`id_stok`, `id_produk`, `id_store`, `jumlah_stok`, `stok_akhir`, `updated_at`) VALUES
(8, 4, 2, 20, 18, '2025-11-15 23:34:48'),
(15, 5, 2, 110, 110, '2025-11-11 14:52:39'),
(34, 8, 1, 30, 29, '2025-11-16 21:58:33'),
(37, 9, 1, 40, 39, '2025-11-15 17:54:37'),
(38, 10, 3, 10, 10, '2025-11-11 13:45:49'),
(41, 9, 2, 20, 20, '2025-11-15 17:37:06'),
(44, 6, 1, 100, 80, '2025-11-16 21:18:36');

-- --------------------------------------------------------

--
-- Struktur dari tabel `store`
--

CREATE TABLE `store` (
  `id_store` int(11) NOT NULL,
  `nama_store` varchar(100) NOT NULL,
  `alamat_store` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `store`
--

INSERT INTO `store` (`id_store`, `nama_store`, `alamat_store`, `created_at`) VALUES
(1, 'Le Muani Barbershop', 'Jl. Merdeka No.10, Palembang', '2025-11-11 02:18:05'),
(2, 'Le Muani Barbershop 2', 'Jl. Veteran No.22, Palembang', '2025-11-11 02:18:05'),
(3, 'Le Muani Barbershop 3', 'Jl. Rajawali No.55, Palembang', '2025-11-11 02:18:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `struk`
--

CREATE TABLE `struk` (
  `id_struk` int(11) NOT NULL,
  `id_transaksi` int(11) NOT NULL,
  `nomor_struk` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `struk`
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
(26, 12, 'STRK251119001', '2025-11-19 22:05:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `id_store`, `id_user`, `tipe_transaksi`, `metode_bayar`, `subtotal`, `jumlah_bayar`, `kembalian`, `created_at`) VALUES
(1, 1, 2, 'produk', 'cash', '35000.00', '50000.00', '15000.00', '2025-11-11 02:39:23'),
(2, 1, 2, 'produk', 'cash', '140000.00', '150000.00', '10000.00', '2025-11-11 02:40:08'),
(3, 1, 2, 'campuran', 'cash', '75000.00', '100000.00', '25000.00', '2025-11-11 03:06:01'),
(4, 1, 2, 'service', 'cash', '50000.00', '50000.00', '0.00', '2025-11-11 03:08:54'),
(5, 1, 2, 'produk', 'cash', '140000.00', '150000.00', '10000.00', '2025-11-11 03:15:25'),
(6, 1, 2, 'produk', 'cash', '35000.00', '40000.00', '5000.00', '2025-11-11 03:18:53'),
(7, 1, 2, 'service', 'cash', '50000.00', '50000.00', '0.00', '2025-11-11 03:21:36'),
(8, 1, 2, 'produk', 'cash', '65000.00', '70000.00', '5000.00', '2025-11-11 13:29:57'),
(9, 2, 6, 'produk', 'qris', '45000.00', '45000.00', '0.00', '2025-11-11 14:50:20'),
(10, 2, 6, 'produk', 'cash', '80000.00', '100000.00', '20000.00', '2025-11-11 14:52:13'),
(11, 2, 17, 'produk', 'cash', '45000.00', '50000.00', '5000.00', '2025-11-15 23:34:48'),
(12, 2, 17, 'service', 'cash', '50000.00', '50000.00', '0.00', '2025-11-19 22:05:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi_produk_detail`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `transaksi_produk_detail`
--

INSERT INTO `transaksi_produk_detail` (`id_detail`, `id_transaksi`, `id_produk`, `jumlah`, `harga_awal`, `harga_jual`, `total_penjualan`, `total_modal`, `laba_rugi`, `created_at`) VALUES
(1, 1, 6, 1, '30000.00', '35000.00', '35000.00', '30000.00', '5000.00', '2025-11-11 02:39:23'),
(2, 2, 6, 4, '30000.00', '35000.00', '140000.00', '120000.00', '20000.00', '2025-11-11 02:40:08'),
(3, 3, 6, 1, '30000.00', '35000.00', '35000.00', '30000.00', '5000.00', '2025-11-11 03:06:02'),
(4, 5, 6, 4, '30000.00', '35000.00', '140000.00', '120000.00', '20000.00', '2025-11-11 03:15:25'),
(5, 6, 6, 1, '30000.00', '35000.00', '35000.00', '30000.00', '5000.00', '2025-11-11 03:18:53'),
(6, 8, 8, 1, '20000.00', '25000.00', '25000.00', '20000.00', '5000.00', '2025-11-11 13:29:57'),
(7, 8, 9, 1, '20000.00', '40000.00', '40000.00', '20000.00', '20000.00', '2025-11-11 13:29:57'),
(8, 9, 4, 1, '22000.00', '45000.00', '45000.00', '22000.00', '23000.00', '2025-11-11 14:50:20'),
(9, 10, 4, 1, '25000.00', '45000.00', '45000.00', '25000.00', '20000.00', '2025-11-11 14:52:13'),
(10, 10, 5, 1, '30000.00', '35000.00', '35000.00', '30000.00', '5000.00', '2025-11-11 14:52:13'),
(11, 11, 4, 1, '25000.00', '45000.00', '45000.00', '25000.00', '20000.00', '2025-11-15 23:34:48');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi_service_detail`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `transaksi_service_detail`
--

INSERT INTO `transaksi_service_detail` (`id_detail`, `id_transaksi`, `id_pricelist`, `id_capster`, `harga`, `persentase_capster`, `komisi_capster`, `created_at`) VALUES
(1, 3, 3, 2, '40000.00', '10.00', '4000.00', '2025-11-11 03:06:02'),
(2, 4, 4, 2, '50000.00', '10.00', '5000.00', '2025-11-11 03:08:54'),
(3, 7, 4, 1, '50000.00', '10.00', '5000.00', '2025-11-11 03:21:36'),
(4, 12, 4, 3, '50000.00', '10.00', '5000.00', '2025-11-19 22:05:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `nama_user`, `username`, `password`, `role`, `id_store`, `id_capster`, `created_at`, `id_kasir`) VALUES
(1, 'I Made Desta Arwan', 'admin', '$2b$10$INGIMHQp7g3VqnkpuUEQd.eC/7AsfJ4ZTOENfR2wnHohkYUC69GA.', 'admin', NULL, NULL, '2025-11-11 02:18:05', NULL),
(2, 'Kasir Le Muani 1', 'kasir1', '$2b$10$7veUoYCTbgLISbrbwKCSVuODc4JeWuUyddoV2gyUdsKKdyhB21e.O', 'kasir', 1, NULL, '2025-11-11 02:18:05', NULL),
(6, 'Kasir Le Muani 2', 'dedii', '$2b$10$wKQkAVJRR9AFy9J/Idi.CuBsLXMRWmfSarVvBrOjVoYvRkgcgbr4m', 'kasir', 2, NULL, '2025-11-11 14:00:20', NULL),
(7, 'Kasir Le Muani 3', 'kasir3', '$2b$10$5oNM/IDMpisrhD7abP6rzu2xq0CMoj0XsgLeXE5zP43/aEKuc8QCC', 'kasir', 3, NULL, '2025-11-11 14:01:00', NULL),
(10, 'Rian', 'rian', '$2b$10$qaI2weppHp8WKMZI907Sg.iJeYQAflqWH0LwD8YZ2UBid/.mDqdl2', 'capster', 1, 2, '2025-11-11 14:10:38', NULL),
(11, 'Budi', 'budi', '$2b$10$Uq3bNe6Wjuhmy//JJeJ3y.ZUQy8FISC6npgnZEYvUIbbrYSiJv2U.', 'capster', 1, 1, '2025-11-11 16:23:42', NULL),
(17, 'Dedi', 'dedi', '$2b$10$uaBWA8yuvoYY4tWdAgYVDOO1VvyO6/MPOqKBrK/uwxcyRPP85IGyK', 'kasir', 2, NULL, '2025-11-14 00:05:55', 2),
(18, 'Tono', 'tono', '$2b$10$vnxPQQk9C3LlCpWDfF3YneNH5aNPXyZ2zor36iyVP10kcns9XpXoK', 'capster', 3, 4, '2025-11-14 00:54:12', NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bonus`
--
ALTER TABLE `bonus`
  ADD PRIMARY KEY (`id_bonus`),
  ADD UNIQUE KEY `unique_bonus_periode` (`judul_bonus`,`periode`,`id_capster`,`id_user`),
  ADD KEY `fk_bonus_capster` (`id_capster`),
  ADD KEY `fk_bonus_user` (`id_user`),
  ADD KEY `fk_bonus_kasir` (`id_kasir`);

--
-- Indeks untuk tabel `capster`
--
ALTER TABLE `capster`
  ADD PRIMARY KEY (`id_capster`),
  ADD KEY `fk_capster_store` (`id_store`),
  ADD KEY `fk_capster_user` (`id_user`);

--
-- Indeks untuk tabel `gaji_setting`
--
ALTER TABLE `gaji_setting`
  ADD PRIMARY KEY (`id_gaji_setting`),
  ADD KEY `fk_gaji_capster` (`id_capster`),
  ADD KEY `fk_gaji_user` (`id_user`);

--
-- Indeks untuk tabel `kasbon`
--
ALTER TABLE `kasbon`
  ADD PRIMARY KEY (`id_kasbon`),
  ADD KEY `idx_kasbon_capster` (`id_capster`),
  ADD KEY `fk_kasbon_kasir` (`id_kasir`);

--
-- Indeks untuk tabel `kasir`
--
ALTER TABLE `kasir`
  ADD PRIMARY KEY (`id_kasir`),
  ADD KEY `fk_kasir_store` (`id_store`),
  ADD KEY `fk_kasir_user` (`id_user`);

--
-- Indeks untuk tabel `komisi_setting`
--
ALTER TABLE `komisi_setting`
  ADD PRIMARY KEY (`id_setting`),
  ADD KEY `fk_komisi_capster` (`id_capster`);

--
-- Indeks untuk tabel `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD PRIMARY KEY (`id_pengeluaran`),
  ADD KEY `fk_pengeluaran_store` (`id_store`),
  ADD KEY `fk_pengeluaran_user` (`id_user`);

--
-- Indeks untuk tabel `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  ADD PRIMARY KEY (`id_potongan`),
  ADD KEY `id_kasbon` (`id_kasbon`),
  ADD KEY `idx_potongan_periode` (`periode`),
  ADD KEY `fk_potongan_capster` (`id_capster`),
  ADD KEY `fk_potkasbon_kasir` (`id_kasir`);

--
-- Indeks untuk tabel `pricelist`
--
ALTER TABLE `pricelist`
  ADD PRIMARY KEY (`id_pricelist`);

--
-- Indeks untuk tabel `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`),
  ADD UNIQUE KEY `unik_nama_harga` (`nama_produk`,`harga_awal`,`harga_jual`);

--
-- Indeks untuk tabel `profil`
--
ALTER TABLE `profil`
  ADD PRIMARY KEY (`id_profil`);

--
-- Indeks untuk tabel `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD PRIMARY KEY (`id_stok`),
  ADD UNIQUE KEY `unique_store_produk` (`id_store`,`id_produk`),
  ADD UNIQUE KEY `unik_store_produk` (`id_store`,`id_produk`),
  ADD KEY `fk_stok_produk` (`id_produk`);

--
-- Indeks untuk tabel `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`id_store`);

--
-- Indeks untuk tabel `struk`
--
ALTER TABLE `struk`
  ADD PRIMARY KEY (`id_struk`),
  ADD UNIQUE KEY `nomor_struk` (`nomor_struk`),
  ADD KEY `fk_struk_transaksi` (`id_transaksi`);

--
-- Indeks untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `fk_transaksi_store` (`id_store`),
  ADD KEY `fk_transaksi_user` (`id_user`);

--
-- Indeks untuk tabel `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_produk_transaksi` (`id_transaksi`),
  ADD KEY `fk_produk_master` (`id_produk`);

--
-- Indeks untuk tabel `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_service_transaksi` (`id_transaksi`),
  ADD KEY `fk_service_pricelist` (`id_pricelist`),
  ADD KEY `fk_service_capster` (`id_capster`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_user_store` (`id_store`),
  ADD KEY `fk_user_capster` (`id_capster`),
  ADD KEY `fk_user_kasir` (`id_kasir`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bonus`
--
ALTER TABLE `bonus`
  MODIFY `id_bonus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `capster`
--
ALTER TABLE `capster`
  MODIFY `id_capster` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `gaji_setting`
--
ALTER TABLE `gaji_setting`
  MODIFY `id_gaji_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `kasbon`
--
ALTER TABLE `kasbon`
  MODIFY `id_kasbon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `kasir`
--
ALTER TABLE `kasir`
  MODIFY `id_kasir` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `komisi_setting`
--
ALTER TABLE `komisi_setting`
  MODIFY `id_setting` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `pengeluaran`
--
ALTER TABLE `pengeluaran`
  MODIFY `id_pengeluaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  MODIFY `id_potongan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `pricelist`
--
ALTER TABLE `pricelist`
  MODIFY `id_pricelist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `profil`
--
ALTER TABLE `profil`
  MODIFY `id_profil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `stok_produk`
--
ALTER TABLE `stok_produk`
  MODIFY `id_stok` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT untuk tabel `store`
--
ALTER TABLE `store`
  MODIFY `id_store` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `struk`
--
ALTER TABLE `struk`
  MODIFY `id_struk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `bonus`
--
ALTER TABLE `bonus`
  ADD CONSTRAINT `fk_bonus_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bonus_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bonus_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `capster`
--
ALTER TABLE `capster`
  ADD CONSTRAINT `fk_capster_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_capster_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `gaji_setting`
--
ALTER TABLE `gaji_setting`
  ADD CONSTRAINT `fk_gaji_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_gaji_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kasbon`
--
ALTER TABLE `kasbon`
  ADD CONSTRAINT `fk_kasbon_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `kasbon_ibfk_2` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `kasir`
--
ALTER TABLE `kasir`
  ADD CONSTRAINT `fk_kasir_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_kasir_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `komisi_setting`
--
ALTER TABLE `komisi_setting`
  ADD CONSTRAINT `fk_komisi_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD CONSTRAINT `fk_pengeluaran_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pengeluaran_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `potongan_kasbon`
--
ALTER TABLE `potongan_kasbon`
  ADD CONSTRAINT `fk_potkasbon_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `fk_potongan_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `potongan_kasbon_ibfk_1` FOREIGN KEY (`id_kasbon`) REFERENCES `kasbon` (`id_kasbon`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `stok_produk`
--
ALTER TABLE `stok_produk`
  ADD CONSTRAINT `fk_stok_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stok_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `struk`
--
ALTER TABLE `struk`
  ADD CONSTRAINT `fk_struk_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_transaksi_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transaksi_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaksi_produk_detail`
--
ALTER TABLE `transaksi_produk_detail`
  ADD CONSTRAINT `fk_produk_master` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_produk_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaksi_service_detail`
--
ALTER TABLE `transaksi_service_detail`
  ADD CONSTRAINT `fk_service_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_service_pricelist` FOREIGN KEY (`id_pricelist`) REFERENCES `pricelist` (`id_pricelist`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_service_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_capster` FOREIGN KEY (`id_capster`) REFERENCES `capster` (`id_capster`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir` (`id_kasir`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_store` FOREIGN KEY (`id_store`) REFERENCES `store` (`id_store`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
