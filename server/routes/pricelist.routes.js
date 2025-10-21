import express from "express";
import {
  getAllPricelist,
  getPricelistById,
  createPricelist,
  updatePricelist,
  deletePricelist,
} from "../controllers/pricelist.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllPricelist);
router.get("/:id", verifyToken, getPricelistById);
router.post("/", verifyToken, isAdmin, createPricelist);
router.put("/:id", verifyToken, isAdmin, updatePricelist);
router.delete("/:id", verifyToken, isAdmin, deletePricelist);

export default router;
