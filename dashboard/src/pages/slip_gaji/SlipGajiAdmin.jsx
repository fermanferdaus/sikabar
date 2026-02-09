import { useEffect, useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import TableData from "../../components/TableData";
import { formatKasirID, formatCapsterID } from "../../utils/formatID";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SlipGajiAdmin() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [komisiBulanan, setKomisiBulanan] = useState([]);
  const [filterPosisi, setFilterPosisi] = useState("all");
  const [filterCabang, setFilterCabang] = useState("all");
  const [filterPegawai, setFilterPegawai] = useState("all");

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

  useEffect(() => {
    const fetchKomisi = async () => {
      try {
        const tanggal = `${selectedMonth}-01`;

        const res = await fetch(
          `${API_URL}/komisi?type=Bulanan&tanggal=${tanggal}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) return setKomisiBulanan([]);

        const data = await res.json();
        setKomisiBulanan(data || []);
      } catch {
        setKomisiBulanan([]);
      }
    };

    fetchKomisi();
  }, [selectedMonth]);

  const listCabang = useMemo(() => {
    const set = new Set();
    pegawai.forEach((p) => {
      if (p.nama_store) set.add(p.nama_store);
    });
    return Array.from(set);
  }, [pegawai]);

  const getLabelPegawai = (p) => {
    if (p.jabatan === "Kasir" && p.id_kasir)
      return `${formatKasirID(p.id_kasir)} - ${p.nama}`;
    if (p.jabatan === "Capster" && p.id_capster)
      return `${formatCapsterID(p.id_capster)} - ${p.nama}`;
    return p.nama;
  };

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
            const slip = slipData?.data || null;

            return {
              ...p,
              total_gaji: slip ? Number(slip.total_diterima || 0) : 0,
              komisi: Number(slip?.total_komisi || 0),
              bonus: Number(slip?.total_bonus || 0),
              potongan: Number(slip?.potongan_bulan_ini || 0),
              kasbon: Array.isArray(slip?.daftar_kasbon)
                ? slip.daftar_kasbon.reduce(
                    (sum, k) => sum + Number(k.jumlah_total || 0),
                    0
                  )
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
          const label = getLabelPegawai(p).toLowerCase();

          const matchNama =
            !keyword ||
            label.includes(keyword) ||
            p.nama.toLowerCase().includes(keyword) ||
            p.nama_store.toLowerCase().includes(keyword);

          const matchPegawai =
            filterPegawai === "all" || getLabelPegawai(p) === filterPegawai;

          const matchPosisi =
            filterPosisi === "all" || p.jabatan.toLowerCase() === filterPosisi;

          const matchCabang =
            filterCabang === "all" || p.nama_store === filterCabang;

          return matchNama && matchPegawai && matchPosisi && matchCabang;
        });

        const columns = [
          { key: "no", label: "#" },
          { key: "id_pengguna", label: "ID Pegawai" },
          { key: "nama", label: "Nama" },
          { key: "jabatan", label: "Posisi" },
          { key: "cabang", label: "Cabang" },
          { key: "komisi", label: "Komisi" },
          { key: "bonus", label: "Bonus" },
          { key: "kasbon", label: "Kasbon" },
          { key: "potongan", label: "Potongan" },
          { key: "total_gaji", label: "Total Gaji" },
          { key: "aksi", label: "Aksi" },
        ];

        const data = filtered.map((p, i) => {
          return {
            no: i + 1,
            id_pengguna: (
              <span className="font-semibold text-slate-700">
                {p.jabatan === "Kasir" && p.id_kasir
                  ? formatKasirID(p.id_kasir)
                  : p.jabatan === "Capster" && p.id_capster
                  ? formatCapsterID(p.id_capster)
                  : "-"}
              </span>
            ),
            nama: p.nama,
            jabatan: p.jabatan,
            cabang: p.nama_store,
            komisi: (
              <span className="text-emerald-600 font-medium">
                Rp {Number(p.komisi || 0).toLocaleString("id-ID")}
              </span>
            ),
            bonus: (
              <span className="text-blue-600 font-medium">
                Rp {Number(p.bonus || 0).toLocaleString("id-ID")}
              </span>
            ),
            kasbon: (
              <span className="text-orange-600 font-medium">
                Rp {Number(p.kasbon).toLocaleString("id-ID")}
              </span>
            ),
            potongan: (
              <span className="text-red-600 font-medium">
                Rp {Number(p.potongan).toLocaleString("id-ID")}
              </span>
            ),
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Pegawai:
                </label>
                <select
                  value={filterPegawai}
                  onChange={(e) => setFilterPegawai(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">Semua</option>
                  {pegawai.map((p) => {
                    const label = getLabelPegawai(p);
                    return (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* POSISI */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Posisi:
                </label>
                <select
                  value={filterPosisi}
                  onChange={(e) => setFilterPosisi(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">Semua</option>
                  <option value="kasir">Kasir</option>
                  <option value="capster">Capster</option>
                </select>
              </div>

              {/* CABANG */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Cabang:
                </label>
                <select
                  value={filterCabang}
                  onChange={(e) => setFilterCabang(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">Semua</option>
                  {listCabang.map((cabang) => (
                    <option key={cabang} value={cabang}>
                      {cabang}
                    </option>
                  ))}
                </select>
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
