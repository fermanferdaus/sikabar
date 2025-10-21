import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";

export default function ProdukAdd() {
  const [namaProduk, setNamaProduk] = useState("");
  const [hargaAwal, setHargaAwal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { addProduk, addStokProduk } = useProdukAPI();
  const navigate = useNavigate();
  const location = useLocation();

  // Jika datang dari ProdukStokDetail, simpan ID store-nya
  const fromStore = location.state?.fromStore || null;

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
      // Jika admin → pakai addProduk
      let idProdukBaru = null;

      const role = localStorage.getItem("role");
      const idStore = localStorage.getItem("id_store");

      if (role === "admin") {
        // Simpan data produk ke database
        const produkBaru = await addProduk({
          nama_produk: namaProduk,
          harga_awal: Number(hargaAwal),
          harga_jual: Number(hargaJual),
        });
        idProdukBaru = produkBaru.id;

        // Jika admin menambahkan langsung ke store tertentu
        if (fromStore && stokAwal) {
          await addStokProduk({
            id_produk: idProdukBaru,
            id_store: fromStore,
            jumlah_stok: Number(stokAwal),
          });
        }
      } else if (role === "kasir") {
        // 🔹 Kasir langsung menambah stok di tokonya sendiri
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/produk/kasir/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_store: idStore,
            id_produk: null, // bisa diubah nanti jika pilih produk lama
            jumlah_stok: Number(stokAwal) || 0,
            nama_produk: namaProduk,
            harga_awal: Number(hargaAwal),
            harga_jual: Number(hargaJual),
          }),
        });

        if (!res.ok) throw new Error("Gagal menambah produk");
      }

      // ✅ Notifikasi sukses
      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: "Produk berhasil ditambahkan",
        })
      );

      localStorage.setItem("reloadProduk", "true");

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else if (role === "kasir") navigate(`/produk/kasir`);
      else navigate(-1);
    } catch (err) {
      console.error(err);

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal menambahkan produk: " + err.message,
        })
      );

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Tambah Produk</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* === Nama Produk === */}
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

          {/* === Harga Awal === */}
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
              placeholder="0"
              required
            />
          </div>

          {/* === Harga Jual === */}
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
              placeholder="0"
              required
            />
          </div>

          {/* === Stok Awal (opsional, hanya muncul jika dari store) === */}
          {fromStore && (
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
                placeholder="Masukkan jumlah stok awal"
              />
            </div>
          )}

          {/* === Error Message === */}
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
              {error}
            </p>
          )}

          {/* === Tombol Aksi === */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
