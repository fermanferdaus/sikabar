import { formatPeriode } from "../utils/dateFormatter";
import { terbilang } from "../utils/terbilang";

export default function SlipGajiContent({
  data,
  profil,
  role,
  daftarBonus,
  daftarPotongan,
  daftarKasbon,
  totalPendapatan,
  totalPotongan,
  totalDiterima,
  logoSrc,
}) {
  return (
    <div style={{ width: "560px", background: "white", padding: "28px" }}>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div className="flex gap-4 items-start">
          <img src={logoSrc} className="w-20 h-20 object-contain" />

          <div>
            <div className="font-bold text-xl text-slate-800">
              {profil?.nama_barbershop}
            </div>

            {data.alamat_store && (
              <div
                className="text-[14px] text-gray-500 leading-snug"
                style={{
                  maxWidth: "420px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {data.alamat_store}
              </div>
            )}

            <div className="text-[15px] text-slate-700">
              Telp: {profil?.telepon}
            </div>
          </div>
        </div>
      </div>

      {/* IDENTITAS */}
      <div className="mb-6 text-[16px]">
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

        <div className="space-y-1 text-[16px]">
          {/* Gaji Pokok hanya untuk KASIR */}
          {role === "kasir" && Number(data.gaji_pokok) > 0 && (
            <div className="flex justify-between">
              <span>Gaji Pokok</span>
              <span>Rp {Number(data.gaji_pokok).toLocaleString("id-ID")}</span>
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

              <div className="mt-1 ml-4 space-y-1 text-[15px] text-gray-600">
                {daftarBonus.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <span>• {b.keterangan}</span>
                    <span>Rp {Number(b.jumlah).toLocaleString("id-ID")}</span>
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

        <div className="space-y-1 text-[16px]">
          {daftarPotongan.map((p, i) => (
            <div key={i} className="flex justify-between text-[15px]">
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
              <div key={i} className="ml-4 mt-2 text-[15px] text-gray-600">
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

        <div className="space-y-1 text-[16px]">
          <div className="flex justify-between">
            <span>Total Pendapatan</span>
            <span>Rp {totalPendapatan.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between">
            <span>Total Potongan</span>
            <span>Rp {totalPotongan.toLocaleString("id-ID")}</span>
          </div>

          <div
            className="flex justify-between font-extrabold text-xl text-[#0e57b5] 
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

          <div className="mt-10 font-semibold text-[16px]">
            {data.nama_owner}
          </div>
        </div>
      </div>
    </div>
  );
}
