import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisiSetting from "../../hooks/useFetchKomisiSetting";
import { formatTanggalJam } from "../../utils/dateFormatter";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Search } from "lucide-react";

export default function KomisiSetting() {
  const { data, loading, error, deleteKomisi } = useFetchKomisiSetting();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedMessage = localStorage.getItem("komisiMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("komisiMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  const handleDelete = (id, storeName) => {
    setSelectedId(id);
    setSelectedStore(storeName);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKomisi(selectedId);
      setNotif({
        type: "success",
        text: `Pengaturan komisi untuk store "${selectedStore}" berhasil dihapus.`,
      });
    } catch {
      setNotif({
        type: "error",
        text: "Gagal menghapus pengaturan komisi.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setSelectedStore(null);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  const filteredData = data.filter((item) =>
    item.nama_store.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout current="komisi setting">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Pengaturan Komisi Capster
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/komisi-setting/add")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Tambah Komisi
          </button>
        </div>
      </div>

      {notif && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            notif.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {notif.text}
        </div>
      )}

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
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-6 border italic"
                  >
                    Tidak ada data yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id_setting}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border">{item.id_setting}</td>
                    <td className="p-3 border">{item.nama_store}</td>
                    <td className="p-3 border text-center text-blue-700 font-medium">
                      {Math.floor(item.persentase_capster)}%
                    </td>
                    <td className="p-3 border text-center">
                      {formatTanggalJam(item.updated_at)}
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/komisi-setting/edit/${item.id_setting}`)
                          }
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(item.id_setting, item.nama_store)
                          }
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message={`Apakah Anda yakin ingin menghapus pengaturan komisi untuk store "${selectedStore}"?`}
      />
    </MainLayout>
  );
}
