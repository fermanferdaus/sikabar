import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardKasir from "./pages/dashboard/DashboardKasir";
import Produk from "./pages/produk/Produk";
import Capster from "./pages/capster/Capster";
import Transaksi from "./pages/transaksi/Transaksi";
import Komisi from "./pages/komisi/Komisi";
import Users from "./pages/users/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import KomisiDetail from "./pages/komisi/KomisiDetail";
import Store from "./pages/store/Store";
import StoreAdd from "./pages/store/StoreAdd";
import StoreEdit from "./pages/store/StoreEdit";
import KomisiSetting from "./pages/komisi/KomisiSetting";
import Pricelist from "./pages/pricelist/Pricelist";
import KomisiAdd from "./pages/komisi/KomisiAdd";
import KomisiEdit from "./pages/komisi/KomisiEdit";
import TransaksiAdmin from "./pages/transaksi/TransaksiAdmin";
import TransaksiDetail from "./pages/transaksi/TransaksiDetail";
import RiwayatTransaksiKasir from "./pages/transaksi/RiwayatTransaksiKasir";
import ProdukStokDetail from "./pages/produk/ProdukStokDetail";
import ProdukAdd from "./pages/produk/ProdukAdd";
import ProdukEdit from "./pages/produk/ProdukEdit";
import ProdukKasir from "./pages/produk/ProdukKasir";
import ProdukAddKasir from "./pages/produk/ProdukAddKasir";
import ProdukEditKasir from "./pages/produk/ProdukEditKasir";
import CapsterAdd from "./pages/capster/CapsterAdd";
import CapsterEdit from "./pages/capster/CapsterEdit";
import PricelistAdd from "./pages/pricelist/PricelistAdd";
import PricelistEdit from "./pages/pricelist/PricelistEdit";
import UsersAdd from "./pages/users/UsersAdd";
import UsersEdit from "./pages/users/UsersEdit";
import CapsterKasir from "./pages/capster/CapsterKasir";
import CapsterAddKasir from "./pages/capster/CapsterAddKasir";
import CapsterEditKasir from "./pages/capster/CapsterEditKasir";
import Gaji from "./pages/gaji/Gaji";
import GajiAdd from "./pages/gaji/GajiAdd";
import GajiEdit from "./pages/gaji/GajiEdit";
import BonusAdd from "./pages/gaji/BonusAdd";
import BonusEdit from "./pages/gaji/BonusEdit";
import CapsterDashboard from "./pages/dashboard/DashboardCapster";
import Pengeluaran from "./pages/pengeluaran/Pengeluaran";
import PengeluaranDetail from "./pages/pengeluaran/PengeluaranDetail";
import PengeluaranAdminAdd from "./pages/pengeluaran/PengeluaranAdminAdd";
import PengeluaranAdminEdit from "./pages/pengeluaran/PengeluaranAdminEdit";
import PengeluaranKasir from "./pages/pengeluaran/PengeluaranKasir";
import PengeluaranKasirAdd from "./pages/pengeluaran/PengeluaranKasirAdd";
import PengeluaranKasirEdit from "./pages/pengeluaran/PengeluaranKasirEdit";
import LaporanPemasukan from "./pages/laporan/LaporanPemasukan";
import LaporanPengeluaran from "./pages/laporan/LaporanPengeluran";
import LaporanPemasukanKasir from "./pages/laporan/LaporanPemasukanKasir";
import LaporanPengeluaranKasir from "./pages/laporan/LaporanPengeluaranKasir";
import SlipGaji from "./pages/gaji/SlipGaji";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD - Admin, Kasir, Capster */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "kasir", "capster"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <DashboardKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/capster"
          element={
            <ProtectedRoute allowedRoles={["capster"]}>
              <CapsterDashboard />
            </ProtectedRoute>
          }
        />
        {/* CAPSTER - Admin */}
        <Route
          path="/capster"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Capster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capster/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CapsterAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capster/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CapsterEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capster/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <CapsterKasir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capster/kasir/add"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <CapsterAddKasir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capster/kasir/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <CapsterEditKasir />
            </ProtectedRoute>
          }
        />

        {/* PRODUK - Admin */}
        <Route
          path="/produk"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Produk />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProdukAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk/stok/:id_store"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProdukStokDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProdukEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <ProdukKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk/kasir/add"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <ProdukAddKasir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produk/kasir/edit/:id_produk"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <ProdukEditKasir />
            </ProtectedRoute>
          }
        />

        {/* TRANSAKSI - Admin & Kasir */}
        {/* Transaksi untuk Kasir */}
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <Transaksi />
            </ProtectedRoute>
          }
        />

        {/* Transaksi untuk Admin */}
        <Route
          path="/transaksi/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TransaksiAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transaksi/admin/store/:id_store"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TransaksiDetail />
            </ProtectedRoute>
          }
        />

        {/* Kasir - Riwayat Transaksi */}
        <Route
          path="/riwayat"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <RiwayatTransaksiKasir />
            </ProtectedRoute>
          }
        />

        {/* KOMISI - Capster & Admin */}
        <Route
          path="/komisi"
          element={
            <ProtectedRoute allowedRoles={["admin", "capster"]}>
              <Komisi /> {/* Halaman daftar capster */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/komisi/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiDetail /> {/* Halaman detail capster */}
            </ProtectedRoute>
          }
        />

        {/* USERS - Admin */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Store />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StoreAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StoreEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricelist"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Pricelist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricelist/add"
          element={
            <ProtectedRoute>
              <PricelistAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricelist/edit/:id"
          element={
            <ProtectedRoute>
              <PricelistEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/komisi-setting"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/komisi-setting/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/komisi-setting/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiEdit />
            </ProtectedRoute>
          }
        />

        {/* 💼 GAJI & BONUS */}
        <Route
          path="/gaji"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Gaji />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gaji/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GajiAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gaji/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GajiEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gaji/bonus/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BonusAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gaji/bonus/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BonusEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/slip-gaji"
          element={
            <ProtectedRoute allowedRoles={["kasir", "capster"]}>
              <SlipGaji />
            </ProtectedRoute>
          }
        />

        {/* 💸 PENGELUARAN - Admin & Kasir */}
        <Route
          path="/pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Pengeluaran />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <PengeluaranKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/kasir/add"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <PengeluaranKasirAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/kasir/edit/:id_pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <PengeluaranKasirEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/:id_store"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PengeluaranDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PengeluaranAdminAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengeluaran/edit/:id_pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PengeluaranAdminEdit />
            </ProtectedRoute>
          }
        />

        {/* Laporan */}
        <Route
          path="/laporan/pemasukan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPemasukan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPengeluaran />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/pemasukan"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPemasukanKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPengeluaranKasir />
            </ProtectedRoute>
          }
        />

        {/* Default Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
