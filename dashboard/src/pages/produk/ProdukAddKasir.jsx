import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import formatRupiah from "../../utils/formatRupiah";

export default function ProdukAddKasir() {
  const { getAllProduk } = useProdukAPI();

  const [formData, setFormData] = useState({
    nama_produk: "",
    harga_awal: "",
    harga_jual: "",
    stok_awal: "",
    id_produk_existing: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store");

  const parseRupiah = (v) => Number(String(v).replace(/[^\d]/g, "")) || 0;

  const handleNamaChange = async (e) => {
    const nama = e.target.value;

    setFormData({
      ...formData,
      nama_produk: nama,
      id_produk_existing: null,
      harga_awal: "",
      harga_jual: "",
    });

    setSuggestions([]);
    if (nama.length < 2) return;

    try {
      setSearching(true);
      const all = await getAllProduk();

      const filtered = all.filter((p) =>
        p.nama_produk.toLowerCase().includes(nama.toLowerCase())
      );

      const unique = filtered.reduce(
        (acc, item) => {
          const key = item.nama_produk.toLowerCase();
          if (!acc.map[key]) {
            acc.map[key] = true;
            acc.list.push(item);
          }
          return acc;
        },
        { map: {}, list: [] }
      ).list;

      setSuggestions(unique);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduk = (p) => {
    setFormData({
      ...formData,
      nama_produk: p.nama_produk,
      harga_awal: formatRupiah(String(p.harga_awal)),
      harga_jual: formatRupiah(String(p.harga_jual)),
      id_produk_existing: p.id_produk,
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const hAwal = parseRupiah(formData.harga_awal);
    const hJual = parseRupiah(formData.harga_jual);

    if (!formData.nama_produk || !hAwal || !hJual) {
      return setErrorMsg("Semua field wajib diisi!");
    }
    if (hJual < hAwal) {
      return setErrorMsg("Harga jual tidak boleh lebih kecil dari harga awal!");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/produk/kasir/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_store,
          nama_produk: formData.nama_produk,
          harga_awal: hAwal,
          harga_jual: hJual,
          jumlah_stok: Number(formData.stok_awal) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambahkan produk");

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: `Produk "${formData.nama_produk}" berhasil ditambahkan!`,
        })
      );

      navigate(`/produk/kasir`);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 relative">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Produk
          </h1>
          <p className="text-sm text-gray-500">
            Lengkapi data produk baru untuk toko Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === AUTOSEARCH NAMA PRODUK === */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>

            <input
              type="text"
              value={formData.nama_produk}
              onChange={handleNamaChange}
              placeholder="Masukkan nama atau ketik untuk mencari..."
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 
              focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            {searching && (
              <p className="text-xs text-blue-500 mt-1">Mencari...</p>
            )}

            {suggestions.length > 0 && (
              <ul className="absolute w-full bg-white border rounded-lg shadow-lg mt-1 z-20 max-h-48 overflow-auto">
                {suggestions.map((p) => (
                  <li
                    key={p.id_produk}
                    onClick={() => handleSelectProduk(p)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    <div className="font-medium">{p.nama_produk}</div>
                    <div className="text-xs text-gray-500">
                      Harga: Rp {Number(p.harga_jual).toLocaleString("id-ID")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* === STOK === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok Awal
            </label>
            <input
              type="number"
              min="0"
              value={formData.stok_awal}
              onChange={(e) =>
                setFormData({ ...formData, stok_awal: e.target.value })
              }
              placeholder="Masukkan stok awal"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 
              focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* === HARGA === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal
              </label>
              <input
                type="text"
                value={formData.harga_awal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    harga_awal: formatRupiah(
                      e.target.value.replace(/[^\d]/g, "")
                    ),
                  })
                }
                placeholder="Contoh: 30000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual
              </label>
              <input
                type="text"
                value={formData.harga_jual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    harga_jual: formatRupiah(
                      e.target.value.replace(/[^\d]/g, "")
                    ),
                  })
                }
                placeholder="Contoh: 40000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* === BUTTON === */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg text-white ${
                loading ? "bg-gray-300" : "bg-[#0e57b5] hover:bg-[#0b4894]"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
