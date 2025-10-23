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

  // === Ambil data capster untuk diedit ===
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

  // === Submit Update ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_capster.trim()) {
      setError("Nama capster wajib diisi!");
      return;
    }

    try {
      setError(null);
      await updateCapster(id, formData.nama_capster, formData.status);

      // ✅ Simpan notifikasi sukses ke localStorage
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

  // === Jika gagal load data awal ===
  if (error && loadingData) {
    return (
      <MainLayout current="capster">
        <div className="text-center text-red-600 font-medium mt-10">
          {error}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout current="capster">
      <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          ✏️ Edit Capster
        </h1>

        {/* 🔔 Alert Error */}
        {(error || hookError) && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm font-medium">
            {error || hookError}
          </div>
        )}

        {/* Loading state */}
        {loadingData ? (
          <p className="text-gray-500 italic">Memuat data capster...</p>
        ) : (
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
                onClick={() => navigate("/capster/kasir")}
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
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
