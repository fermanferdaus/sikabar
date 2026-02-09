import express from "express";
import {
  getAllGajiSetting,
  createOrUpdateGajiSetting,
  addBonus,
  getAllBonus,
  deleteBonus,
  deleteGajiSetting,
  getBonusById,
  updateBonus,
  updateGajiSetting,
  updateBonusStatus,
  getSlipGaji,
  getAllPegawaiGaji
} from "../controllers/gajiSetting.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===============================
// 💼 ROUTE: Gaji Pokok
// ===============================
router.get("/setting", verifyToken, getAllGajiSetting);
router.post("/setting", verifyToken, createOrUpdateGajiSetting);
router.put("/setting/:id", verifyToken, updateGajiSetting);

// ===============================
// 🎁 ROUTE: Bonus
// ===============================
router.get("/bonus", verifyToken, getAllBonus);
router.get("/bonus/:id", verifyToken, getBonusById);
router.post("/bonus", verifyToken, addBonus);
router.put("/bonus/:id", verifyToken, updateBonus);
router.put("/bonus/status/:id", verifyToken, updateBonusStatus);
router.delete("/bonus/:id", verifyToken, deleteBonus);
router.delete("/gaji-setting/:id", deleteGajiSetting);

// ===============================
// 🧾 ROUTE: Slip Gaji (Kasir & Capster)
// ===============================
router.get("/slip", verifyToken, getSlipGaji);
router.get("/pegawai-all", verifyToken, getAllPegawaiGaji);

export default router;
