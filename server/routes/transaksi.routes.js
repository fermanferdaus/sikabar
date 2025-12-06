import express from "express";
import {
  getAllTransaksi,
  getLaporanTransaksi,
  getTransaksiByStoreAdmin,
  getTransaksiByStore,
  getKeuanganByStore,
  createTransaksi,
  deleteTransaksi,
  uploadBuktiQris,
} from "../controllers/transaksi.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin, isKasir } from "../middlewares/role.middleware.js";
import uploadQris from "../middlewares/uploadQris.middleware.js";

const router = express.Router();

/* =======================================================
   🟣 ADMIN ROUTES
   ======================================================= */

// 📊 Laporan semua store (dashboard admin)
router.get("/laporan", verifyToken, isAdmin, getLaporanTransaksi);

// 📋 Riwayat transaksi per store (admin melihat toko tertentu)
router.get("/store/:id_store", verifyToken, isAdmin, getTransaksiByStoreAdmin);

// 🧾 Semua transaksi (tanpa filter, jika dibutuhkan)
router.get("/admin", verifyToken, isAdmin, getAllTransaksi);

// 🗑️ Hapus transaksi (admin)
router.delete("/:id", verifyToken, isAdmin, deleteTransaksi);

/* =======================================================
   🔵 KASIR ROUTES
   ======================================================= */

// 📄 Riwayat transaksi kasir (otomatis berdasarkan req.user.id_store)
router.get("/", verifyToken, isKasir, getTransaksiByStore);

// 💰 Data keuangan (grafik pendapatan harian/bulanan per store)
router.get("/keuangan/:id_store", verifyToken, isKasir, getKeuanganByStore);

// ➕ Tambah transaksi baru
router.post("/", verifyToken, isKasir, createTransaksi);

router.post("/upload-bukti", verifyToken, isKasir, uploadQris, uploadBuktiQris);

export default router;
