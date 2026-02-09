import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchCapster from "../../hooks/useFetchCapster";

export default function KomisiAdd() {
  const navigate = useNavigate();
  const { capsters, loading, error } = useFetchCapster();

  const [form, setForm] = useState({ id_capster: "", persentase_capster: "" });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // 🔢 Hanya angka bulat
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, persentase_capster: value });
  };

  // 💾 Submit data ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_capster || !form.persentase_capster) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/komisi-setting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔴 Tangani error duplikat dari backend
        if (data.message && data.message.includes("Komisi capster sudah ada")) {
          setErrorMsg("Komisi capster sudah ada!");
          return;
        }
        throw new Error(data.message || "Gagal menambah komisi capster");
      }

      // ✅ Simpan pesan sukses ke localStorage
      localStorage.setItem(
        "komisiMessage",
        JSON.stringify({
          type: "success",
          text: `Komisi untuk capster berhasil ditambahkan.`,
        })
      );

      navigate("/komisi");
    } catch (err) {
      console.error("❌ Gagal menambah komisi capster:", err);
      setErrorMsg(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <MainLayout current="komisi setting">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Pengaturan Komisi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur persentase pembagian komisi untuk setiap capster.
          </p>
        </div>

        {/* === Alert Error === */}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* === Loading/Error Fetch Capster === */}
        {loading && (
          <p className="text-gray-500 italic mb-6">Memuat data capster...</p>
        )}
        {error && <p className="text-red-500 mb-6">{error}</p>}

        {/* === Form === */}
        {!loading && !error && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Baris 1: Capster & Persentase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih Capster */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Capster
                </label>
                <select
                  value={form.id_capster}
                  onChange={(e) =>
                    setForm({ ...form, id_capster: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                >
                  <option value="">-- Pilih Capster --</option>
                  {capsters.map((c) => (
                    <option key={c.id_capster} value={c.id_capster}>
                      {c.nama_capster} — {c.nama_store}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  *Setiap capster hanya boleh punya satu pengaturan komisi.
                </p>
              </div>

              {/* Persentase Komisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persentase Komisi (%)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.persentase_capster}
                  onChange={handlePercentageChange}
                  placeholder="Misal: 35"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                disabled={loadingSubmit}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
                  loadingSubmit
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#0e57b5] hover:bg-[#0b4894]"
                }`}
              >
                {loadingSubmit ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
