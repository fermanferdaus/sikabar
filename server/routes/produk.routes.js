import express from "express";
import {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  getStokPerStore,
  getProdukByStore
} from "../controllers/produk.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllProduk);
router.get("/stok", verifyToken, isAdmin, getStokPerStore); // ⬆️ Pindahkan ke atas
router.get("/stok/:id_store", verifyToken, isAdmin, getProdukByStore); // ⬆️ Pindahkan ke atas
router.get("/:id", verifyToken, getProdukById);
router.post("/", verifyToken, isAdmin, createProduk);
router.put("/:id", verifyToken, isAdmin, updateProduk);
router.delete("/:id", verifyToken, isAdmin, deleteProduk);

export default router;
