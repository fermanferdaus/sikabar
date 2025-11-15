import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useKasir } from "../../hooks/useKasir";

export default function KasirEdit() {
  const { id } = useParams();
  const { updateKasir, loading } = useKasir();

  const [formData, setFormData] = useState({
    nama_kasir: "",
    id_store: "",
    status: "aktif",
  });

  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  /* ============================================================
     🧭 Fetch data kasir & store
     ============================================================ */
  useEffect(() => {
    if (role !== "admin") navigate("/kasir");

    const fetchData = async () => {
      try {
        // 🔵 Ambil data kasir
        const resKasir = await fetch(`${API_URL}/kasir/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const kasirData = await resKasir.json();
        if (!resKasir.ok) throw new Error(kasirData.message);

        // 🔵 Ambil data store
        const resStore = await fetch(`${API_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const storeData = await resStore.json();
        if (!resStore.ok) throw new Error(storeData.message);

        setFormData(kasirData);
        setStores(storeData);
      } catch (err) {
        setError("Gagal memuat data kasir. " + err.message);
      }
    };

    fetchData();
  }, [id]);

  /* ============================================================
     📝 Handle Submit
     ============================================================ */
  const handleSubmit = (e) => {
    e.preventDefault();
    updateKasir(id, formData);
  };

  /* ============================================================
     🔴 Jika error load data
     ============================================================ */
  if (error)
    return (
      <MainLayout current="kasir">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10">
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium">
            {error}
          </p>
          <div className="text-right mt-4">
            <button
              onClick={() => navigate("/kasir")}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Kembali
            </button>
          </div>
        </div>
      </MainLayout>
    );

  /* ============================================================
     🧾 Tampilan Form
     ============================================================ */
  return (
    <MainLayout current="kasir">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Edit Kasir</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah informasi kasir yang terdaftar di sistem.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Nama Kasir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kasir
              </label>
              <input
                type="text"
                value={formData.nama_kasir}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kasir: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700
                  focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan nama kasir"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700
                  focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Store */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={formData.id_store}
              onChange={(e) =>
                setFormData({ ...formData, id_store: e.target.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700
                focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              <option value="">-- Pilih Store --</option>
              {stores.map((s) => (
                <option key={s.id_store} value={s.id_store}>
                  {s.nama_store}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/kasir")}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700
                hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition
                ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
