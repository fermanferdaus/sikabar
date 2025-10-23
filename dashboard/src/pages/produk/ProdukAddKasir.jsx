import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function ProdukAddKasir() {
  const [namaProduk, setNamaProduk] = useState("");
  const [hargaAwal, setHargaAwal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  // 💰 Format input Rupiah
  const formatRupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

  const handleInputRupiah = (e, setter) => {
    const val = e.target.value.replace(/\D/g, ""); // hapus semua non-digit
    setter(val ? Number(val) : 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaProduk || !hargaAwal || !hargaJual) {
      setError("Semua field wajib diisi!");
      return;
    }

    if (Number(hargaJual) < Number(hargaAwal)) {
      setError("Harga jual tidak boleh lebih kecil dari harga awal!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/produk/kasir/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_store,
          nama_produk: namaProduk,
          harga_awal: Number(hargaAwal),
          harga_jual: Number(hargaJual),
          jumlah_stok: Number(stokAwal) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah produk");

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: "Produk berhasil ditambahkan",
        })
      );
      localStorage.setItem("reloadProduk", "true");

      navigate(`/produk/kasir`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      {/* === Wrapper Full Width === */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Isi informasi produk baru untuk toko Anda.
          </p>
        </div>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                value={namaProduk}
                onChange={(e) => setNamaProduk(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan nama produk"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                value={stokAwal}
                onChange={(e) => setStokAwal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan stok awal"
              />
            </div>
          </div>

          {/* Row 2 - Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={hargaAwal ? formatRupiah(hargaAwal) : ""}
                onChange={(e) => handleInputRupiah(e, setHargaAwal)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-right font-medium tracking-wide"
                placeholder="Masukkan harga awal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={hargaJual ? formatRupiah(hargaJual) : ""}
                onChange={(e) => handleInputRupiah(e, setHargaJual)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-right font-medium tracking-wide"
                placeholder="Masukkan harga jual"
                required
              />
            </div>
          </div>

          {/* === Error === */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* === Tombol === */}
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
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
