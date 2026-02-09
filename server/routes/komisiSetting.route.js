import express from "express";
import {
  getAllKomisiSetting,
  getKomisiSettingById,
  createKomisiSetting,
  updateKomisiSetting,
  deleteKomisiSetting,
} from "../controllers/komisiSetting.controller.js";

const router = express.Router();

router.get("/", getAllKomisiSetting);
router.get("/:id", getKomisiSettingById);
router.post("/", createKomisiSetting);
router.put("/:id", updateKomisiSetting);
router.delete("/:id", deleteKomisiSetting);

export default router;
