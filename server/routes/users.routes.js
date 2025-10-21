import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// Semua route ini hanya untuk admin
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.post("/", verifyToken, isAdmin, createUser);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
