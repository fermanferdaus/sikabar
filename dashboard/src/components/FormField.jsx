// components/FormField.jsx
export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  min,
  options = [],
}) {
  // 🔹 Fungsi format Rupiah
  const formatRupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

  // 🔹 Event handler
  const handleInput = (e) => {
    const val = e.target.value;

    if (type === "rupiah") {
      // Hanya ambil angka
      const cleanVal = val.replace(/\D/g, "");
      onChange(cleanVal ? Number(cleanVal) : 0);
    } else {
      onChange(val);
    }
  };

  // 🔹 Tampilkan formatted display jika rupiah
  const displayValue =
    type === "rupiah" && value ? formatRupiah(value) : value ?? "";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required={required}
        >
          <option value="">Pilih {label}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type === "rupiah" ? "text" : type}
          value={displayValue}
          onChange={handleInput}
          min={min}
          placeholder={placeholder}
          required={required}
          inputMode={type === "rupiah" ? "numeric" : undefined}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-right font-medium tracking-wide"
        />
      )}
    </div>
  );
}
