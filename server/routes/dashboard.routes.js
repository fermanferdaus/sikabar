import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isCapster } from "../middlewares/role.middleware.js";
import {
  getCapsterDashboard,
  getCapsterChartData,
  getKasirDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/capster/:id_capster", verifyToken, isCapster, getCapsterDashboard);
router.get("/capster/chart/:id_capster", verifyToken, getCapsterChartData);
router.get("/kasir/:id_kasir", verifyToken, getKasirDashboard);

export default router;
