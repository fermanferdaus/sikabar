import db from "../config/db.js";

// 🟢 Get All Pricelist (bisa filter per store)
export const getAllPricelist = (req, res) => {
  const { store } = req.query; // ← ambil parameter ?store=
  let sql = "SELECT * FROM pricelist";
  const params = [];

  if (store) {
    sql += " WHERE id_store = ?";
    params.push(store);
  }

  sql += " ORDER BY id_pricelist DESC";

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

// 🔵 Get by ID
export const getPricelistById = (req, res) => {
  db.query(
    "SELECT * FROM pricelist WHERE id_pricelist=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Data tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

// 🟡 Create
export const createPricelist = (req, res) => {
  const { service, keterangan, harga } = req.body;

  if (!service || !harga) {
    return res
      .status(400)
      .json({ message: "Nama layanan dan harga wajib diisi" });
  }

  // 🔍 Cek apakah nama service sudah ada
  db.query(
    "SELECT * FROM pricelist WHERE service = ?",
    [service],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Gagal memeriksa data" });
      }

      if (result.length > 0) {
        // 🚫 Jika nama service sudah ada
        return res
          .status(400)
          .json({ message: "Nama layanan sudah terdaftar!" });
      }

      // ✅ Jika belum ada, lanjut insert
      db.query(
        "INSERT INTO pricelist (service, keterangan, harga) VALUES (?,?,?)",
        [service, keterangan, harga],
        (err, result) => {
          if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ message: "Gagal menambah service" });
          }
          res.json({
            message: "Service berhasil ditambahkan",
            id: result.insertId,
          });
        }
      );
    }
  );
};

// 🟠 Update
export const updatePricelist = (req, res) => {
  const { service, keterangan, harga } = req.body;
  db.query(
    "UPDATE pricelist SET service=?, keterangan=?, harga=? WHERE id_pricelist=?",
    [service, keterangan, harga, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal update" });
      res.json({ message: "Service diperbarui" });
    }
  );
};

// 🔴 Delete
export const deletePricelist = (req, res) => {
  db.query(
    "DELETE FROM pricelist WHERE id_pricelist=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal hapus" });
      res.json({ message: "Service dihapus" });
    }
  );
};
