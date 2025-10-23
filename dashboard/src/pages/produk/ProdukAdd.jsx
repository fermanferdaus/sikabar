import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useProdukAPI from "../../hooks/useProdukAPI";
import FormLayout from "../../components/FormLayout";
import FormField from "../../components/FormField";

export default function ProdukAdd() {
  const [namaProduk, setNamaProduk] = useState("");
  const [hargaAwal, setHargaAwal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { addProduk, addStokProduk } = useProdukAPI();
  const navigate = useNavigate();
  const location = useLocation();
  const fromStore = location.state?.fromStore || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaProduk || !hargaAwal || !hargaJual) {
      setError("Semua field wajib diisi!");
      return;
    }

    if (Number(hargaJual) < Number(hargaAwal)) {
      setError("Harga jual tidak boleh lebih kecil dari harga awal!");
      return;
    }

    setLoading(true);
    try {
      const role = localStorage.getItem("role");
      const idStore = localStorage.getItem("id_store");

      if (role === "admin") {
        const produkBaru = await addProduk({
          nama_produk: namaProduk,
          harga_awal: Number(hargaAwal),
          harga_jual: Number(hargaJual),
        });

        if (fromStore && stokAwal) {
          await addStokProduk({
            id_produk: produkBaru.id,
            id_store: fromStore,
            jumlah_stok: Number(stokAwal),
          });
        }
      }

      localStorage.setItem(
        "produkMessage",
        JSON.stringify({
          type: "success",
          text: "Produk berhasil ditambahkan",
        })
      );

      navigate(fromStore ? `/produk/stok/${fromStore}` : -1);
    } catch (err) {
      console.error(err);
      setError("Gagal menambahkan produk: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout current="produk">
      <FormLayout
        title="Tambah Produk"
        description="Isi informasi produk baru untuk ditambahkan ke sistem."
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        loading={loading}
        submitText="Simpan Produk"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <FormField
            label="Nama Produk"
            value={namaProduk}
            onChange={setNamaProduk}
            placeholder="Masukkan nama produk"
            required
          />
          {fromStore && (
            <FormField
              label="Stok Awal"
              type="number"
              value={stokAwal}
              onChange={setStokAwal}
              placeholder="Masukkan stok awal"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <FormField
            label="Harga Awal"
            type="rupiah"
            value={hargaAwal}
            onChange={setHargaAwal}
            placeholder="Masukkan harga awal"
            required
          />
          <FormField
            label="Harga Jual"
            type="rupiah"
            value={hargaJual}
            onChange={setHargaJual}
            placeholder="Masukkan harga jual"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </FormLayout>
    </MainLayout>
  );
}
