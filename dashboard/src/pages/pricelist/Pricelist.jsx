import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchPricelist from "../../hooks/useFetchPricelist";
import ConfirmModal from "../../components/ConfirmModal";
import { Pencil, Trash2, Search } from "lucide-react";

export default function Pricelist() {
  const { data, loading, error, deletePricelist } = useFetchPricelist();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const savedMessage = localStorage.getItem("pricelistMessage");
    if (savedMessage) {
      const msg = JSON.parse(savedMessage);
      setNotif(msg);
      localStorage.removeItem("pricelistMessage");
      setTimeout(() => setNotif(null), 4000);
    }
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        item.service.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  const handleDelete = (id, name) => {
    setSelectedId(id);
    setSelectedService(name);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePricelist(selectedId);
      setNotif({
        type: "success",
        text: `Layanan "${selectedService}" berhasil dihapus.`,
      });
    } catch {
      setNotif({
        type: "error",
        text: "Gagal menghapus layanan.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setSelectedService(null);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <MainLayout current="pricelist">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Daftar Layanan
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/pricelist/add")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Tambah Layanan
          </button>
        </div>
      </div>

      {notif && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium ${
            notif.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {notif.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat data layanan...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500">Layanan tidak ditemukan.</p>
      ) : (
        <div className="bg-white border rounded-xl p-5 shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-center w-16">No</th>
                <th className="p-3 border text-left">Layanan</th>
                <th className="p-3 border text-right">Harga</th>
                <th className="p-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, i) => (
                <tr key={item.id_pricelist} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border">{item.service}</td>
                  <td className="p-3 border text-right">
                    Rp {Number(item.harga).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/pricelist/edit/${item.id_pricelist}`)
                        }
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(item.id_pricelist, item.service)
                        }
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message={`Apakah Anda yakin ingin menghapus layanan "${selectedService}"?`}
      />
    </MainLayout>
  );
}
