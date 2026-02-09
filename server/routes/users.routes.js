import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUserByName,
  checkUsername,
} from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// === ROUTE SPESIFIK WAJIB DI ATAS ===
router.get("/check-username/:username", checkUsername);
router.get("/search/:nama", verifyToken, isAdmin, searchUserByName);

// === ROUTE DEFAULT ===
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.post("/", verifyToken, isAdmin, createUser);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
