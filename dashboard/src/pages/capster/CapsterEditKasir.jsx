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
    telepon: "",
    email: "",
    alamat: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    id_store: id_store,
  });

  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  function toLocalDateOnly(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().substring(0, 10);
  }

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
          telepon: data.telepon || "",
          email: data.email || "",
          alamat: data.alamat || "",
          jenis_kelamin: data.jenis_kelamin || "",
          tempat_lahir: data.tempat_lahir || "",
          tanggal_lahir: toLocalDateOnly(data.tanggal_lahir),
          id_store: id_store,
        });

        setError(null);
      } catch (err) {
        setError("Gagal memuat data kapster: " + err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchCapster();
  }, [id]);

  // 💾 Simpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_capster.trim()) {
      setError("Nama kapster wajib diisi!");
      return;
    }

    try {
      setError(null);

      await updateCapster(id, formData);

      localStorage.setItem(
        "capsterMessageKasir",
        JSON.stringify({
          type: "success",
          text: `kapster "${formData.nama_capster}" berhasil diperbarui!`,
        })
      );

      navigate("/capster/kasir");
    } catch (err) {
      setError("Gagal memperbarui kapster: " + err.message);
    }
  };

  // 🟥 Error saat load awal
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
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Kapster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah informasi kapster di cabang Anda.
          </p>
        </div>

        {/* Error Global */}
        {(error || hookError) && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error || hookError}
          </div>
        )}

        {/* Loading State */}
        {loadingData ? (
          <p className="text-gray-500 italic">Memuat data kapster...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kapster
              </label>
              <input
                type="text"
                value={formData.nama_capster}
                onChange={(e) =>
                  setFormData({ ...formData, nama_capster: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Telepon & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) =>
                    setFormData({ ...formData, telepon: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="08xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            {/* Gender & Tempat Lahir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) =>
                    setFormData({ ...formData, jenis_kelamin: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                >
                  <option value="">-- Pilih Gender --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempat_lahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tempat_lahir: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="Contoh: Surabaya"
                />
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_lahir: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows={3}
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-lg font-medium text-white ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#0e57b5] hover:bg-[#0b4894]"
                }`}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
