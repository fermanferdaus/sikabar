import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import formatRupiah from "../../utils/formatRupiah";

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
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil data produk + stok
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProdukById(id);
        let stok = 0;

        if (fromStore) {
          const stokData = await getStokByStoreAndProduk(fromStore, id);
          stok =
            stokData?.stok_sekarang ??
            stokData?.stok_akhir ??
            stokData?.jumlah_stok ??
            0;
        }

        setProduk({
          nama_produk: data.nama_produk || "",
          harga_awal: formatRupiah(data.harga_awal || 0),
          harga_jual: formatRupiah(data.harga_jual || 0),
          stok_awal: stok,
        });
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fromStore]);

  // Format angka → numerik
  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  // Handle input text biasa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduk({ ...produk, [name]: value });
  };

  // Submit perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);

    const hargaAwalNum = parseRupiah(produk.harga_awal);
    const hargaJualNum = parseRupiah(produk.harga_jual);

    if (hargaJualNum < hargaAwalNum) {
      setErrorMsg("Harga jual tidak boleh lebih kecil dari harga awal!");
      setSaving(false);
      return;
    }

    try {
      const role = localStorage.getItem("role");
      const idStore = localStorage.getItem("id_store");
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      if (role === "admin") {
        await updateProduk(id, {
          nama_produk: produk.nama_produk,
          harga_awal: hargaAwalNum,
          harga_jual: hargaJualNum,
        });

        if (fromStore) {
          await updateStokProduk({
            id_store: fromStore,
            id_produk: id,
            jumlah_stok: Number(produk.stok_awal),
          });
        }
      } else if (role === "kasir") {
        const res = await fetch(`${API_URL}/produk/kasir/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_store: idStore,
            id_produk: id,
            nama_produk: produk.nama_produk,
            harga_awal: hargaAwalNum,
            harga_jual: hargaJualNum,
            jumlah_stok: Number(produk.stok_awal),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
      }

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: `Produk "${produk.nama_produk}" berhasil diperbarui!`,
        })
      );
      localStorage.setItem("reloadProduk", "true");

      if (fromStore) navigate(`/produk/stok/${fromStore}`);
      else if (role === "kasir") navigate(`/produk/kasir`);
      else navigate(-1);
    } catch (err) {
      setErrorMsg(err.message || "Gagal memperbarui produk");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <MainLayout current="produk">
        <p className="text-gray-500 p-6">Memuat data produk...</p>
      </MainLayout>
    );

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui detail dan harga produk sesuai kebutuhan Anda.
          </p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          {/* Baris 1: Nama & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                name="nama_produk"
                value={produk.nama_produk}
                onChange={handleChange}
                placeholder="Masukkan nama produk"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

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
                  placeholder="Masukkan stok"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Baris 2: Harga Awal & Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
                name="harga_awal"
                value={produk.harga_awal}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setProduk({ ...produk, harga_awal: formatRupiah(raw) });
                }}
                placeholder="Masukkan harga awal"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="text"
                name="harga_jual"
                value={produk.harga_jual}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setProduk({ ...produk, harga_jual: formatRupiah(raw) });
                }}
                placeholder="Masukkan harga jual"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                  : "bg-[#0e57b5] hover:bg-[#0b4894]"
              }`}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
