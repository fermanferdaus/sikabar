import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function PricelistAdd() {
  const { addPricelist } = useFetchPricelist();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    service: "",
    keterangan: "",
    harga: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Format angka ke Rupiah
  const formatRupiah = (value) => {
    const number = value.replace(/\D/g, "");
    return number ? `Rp${Number(number).toLocaleString("id-ID")}` : "";
  };

  // 🔹 Handle input harga
  const handleHargaChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setForm({
      ...form,
      harga: numericValue,
      hargaFormatted: formatRupiah(numericValue),
    });
  };

  // 🔹 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service || !form.harga) {
      setError("Nama layanan dan harga wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/pricelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          service: form.service,
          keterangan: form.keterangan,
          harga: Number(form.harga),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔴 Tangani duplikat layanan
        if (
          data.message &&
          data.message.includes("Nama layanan sudah terdaftar")
        ) {
          setError("Nama layanan sudah terdaftar!");
          return;
        }

        throw new Error(data.message || "Gagal menambahkan layanan");
      }

      // ✅ Jika berhasil
      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "success",
          text: `Layanan "${form.service}" berhasil ditambahkan.`,
        })
      );

      navigate("/pricelist");
    } catch (err) {
      console.error("❌ Gagal menambahkan layanan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="pricelist">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Tambah Layanan Baru
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi detail layanan di bawah untuk menambah daftar harga.
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
          {/* Nama Layanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Layanan
            </label>
            <input
              type="text"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              placeholder="Contoh: Haircut Classic"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Tambahkan deskripsi singkat (opsional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.hargaFormatted || ""}
              onChange={handleHargaChange}
              placeholder="Masukkan harga layanan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
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
