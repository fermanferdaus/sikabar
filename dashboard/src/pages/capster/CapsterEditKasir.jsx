import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useCapsterKasir from "../../hooks/useCapsterKasir";

export default function CapsterEditKasir() {
  const { id } = useParams();
  const navigate = useNavigate();
  const id_store = localStorage.getItem("id_store");

  const {
    updateCapster,
    loading,
    error: hookError,
  } = useCapsterKasir(id_store);

  const [formData, setFormData] = useState({
    nama_capster: "",
    id_store: id_store || "",
    status: "aktif",
  });

  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // 🔄 Ambil data capster
  useEffect(() => {
    const fetchCapster = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`${API_URL}/capster/kasir/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data capster");

        const data = await res.json();
        setFormData({
          nama_capster: data.nama_capster || "",
          id_store: id_store,
          status: data.status || "aktif",
        });
        setError(null);
      } catch (err) {
        console.error("❌ fetchCapster Error:", err);
        setError("Gagal memuat data capster: " + err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchCapster();
  }, [id]);

  // 💾 Simpan update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_capster.trim()) {
      setError("Nama capster wajib diisi!");
      return;
    }

    try {
      setError(null);
      await updateCapster(id, formData.nama_capster, formData.status);

      // ✅ Notifikasi sukses
      localStorage.setItem(
        "capsterMessageKasir",
        JSON.stringify({
          type: "success",
          text: `Capster "${formData.nama_capster}" berhasil diperbarui!`,
        })
      );

      navigate("/capster/kasir");
    } catch (err) {
      console.error("❌ handleUpdate Error:", err);
      setError("Gagal memperbarui capster: " + err.message);
    }
  };

  // 🟥 Error load awal
  if (error && loadingData) {
    return (
      <MainLayout current="capster">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 text-center">
          <p className="text-red-700 bg-red-50 border border-red-200 inline-block rounded-lg px-4 py-3 text-sm font-medium">
            {error}
          </p>
          <div className="mt-5">
            <button
              onClick={() => navigate("/capster/kasir")}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Kembali
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout current="capster">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Capster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah informasi capster di store Anda.
          </p>
        </div>

        {/* === Alert Error === */}
        {(error || hookError) && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error || hookError}
          </div>
        )}

        {/* === Loading State === */}
        {loadingData ? (
          <p className="text-gray-500 italic">Memuat data capster...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/capster/kasir")}
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
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
