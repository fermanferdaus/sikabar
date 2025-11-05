import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import MainLayout from "../../layouts/MainLayout";
import { Download, AlertTriangle } from "lucide-react";

export default function SlipGaji() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // custom alert state

  const API_URL = import.meta.env.VITE_API_URL;
  const role = localStorage.getItem("role");
  const idUser = localStorage.getItem("id_user");
  const idCapster = localStorage.getItem("id_capster");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!["kasir", "capster"].includes(role)) {
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
        const res = await fetch(
          `${API_URL}/gaji/slip?role=${role}&id_user=${
            idUser || ""
          }&id_capster=${idCapster || ""}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

        .logo img {
          width: 75px;
          height: 75px;
          object-fit: contain;
        }

        header h1 {
          font-size: 22px;
          color: #0e57b5;
          font-weight: 700;
          margin: 0;
          text-align: right;
          line-height: 1.3;
        }

        .info {
          margin-bottom: 18px;
          line-height: 1.6;
          display: grid;
          grid-template-columns: 120px 1fr;
          row-gap: 4px;
          font-size: 15px;
        }

        .info .label { font-weight: 600; color: #1e293b; }
        .info .value { text-align: left; }

        .section { width: 100%; font-size: 15px; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; }
        .label { font-weight: 500; color: #1e293b; }
        .value { text-align: right; min-width: 130px; }

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

        footer {
          margin-top: 40px;
          font-size: 13px;
          color: #64748b;
          text-align: left;
        }
        footer .brand { font-weight: 600; color: #0e57b5; }
      `;

      const total =
        Number(data?.gaji_pokok || 0) +
        Number(data?.total_bonus || 0) +
        (role === "capster" ? Number(data?.total_komisi || 0) : 0);

      doc.open();
      doc.write(`
        <html>
          <head><style>${css}</style></head>
          <body>
            <header>
              <div class="logo">
                <img src="/Logo.png" alt="Logo Le Muani Barbershop" />
              </div>
              <h1>
                Slip Gaji Bulan<br />${data?.periode || "N/A"}
              </h1>
            </header>

            <section class="info">
              <div class="label">Nama</div><div class="value">: ${data?.nama}</div>
              <div class="label">Jabatan</div><div class="value">: ${
                role === "kasir" ? "Kasir" : "Capster"
              }</div>
              <div class="label">Cabang</div><div class="value">: ${
                data?.nama_store
              }</div>
            </section>

            <section class="section">
              <div class="row"><span class="label">Gaji Pokok</span><span class="value">Rp ${Number(
                data?.gaji_pokok
              ).toLocaleString("id-ID")}</span></div>
              <div class="row"><span class="label">Bonus</span><span class="value">Rp ${Number(
                data?.total_bonus
              ).toLocaleString("id-ID")}</span></div>
              ${
                role === "capster"
                  ? `<div class="row"><span class="label">Komisi</span><span class="value">Rp ${Number(
                      data?.total_komisi
                    ).toLocaleString("id-ID")}</span></div>`
                  : ""
              }
              <div class="total">
                <span>Total Diterima</span>
                <span>Rp ${total.toLocaleString("id-ID")}</span>
              </div>
            </section>

            <footer>
              Dicetak otomatis oleh sistem <span class="brand">Le Muani Barbershop</span><br/>
              ${new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </footer>
          </body>
        </html>
      `);
      doc.close();

      const canvas = await html2canvas(iframe.contentDocument.body, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = img;
      a.download = `Slip-Gaji-${data?.nama || "User"}.png`;
      a.click();

      document.body.removeChild(iframe);
    } catch (err) {
      console.error("❌ Gagal generate gambar slip:", err);
      setErrorMsg("Gagal membuat slip gaji. Coba ulangi lagi.");
    }
  };

  const total =
    Number(data?.gaji_pokok || 0) +
    Number(data?.total_bonus || 0) +
    (role === "capster" ? Number(data?.total_komisi || 0) : 0);

  return (
    <MainLayout current="Slip Gaji">
      {/* Header section */}
      <div className="bg-white rounded-t-2xl border-b border-gray-100 p-6">
        <h1 className="text-lg font-semibold text-slate-800">Slip Gaji Bulanan</h1>
        <p className="text-sm text-gray-500">
          Detail gaji dan bonus yang diterima bulan ini.
        </p>
      </div>

      {/* Alert custom */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-10 my-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card Slip */}
      {!errorMsg && !loading && data && (
        <div className="w-full bg-white rounded-b-2xl shadow-sm border border-gray-100 px-10 py-10">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <img src="/Logo.png" alt="Logo" className="w-20 h-20 object-contain" />
            <h1 className="text-2xl font-bold text-[#0e57b5] text-right leading-tight">
              Slip Gaji Bulan <br /> {data.periode || "N/A"}
            </h1>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-y-1 text-[15px] mb-4">
            <div className="font-semibold text-gray-800">Nama</div>
            <div>: {data.nama}</div>
            <div className="font-semibold text-gray-800">Jabatan</div>
            <div>: {role === "kasir" ? "Kasir" : "Capster"}</div>
            <div className="font-semibold text-gray-800">Cabang</div>
            <div>: {data.nama_store}</div>
          </div>

          <div className="text-[15px] space-y-1">
            <div className="flex justify-between">
              <span>Gaji Pokok</span>
              <span>Rp {Number(data.gaji_pokok).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus</span>
              <span>Rp {Number(data.total_bonus).toLocaleString("id-ID")}</span>
            </div>

            {role === "capster" && (
              <div className="flex justify-between">
                <span>Komisi</span>
                <span>Rp {Number(data.total_komisi).toLocaleString("id-ID")}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-[#0e57b5] border-t border-dashed border-gray-300 pt-2 mt-2">
              <span>Total Diterima</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

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
