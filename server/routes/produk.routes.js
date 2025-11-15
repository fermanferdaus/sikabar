import express from "express";
import {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  getStokPerStore,
  getProdukByStore,
  addStokProduk,
  getStokByStoreAndProduk,
  updateStokProduk,
  deleteStokProduk,
  addProdukByKasir,
} from "../controllers/produk.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

/* =======================================================
   🧾 RUTE KHUSUS KASIR (Tambah/Edit Produk di Tokonya)
   ======================================================= */

// 🔸 Tambah produk + stok baru (kasir)
router.post("/kasir/add", verifyToken, addProdukByKasir);

// 🔸 Update stok produk di tokonya sendiri
router.put("/kasir/update", verifyToken, updateStokProduk);

// 🔸 Hapus stok produk di tokonya sendiri
router.delete(
  "/kasir/delete/:id_store/:id_produk",
  verifyToken,
  deleteStokProduk
);

/* =======================================================
   📦 RUTE STOK PRODUK PER STORE
   ======================================================= */

// 🔹 Ambil stok 1 produk di store (kasir & admin)
router.get("/stok/:id_store/:id_produk", verifyToken, getStokByStoreAndProduk);

// 🔹 Update stok produk di store (admin & kasir)
router.post("/stok/update", verifyToken, updateStokProduk);

// 🔹 Hapus stok produk di toko tertentu (admin & kasir)
router.delete("/stok/:id_store/:id_produk", verifyToken, deleteStokProduk);

// 🔹 Rekap total stok semua store (admin only)
router.get("/stok", verifyToken, isAdmin, getStokPerStore);

// 🔹 Ambil daftar produk & stok per store (kasir & admin)
router.get("/stok/:id_store", verifyToken, getProdukByStore);

// 🔹 Tambah stok produk ke toko tertentu (admin & kasir)
router.post("/stok", verifyToken, addStokProduk);

/* =======================================================
   🛒 RUTE PRODUK UTAMA
   ======================================================= */

// 🔹 Ambil semua produk (admin bisa lihat semua)
router.get("/", verifyToken, getAllProduk);

// 🔹 Ambil produk berdasarkan ID
router.get("/:id", verifyToken, getProdukById);

// 🔹 Tambah produk baru (admin only)
router.post("/", verifyToken, isAdmin, createProduk);

// 🔹 Update produk (admin only)
router.put("/:id", verifyToken, updateProduk);

// 🔹 Hapus produk (admin only)
router.delete("/:id", verifyToken, isAdmin, deleteProduk);

export default router;
