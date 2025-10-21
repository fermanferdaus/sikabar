import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import AuthRoutes from "./routes/auth.routes.js";
import ProdukRoutes from "./routes/produk.routes.js";
import StoreRoutes from "./routes/store.routes.js";
import CapsterRoutes from "./routes/capster.routes.js";
import PricelistRoutes from "./routes/pricelist.routes.js";
import TransaksiRoutes from "./routes/transaksi.routes.js";
import KomisiRoutes from "./routes/komisi.routes.js";
import UserRoutes from "./routes/users.routes.js";
import komisiSettingRoutes from "./routes/komisiSetting.route.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// === Routes ===
app.use("/api/auth", AuthRoutes);
app.use("/api/produk", ProdukRoutes);
app.use("/api/store", StoreRoutes);
app.use("/api/capster", CapsterRoutes);
app.use("/api/pricelist", PricelistRoutes);
app.use("/api/transaksi", TransaksiRoutes);
app.use("/api/komisi", KomisiRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/komisi-setting", komisiSettingRoutes);

// === Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
