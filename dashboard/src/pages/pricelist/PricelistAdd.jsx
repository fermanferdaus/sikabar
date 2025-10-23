import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function PricelistAdd() {
  const { addPricelist } = useFetchPricelist();
  const navigate = useNavigate();
  const [form, setForm] = useState({ service: "", keterangan: "", harga: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service || !form.harga)
      return alert("Nama dan harga wajib diisi!");

    setLoading(true);
    try {
      await addPricelist(form);
      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "success",
          text: `Layanan "${form.service}" berhasil ditambahkan.`,
        })
      );
      navigate("/pricelist");
    } catch (err) {
      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal menambahkan layanan: ${err.message}`,
        })
      );
      navigate("/pricelist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="pricelist">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Tambah Layanan Baru
      </h1>

      <div className="bg-white border rounded-xl p-8 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Layanan
            </label>
            <input
              type="text"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              placeholder="Contoh: Haircut Classic"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Opsional"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Harga (Rp)
            </label>
            <input
              type="number"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              placeholder="50000"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/pricelist")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
