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

  // === Handle Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      setError("Nama capster wajib diisi!");
      return;
    }

    try {
      setError(null);
      await addCapster(nama);

      // ✅ Simpan pesan ke localStorage untuk alert di halaman daftar
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
      setError("Gagal menambahkan capster: " + err.message);
    }
  };

  return (
    <MainLayout current="capster">
      <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          ➕ Tambah Capster
        </h1>

        {/* 🔔 Alert Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Capster */}
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
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
              className={`flex items-center gap-2 ${
                loading
                  ? "bg-amber-400 cursor-wait"
                  : "bg-amber-600 hover:bg-amber-700"
              } text-white px-4 py-2 rounded-lg transition`}
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
