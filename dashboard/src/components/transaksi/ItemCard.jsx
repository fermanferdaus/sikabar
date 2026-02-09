import { Trash2 } from "lucide-react";

const formatRupiah = (angka) =>
  "Rp" + Number(angka || 0).toLocaleString("id-ID");

export default function ItemCard({ items, setItems }) {
  const handleQuantity = (index, delta) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newJumlah = Math.max(1, item.jumlah + delta);
        return {
          ...item,
          jumlah: newJumlah,
          total: item.harga * newJumlah,
        };
      }),
    );
  };

  const handleDelete = (index) => {
    setItems((prev) => prev.filter((_, j) => j !== index));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-700 mb-1">Daftar Item</h3>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400 italic text-sm">
          Belum ada item ditambahkan
        </div>
      ) : (
        <div className="max-h-[185px] overflow-y-auto hide-scrollbar space-y-2">
          {items.map((i, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-1 border-b border-gray-300 last:border-none"
            >
              <div>
                <p className="font-medium text-gray-800">{i.nama}</p>
                <p className="text-sm text-gray-500">{formatRupiah(i.harga)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantity(idx, -1)}
                  disabled={i.jumlah <= 1}
                  className={`px-2 py-1 rounded-md font-semibold ${
                    i.jumlah <= 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  -
                </button>

                <span className="min-w-[28px] text-center text-gray-800 font-medium">
                  {i.jumlah}
                </span>

                <button
                  onClick={() => handleQuantity(idx, +1)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-semibold"
                >
                  +
                </button>

                <span className="font-semibold text-gray-800 ml-2">
                  {formatRupiah(i.total)}
                </span>

                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
