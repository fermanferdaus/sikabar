export const formatKodeProduk = (id_produk) => {
  // Format: PR0001
  return `PR${String(id_produk).padStart(4, "0")}`;
};
