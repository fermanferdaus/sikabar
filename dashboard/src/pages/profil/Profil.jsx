import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import useProfil from "../../hooks/useProfil";

export default function Profil() {
  const { profil, loading, error } = useProfil();
  const role = localStorage.getItem("role");

  const [alert, setAlert] = useState(null);

  // Ambil alert dari hasil edit
  useEffect(() => {
    const message = localStorage.getItem("profilMessage");
    if (message) {
      setAlert(JSON.parse(message));
      localStorage.removeItem("profilMessage");
      setTimeout(() => setAlert(null), 3500);
    }
  }, []);

  if (loading) {
    return (
      <MainLayout current="profil">
        <p className="text-gray-500">Memuat data profil...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout current="profil">
        <p className="text-red-500">{error}</p>
      </MainLayout>
    );
  }

  // Kolom tabel
  const columns = [
    { key: "field", label: "Informasi" },
    { key: "value", label: "Data" },
  ];

  // Data tabel
  const data = [
    {
      field: "Logo",
      value: (
        <img
          src={profil.logo_url}
          alt="Logo Barbershop"
          className="w-32 h-32 object-contain rounded-lg p-1 shadow-sm bg-gray-50"
        />
      ),
    },
    { field: "Nama Barbershop", value: profil.nama_barbershop || "-" },
    { field: "Nama Owner", value: profil.nama_owner || "-" },
    { field: "Nomor Telepon", value: profil.telepon || "-" },
    {
      field: "Instagram",
      value: (
        <a
          href={profil.instagram}
          className="text-blue-600 underline"
          target="_blank"
        >
          {profil.instagram}
        </a>
      ),
    },
    {
      field: "TikTok",
      value: (
        <a
          href={profil.tiktok}
          className="text-blue-600 underline"
          target="_blank"
        >
          {profil.tiktok}
        </a>
      ),
    },
  ];

  return (
    <MainLayout current="profil">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Profil Barbershop
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Informasi utama barbershop dan logo.
            </p>
          </div>

          {role === "admin" && (
            <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-start sm:justify-end">
              <Link
                to="/profil/edit"
                className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
              >
                <Pencil size={16} />
                Edit Profil
              </Link>
            </div>
          )}
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium border ${
              alert.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {alert.text}
          </div>
        )}

        {/* Tabel Profil */}
        <TableData
          columns={columns}
          data={data}
          searchTerm=""
          hideEntries={true} // 🔥 Hilangkan “Tampilkan X entri”
        />
      </div>
    </MainLayout>
  );
}
