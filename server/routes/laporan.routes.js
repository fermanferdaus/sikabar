import express from "express";
import {
  getLaporanPengeluaran,
  getLaporanPengeluaranKasir,
  getLaporanProduk,
  getLaporanProdukKasir,
  getLaporanPenjualanProduk,
  getLaporanPenjualanProdukKasir,
  getLaporanPendapatanProduk,
  getLaporanPendapatanJasa,
  getLaporanPendapatanProdukKasir,
  getLaporanPendapatanJasaKasir,
} from "../controllers/laporan.controller.js";

const router = express.Router();

router.get("/pengeluaran", getLaporanPengeluaran);
router.get("/pengeluaran/kasir", getLaporanPengeluaranKasir);
router.get("/produk", getLaporanProduk);
router.get("/produk-kasir", getLaporanProdukKasir);
router.get("/penjualan-produk", getLaporanPenjualanProduk);
router.get("/penjualan-produk-kasir", getLaporanPenjualanProdukKasir);
router.get("/pendapatan-produk", getLaporanPendapatanProduk);
router.get("/pendapatan-produk-kasir", getLaporanPendapatanProdukKasir);
router.get("/pendapatan-jasa", getLaporanPendapatanJasa);
router.get("/pendapatan-jasa-kasir", getLaporanPendapatanJasaKasir);

export default router;
