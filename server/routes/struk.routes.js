import express from "express";
import { printStruk } from "../controllers/struk.controller.js";

const router = express.Router();

/* ======================================================
   🧾 CETAK STRUK TANPA TOKEN (boleh diakses langsung)
   ====================================================== */
router.get("/print/:id", printStruk);

export default router;
