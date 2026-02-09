// =========================
// Format ID Kasir → KS0001
// =========================
export const formatKasirID = (id) => {
  const num = String(id).padStart(4, "0");
  return `KS${num}`;
};

// =========================
// Format ID Capster → CS0001
// =========================
export const formatCapsterID = (id) => {
  const num = String(id).padStart(4, "0");
  return `CS${num}`;
};

// =========================
// Format ID Pengguna / Akun → US0001
// =========================
export const formatPenggunaID = (id) => {
  if (!id && id !== 0) return "-";
  const num = String(id).padStart(4, "0");
  return `US${num}`;
};