import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import formatRupiah from "../../utils/formatRupiah"; // ⬅️ pastikan path-nya sesuai

export default function ProdukAdd() {
  const { addProduk, addStokProduk } = useProdukAPI();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_produk: "",
    harga_awal: "",
    harga_jual: "",
    stok_awal: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const fromStore = location.state?.fromStore || null;

  // 🔹 Fungsi bantu untuk parsing angka dari input rupiah
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
      const role = localStorage.getItem("role");
      const idStore = localStorage.getItem("id_store");

      if (role === "admin") {
        const produkBaru = await addProduk({
          nama_produk: formData.nama_produk,
          harga_awal: hargaAwalNum,
          harga_jual: hargaJualNum,
        });

        if (fromStore && formData.stok_awal) {
          await addStokProduk({
            id_produk: produkBaru.id,
            id_store: fromStore,
            jumlah_stok: Number(formData.stok_awal),
          });
        }
      }

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: `Produk "${formData.nama_produk}" berhasil ditambahkan!`,
        })
      );

      navigate(fromStore ? `/produk/stok/${fromStore}` : -1);
    } catch (error) {
      console.error("❌ Error submit:", error);
      setErrorMsg(error.message || "Terjadi kesalahan saat menambah produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data produk baru untuk ditambahkan ke sistem.
          </p>
        </div>

        {/* 🔴 Alert Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
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
                required
                placeholder="Masukkan nama produk"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Stok Awal */}
            {fromStore && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Awal
                </label>
                <input
                  type="number"
                  value={formData.stok_awal}
                  onChange={(e) =>
                    setFormData({ ...formData, stok_awal: e.target.value })
                  }
                  placeholder="Masukkan stok awal"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Harga Awal & Harga Jual */}
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
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
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
