import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import { formatTanggalJam } from "../../utils/dateFormatter";

export default function KomisiSetting() {
  const { data, loading, error, deleteKomisi } = useFetchKomisiSetting();
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus pengaturan komisi ini?"
    );
    if (confirmDelete) await deleteKomisi(id);
  };

  return (
    <MainLayout current="komisi setting">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Pengaturan Komisi Capster
        </h1>

        <button
          onClick={() => navigate("/komisi-setting/add")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Tambah Komisi
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data komisi...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white border rounded-xl p-6 shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-left">ID Setting</th>
                <th className="p-3 border text-left">Store</th>
                <th className="p-3 border text-center">
                  Persentase Capster (%)
                </th>
                <th className="p-3 border text-center">Update Terakhir</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-6 border"
                  >
                    Belum ada data komisi.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id_setting} className="hover:bg-gray-50">
                    <td className="p-3 border">{item.id_setting}</td>
                    <td className="p-3 border">{item.nama_store}</td>
                    <td className="p-3 border text-center text-blue-700 font-medium">
                      {Math.floor(item.persentase_capster)}%
                    </td>
                    <td className="p-3 border text-center">
                      {formatTanggalJam(item.updated_at)}
                    </td>
                    <td className="p-3 border text-center space-x-3">
                      <button
                        onClick={() =>
                          navigate(`/komisi-setting/edit/${item.id_setting}`)
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id_setting)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}
