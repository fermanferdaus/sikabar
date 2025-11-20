import express from "express";
import {
  getProfil,
  updateProfil,
  updateLogo,
} from "../controllers/profil.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import uploadLogo from "../middlewares/profil.middleware.js";

const router = express.Router();

router.get("/", getProfil);
router.put("/", verifyToken, isAdmin, updateProfil);
router.put("/logo", verifyToken, isAdmin, uploadLogo, updateLogo);

export default router;
