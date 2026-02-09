import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import formatRupiah from "../../utils/formatRupiah";

export default function PengeluaranKasirEdit() {
  const { id_pengeluaran } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    kategori: "",
    deskripsi: "",
    jumlah: "",
    tanggal: "",
    bukti: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPicker, setShowPicker] = useState(false);

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

  // 🔁 Ambil data pengeluaran
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/pengeluaran`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const found = json.data.find(
          (p) => p.id_pengeluaran === Number(id_pengeluaran),
        );
        if (!found) throw new Error("Data tidak ditemukan");

        setFormData({
          kategori: found.kategori || "",
          deskripsi: found.deskripsi || "",
          jumlah: formatRupiah(found.jumlah),
          tanggal: found.tanggal?.split("T")[0] || "",
          bukti: null,
        });
        if (found.bukti_path) setPreview(`${BACKEND_URL}${found.bukti_path}`);
      } catch (err) {
        console.error("❌ Error get pengeluaran:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_pengeluaran]);

  const parseRupiah = (val) => Number(String(val).replace(/[^\d]/g, "")) || 0;

  const handleBuktiChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, bukti: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const jumlahNum = parseRupiah(formData.jumlah);
    const body = new FormData();
    if (formData.kategori) body.append("kategori", formData.kategori);
    if (formData.deskripsi) body.append("deskripsi", formData.deskripsi);
    if (formData.jumlah) body.append("jumlah", jumlahNum);
    if (formData.tanggal) body.append("tanggal", formData.tanggal);
    if (formData.bukti) body.append("bukti", formData.bukti);

    try {
      const res = await fetch(`${API_URL}/pengeluaran/${id_pengeluaran}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();

      if (data.status !== "success") throw new Error(data.message);

      localStorage.setItem(
        "pengeluaranMessage",
        JSON.stringify({
          type: "success",
          text: "Pengeluaran berhasil diperbarui!",
        }),
      );

      navigate(-1);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  if (loading)
    return (
      <MainLayout current="pengeluaran">
        <p className="p-10 text-gray-600">Memuat data...</p>
      </MainLayout>
    );

  return (
    <MainLayout current="pengeluaran">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300 relative">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Pengeluaran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah data pengeluaran toko Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Tulis keterangan tambahan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none"
            ></textarea>
          </div>

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
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Bukti (opsional)
            </label>

            <div
              onClick={() => setShowPicker(true)}
              className="
                w-full border-2 border-dashed border-gray-300
                hover:border-blue-500 transition
                rounded-xl p-6 bg-gray-50
                flex flex-col items-center justify-center gap-4
                cursor-pointer
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview Bukti"
                  className="w-40 h-40 object-cover rounded-xl shadow-sm bg-white"
                />
              ) : (
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>

                  <p className="text-gray-600 font-medium">
                    Upload bukti pengeluaran
                  </p>
                  <p className="text-xs text-gray-400">
                    Bisa ambil foto atau pilih dari galeri
                  </p>
                </div>
              )}
            </div>
          </div>

          {showPicker && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-5 w-72 shadow-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Pilih sumber foto
                </h3>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPicker(false);
                      document.getElementById("cameraInput").click();
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Kamera
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPicker(false);
                      document.getElementById("galleryInput").click();
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50"
                  >
                    Galeri
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPicker(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            id="cameraInput"
            type="file"
            accept="image/*"
            capture
            className="hidden"
            onChange={handleBuktiChange}
          />

          <input
            id="galleryInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBuktiChange}
          />

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
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#0e57b5] hover:bg-[#0b4894]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
