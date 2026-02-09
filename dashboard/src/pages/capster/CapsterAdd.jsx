import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useCapsterActions from "../../hooks/useCapsterActions";

export default function CapsterAdd() {
  const { addCapster, loading } = useCapsterActions();
  const [stores, setStores] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    nama_capster: "",
    id_store: "",

    // 🔥 field baru
    telepon: "",
    email: "",
    alamat: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
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

  // 🔹 Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await addCapster(formData);
    } catch (error) {
      console.error("❌ Error submit:", error);
      setErrorMsg("Terjadi kesalahan koneksi ke server");
    }
  };

  return (
    <MainLayout current="capster">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Kapster
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data Kapster baru untuk ditambahkan ke dalam sistem.
          </p>
        </div>

        {/* 🔴 Alert Error */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Bagian 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                placeholder="Masukkan nama kapster"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="">-- Pilih Store --</option>
                {stores.map((s) => (
                  <option key={s.id_store} value={s.id_store}>
                    {s.nama_store}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bagian 2 – Data Diri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Telepon */}
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

            {/* Email */}
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
                placeholder="kapster@email.com"
              />
            </div>

            {/* Jenis Kelamin */}
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
                placeholder="Contoh: Palembang"
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
              value={formData.alamat}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Masukkan alamat lengkap"
            ></textarea>
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
      </div>
    </MainLayout>
  );
}
