import express from "express";
import {
  getAllKasbon,
  getKasbonByCapster,
  getKasbonById,
  createKasbon,
  updateKasbon,
  deleteKasbon,
} from "../controllers/kasbon.controller.js";

const router = express.Router();

router.get("/", getAllKasbon);
router.get("/capster/:id_capster", getKasbonByCapster);
router.get("/:id", getKasbonById);
router.post("/", createKasbon);
router.put("/:id", updateKasbon);
router.delete("/:id", deleteKasbon);

export default router;
