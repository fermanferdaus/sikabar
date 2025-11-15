import express from "express";
import { printStruk, generateNomorStruk } from "../controllers/struk.controller.js";

const router = express.Router();

/* ======================================================
   🧾 CETAK STRUK TANPA TOKEN (boleh diakses langsung)
   ====================================================== */
router.get("/print/:id", printStruk);
router.get("/generate", generateNomorStruk);

export default router;
