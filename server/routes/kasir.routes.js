import express from "express";
import {
  getKasir,
  getKasirById,
  getKasirByStore,
  createKasir,
  updateKasir,
  deleteKasir,
  getKasirDashboard,
} from "../controllers/kasir.controller.js";

const router = express.Router();

router.get("/", getKasir);
router.get("/:id", getKasirById);
router.get("/store/:id_store", getKasirByStore);
router.post("/", createKasir);
router.put("/:id", updateKasir);
router.delete("/:id", deleteKasir);

// Dashboard kasir
router.get("/dashboard/:id_kasir", getKasirDashboard);

export default router;
