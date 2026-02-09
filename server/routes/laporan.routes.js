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
  getLaporanKas,
  getLaporanKasKasir,
  getLaporanPendapatanStore,
  getLaporanPendapatan,
} from "../controllers/laporan.controller.js";

const router = express.Router();

router.get("/pengeluaran/kasir", getLaporanPengeluaranKasir);
router.get("/pengeluaran", getLaporanPengeluaran);
router.get("/produk", getLaporanProduk);
router.get("/produk-kasir", getLaporanProdukKasir);
router.get("/penjualan-produk", getLaporanPenjualanProduk);
router.get("/penjualan-produk-kasir", getLaporanPenjualanProdukKasir);
router.get("/pendapatan-produk", getLaporanPendapatanProduk);
router.get("/pendapatan-produk-kasir", getLaporanPendapatanProdukKasir);
router.get("/pendapatan-jasa", getLaporanPendapatanJasa);
router.get("/pendapatan-jasa-kasir", getLaporanPendapatanJasaKasir);
router.get("/arus-kas", getLaporanKas);
router.get("/arus-kas-kasir", getLaporanKasKasir);
router.get("/pendapatan", getLaporanPendapatan);
router.get("/pendapatan-store", getLaporanPendapatanStore);

export default router;
