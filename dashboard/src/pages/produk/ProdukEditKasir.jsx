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

  if (loading) return <p className="text-gray-500 p-6">Memuat data...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <MainLayout current="produk">
      <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          ✏️ Edit Produk (Kasir)
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              name="nama_produk"
              value={produk.nama_produk}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Awal
            </label>
            <input
              type="number"
              name="harga_awal"
              value={produk.harga_awal}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Jual
            </label>
            <input
              type="number"
              name="harga_jual"
              value={produk.harga_jual}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok Sekarang
            </label>
            <input
              type="number"
              name="stok_sekarang"
              value={produk.stok_sekarang}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              min="0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate(`/produk/kasir`)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`${
                saving
                  ? "bg-amber-400 cursor-wait"
                  : "bg-amber-600 hover:bg-amber-700"
              } text-white px-4 py-2 rounded-lg transition`}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
