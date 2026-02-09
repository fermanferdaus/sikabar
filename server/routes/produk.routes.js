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
  closingStokBulanan,
} from "../controllers/produk.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { cronAuth } from "../middlewares/cron.middleware.js";

const router = express.Router();

router.post("/kasir/add", verifyToken, addProdukByKasir);
router.put("/kasir/update", verifyToken, updateStokProduk);
router.delete(
  "/kasir/delete/:id_store/:id_produk",
  verifyToken,
  deleteStokProduk,
);
router.get("/stok/:id_store/:id_produk", verifyToken, getStokByStoreAndProduk);
router.post("/stok/update", verifyToken, updateStokProduk);
router.delete("/stok/:id_store/:id_produk", verifyToken, deleteStokProduk);
router.get("/stok", verifyToken, isAdmin, getStokPerStore);
router.get("/stok/:id_store", verifyToken, getProdukByStore);
router.post("/stok", verifyToken, addStokProduk);

router.get("/", verifyToken, getAllProduk);
router.get("/:id", verifyToken, getProdukById);
router.post("/", verifyToken, isAdmin, createProduk);
router.put("/:id", verifyToken, updateProduk);
router.delete("/:id", verifyToken, isAdmin, deleteProduk);

router.post("/closing-stok", cronAuth, closingStokBulanan);

export default router;
