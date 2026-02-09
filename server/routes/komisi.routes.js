import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isCapster, isAdmin } from "../middlewares/role.middleware.js";
import {
  getKomisiCapster,
  getAllKomisi,
  getKomisiCapsterById,
} from "../controllers/komisi.controller.js";

const router = express.Router();

/**
 * 💈 Capster lihat komisi sendiri
 * GET /api/komisi/me
 */
router.get("/me", verifyToken, isCapster, getKomisiCapster);

/**
 * 👑 Admin lihat semua komisi capster
 * GET /api/komisi
 */
router.get("/", verifyToken, isAdmin, getAllKomisi);

/**
 * 👑 Admin lihat komisi capster tertentu berdasarkan ID
 * GET /api/komisi/:id_capster
 */
router.get("/:id_capster", verifyToken, isAdmin, getKomisiCapsterById);

export default router;
