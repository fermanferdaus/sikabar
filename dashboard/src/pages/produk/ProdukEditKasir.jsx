import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function ProdukEditKasir() {
  const { id_produk } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 💰 Format helper
  const formatRupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

  const handleInputRupiah = (e, field) => {
    const clean = e.target.value.replace(/\D/g, "");
    setProduk((prev) => ({
      ...prev,
      [field]: clean ? Number(clean) : 0,
    }));
  };

  // 🔹 Ambil data produk
  useEffect(() => {
    const loadProduk = async () => {
      try {
        const res = await fetch(
          `${API_URL}/produk/stok/${id_store}/${id_produk}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProduk(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduk();
  }, [API_URL, id_store, id_produk, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduk({ ...produk, [name]: value });
  };

  // 🔹 Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/produk/kasir/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_store,
          id_produk,
          nama_produk: produk.nama_produk,
          harga_awal: Number(produk.harga_awal),
          harga_jual: Number(produk.harga_jual),
          jumlah_stok: Number(produk.stok_sekarang),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: "Produk berhasil diperbarui",
        })
      );
      localStorage.setItem("reloadProduk", "true");

      navigate(`/produk/kasir`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <MainLayout current="produk">
        <p className="text-gray-500 p-6">Memuat data...</p>
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout current="produk">
        <p className="text-red-500 p-6">{error}</p>
      </MainLayout>
    );

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah detail produk dan stok untuk toko Anda.
          </p>
        </div>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Nama Produk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                name="nama_produk"
                value={produk.nama_produk}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            {/* Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Sekarang
              </label>
              <input
                type="number"
                name="stok_sekarang"
                min="0"
                value={produk.stok_sekarang}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan stok"
              />
            </div>
          </div>

          {/* Grid 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Harga Awal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="harga_awal"
                value={produk.harga_awal ? formatRupiah(produk.harga_awal) : ""}
                onChange={(e) => handleInputRupiah(e, "harga_awal")}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-right font-medium tracking-wide"
                placeholder="Masukkan harga awal"
                required
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="harga_jual"
                value={produk.harga_jual ? formatRupiah(produk.harga_jual) : ""}
                onChange={(e) => handleInputRupiah(e, "harga_jual")}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-right font-medium tracking-wide"
                placeholder="Masukkan harga jual"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tombol */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/produk/kasir`)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                saving
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
