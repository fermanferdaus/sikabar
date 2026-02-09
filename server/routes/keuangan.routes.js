import express from "express";
import {
  getKeuangan,
  getKeuanganSummary,
  getKeuanganStoreSummary,
  getKeuanganStoreGrafik
} from "../controllers/keuangan.controller.js";

const router = express.Router();

router.get("/keuangan", getKeuangan);
// 🔹 Untuk grafik keuangan per tanggal
router.get("/transaksi/keuangan", getKeuangan);

// 🔹 Untuk ringkasan total per cabang
router.get("/keuangan/summary", getKeuanganSummary);
router.get("/keuangan/store/:id_store", getKeuanganStoreSummary);
router.get("/keuangan/store/:id_store/grafik", getKeuanganStoreGrafik);

export default router;
