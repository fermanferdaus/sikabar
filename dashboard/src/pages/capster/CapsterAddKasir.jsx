import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { Save } from "lucide-react";
import useCapsterKasir from "../../hooks/useCapsterKasir";

export default function CapsterAddKasir() {
  const navigate = useNavigate();
  const id_store = localStorage.getItem("id_store");
  const { addCapster, loading } = useCapsterKasir(id_store);

  const [nama, setNama] = useState("");
  const [error, setError] = useState(null);

  // 🧩 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      setError("Nama capster wajib diisi!");
      return;
    }

    try {
      setError(null);
      await addCapster(nama);

      localStorage.setItem(
        "capsterMessageKasir",
        JSON.stringify({
          type: "success",
          text: `Capster "${nama}" berhasil ditambahkan!`,
        })
      );

      navigate("/capster/kasir");
    } catch (err) {
      console.error("❌ handleAddCapster Error:", err);

      // 🔍 Cek apakah server mengirim pesan error custom
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message);
      }
    }
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
            Capster baru akan otomatis ditambahkan ke store Anda.
          </p>
        </div>

        {/* === Alert Error === */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Capster
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama capster"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* === Tombol Aksi === */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/capster/kasir")}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Menyimpan..." : <> Simpan Capster</>}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
