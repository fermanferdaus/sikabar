import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isKasir } from "../middlewares/role.middleware.js";
import {
  createMidtransTransaction,
  checkMidtransStatus,
  cancelMidtransTransaction,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", verifyToken, isKasir, createMidtransTransaction);
router.get("/status/:order_id", checkMidtransStatus);
router.post("/cancel/:order_id", cancelMidtransTransaction);

export default router;
