import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchStore from "../../hooks/useFetchStore";

export default function Store() {
  const { data, loading, error, deleteStore } = useFetchStore();
  const navigate = useNavigate();

  return (
    <MainLayout current="store">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Data Store</h1>
        <button
          onClick={() => navigate("/store/add")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Tambah Store
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data store...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">Belum ada data store.</p>
      ) : (
        <div className="bg-white border rounded-xl p-5 shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-left">ID</th>
                <th className="p-3 border text-left">Nama Store</th>
                <th className="p-3 border text-left">Alamat</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id_store} className="hover:bg-gray-50 transition">
                  <td className="p-3 border">{s.id_store}</td>
                  <td className="p-3 border">{s.nama_store}</td>
                  <td className="p-3 border">{s.alamat_store}</td>
                  <td className="p-3 border text-center space-x-3">
                    <button
                      onClick={() => navigate(`/store/edit/${s.id_store}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStore(s.id_store)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
