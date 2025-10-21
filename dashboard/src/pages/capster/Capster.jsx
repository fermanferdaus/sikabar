import MainLayout from "../../layouts/MainLayout";
import useFetchCapster from "../../hooks/useFetchCapster";

export default function Capster() {
  const { capsters, loading, error } = useFetchCapster();

  return (
    <MainLayout current="capster">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Data Capster</h1>
        <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition">
          + Tambah Capster
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : capsters.length === 0 ? (
        <p className="text-gray-500">Belum ada capster.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Nama Capster</th>
                <th className="p-3 border text-left">Store</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {capsters.map((c, i) => (
                <tr key={c.id_capster} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{c.nama_capster}</td>
                  <td className="p-3 border">{c.nama_store}</td>
                  <td className="p-3 border text-center space-x-2">
                    <button className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
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
