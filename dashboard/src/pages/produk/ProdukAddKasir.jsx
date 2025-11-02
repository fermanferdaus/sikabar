import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import formatRupiah from "../../utils/formatRupiah"; // pastikan path sesuai

export default function ProdukAddKasir() {
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga_awal: "",
    harga_jual: "",
    stok_awal: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showToast, setShowToast] = useState(false); // 🧩 kontrol toast muncul / hilang

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  // 🧠 Hapus non-digit dari rupiah → angka murni
  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nama_produk || !formData.harga_awal || !formData.harga_jual) {
      setErrorMsg("Semua field wajib diisi!");
      return;
    }

    const hargaAwalNum = parseRupiah(formData.harga_awal);
    const hargaJualNum = parseRupiah(formData.harga_jual);

    if (hargaJualNum < hargaAwalNum) {
      setErrorMsg("Harga jual tidak boleh lebih kecil dari harga awal!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/produk/kasir/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_store,
          nama_produk: formData.nama_produk,
          harga_awal: hargaAwalNum,
          harga_jual: hargaJualNum,
          jumlah_stok: Number(formData.stok_awal) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah produk");

      // ✅ Jika sukses
      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: `Produk "${formData.nama_produk}" berhasil ditambahkan!`,
        })
      );

      navigate(`/produk/kasir`);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 relative">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data produk baru untuk toko Anda.
          </p>
        </div>

        {/* 🔴 Alert Error (inline di atas form, tetap muncul saat toast hilang) */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          {/* Baris 1: Nama & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Nama Produk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                value={formData.nama_produk}
                onChange={(e) =>
                  setFormData({ ...formData, nama_produk: e.target.value })
                }
                placeholder="Masukkan nama produk"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Stok Awal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                value={formData.stok_awal}
                onChange={(e) =>
                  setFormData({ ...formData, stok_awal: e.target.value })
                }
                placeholder="Masukkan stok awal"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Baris 2: Harga Awal & Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Harga Awal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
                value={formData.harga_awal}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setFormData({
                    ...formData,
                    harga_awal: formatRupiah(raw),
                  });
                }}
                placeholder="Masukkan harga awal"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="text"
                value={formData.harga_jual}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setFormData({
                    ...formData,
                    harga_jual: formatRupiah(raw),
                  });
                }}
                placeholder="Masukkan harga jual"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/produk/kasir`)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
