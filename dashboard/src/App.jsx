import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardKasir from "./pages/dashboard/DashboardKasir";
import Produk from "./pages/produk/Produk";
import Transaksi from "./pages/transaksi/Transaksi";
import Komisi from "./pages/komisi/Komisi";
import Users from "./pages/users/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import KomisiDetail from "./pages/komisi/KomisiDetail";
import Store from "./pages/store/Store";
import StoreAdd from "./pages/store/StoreAdd";
import StoreEdit from "./pages/store/StoreEdit";
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
import KasirAdd from "./pages/kasir/KasirAdd";
import KasirEdit from "./pages/kasir/KasirEdit";
import Gaji from "./pages/gaji/GajiDanBonus";
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
import LaporanPengeluaran from "./pages/laporan/LaporanPengeluran";
import LaporanPengeluaranKasir from "./pages/laporan/LaporanPengeluaranKasir";
import SlipGaji from "./pages/slip_gaji/SlipGaji";
import SlipGajiAdmin from "./pages/slip_gaji/SlipGajiAdmin";
import SlipGajiAdminDetail from "./pages/slip_gaji/SlipGajiAdminDetail";
import Kasbon from "./pages/kasbon/Kasbon";
import Potongan from "./pages/potongan/Potongan";
import KasbonAdd from "./pages/kasbon/KasbonAdd";
import KasbonEdit from "./pages/kasbon/KasbonEdit";
import PotonganAdd from "./pages/potongan/PotonganAdd";
import PotonganEdit from "./pages/potongan/PotonganEdit";
import LaporanProduk from "./pages/laporan/LaporanProduk";
import LaporanDataProdukKasir from "./pages/laporan/LaporanDataProdukKasir";
import LaporanPenjualanProduk from "./pages/laporan/LaporanPenjualanProduk";
import LaporanPenjualanProdukKasir from "./pages/laporan/LaporanPenjualanProdukKasir";
import LaporanPendapatanProduk from "./pages/laporan/LaporanPendapatanProduk";
import LaporanPendapatanJasa from "./pages/laporan/LaporanPendapatanJasa";
import LaporanPendapatanProdukKasir from "./pages/laporan/LaporanPendapatanProdukKasir";
import LaporanPendapatanJasaKasir from "./pages/laporan/LaporanPendapatanJasaKasir";
import Profil from "./pages/profil/Profil";
import ProfilEdit from "./pages/profil/ProfilEdit";
import Pegawai from "./pages/pegawai/pegawai";
import KomisiCapster from "./pages/komisi/KomisiCapster";
import Laporan from "./pages/laporan/Laporan";
import LaporanKasir from "./pages/laporan/LaporanKasir";
import NotFound from "./pages/NotFound";
import LaporanPendapatanKasir from "./pages/laporan/LaporanPendapatanKAsir";
import LaporanPendapatan from "./pages/laporan/laporan_pendapatan/LaporanPendapatan";
import LaporanPendapatanDetail from "./pages/laporan/laporan_pendapatan/LaporanPendapatanDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

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
          path="/pegawai"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Pegawai />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai/capster/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CapsterAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai/capster/edit/:id"
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

        {/* Kasir - Admin */}
        <Route
          path="/pegawai/kasir/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KasirAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pegawai/kasir/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KasirEdit />
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
            <ProtectedRoute allowedRoles={["admin"]}>
              <Komisi /> {/* Halaman daftar capster */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/komisi/capster"
          element={
            <ProtectedRoute allowedRoles={["capster"]}>
              <KomisiCapster />
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

        <Route
          path="/komisi/komisi-setting/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/komisi/komisi-setting/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KomisiEdit />
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
          path="/kasbon"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Kasbon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kasbon/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KasbonAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kasbon/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KasbonEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/potongan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Potongan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/potongan/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PotonganAdd />
            </ProtectedRoute>
          }
        />

        <Route
          path="/potongan/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PotonganEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/slip-admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SlipGajiAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/slip-admin/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SlipGajiAdminDetail />
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
              <PengeluaranKasirAdd />
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
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Laporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/produk"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanProduk />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/produk"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanDataProdukKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/penjualan-produk"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPenjualanProduk />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/penjualan-produk"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPenjualanProdukKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/pendapatan-produk"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPendapatanProduk />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/pendapatan-produk"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPendapatanProdukKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/pendapatan-jasa"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPendapatanJasa />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/pendapatan-jasa"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPendapatanJasaKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/pendapatan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPendapatan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/pendapatan/:id_store"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanPendapatanDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan/kasir/pendapatan-cabang"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPendapatanKasir />
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
          path="/laporan/kasir/pengeluaran"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <LaporanPengeluaranKasir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Profil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profil/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProfilEdit />
            </ProtectedRoute>
          }
        />

        {/* Default Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
