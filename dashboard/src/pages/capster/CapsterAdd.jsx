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
      const res = await fetch(`${API_URL}/store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStores(data);
    };
    fetchStores();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addCapster(formData);
  };

  return (
    <MainLayout current="capster">
      <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          ➕ Tambah Capster
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Pilih Store --</option>
              {stores.map((s) => (
                <option key={s.id_store} value={s.id_store}>
                  {s.nama_store}
                </option>
              ))}
            </select>
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate("/capster")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-amber-400 cursor-wait"
                  : "bg-amber-600 hover:bg-amber-700"
              } text-white px-4 py-2 rounded-lg transition`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
