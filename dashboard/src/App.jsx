import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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

        {/* CAPSTER - Admin */}
        <Route
          path="/capster"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Capster />
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
          path="/produk/addkasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <ProdukAddKasir  />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produk/editkasir/:id_produk"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              <ProdukEditKasir  />
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
          path="/transaksi/store/:id_store"
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

        {/* Default Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
