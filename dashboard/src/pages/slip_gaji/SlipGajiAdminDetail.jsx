import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import MainLayout from "../../layouts/MainLayout";
import { Download, AlertTriangle, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import useProfil from "../../hooks/useProfil";

export default function SlipGajiAdminDetail() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const { profil } = useProfil();
  const logoSrc = profil?.logo_url || "/Logo1.png";

  const { id } = useParams();
  const role = new URLSearchParams(window.location.search).get("role");

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      window.location.href = "/dashboard";
      return;
    }
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchSlip = async () => {
      try {
        setLoading(true);

        const url =
          role === "kasir"
            ? `${API_URL}/gaji/slip?role=kasir&id_kasir=${id}`
            : `${API_URL}/gaji/slip?role=capster&id_capster=${id}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setErrorMsg("Gagal mengambil data slip gaji dari server.");
          setData(null);
          return;
        }
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          setErrorMsg(null);
        } else {
          setErrorMsg("Data slip tidak ditemukan.");
          setData(null);
        }
      } catch (err) {
        console.error("Gagal mengambil data slip:", err);
        setErrorMsg("Terjadi kesalahan saat memuat data slip gaji.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, []);

  /* ===========================
        HITUNG AKUMULASI KASBON
  ============================ */
  const daftarKasbon = Array.isArray(data?.daftar_kasbon)
    ? data.daftar_kasbon
    : [];

  const totalSisaKasbon = daftarKasbon.reduce(
    (a, b) => a + Number(b.sisa_kasbon || 0),
    0
  );

  const totalTotalKasbon = daftarKasbon.reduce(
    (a, b) => a + Number(b.jumlah_total || 0),
    0
  );

  const totalSisaCicilan = daftarKasbon.reduce(
    (a, b) =>
      a +
      Math.max(
        0,
        Number(b.jumlah_cicilan || 0) - Number(b.cicilan_terbayar || 0)
      ),
    0
  );

  const daftarBonus = Array.isArray(data?.daftar_bonus)
    ? data.daftar_bonus
    : [];
  const daftarPotongan = Array.isArray(data?.daftar_potongan)
    ? data.daftar_potongan
    : [];

  const total =
    Number(data?.gaji_pokok || 0) +
    Number(data?.total_bonus || 0) +
    (role === "capster" ? Number(data?.total_komisi || 0) : 0) -
    Number(data?.potongan_bulan_ini || 0);

  /* ===========================
        DOWNLOAD PNG
  ============================ */
  const handleDownload = async () => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      const css = `
      * { box-sizing: border-box; }
      body {
        font-family: 'Inter', Arial, sans-serif;
        background: #ffffff;
        color: #1e293b;
        padding: 60px 80px;
        width: 700px;
        margin: auto;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 15px;
        margin-bottom: 25px;
      }
      .logo img { width: 75px; height: 75px; object-fit: contain; }
      header h1 {
        font-size: 22px; color: #0e57b5; font-weight: 700;
        margin: 0; text-align: right; line-height: 1.3;
      }
      .info {
        margin-bottom: 25px;
        font-size: 15px;
        line-height: 1.6;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 12px;
      }
      .info .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .info .label {
        flex: 0 0 90px;
        font-weight: 700;
        color: #1e293b;
      }
      .info .colon {
        flex: 0 0 10px;
        text-align: center;
        color: #1e293b;
        font-weight: 600;
      }
      .info .value {
        flex: 1;
        text-align: left;
        color: #334155;
      }
      .section { width: 100%; font-size: 15px; }
      .row { display: flex; justify-content: space-between; margin: 6px 0; }
      .label { font-weight: 500; color: #1e293b; }
      .value { min-width: 130px; text-align: right; }
      .list { margin-left: 10px; color: #475569; font-size: 13px; }
      .item { margin-top: 4px; }
      .total {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        color: #0e57b5;
        font-size: 16px;
        margin-top: 16px;
        border-top: 1px dashed #cbd5e1;
        padding-top: 10px;
      }

      .kasbon-block {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 700;
        color: #d00000;
      }

      .kasbon-note {
        margin-top: 6px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #64748b;
      }

      footer {
        margin-top: 20px;
        font-size: 13px;
        color: #64748b;
        text-align: left;
      }
      footer .brand { font-weight: 600; color: #0e57b5; }
      `;

      doc.open();
      doc.write(`
      <html><head><style>${css}</style></head><body>

        <header>
          <div class="logo"><img src="${logoSrc}" crossorigin="anonymous" alt="Logo" /></div>
          <h1>Slip Gaji Bulan<br />${data?.periode || "N/A"}</h1>
        </header>

        <section class="info">
          <div class="row"><div class="label">Nama</div><div class="colon">:</div><div class="value">${
            data?.nama
          }</div></div>
          <div class="row"><div class="label">Jabatan</div><div class="colon">:</div><div class="value">${
            role === "kasir" ? "Kasir" : "Capster"
          }</div></div>
          <div class="row"><div class="label">Cabang</div><div class="colon">:</div><div class="value">${
            data?.nama_store
          }</div></div>
        </section>

        <section class="section">

          ${
            Number(data?.gaji_pokok) > 0
              ? `<div class="row"><span class="label">Gaji Pokok</span><span class="value">Rp ${Number(
                  data?.gaji_pokok
                ).toLocaleString("id-ID")}</span></div>`
              : ""
          }

          ${
            role === "capster"
              ? `<div class="row"><span class="label">Komisi</span><span class="value">Rp ${Number(
                  data?.total_komisi
                ).toLocaleString("id-ID")}</span></div>`
              : ""
          }

          ${
            data?.total_bonus > 0
              ? `<div class="row"><span class="label">Bonus</span><span class="value">Rp ${Number(
                  data?.total_bonus
                ).toLocaleString("id-ID")}</span></div>
                ${
                  daftarBonus.length
                    ? `<div class="list">${daftarBonus
                        .map(
                          (b) =>
                            `<div class="item">• ${
                              b.keterangan || "-"
                            } (Rp ${Number(b.jumlah).toLocaleString(
                              "id-ID"
                            )})</div>`
                        )
                        .join("")}</div>`
                    : ""
                }`
              : ""
          }

          ${
            data?.potongan_bulan_ini > 0
              ? `<div class="row"><span class="label">Potongan</span><span class="value">- Rp ${Number(
                  data?.potongan_bulan_ini
                ).toLocaleString("id-ID")}</span></div>
                ${
                  daftarPotongan.length
                    ? `<div class="list">${daftarPotongan
                        .map(
                          (p) =>
                            `<div class="item">• ${
                              p.keterangan || "-"
                            } (Rp ${Number(p.jumlah).toLocaleString(
                              "id-ID"
                            )})</div>`
                        )
                        .join("")}</div>`
                    : ""
                }`
              : ""
          }

          <div class="total"><span>Total Diterima</span><span>Rp ${total.toLocaleString(
            "id-ID"
          )}</span></div>

          ${
            daftarKasbon.length
              ? `
            <div class="kasbon-block">
              <span>Total Kasbon Tersisa</span>
              <span>Rp ${totalSisaKasbon.toLocaleString("id-ID")}</span>
            </div>

            <div class="kasbon-note">
              Total sisa cicilan: ${totalSisaCicilan} kali — Total kasbon: Rp ${totalTotalKasbon.toLocaleString(
                  "id-ID"
                )}
            </div>

            <div class="list">
              ${daftarKasbon
                .map(
                  (k, i) => `
                  <div class="item">• Kasbon #${i + 1} — Sisa: Rp ${Number(
                    k.sisa_kasbon
                  ).toLocaleString("id-ID")} (cicilan tersisa: ${
                    Number(k.jumlah_cicilan) - Number(k.cicilan_terbayar)
                  } kali)</div>
                `
                )
                .join("")}
            </div>
          `
              : ""
          }

        </section>

        <footer>
          Dicetak otomatis oleh sistem <span class="brand">Le Muani Barbershop</span><br/>
          ${new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </footer>

      </body></html>
    `);

      doc.close();

      const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const img = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = img;
      a.download = `Slip-Gaji-${data?.nama}.png`;
      a.click();

      document.body.removeChild(iframe);
    } catch (err) {
      console.error("❌ Gagal generate gambar slip:", err);
      setErrorMsg("Gagal membuat slip gaji.");
    }
  };
  return (
    <MainLayout current="Slip Gaji">
      <div className="bg-white rounded-t-2xl border-b border-gray-100 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Slip Gaji Bulanan
          </h1>
          <p className="text-sm text-gray-500">
            Detail gaji, bonus, potongan, dan kasbon bulan ini.
          </p>
        </div>

        <button
          onClick={() => navigate("/slip-admin")}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 
                     text-gray-800 px-4 py-2.5 rounded-xl text-sm font-medium 
                     shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-10 my-4 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!errorMsg && !loading && data && (
        <div className="w-full bg-white rounded-b-2xl shadow-sm border border-gray-100 px-10 py-10">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <img src={logoSrc} className="w-20 h-20 object-contain" />
            <h1 className="text-2xl font-bold text-[#0e57b5] text-right">
              Slip Gaji Bulan <br /> {data.periode}
            </h1>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-y-1 text-[15px] mb-4">
            <div className="font-semibold">Nama</div>
            <div>: {data.nama}</div>
            <div className="font-semibold">Jabatan</div>
            <div>: {role === "kasir" ? "Kasir" : "Capster"}</div>
            <div className="font-semibold">Cabang</div>
            <div>: {data.nama_store}</div>
          </div>

          <div className="text-[15px] space-y-1">
            {Number(data.gaji_pokok) > 0 && (
              <div className="flex justify-between">
                <span>Gaji Pokok</span>
                <span>
                  Rp {Number(data.gaji_pokok).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {role === "capster" && (
              <div className="flex justify-between">
                <span>Komisi</span>
                <span>
                  Rp {Number(data.total_komisi).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {data.total_bonus > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Bonus</span>
                  <span>
                    Rp {Number(data.total_bonus).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="mt-2 pl-3 border-l-2 border-gray-200 text-sm text-gray-600 space-y-1">
                  {daftarBonus.map((b, i) => (
                    <div key={i}>
                      • {b.keterangan} (Rp{" "}
                      {Number(b.jumlah).toLocaleString("id-ID")})
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.potongan_bulan_ini > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Potongan</span>
                  <span>
                    - Rp{" "}
                    {Number(data.potongan_bulan_ini).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="mt-2 pl-3 border-l-2 border-gray-200 text-sm text-gray-600 space-y-1">
                  {daftarPotongan.map((p, i) => (
                    <div key={i}>
                      • {p.keterangan} (Rp{" "}
                      {Number(p.jumlah).toLocaleString("id-ID")})
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-between font-semibold text-[#0e57b5] border-t border-dashed border-gray-300 pt-2 mt-2">
              <span>Total Diterima</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>

            {daftarKasbon.length > 0 && (
              <>
                <div className="flex justify-between font-semibold text-red-600 mt-1">
                  <span>Total Kasbon Tersisa</span>
                  <span>Rp {totalSisaKasbon.toLocaleString("id-ID")}</span>
                </div>

                <div className="text-xs text-gray-500 -mt-1 mb-1">
                  Total sisa cicilan: {totalSisaCicilan} kali — Total kasbon: Rp{" "}
                  {totalTotalKasbon.toLocaleString("id-ID")}
                </div>

                <div className="mt-2 pl-3 border-l-2 border-gray-200 text-sm text-gray-600 space-y-1">
                  {daftarKasbon.map((k, i) => (
                    <div key={i}>
                      • Kasbon #{i + 1} — Sisa: Rp{" "}
                      {Number(k.sisa_kasbon).toLocaleString("id-ID")} (cicilan
                      tersisa:{" "}
                      {Math.max(
                        0,
                        Number(k.jumlah_cicilan) - Number(k.cicilan_terbayar)
                      )}{" "}
                      kali)
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div className="text-sm text-gray-500 mt-6">
            Dicetak otomatis oleh sistem{" "}
            <span className="font-semibold text-[#0e57b5]">
              Le Muani Barbershop
            </span>
            <br />
            {new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-md flex items-center gap-2 justify-center mx-auto"
            >
              <Download size={18} /> Download Slip Gaji (PNG)
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
