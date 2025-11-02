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
  updateGajiSetting
} from "../controllers/gajiSetting.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ===============================
// 💼 ROUTE: Gaji Pokok
// ===============================
router.get("/setting", verifyToken, getAllGajiSetting);
router.post("/setting", verifyToken, createOrUpdateGajiSetting);
// 💼 Update Gaji Pokok by ID
router.put("/setting/:id", verifyToken, updateGajiSetting);


// ===============================
// 🎁 ROUTE: Bonus
// ===============================
router.get("/bonus", verifyToken, getAllBonus);
router.get("/bonus/:id", verifyToken, getBonusById);
router.post("/bonus", verifyToken, addBonus);
router.put("/bonus/:id", verifyToken, updateBonus); 
router.delete("/bonus/:id", verifyToken, deleteBonus);
router.delete("/gaji-setting/:id", deleteGajiSetting);


export default router;
