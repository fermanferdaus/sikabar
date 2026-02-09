export default function QrisPopup({ open, amount, onCancel, onFinish }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-2 w-full max-w-[720px] shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QRIS - ATAS DI MOBILE, KIRI DI DESKTOP */}
          <div className="flex justify-center">
            <img
              src="/qris.png"
              alt="QRIS"
              className="w-full max-w-[360px] md:max-w-[420px] object-contain"
            />
          </div>

          {/* INFO & ACTION - BAWAH DI MOBILE, KANAN DI DESKTOP */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* INFO */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Total Bayar
              </h3>

              <p className="text-3xl font-bold text-blue-600">
                Rp {amount.toLocaleString("id-ID")}
              </p>

              <p className="text-sm text-gray-500 mt-3 max-w-[260px]">
                Silakan scan QR menggunakan e-wallet pelanggan
              </p>
            </div>

            {/* BUTTON */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              >
                Batal
              </button>

              <button
                onClick={onFinish}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
