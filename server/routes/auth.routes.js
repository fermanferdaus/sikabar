import express from "express";
import { login, checkToken } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Login user
router.post("/login", login);

// 🧠 Validasi token aktif
router.get("/check", verifyToken, checkToken);

export default router;
