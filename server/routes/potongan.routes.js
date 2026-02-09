import express from "express";
import {
  getAllPotongan,
  getPotonganByCapster,
  getPotonganById,
  createPotongan,
  updatePotongan,
  deletePotongan,
} from "../controllers/potongan.controller.js";

const router = express.Router();

// ⚠️ Urutan penting: rute spesifik (capster) harus di atas rute dinamis (/:id)
router.get("/", getAllPotongan);
router.get("/capster/:id_capster", getPotonganByCapster);
router.get("/:id", getPotonganById);
router.post("/", createPotongan);
router.put("/:id", updatePotongan);
router.delete("/:id", deletePotongan);

export default router;
