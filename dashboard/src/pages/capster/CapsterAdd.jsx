import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useCapsterActions from "../../hooks/useCapsterActions";

export default function CapsterAdd() {
  const { addCapster, loading } = useCapsterActions();
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    nama_capster: "",
    id_store: "",
    status: "aktif",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") navigate("/capster");

    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat store");
        setStores(data);
      } catch (err) {
        console.error("Error fetching store:", err);
      }
    };

    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addCapster(formData);
  };

  return (
    <MainLayout current="capster">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Capster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data capster baru untuk ditambahkan ke dalam sistem.
          </p>
        </div>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid Baris 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Nama Capster */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Capster
              </label>
              <input
                type="text"
                value={formData.nama_capster}
                onChange={(e) =>
                  setFormData({ ...formData, nama_capster: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Masukkan nama capster"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              <option value="">-- Pilih Store --</option>
              {stores.map((s) => (
                <option key={s.id_store} value={s.id_store}>
                  {s.nama_store}
                </option>
              ))}
            </select>
          </div>

          {/* === Tombol Aksi === */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/capster")}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
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
              {loading ? "Menyimpan..." : "Simpan Capster"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
