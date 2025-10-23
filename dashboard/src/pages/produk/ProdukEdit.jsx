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
    harga_awal: 0,
    harga_jual: 0,
    stok_awal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 💰 Format Rupiah helper
  const formatRupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

  const handleInputRupiah = (e, field) => {
    const clean = e.target.value.replace(/\D/g, "");
    setProduk((prev) => ({
      ...prev,
      [field]: clean ? Number(clean) : 0,
    }));
  };

  // 🔁 Ambil data produk + stok
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
          harga_awal: data.harga_awal || 0,
          harga_jual: data.harga_jual || 0,
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

  // ✏️ Handle input teks biasa
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
          text: "Produk berhasil diperbarui",
        })
      );
      localStorage.setItem("reloadProduk", "true");

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else if (role === "kasir") navigate(`/produk/kasir`);
      else navigate(-1);
    } catch (err) {
      setError("Gagal memperbarui produk: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <MainLayout>
        <p className="text-gray-500 p-6">Memuat data produk...</p>
      </MainLayout>
    );

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah detail dan harga produk sesuai kebutuhan Anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

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
            {fromStore && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Produk di Store Ini
                </label>
                <input
                  type="number"
                  name="stok_awal"
                  min="0"
                  value={produk.stok_awal}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Masukkan stok"
                />
              </div>
            )}
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

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                fromStore ? navigate(`/produk/stok/${fromStore}`) : navigate(-1)
              }
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
