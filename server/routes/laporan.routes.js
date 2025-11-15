import express from "express";
import {
  getLaporanPemasukan,
  getLaporanPengeluaran,
  getLaporanPemasukanKasir,
  getLaporanPengeluaranKasir,
  getLaporanProduk,
  getLaporanPenjualanProduk,
  getLaporanStokProduk,
} from "../controllers/laporan.controller.js";

const router = express.Router();

router.get("/pemasukan", getLaporanPemasukan);
router.get("/pemasukan/kasir", getLaporanPemasukanKasir);
router.get("/pengeluaran", getLaporanPengeluaran);
router.get("/pengeluaran/kasir", getLaporanPengeluaranKasir);
router.get("/produk", getLaporanProduk);
router.get("/penjualan-produk", getLaporanPenjualanProduk);
router.get("/stok-produk", getLaporanStokProduk);

export default router;
