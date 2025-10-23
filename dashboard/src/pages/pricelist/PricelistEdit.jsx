import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";

export default function PricelistEdit() {
  const { id } = useParams();
  const { data, updatePricelist } = useFetchPricelist();
  const navigate = useNavigate();

  const [form, setForm] = useState({ service: "", keterangan: "", harga: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const layanan = data.find(
      (item) => String(item.id_pricelist) === String(id)
    );
    if (layanan) {
      setForm({
        service: layanan.service,
        keterangan: layanan.keterangan || "",
        harga: layanan.harga,
      });
    }
  }, [id, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service || !form.harga)
      return alert("Nama dan harga wajib diisi!");
    setLoading(true);
    try {
      await updatePricelist(id, form);
      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "success",
          text: `Layanan "${form.service}" berhasil diperbarui.`,
        })
      );
      navigate("/pricelist");
    } catch (err) {
      localStorage.setItem(
        "pricelistMessage",
        JSON.stringify({
          type: "error",
          text: `Gagal memperbarui layanan: ${err.message}`,
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
        Edit Layanan
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
