import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import formatRupiah from "../../utils/formatRupiah";

export default function PengeluaranAdminAdd() {
  const [formData, setFormData] = useState({
    id_store: "",
    kategori: "",
    deskripsi: "",
    jumlah: "",
    tanggal: new Date().toISOString().split("T")[0],
    bukti: null,
  });

  const [preview, setPreview] = useState(null);
  const [storeList, setStoreList] = useState([]);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeFromParam = searchParams.get("id_store");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const id_user = localStorage.getItem("id_user");

  // 🔽 Daftar kategori preset
  const kategoriList = [
    "Listrik",
    "Air",
    "Bahan",
    "Operasional",
    "Kebersihan",
    "Perawatan",
    "Gaji Tambahan",
    "Transportasi",
    "Lainnya",
  ];

  // 🧮 Hapus non-digit dari format rupiah
  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  // 🏪 Ambil daftar store (untuk admin)
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "success") {
          setStoreList(data.data || []);
          // Jika ada id_store di URL, cari nama store-nya
          if (storeFromParam) {
            const selected = data.data.find(
              (s) => String(s.id_store) === String(storeFromParam)
            );
            if (selected) {
              setSelectedStoreName(selected.nama_store);
              setFormData((prev) => ({ ...prev, id_store: selected.id_store }));
            }
          }
        }
      } catch (err) {
        console.error("❌ Gagal ambil daftar cabang:", err);
      }
    };
    fetchStores();
  }, []);

  // 🖼️ Preview gambar bukti
  const handleBuktiChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, bukti: file });
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // 🧾 Submit data pengeluaran
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.kategori || !formData.jumlah || !formData.tanggal) {
      setErrorMsg("Kategori, jumlah, dan tanggal wajib diisi!");
      return;
    }
    if (!formData.deskripsi.trim()) {
      setErrorMsg("Deskripsi wajib diisi!");
      return;
    }
    if (!formData.bukti) {
      setErrorMsg("Bukti pengeluaran wajib diunggah!");
      return;
    }

    const jumlahNum = parseRupiah(formData.jumlah);
    const body = new FormData();

    // ✅ Pastikan id_store selalu dikirim
    const storeToSend = formData.id_store || storeFromParam || "";
    if (storeToSend) body.append("id_store", storeToSend);

    body.append("id_user", id_user || null);
    body.append("kategori", formData.kategori);
    body.append("deskripsi", formData.deskripsi);
    body.append("jumlah", jumlahNum);
    body.append("tanggal", formData.tanggal);
    body.append("bukti", formData.bukti);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pengeluaran`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Gagal menambah pengeluaran");

      localStorage.setItem(
        "pengeluaranMessage",
        JSON.stringify({
          type: "success",
          text: `Pengeluaran "${formData.kategori}" berhasil ditambahkan!`,
        })
      );

      // ✅ Gunakan storeToSend agar redirect-nya tepat
      if (storeToSend) {
        navigate(`/pengeluaran/${storeToSend}`);
      } else {
        navigate(`/pengeluaran`);
      }
    } catch (err) {
      console.error("❌ Error add pengeluaran:", err);
      setErrorMsg(err.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="pengeluaran">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 relative">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Pengeluaran{" "}
            {selectedStoreName ? `Cabang – ${selectedStoreName}` : "Pusat"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data pengeluaran untuk pusat atau cabang tertentu.
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
          {/* 🔹 Pilihan Cabang (hanya muncul jika tidak datang dari detail cabang) */}
          {!storeFromParam && storeList.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Cabang (kosongkan untuk pengeluaran pusat)
              </label>
              <select
                value={formData.id_store}
                onChange={(e) =>
                  setFormData({ ...formData, id_store: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">-- Pengeluaran Pusat --</option>
                {storeList.map((s) => (
                  <option key={s.id_store} value={s.id_store}>
                    {s.nama_store}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kategori & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Pengeluaran
              </label>
              <select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Tulis keterangan pengeluaran"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            ></textarea>
          </div>

          {/* Jumlah & Bukti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah (Rp)
              </label>
              <input
                type="text"
                value={formData.jumlah}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setFormData({ ...formData, jumlah: formatRupiah(raw) });
                }}
                placeholder="Masukkan jumlah pengeluaran"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Bukti <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBuktiChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              {preview && (
                <div className="mt-3">
                  <img
                    src={preview}
                    alt="Preview Bukti"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/pengeluaran`)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
