import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import uploadPengeluaran from "../middlewares/pengeluaran.middleware.js";
import {
  getPengeluaran,
  getTotalPengeluaran,
  addPengeluaran,
  deletePengeluaran,
  updatePengeluaran,
  getPengeluaranByStore,
} from "../controllers/pengeluaran.controller.js";

const router = express.Router();

/* ======================================================
   🧾 ROUTES PENGELUARAN
   ------------------------------------------------------
   - Admin → bisa melihat semua cabang
   - Kasir → hanya cabangnya sendiri
====================================================== */

// 🔹 Ambil semua pengeluaran (kasir: hanya cabangnya)
router.get("/", verifyToken, getPengeluaran);

// 🔹 Ambil total pengeluaran per cabang (admin & kasir)
router.get("/total", verifyToken, getTotalPengeluaran);

// 🔹 Ambil pengeluaran detail berdasarkan cabang tertentu
router.get("/store/:id_store", verifyToken, getPengeluaranByStore);

// 🔹 Tambah pengeluaran baru (admin & kasir)
router.post("/", verifyToken, uploadPengeluaran, addPengeluaran);

// 🔹 Update pengeluaran (admin & kasir)
router.put("/:id", verifyToken, uploadPengeluaran, updatePengeluaran);

// 🔹 Hapus pengeluaran (admin & kasir)
router.delete("/:id", verifyToken, deletePengeluaran);

export default router;
