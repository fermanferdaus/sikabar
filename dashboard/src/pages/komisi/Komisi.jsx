import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import useFetchKomisi from "../../hooks/useFetchKomisi";
import TableData from "../../components/TableData";

export default function Komisi() {
  const { komisi, komisiDetail, loading, error } = useFetchKomisi();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const data = role === "capster" ? komisiDetail : komisi;

  return (
    <MainLayout current="komisi">
      {(searchTerm) => {
        // 🔍 Filter untuk admin
        const filtered =
          role === "capster"
            ? data
            : data.filter(
                (k) =>
                  k.nama_capster
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  k.nama_store
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
              );

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 transition-all duration-300">
            {/* === Header Card === */}
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-xl font-semibold text-slate-800">
                {role === "capster" ? "Komisi Saya" : "Komisi Capster"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {role === "capster"
                  ? "Lihat pendapatan dan riwayat layanan Anda."
                  : "Daftar total komisi capster di seluruh cabang."}
              </p>
            </div>

            {/* === Konten Tabel === */}
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : role === "capster" && data ? (
              <KomisiCapster data={data} />
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">Data tidak ditemukan.</p>
            ) : (
              <KomisiAdmin data={filtered} navigate={navigate} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}

function KomisiCapster({ data }) {
  const columns = [
    { key: "no", label: "#" },
    { key: "service", label: "Service" },
    { key: "harga", label: "Harga" },
    { key: "komisi", label: "Komisi" },
  ];

  const tableData = data.riwayat.map((r, i) => ({
    no: i + 1,
    service: r.service,
    harga: (
      <div className="text-right">
        Rp {r.harga.toLocaleString("id-ID")}
      </div>
    ),
    komisi: (
      <div className="text-right text-green-600 font-semibold">
        Rp {r.komisi.toLocaleString("id-ID")}
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      {/* === Card Komisi === */}
      <div className="grid sm:grid-cols-2 gap-4 text-center">
        <div className="p-4 border rounded-xl bg-gray-50">
          <p className="text-gray-500">Pendapatan Kotor</p>
          <h2 className="text-2xl font-bold text-blue-600">
            Rp {Number(data.pendapatan_kotor || 0).toLocaleString("id-ID")}
          </h2>
        </div>
        <div className="p-4 border rounded-xl bg-gray-50">
          <p className="text-gray-500">Pendapatan Bersih (Komisi)</p>
          <h2 className="text-2xl font-bold text-green-600">
            Rp {Number(data.pendapatan_bersih || 0).toLocaleString("id-ID")}
          </h2>
        </div>
      </div>

      {/* === Tabel === */}
      <TableData columns={columns} data={tableData} />
    </div>
  );
}

function KomisiAdmin({ data, navigate }) {
  const columns = [
    { key: "no", label: "#" },
    { key: "nama_capster", label: "Capster" },
    { key: "nama_store", label: "Cabang" },
    { key: "total_komisi", label: "Total Komisi" },
    { key: "aksi", label: "Aksi" },
  ];

  const tableData = data.map((k, i) => ({
    no: i + 1,
    nama_capster: k.nama_capster,
    nama_store: k.nama_store,
    total_komisi: (
      <div className="text-left text-green-600 font-semibold">
        Rp {Number(k.total_komisi).toLocaleString("id-ID")}
      </div>
    ),
    aksi: (
      <button
        onClick={() => navigate(`/komisi/${k.id_capster}`)}
        className="text-[#0e57b5] hover:underline font-medium"
      >
        Lihat Detail
      </button>
    ),
  }));

  return <TableData columns={columns} data={tableData} />;
}
