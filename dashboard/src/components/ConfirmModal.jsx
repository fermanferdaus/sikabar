import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Konfirmasi Hapus",
  message,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] sm:w-[400px] relative">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Judul */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>

        {/* Pesan */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition ${
              loading ? "bg-red-400 cursor-wait" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
