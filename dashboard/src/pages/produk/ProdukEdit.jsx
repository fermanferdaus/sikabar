import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";

export default function ProdukEdit() {
  const { id } = useParams(); // id_produk
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getProdukById,
    updateProduk,
    getStokByStoreAndProduk,
    updateStokProduk,
  } = useProdukAPI();

  const fromStore = location.state?.fromStore || null;

  const [produk, setProduk] = useState({
    nama_produk: "",
    harga_awal: "",
    harga_jual: "",
    stok_awal: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔁 Ambil data produk + stok per store
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProdukById(id);
        let stok = 0;

        if (fromStore) {
          const stokData = await getStokByStoreAndProduk(fromStore, id);
          stok = stokData?.jumlah_stok ?? 0;
        }

        setProduk({
          nama_produk: data.nama_produk || "",
          harga_awal: data.harga_awal || "",
          harga_jual: data.harga_jual || "",
          stok_awal: stok,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fromStore]);

  // ✏️ Handle input perubahan
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduk({ ...produk, [name]: value });
  };

  // 💾 Simpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const role = localStorage.getItem("role");
      const idStore = localStorage.getItem("id_store");
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      if (role === "admin") {
        // 🟩 Admin tetap pakai route lama
        await updateProduk(id, {
          nama_produk: produk.nama_produk,
          harga_awal: Number(produk.harga_awal),
          harga_jual: Number(produk.harga_jual),
        });

        if (fromStore) {
          await updateStokProduk({
            id_store: fromStore,
            id_produk: id,
            jumlah_stok: Number(produk.stok_awal),
          });
        }
      } else if (role === "kasir") {
        // 🟨 Kasir pakai endpoint kasir khusus
        await fetch(`${API_URL}/produk/kasir/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_store: idStore,
            id_produk: id,
            jumlah_stok: Number(produk.stok_awal),
            nama_produk: produk.nama_produk,
            harga_awal: Number(produk.harga_awal),
            harga_jual: Number(produk.harga_jual),
          }),
        });
      }

      // ✅ Notifikasi sukses
      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: "Produk dan stok berhasil diperbarui",
        })
      );

      localStorage.setItem("reloadProduk", "true");

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else if (role === "kasir") navigate(`/produk/kasir`);
      else navigate(-1);
    } catch (err) {
      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "error",
          text: "Gagal memperbarui produk: " + err.message,
        })
      );

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else navigate(-1);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <MainLayout>
        <p className="text-gray-500">Memuat data produk...</p>
      </MainLayout>
    );

  return (
    <MainLayout current="produk">
      <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          ✏️ Edit Produk
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Harga Awal */}
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

          {/* Harga Jual */}
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

          {/* Stok Awal */}
          {fromStore && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Produk di Store Ini
              </label>
              <input
                type="number"
                name="stok_awal"
                value={produk.stok_awal}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
                required
              />
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() =>
                fromStore ? navigate(`/produk/stok/${fromStore}`) : navigate(-1)
              }
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
