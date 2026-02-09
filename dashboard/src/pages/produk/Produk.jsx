import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";

export default function Produk() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchStores = async () => {
    try {
      setLoading(true);
      const url = `${API_URL}/produk/stok`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat data");
      setStores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []); // ⬅ dependency filterType & tanggal dihapus

  const columns = [
    { key: "no", label: "#" },
    { key: "nama_store", label: "Nama Cabang" },
    { key: "total_produk", label: "Total Produk" },
    { key: "total_stok", label: "Total Stok" },
    { key: "aksi", label: "Aksi" },
  ];

  const data = stores.map((s, i) => ({
    no: i + 1,
    nama_store: s.nama_store,
    total_produk: s.total_produk,
    total_stok: s.total_stok,
    aksi: (
      <div className="flex items-center justify-left gap-2">
        <button
          onClick={() => navigate(`/produk/stok/${s.id_store}`)}
          className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          Lihat
        </button>
      </div>
    ),
  }));

  return (
    <MainLayout current="produk">
      {(searchTerm) => {
        const filtered = stores.filter((s) =>
          s.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-xl font-semibold text-slate-800">
                Data Stok Produk
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Daftar stok produk di setiap cabang.
              </p>
            </div>

            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">Data tidak ditemukan.</p>
            ) : (
              <TableData
                columns={columns}
                data={data.filter((s) =>
                  s.nama_store.toLowerCase().includes(searchTerm.toLowerCase())
                )}
              />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
