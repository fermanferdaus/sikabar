import express from "express";
import {
  getLaporanPemasukan,
  getLaporanPengeluaran,
  getLaporanPemasukanKasir,
  getLaporanPengeluaranKasir
} from "../controllers/laporan.controller.js";

const router = express.Router();

router.get("/pemasukan", getLaporanPemasukan);
router.get("/pemasukan/kasir", getLaporanPemasukanKasir);
router.get("/pengeluaran", getLaporanPengeluaran);
router.get("/pengeluaran/kasir", getLaporanPengeluaranKasir);

export default router;
