import { useState } from "react";
import { Wallet, QrCode } from "lucide-react";

const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

export default function PembayaranCard({
  subtotal,
  metode,
  setMetode,
  jumlahBayar,
  setJumlahBayar,
  handleSubmit,
  loading,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Subtotal</h3>
        <span className="font-bold text-blue-600 text-lg">
          {formatRupiah(subtotal)}
        </span>
      </div>

      {/* PILIH METODE PEMBAYARAN */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "cash", icon: <Wallet size={18} />, label: "CASH" },
          { key: "qris", icon: <QrCode size={18} />, label: "QRIS" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setMetode(key)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold ${
              metode === key
                ? "bg-[#0e57b5] text-white"
                : "bg-gray-100 hover:bg-blue-50 text-gray-700"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* INPUT JUMLAH BAYAR & KEMBALIAN HANYA UNTUK CASH */}
      {metode !== "qris" && (
        <>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Jumlah Bayar
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Masukkan jumlah bayar"
              value={
                jumlahBayar
                  ? "Rp" +
                    jumlahBayar.toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                    })
                  : ""
              }
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                setJumlahBayar(Number(numericValue || 0));
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full text-right font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {jumlahBayar > 0 && (
            <div className="text-right">
              {jumlahBayar >= subtotal ? (
                <p className="text-green-600 font-semibold">
                  Kembalian: {formatRupiah(jumlahBayar - subtotal)}
                </p>
              ) : (
                <p className="text-red-600 font-semibold">
                  Kurang: {formatRupiah(subtotal - jumlahBayar)}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || (metode === "cash" && jumlahBayar < subtotal)}
        className={`w-full font-medium py-3 rounded-lg ${
          loading || (metode === "cash" && jumlahBayar < subtotal)
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#0e57b5] hover:bg-[#0b4894] text-white shadow-sm"
        }`}
      >
        {loading ? "Menyimpan..." : "Simpan & Cetak Struk"}
      </button>
    </div>
  );
}
