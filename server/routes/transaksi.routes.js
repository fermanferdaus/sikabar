import express from "express";
import {
  getTransaksiByStore,
  getAllTransaksi,
  createTransaksi,
  deleteTransaksi,
  getLaporanTransaksi,
  getTransaksiByStoreAdmin,
  getKeuanganChart,
  getKeuanganByStore
} from "../controllers/transaksi.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin, isKasir } from "../middlewares/role.middleware.js";

const router = express.Router();

// ================== ADMIN ==================
router.get("/laporan", verifyToken, isAdmin, getLaporanTransaksi);
router.get("/store/:id_store", verifyToken, isAdmin, getTransaksiByStoreAdmin);
router.get("/admin", verifyToken, isAdmin, getAllTransaksi);
router.get("/keuangan", verifyToken, isAdmin, getKeuanganChart);
router.delete("/:id", verifyToken, isAdmin, deleteTransaksi);

// ================== KASIR ==================
router.get("/keuangan/:id_store", verifyToken, isKasir, getKeuanganByStore);
router.get("/keuangan/store/:id_store", verifyToken, isAdmin, getKeuanganByStore);
router.get("/", verifyToken, isKasir, getTransaksiByStore);
router.post("/", verifyToken, isKasir, createTransaksi);

export default router;
