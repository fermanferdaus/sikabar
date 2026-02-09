export default function formatRupiah(value) {
  const num = Number(value) || 0;
  return `Rp ${num.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
