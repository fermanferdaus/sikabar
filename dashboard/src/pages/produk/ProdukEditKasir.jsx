import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import formatRupiah from "../../utils/formatRupiah";

export default function ProdukEditKasir() {
  const { id_produk } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Ambil data produk berdasarkan ID
  useEffect(() => {
    const loadProduk = async () => {
      try {
        const res = await fetch(
          `${API_URL}/produk/stok/${id_store}/${id_produk}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // ✅ Adaptasi struktur data backend (stok_sekarang, stok_akhir, harga string)
        setProduk({
          id_produk: data.id_produk,
          nama_produk: data.nama_produk || "",
          harga_awal: formatRupiah(data.harga_awal || 0),
          harga_jual: formatRupiah(data.harga_jual || 0),
          stok_sekarang:
            data.stok_sekarang ?? data.stok_akhir ?? data.jumlah_stok ?? 0,
        });
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduk();
  }, [API_URL, id_store, id_produk, token]);

  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  // 🟢 Submit perubahan
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
      const res = await fetch(`${API_URL}/produk/${id_produk}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_store,
          id_produk,
          nama_produk: produk.nama_produk,
          harga_awal: hargaAwalNum,
          harga_jual: hargaJualNum,
          jumlah_stok: Number(produk.stok_sekarang),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: `Produk "${produk.nama_produk}" berhasil diperbarui!`,
        })
      );

      navigate(`/produk/kasir`);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan perubahan");
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
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi produk dan stok untuk toko Anda.
          </p>
        </div>

        {/* 🔴 Alert Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          {/* Baris 1: Nama & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                value={produk.nama_produk}
                onChange={(e) =>
                  setProduk({ ...produk, nama_produk: e.target.value })
                }
                placeholder="Masukkan nama produk"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Sekarang
              </label>
              <input
                type="number"
                min="0"
                value={produk.stok_sekarang}
                onChange={(e) =>
                  setProduk({ ...produk, stok_sekarang: e.target.value })
                }
                placeholder="Masukkan stok"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Baris 2: Harga Awal & Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
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

          {/* Tombol Aksi */}
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
