import express from "express";
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/store.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getStores);
router.get("/:id", verifyToken, getStoreById);
router.post("/", verifyToken, isAdmin, createStore);
router.put("/:id", verifyToken, isAdmin, updateStore);
router.delete("/:id", verifyToken, isAdmin, deleteStore);

export default router;
