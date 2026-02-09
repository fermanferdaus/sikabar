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
import komisiSettingRoutes from "./routes/komisiSetting.route.js";
import gajiSettingRoutes from "./routes/gajiSetting.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import pengeluaranRoutes from "./routes/pengeluaran.routes.js";
import keuanganRoutes from "./routes/keuangan.routes.js";
import strukRoutes from "./routes/struk.routes.js";
import laporanRoutes from "./routes/laporan.routes.js";
import kasbonRoutes from "./routes/kasbon.routes.js";
import potonganRoutes from "./routes/potongan.routes.js";
import kasirRoutes from "./routes/kasir.routes.js";
import profilRoutes from "./routes/profil.routes.js";

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
app.use("/api/gaji", gajiSettingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pengeluaran", pengeluaranRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/struk", strukRoutes);
app.use("/api/kasbon", kasbonRoutes);
app.use("/api/potongan", potonganRoutes);
app.use("/api/kasir", kasirRoutes);
app.use("/api/profil", profilRoutes);
app.use("/api", keuanganRoutes);
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// === Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));