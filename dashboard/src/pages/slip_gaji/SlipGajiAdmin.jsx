import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SlipGajiAdmin() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }
    getData();
  }, [selectedMonth]);

  const getData = async () => {
    try {
      setLoading(true);

      // Ambil daftar pegawai
      const res = await fetch(`${API_URL}/gaji/pegawai-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setErrorMsg("Gagal mengambil data pegawai.");
        setPegawai([]);
        return;
      }

      const result = await res.json();

      // Ambil slip untuk tiap pegawai
      const enriched = await Promise.all(
        result.map(async (p) => {
          try {
            const periode = selectedMonth; // YYYY-MM

            const slipUrl =
              p.jabatan === "Kasir"
                ? `${API_URL}/gaji/slip?role=kasir&id_kasir=${p.id_kasir}&periode=${periode}`
                : `${API_URL}/gaji/slip?role=capster&id_capster=${p.id_capster}&periode=${periode}`;

            const slipRes = await fetch(slipUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const slipData = await slipRes.json();

            return {
              ...p,
              total_gaji:
                slipData?.success && slipData?.data
                  ? slipData.data.total_diterima
                  : 0,
            };
          } catch {
            return { ...p, total_gaji: 0 };
          }
        })
      );

      setPegawai(enriched);
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat mengambil data pegawai.");
    } finally {
      setLoading(false);
    }
  };

  const toSlip = (p) => {
    navigate(
      `/slip-admin/${p.jabatan === "Kasir" ? p.id_kasir : p.id_capster}?role=${
        p.jabatan === "Kasir" ? "kasir" : "capster"
      }&periode=${selectedMonth}`
    );
  };

  return (
    <MainLayout current="Slip Gaji Pegawai">
      {(searchTerm) => {
        const keyword = searchTerm.toLowerCase();

        const filtered = pegawai.filter((p) => {
          return (
            p.nama.toLowerCase().includes(keyword) ||
            p.nama_store.toLowerCase().includes(keyword) ||
            p.jabatan.toLowerCase().includes(keyword)
          );
        });

        const columns = [
          { key: "no", label: "#" },
          { key: "nama", label: "Nama Pegawai" },
          { key: "jabatan", label: "Jabatan" },
          { key: "cabang", label: "Cabang" },
          { key: "total_gaji", label: "Total Gaji" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filtered.map((p, i) => {
          return {
            no: i + 1,
            nama: p.nama,
            jabatan: p.jabatan,
            cabang: p.nama_store,
            total_gaji: (
              <span className="text-green-700 font-medium">
                Rp {Number(p.total_gaji).toLocaleString("id-ID")}
              </span>
            ),
            aksi: (
              <button
                onClick={() => toSlip(p)}
                className="flex items-center gap-2 bg-[#0e57b5] hover:bg-[#0b4894] text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Lihat
              </button>
            ),
          };
        });

        return (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* =================== HEADER =================== */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Slip Gaji Pegawai
                </h1>
                <p className="text-sm text-gray-500">
                  Lihat total gaji pegawai berdasarkan bulan.
                </p>
              </div>
            </div>

            {/* =================== FILTER BULAN =================== */}
            <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Bulan:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* =================== TABLE =================== */}
            {loading ? (
              <p className="text-gray-500 italic">Memuat data pegawai...</p>
            ) : errorMsg ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex gap-2">
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            ) : (
              <TableData columns={columns} data={data} />
            )}
          </div>
        );
      }}
    </MainLayout>
  );
}
