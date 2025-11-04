export default function useProdukAPI() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const idStore = localStorage.getItem("id_store");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* ===================== 🔹 PRODUK DASAR ===================== */

  const getAllProduk = async () => {
    const res = await fetch(`${API_URL}/produk`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memuat daftar produk");
    return data;
  };

  const getProdukById = async (id) => {
    const res = await fetch(`${API_URL}/produk/${id}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memuat data produk");
    return data;
  };

  /* ===================== 🔹 PRODUK PER STORE ===================== */

  const getProdukByStore = async (
    id_store,
    filterType = "Bulanan",
    tanggal = new Date().toISOString().split("T")[0]
  ) => {
    const url = `${API_URL}/produk/stok/${id_store}?filterType=${filterType}&tanggal=${tanggal}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Gagal memuat data stok produk");
    return data;
  };

  const getStokPerStore = async () => {
    const res = await fetch(`${API_URL}/produk/stok`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memuat rekap stok");
    return data;
  };

  const getStokByStoreAndProduk = async (id_store, id_produk) => {
    const res = await fetch(`${API_URL}/produk/stok/${id_store}/${id_produk}`, {
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memuat stok produk");
    return data;
  };

  /* ===================== 🔹 TAMBAH PRODUK ===================== */

  const addProduk = async (produkData) => {
    let url = `${API_URL}/produk`;
    let method = "POST";

    // 🟡 Jika kasir, gunakan route khusus
    if (role === "kasir") {
      url = `${API_URL}/produk/kasir/add`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...produkData,
          id_store: idStore,
        }),
      });

      // 🧠 Selalu baca respons JSON dulu
      const data = await res.json();

      // 🔥 Jika gagal, lempar error dari backend
      if (!res.ok) {
        throw new Error(data.message || "Gagal menambah produk");
      }

      return data;
    } catch (err) {
      console.error("❌ useProdukAPI addProduk Error:", err);
      // lempar ulang supaya bisa ditangkap di ProdukAdd.jsx
      throw err;
    }
  };

  /* ===================== 🔹 UPDATE PRODUK ===================== */

  const updateProduk = async (id, produkData) => {
    let url = `${API_URL}/produk/${id}`;
    let method = "PUT";

    // 🟡 Jika kasir, gunakan route khusus
    if (role === "kasir") {
      url = `${API_URL}/produk/kasir/update`;
      method = "PUT";
      produkData.id_produk = id;
      produkData.id_store = idStore;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(produkData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memperbarui produk");
    return data;
  };

  /* ===================== 🔹 HAPUS PRODUK ===================== */

  const deleteProduk = async (id) => {
    let url = `${API_URL}/produk/${id}`;
    let method = "DELETE";

    // 🟡 Kasir: hapus produk dari tokonya saja
    if (role === "kasir") {
      url = `${API_URL}/produk/kasir/delete/${idStore}/${id}`;
    }

    const res = await fetch(url, { method, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menghapus produk");
    return data;
  };

  /* ===================== 🔹 STOK PRODUK ===================== */

  const addStokProduk = async (stokData) => {
    const res = await fetch(`${API_URL}/produk/stok`, {
      method: "POST",
      headers,
      body: JSON.stringify(stokData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menambah stok");
    return data;
  };

  const updateStokProduk = async (stokData) => {
    const res = await fetch(`${API_URL}/produk/stok/update`, {
      method: "POST",
      headers,
      body: JSON.stringify(stokData),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Gagal memperbarui stok produk");
    return data;
  };

  const deleteStokProduk = async (id_store, id_produk) => {
    const res = await fetch(`${API_URL}/produk/stok/${id_store}/${id_produk}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menghapus stok produk");
    return data;
  };

  return {
    getAllProduk,
    getProdukById,
    getProdukByStore,
    getStokPerStore,
    addProduk,
    addStokProduk,
    updateProduk,
    deleteProduk,
    deleteStokProduk,
    getStokByStoreAndProduk,
    updateStokProduk,
  };
}
