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
    telepon: "",
    email: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
  });

  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Convert tanggal lahir supaya tidak offset -1 hari
  function toLocalDateOnly(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().substring(0, 10);
  }

  /* ============================================================
     Ambil data kasir & data store
  ============================================================ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Data Kasir
        const resKasir = await fetch(`${API_URL}/kasir/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const kasirData = await resKasir.json();
        if (!resKasir.ok) throw new Error(kasirData.message);

        // Data Store
        const resStore = await fetch(`${API_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const storeData = await resStore.json();
        if (!resStore.ok) throw new Error(storeData.message);

        // Prefill form lengkap
        setFormData({
          nama_kasir: kasirData.nama_kasir,
          id_store: kasirData.id_store,
          telepon: kasirData.telepon || "",
          email: kasirData.email || "",
          jenis_kelamin: kasirData.jenis_kelamin || "",
          tempat_lahir: kasirData.tempat_lahir || "",
          tanggal_lahir: toLocalDateOnly(kasirData.tanggal_lahir),
          alamat: kasirData.alamat || "",
        });

        setStores(storeData);
      } catch (err) {
        setError("Gagal memuat data kasir. " + err.message);
      }
    };

    fetchData();
  }, [id]);

  /* ============================================================
     Submit Form
  ============================================================ */
  const handleSubmit = (e) => {
    e.preventDefault();
    updateKasir(id, formData);
  };

  /* ============================================================
     Jika error load data
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
              onClick={() => navigate("/pegawai")}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
          </div>
        </div>
      </MainLayout>
    );

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
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Nama & Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Nama */}
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cabang
              </label>
              <select
                value={formData.id_store}
                onChange={(e) =>
                  setFormData({ ...formData, id_store: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <option value="">-- Pilih Cabang --</option>
                {stores.map((s) => (
                  <option key={s.id_store} value={s.id_store}>
                    {s.nama_store}
                  </option>
                ))}
              </select>
            </div>

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
              />
            </div>

            {/* Gender */}
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

            {/* Tempat lahir */}
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
              />
            </div>
          </div>

          {/* Tanggal lahir — full width */}
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

          {/* Alamat — full width */}
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
            ></textarea>
          </div>

          {/* Tombol */}
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
