// components/FormLayout.jsx
export default function FormLayout({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitText = "Simpan",
  cancelText = "Batal",
}) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 transition-all duration-300">
      {/* === Header === */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* === Form Content === */}
      <form onSubmit={onSubmit} className="space-y-8">
        {children}

        {/* === Tombol Aksi === */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              {cancelText}
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-white transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Menyimpan..." : submitText}
          </button>
        </div>
      </form>
    </div>
  );
}
