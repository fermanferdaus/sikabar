import db from "../config/db.js";

// 🟢 Get Semua Capster
export const getCapsters = (req, res) => {
  db.query(
    `SELECT c.*, s.nama_store 
     FROM capster c 
     JOIN store s ON c.id_store = s.id_store
     ORDER BY c.id_capster DESC`,
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengambil data capster" });
      res.json(result);
    }
  );
};

// 🔵 Get Capster by ID
export const getCapsterById = (req, res) => {
  db.query(
    "SELECT * FROM capster WHERE id_capster = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Capster tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

export const getCapsterByStore = (req, res) => {
  const { id_store } = req.params;
  db.query(
    "SELECT id_capster, nama_capster FROM capster WHERE id_store = ?",
    [id_store],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      res.json(result);
    }
  );
};

// 🟡 Tambah Capster
export const createCapster = (req, res) => {
  const { nama_capster, id_store, status } = req.body;
  db.query(
    "INSERT INTO capster (nama_capster, id_store, status) VALUES (?,?,?)",
    [nama_capster, id_store, status || "aktif"],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal menambah capster" });
      res.json({
        message: "Capster berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
};

// 🟠 Update Capster
export const updateCapster = (req, res) => {
  const { nama_capster, id_store, status } = req.body;
  db.query(
    "UPDATE capster SET nama_capster=?, id_store=?, status=? WHERE id_capster=?",
    [nama_capster, id_store, status, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Gagal memperbarui capster" });
      res.json({ message: "Capster diperbarui" });
    }
  );
};

// 🔴 Hapus Capster
export const deleteCapster = (req, res) => {
  db.query("DELETE FROM capster WHERE id_capster=?", [req.params.id], (err) => {
    if (err)
      return res.status(500).json({ message: "Gagal menghapus capster" });
    res.json({ message: "Capster dihapus" });
  });
};
