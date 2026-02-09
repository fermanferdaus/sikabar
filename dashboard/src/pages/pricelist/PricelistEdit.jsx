import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function PricelistEdit() {
  const { id } = useParams();
  const {
    data,
    updatePricelist,
    loading: loadingPricelist,
  } = useFetchPricelist();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    service: "",
    keterangan: "",
    harga: 0,
    hargaFormatted: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Format angka ke Rupiah (untuk tampilan)
  const formatRupiah = (num) => {
    if (!num) return "";
    return `Rp${Number(num).toLocaleString("id-ID")}`;
  };

  // 🔹 Ambil data pricelist untuk diedit (saat sudah ready)
  useEffect(() => {
    if (!loadingPricelist && data.length > 0) {
      const layanan = data.find(
        (item) => String(item.id_pricelist) === String(id)
      );
      if (layanan) {
        const hargaAsli = Number(layanan.harga);
        setForm({
          service: layanan.service,
          keterangan: layanan.keterangan || "",
          harga: hargaAsli,
          hargaFormatted: formatRupiah(hargaAsli),
        });
        setError(null);
      } else {
        setError("Data layanan tidak ditemukan.");
      }
    }
  }, [id, data, loadingPricelist]);

  // 🔹 Handle perubahan harga agar otomatis format Rp
  const handleHargaChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, ""); // hanya angka
    if (value.startsWith("0")) value = value.replace(/^0+/, ""); // hilangkan nol depan

    const numeric = Number(value) || 0;
    setForm({
      ...form,
      harga: numeric, // simpan nilai angka mentah
      hargaFormatted: numeric ? formatRupiah(numeric) : "",
    });
  };

  // 🔹 Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service || !form.harga) {
      setError("Nama layanan dan harga wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePricelist(id, {
        service: form.service,
        keterangan: form.keterangan,
        harga: form.harga, // langsung kirim angka mentah
      });

      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "success",
          text: `Layanan "${form.service}" berhasil diperbarui.`,
        })
      );
      navigate("/pricelist");
    } catch (err) {
      console.error("❌ Gagal memperbarui layanan:", err);
      setError("Gagal memperbarui layanan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading sementara data pricelist belum ada
  if (loadingPricelist) {
    return (
      <MainLayout current="pricelist">
        <div className="text-center text-gray-500 mt-10">
          Memuat data layanan...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout current="pricelist">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10">
        {/* === Header === */}
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Edit Layanan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ubah informasi dan harga layanan yang tersedia.
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
              placeholder="Masukkan nama layanan"
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
              placeholder="Masukkan deskripsi layanan (opsional)"
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
              value={form.hargaFormatted}
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
