import { useState } from "react";
import { Package } from "lucide-react";

const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

export default function ProdukGrid({ produk, onAdd }) {
  const [clicked, setClicked] = useState(null);

  return (
    <div>
      <h4 className="font-semibold text-gray-700 mb-3">Pilih Produk</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {produk.map((p) => (
          <button
            key={p.id_produk}
            onClick={() => {
              setClicked(p.id_produk);
              setTimeout(() => setClicked(null), 350);

              onAdd({
                tipe: "produk",
                id_produk: p.id_produk,
                nama: p.nama_produk,
                harga: Number(p.harga_jual),
              });
            }}
            className={`bg-white border border-gray-200 rounded-xl p-3 md:p-4 lg:p-5 flex flex-col items-center shadow-sm hover:shadow-md transition ${
              clicked === p.id_produk
                ? "ring-2 ring-green-500 scale-[1.02]"
                : ""
            }`}
          >
            <Package className="text-green-600" />
            <p className="mt-1 font-semibold text-gray-800">{p.nama_produk}</p>
            <span className="text-gray-600 text-sm">
              {formatRupiah(p.harga_jual)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
