import express from "express";
import {
  getCapsters,
  getCapsterById,
  getCapsterByStore,
  createCapster,
  updateCapster,
  deleteCapster,
} from "../controllers/capster.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// 🟢 Semua capster (admin)
router.get("/", verifyToken, getCapsters);

// 🔵 Capster per store (kasir)
router.get("/store/:id_store", verifyToken, getCapsterByStore);

// 🔵 Capster by ID
router.get("/:id", verifyToken, getCapsterById);

// 🟡 Tambah capster (admin)
router.post("/", verifyToken, isAdmin, createCapster);

// 🟠 Update capster (admin)
router.put("/:id", verifyToken, isAdmin, updateCapster);

// 🔴 Hapus capster (admin)
router.delete("/:id", verifyToken, isAdmin, deleteCapster);

export default router;
