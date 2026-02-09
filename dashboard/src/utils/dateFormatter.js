// 🔹 Format tanggal: 12 Oktober 2025
export function formatTanggal(tanggalISO) {
  const date = new Date(tanggalISO);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  return date.toLocaleDateString("id-ID", options);
}

// 🔹 Format jam: 02.02 WIB
export function formatJam(tanggalISO) {
  const date = new Date(tanggalISO);
  const options = { hour: "2-digit", minute: "2-digit", hour12: false };
  const jam = date.toLocaleTimeString("id-ID", options).replace(":", ".");
  return `${jam} WIB`;
}

// 🔹 Format periode: Oktober 2025
export function formatPeriode(periode) {
  if (!periode) return "-";
  const [year, month] = periode.split("-");
  const bulanNama = new Date(`${year}-${month}-01`).toLocaleString("id-ID", {
    month: "long",
  });
  return `${bulanNama} ${year}`;
}

// 🔹 Gabungan tanggal & jam
export function formatTanggalJam(tanggalISO) {
  return `${formatTanggal(tanggalISO)}, ${formatJam(tanggalISO)}`;
}
