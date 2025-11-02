import db from "../config/db.js";

export const getStores = (req, res) => {
  db.query("SELECT * FROM store ORDER BY id_store DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

export const getStoreById = (req, res) => {
  db.query(
    "SELECT * FROM store WHERE id_store=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Store tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

export const createStore = (req, res) => {
  const { nama_store, alamat_store } = req.body;

  // 🔍 Cek apakah nama store sudah ada
  db.query(
    "SELECT * FROM store WHERE nama_store = ?",
    [nama_store],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal memeriksa store" });

      if (result.length > 0) {
        // 🚫 Store sudah ada
        return res.status(400).json({ message: "Nama store sudah terdaftar!" });
      }

      // ✅ Kalau belum ada → lanjut insert
      db.query(
        "INSERT INTO store (nama_store, alamat_store) VALUES (?, ?)",
        [nama_store, alamat_store],
        (err, result) => {
          if (err)
            return res.status(500).json({ message: "Gagal menambah store" });

          res.json({ message: "Store ditambahkan", id: result.insertId });
        }
      );
    }
  );
};

export const updateStore = (req, res) => {
  const { nama_store, alamat_store } = req.body;
  db.query(
    "UPDATE store SET nama_store=?, alamat_store=? WHERE id_store=?",
    [nama_store, alamat_store, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal update store" });
      res.json({ message: "Store diperbarui" });
    }
  );
};

export const deleteStore = (req, res) => {
  db.query("DELETE FROM store WHERE id_store=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Gagal hapus store" });
    res.json({ message: "Store dihapus" });
  });
};
