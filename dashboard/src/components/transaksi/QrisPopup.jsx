export default function QrisPopup({
  open,
  qrisUrl,
  amount,
  timeLeft,
  onCancel,
}) {
  if (!open) return null;

  const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const sec = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[380px] text-center space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Pembayaran QRIS</h2>
        <p className="text-gray-500 text-sm">
          Scan QR menggunakan E-Wallet (Dana, ShopeePay, Gopay, dll)
        </p>

        <img
          src={qrisUrl}
          className="w-60 h-60 mx-auto border border-gray-300 rounded-xl shadow"
        />

        <p className="text-blue-600 text-2xl font-bold">
          Rp {amount.toLocaleString("id-ID")}
        </p>

        <p className="font-semibold text-red-600">
          Batal otomatis: {min}:{sec}
        </p>

        <button
          onClick={onCancel}
          className="w-[70%] py-2.5 bg-[#0e57b5] hover:bg-[#0b4894] text-white rounded-lg font-medium"
        >
          Batalkan pembayaran
        </button>
      </div>
    </div>
  );
}
