import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin, isKasir } from "../middlewares/role.middleware.js";
import {
  getCapsters,
  getCapsterById,
  getCapsterByStore,
  createCapster,
  updateCapster,
  deleteCapster,
} from "../controllers/capster.controller.js";

const router = express.Router();

/* ===========================================================
   🧩 ADMIN ROUTES
   -----------------------------------------------------------
   - Dapat mengelola semua capster dari seluruh store
   - Akses penuh: get, post, put, delete
=========================================================== */
router.get("/", verifyToken, isAdmin, getCapsters);
router.get("/:id", verifyToken, isAdmin, getCapsterById);
router.post("/", verifyToken, isAdmin, createCapster);
router.put("/:id", verifyToken, isAdmin, updateCapster);
router.delete("/:id", verifyToken, isAdmin, deleteCapster);

/* ===========================================================
   🧩 KASIR ROUTES
   -----------------------------------------------------------
   - Hanya bisa melihat & kelola capster yang ada di tokonya
   - Endpoint kasir tidak boleh bentrok dengan milik admin
=========================================================== */

// 🔹 Ambil semua capster milik store kasir
router.get("/kasir/store/:id_store", verifyToken, isKasir, getCapsterByStore);

// 🔹 Tambah capster di store kasir
router.post("/kasir", verifyToken, isKasir, createCapster);

// 🔹 Update capster di store kasir
router.put("/kasir/:id", verifyToken, isKasir, updateCapster);
router.get("/kasir/:id", verifyToken, isKasir, getCapsterById);

// 🔹 Hapus capster di store kasir
router.delete("/kasir/:id", verifyToken, isKasir, deleteCapster);

export default router;
