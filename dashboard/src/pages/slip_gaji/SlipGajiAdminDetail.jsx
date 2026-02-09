import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { Download, AlertTriangle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import useProfil from "../../hooks/useProfil";
import { formatPeriode } from "../../utils/dateFormatter";
import html2canvas from "html2canvas-pro";
import { renderToStaticMarkup } from "react-dom/server";
import SlipGajiContent from "../../components/SlipGajiContent";
import { terbilang } from "../../utils/terbilang";
import BackButton from "../../components/BackButton";

export default function SlipGajiAdminDetail() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const { profil } = useProfil();
  const logoSrc = profil?.logo_url || "/Logo1.png";

  const getBase64Image = async (url) => {
    try {
      const res = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!res.ok) return null;

      const blob = await res.blob();

      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null; // ⬅️ PENTING: jangan throw
    }
  };

  const { id } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const role = searchParams.get("role");
  const periode = searchParams.get("periode");

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        const url =
          role === "kasir"
            ? `${API_URL}/gaji/slip?role=kasir&id_kasir=${id}&periode=${periode}`
            : `${API_URL}/gaji/slip?role=capster&id_capster=${id}&periode=${periode}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          setErrorMsg("Data slip gaji tidak ditemukan.");
          return;
        }

        setData(json.data);
      } catch {
        setErrorMsg("Gagal memuat slip gaji.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, []);

  if (loading) return null;

  const daftarBonus = data.daftar_bonus || [];
  const daftarPotongan = data.daftar_potongan || [];
  const daftarKasbon = data.daftar_kasbon || [];

  const totalPendapatan =
    Number(data.gaji_pokok || 0) +
    Number(data.total_bonus || 0) +
    (role === "capster" ? Number(data.total_komisi || 0) : 0);

  const totalPotongan = Number(data.potongan_bulan_ini || 0);
  const totalDiterima = totalPendapatan - totalPotongan;

  const getAllStyles = () => {
    return Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((el) => el.outerHTML)
      .join("\n");
  };

  const handleDownload = async () => {
    try {
      const logoBase64 = logoSrc ? await getBase64Image(logoSrc) : null;
      const styles = getAllStyles();

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument;

      const html = renderToStaticMarkup(
        <SlipGajiContent
          data={data}
          profil={profil}
          role={role}
          daftarBonus={daftarBonus}
          daftarPotongan={daftarPotongan}
          daftarKasbon={daftarKasbon}
          totalPendapatan={totalPendapatan}
          totalPotongan={totalPotongan}
          totalDiterima={totalDiterima}
          logoSrc={logoBase64 || logoSrc}
        />,
      );

      doc.open();
      doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          ${styles}

          <script src="https://cdn.tailwindcss.com"></script>

          <style>
            body {
              margin: 0;
              background: white;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
      `);
      doc.close();

      await new Promise((r) => setTimeout(r, 1200));

      const canvas = await html2canvas(doc.body, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const img = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = img;
      a.download = `Slip-Gaji-${data.nama}.png`;
      a.click();

      document.body.removeChild(iframe);
    } catch (err) {
      console.error("Gagal download slip:", err);
    }
  };

  return (
    <MainLayout current="Slip Gaji">
      {/* Header */}
      <div className="bg-white rounded-t-2xl border-b border-gray-100 p-6 space-y-2">
        {/* Back */}
        <BackButton to="/slip-admin" />
        <h1 className="text-lg font-semibold text-slate-800 mt-4">
          Slip Gaji Bulanan
        </h1>
        <p className="text-sm text-gray-500">
          Detail gaji, bonus, potongan, dan kasbon bulan ini.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-4 m-6 rounded">
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      {!errorMsg && data && (
        <div className="w-full bg-white rounded-b-2xl shadow-sm border border-gray-100 px-10 py-10">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <div className="flex gap-4 items-start">
              <img src={logoSrc} className="w-20 h-20 object-contain" />

              <div>
                <div className="font-bold text-lg text-slate-800">
                  {profil?.nama_barbershop}
                </div>

                {data.alamat_store && (
                  <div className="text-sm text-gray-500 max-w-md leading-snug">
                    {data.alamat_store}
                  </div>
                )}

                <div className="text-sm text-slate-700">
                  Telp: {profil?.telepon}
                </div>
              </div>
            </div>
          </div>

          {/* IDENTITAS */}
          <div className="mb-6 text-[15px]">
            <div className="grid grid-cols-[80px_10px_1fr] gap-y-1">
              <div className="font-semibold">Nama</div>
              <div>:</div>
              <div>{data.nama}</div>

              <div className="font-semibold">Posisi</div>
              <div>:</div>
              <div>{role === "kasir" ? "Kasir" : "Kapster"}</div>

              <div className="font-semibold">Cabang</div>
              <div>:</div>
              <div>{data.nama_store}</div>

              <div className="font-semibold">Periode</div>
              <div>:</div>
              <div>{formatPeriode(data.periode_raw)}</div>
            </div>
          </div>

          {/* A. PENCAIRAN */}
          <div className="mb-8">
            <div className="font-bold text-slate-800 mb-3">A. PENCAIRAN</div>

            <div className="space-y-1 text-[15px]">
              {/* Gaji Pokok hanya untuk KASIR */}
              {role === "kasir" && Number(data.gaji_pokok) > 0 && (
                <div className="flex justify-between">
                  <span>Gaji Pokok</span>
                  <span>
                    Rp {Number(data.gaji_pokok).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {/* Komisi hanya untuk CAPSTER */}
              {role === "capster" && (
                <div className="flex justify-between">
                  <span>Komisi</span>
                  <span>
                    Rp {Number(data.total_komisi).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {/* BONUS */}
              {daftarBonus.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Bonus</div>

                  <div className="mt-1 ml-4 space-y-1 text-sm text-gray-600">
                    {daftarBonus.map((b, i) => (
                      <div key={i} className="flex justify-between">
                        <span>• {b.keterangan}</span>
                        <span>
                          Rp {Number(b.jumlah).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOTAL */}
              <div
                className="flex justify-between font-semibold text-[#0e57b5] 
                    border-t border-dashed border-gray-300 pt-2 mt-3"
              >
                <span>Total Pendapatan</span>
                <span>Rp {totalPendapatan.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* B. POTONGAN */}
          <div className="mb-8">
            <div className="font-bold text-slate-800 mb-3">B. POTONGAN</div>

            <div className="space-y-1 text-[15px]">
              {daftarPotongan.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{p.keterangan}</span>
                  <span>Rp {Number(p.jumlah).toLocaleString("id-ID")}</span>
                </div>
              ))}

              {/* DETAIL KASBON */}
              {daftarKasbon.map((k, i) => {
                const sisaCicilan = Math.max(
                  0,
                  Number(k.jumlah_cicilan) - Number(k.cicilan_terbayar),
                );

                return (
                  <div key={i} className="ml-4 mt-2 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <span>•</span>
                      <div className="grid grid-cols-[95px_6px_1fr] gap-y-1">
                        <div>Sisa Kasbon</div>
                        <div>:</div>
                        <div className="font-mono">
                          Rp {Number(k.sisa_kasbon).toLocaleString("id-ID")}
                        </div>

                        <div>Sisa Cicilan</div>
                        <div>:</div>
                        <div>{sisaCicilan} kali</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div
                className="flex justify-between font-semibold text-[#0e57b5] 
                    border-t border-dashed border-gray-300 pt-2 mt-3"
              >
                <span>Total Potongan</span>
                <span>Rp {totalPotongan.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* C. TOTAL */}
          <div className="mb-10">
            <div className="font-bold text-slate-800 mb-3">C. TOTAL</div>

            <div className="space-y-1 text-[15px]">
              <div className="flex justify-between">
                <span>Total Pendapatan</span>
                <span>Rp {totalPendapatan.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Potongan</span>
                <span>Rp {totalPotongan.toLocaleString("id-ID")}</span>
              </div>

              <div
                className="flex justify-between font-bold text-[#0e57b5] 
                    border-t border-dashed border-gray-300 pt-2 mt-2"
              >
                <span>Total Diterima</span>
                <span>Rp {totalDiterima.toLocaleString("id-ID")}</span>
              </div>
              <div className="mt-2 text-sm italic text-gray-600">
                Terbilang:{" "}
                <span className="font-medium">
                  ({terbilang(totalDiterima)} Rupiah)
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-16 flex justify-end">
            <div className="text-left w-40">
              <div>Mengetahui,</div>
              <div>Owner</div>

              <div className="mt-12 font-semibold">{data.nama_owner}</div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={handleDownload}
              className="bg-[#0e57b5] hover:bg-[#0b4894] text-white px-6 py-2 rounded flex gap-2 mx-auto transition"
            >
              <Download size={18} /> Download Slip Gaji
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
