import { useState } from "react";
import { Scissors } from "lucide-react";

const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

export default function ServiceGrid({ services, capsters, onAdd }) {
  const [selectedCapster, setCapster] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [clicked, setClicked] = useState(null);

  return (
    <div className="space-y-8">
      {/* PILIH CAPSTER */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Pilih Capster</h4>
        <div className="flex flex-wrap gap-3">
          {capsters.map((c) => (
            <button
              key={c.id_capster}
              onClick={() => {
                setCapster(c.id_capster);
                setShowWarning(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCapster === c.id_capster
                  ? "bg-[#0e57b5] text-white"
                  : "bg-gray-100 hover:bg-blue-50 text-gray-700"
              }`}
            >
              {c.nama_capster}
            </button>
          ))}
        </div>
      </div>

      {/* WARNING */}
      {showWarning && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200 animate-pulse">
          Pilih capster terlebih dahulu sebelum menambah layanan.
        </div>
      )}

      {/* PILIH LAYANAN */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Pilih Layanan</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {services.map((s) => (
            <button
              key={s.id_pricelist}
              onClick={() => {
                if (!selectedCapster) return setShowWarning(true);

                setClicked(s.id_pricelist);
                setTimeout(() => setClicked(null), 350);

                onAdd({
                  tipe: "service",
                  id_pricelist: s.id_pricelist,
                  id_capster: selectedCapster,
                  nama: s.service,
                  harga: Number(s.harga),
                });
              }}
              className={`bg-white border border-gray-200 rounded-xl p-3 md:p-4 lg:p-5 flex flex-col items-center shadow-sm hover:shadow-md transition ${
                clicked === s.id_pricelist
                  ? "ring-2 ring-green-500 scale-[1.02]"
                  : ""
              }`}
            >
              <Scissors className="text-blue-600" />
              <p className="mt-1 font-semibold text-gray-800">{s.service}</p>
              <span className="text-gray-600 text-sm">
                {formatRupiah(s.harga)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
