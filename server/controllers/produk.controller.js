import db from "../config/db.js";

export const getAllProduk = (req, res) => {
  const id_store = req.user?.id_store || req.query.id_store; // bisa ambil dari token atau query

  // Gunakan LEFT JOIN agar produk tetap muncul meskipun stoknya belum tercatat
  const query = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      p.harga_awal,
      p.harga_jual,
      IFNULL(s.jumlah_stok, 0) AS stok
    FROM produk p
    LEFT JOIN stok_produk s ON p.id_produk = s.id_produk
    ${id_store ? "AND s.id_store = ?" : ""}
    ORDER BY p.id_produk DESC
  `;

  db.query(query, id_store ? [id_store] : [], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    res.json(result);
  });
};

export const getProdukById = (req, res) => {
  db.query(
    "SELECT * FROM produk WHERE id_produk = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

export const createProduk = (req, res) => {
  const { nama_produk, harga_awal, harga_jual } = req.body;
  db.query(
    "INSERT INTO produk (nama_produk, harga_awal, harga_jual) VALUES (?,?,?)",
    [nama_produk, harga_awal, harga_jual],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal menambah produk" });
      res.json({ message: "Produk berhasil ditambahkan", id: result.insertId });
    }
  );
};

export const updateProduk = (req, res) => {
  const { nama_produk, harga_awal, harga_jual } = req.body;
  db.query(
    "UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?",
    [nama_produk, harga_awal, harga_jual, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal update produk" });
      res.json({ message: "Produk diperbarui" });
    }
  );
};

export const deleteProduk = (req, res) => {
  db.query("DELETE FROM produk WHERE id_produk=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus" });
    res.json({ message: "Produk dihapus" });
  });
};

// === 1. Ambil total stok per store ===
export const getStokPerStore = (req, res) => {
  const sql = `
    SELECT 
      st.id_store,
      st.nama_store,
      IFNULL(COUNT(DISTINCT s.id_produk), 0) AS total_produk,
      IFNULL(SUM(s.jumlah_stok), 0) AS total_stok
    FROM store st
    LEFT JOIN stok_produk s ON st.id_store = s.id_store
    GROUP BY st.id_store, st.nama_store
    ORDER BY st.nama_store ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "DB Error", err });
    }
    res.json(result);
  });
};

// === 2. Ambil detail stok produk untuk store tertentu ===
export const getProdukByStore = (req, res) => {
  const { id_store } = req.params;
  const sql = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      p.harga_awal,
      p.harga_jual,
      COALESCE(s.jumlah_stok, 0) AS stok
    FROM produk p
    LEFT JOIN stok_produk s 
      ON p.id_produk = s.id_produk 
      AND s.id_store = ?
    ORDER BY p.nama_produk ASC
  `;
  db.query(sql, [id_store], (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error", err });
    res.json(result);
  });
};
