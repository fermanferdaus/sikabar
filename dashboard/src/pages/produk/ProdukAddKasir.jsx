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

      // ✅ simpan notifikasi sukses
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Tambah Produk (Kasir)
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Produk
            </label>
            <input
              type="text"
              value={namaProduk}
              onChange={(e) => setNamaProduk(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harga Awal
            </label>
            <input
              type="number"
              min="0"
              value={hargaAwal}
              onChange={(e) => setHargaAwal(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harga Jual
            </label>
            <input
              type="number"
              min="0"
              value={hargaJual}
              onChange={(e) => setHargaJual(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stok Awal
            </label>
            <input
              type="number"
              min="0"
              value={stokAwal}
              onChange={(e) => setStokAwal(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/produk/kasir`)}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
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
