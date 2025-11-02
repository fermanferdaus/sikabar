import db from "../config/db.js";
import dayjs from "dayjs";

/**
 * 📋 GET semua komisi setting (per capster)
 */
export const getAllKomisiSetting = (req, res) => {
  const sql = `
    SELECT 
      ks.id_setting,
      ks.id_capster,
      c.nama_capster,
      s.nama_store,
      ks.persentase_capster,
      ks.updated_at
    FROM komisi_setting ks
    JOIN capster c ON ks.id_capster = c.id_capster
    JOIN store s ON c.id_store = s.id_store
    ORDER BY ks.id_setting ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error (getAllKomisiSetting):", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data komisi capster" });
    }

    res.json(result);
  });
};

/**
 * 🔍 GET komisi setting berdasarkan ID
 */
export const getKomisiSettingById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      ks.id_setting,
      ks.id_capster,
      c.nama_capster,
      s.nama_store,
      ks.persentase_capster,
      ks.updated_at
    FROM komisi_setting ks
    JOIN capster c ON ks.id_capster = c.id_capster
    JOIN store s ON c.id_store = s.id_store
    WHERE ks.id_setting = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ DB Error (getKomisiSettingById):", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data komisi capster" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result[0]);
  });
};

/**
 * ➕ Tambah komisi setting baru (per capster)
 */
export const createKomisiSetting = (req, res) => {
  const { id_capster, persentase_capster } = req.body;

  if (!id_capster || !persentase_capster) {
    return res
      .status(400)
      .json({ message: "id_capster dan persentase_capster wajib diisi" });
  }

  // 🔍 Cek apakah capster sudah punya komisi
  const checkSql = `SELECT id_setting FROM komisi_setting WHERE id_capster = ?`;
  db.query(checkSql, [id_capster], (err, result) => {
    if (err) {
      console.error("❌ DB Error (cek duplikasi komisi capster):", err);
      return res
        .status(500)
        .json({ message: "Gagal memeriksa data komisi capster" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Komisi capster sudah ada" });
    }

    // ✅ Jika belum ada, lanjut insert
    const insertSql = `
      INSERT INTO komisi_setting (id_capster, persentase_capster, updated_at)
      VALUES (?, ?, ?)
    `;

    db.query(
      insertSql,
      [id_capster, persentase_capster, dayjs().format("YYYY-MM-DD HH:mm:ss")],
      (err2, result2) => {
        if (err2) {
          console.error("❌ DB Error (createKomisiSetting):", err2);
          return res
            .status(500)
            .json({ message: "Gagal menambah data komisi capster" });
        }

        res.status(201).json({
          message: "Data komisi capster berhasil ditambahkan",
          id_setting: result2.insertId,
        });
      }
    );
  });
};

/**
 * ✏️ Update komisi setting berdasarkan ID
 */
export const updateKomisiSetting = (req, res) => {
  const { id } = req.params;
  const { id_capster, persentase_capster } = req.body;

  // 🔍 Cek apakah capster sudah punya komisi lain (selain dirinya sendiri)
  const checkSql = `
    SELECT id_setting FROM komisi_setting 
    WHERE id_capster = ? AND id_setting != ?
  `;
  db.query(checkSql, [id_capster, id], (err, result) => {
    if (err) {
      console.error("❌ DB Error (cek duplikasi update):", err);
      return res
        .status(500)
        .json({ message: "Gagal memeriksa duplikasi komisi capster" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Komisi capster sudah ada" });
    }

    // ✅ Jika aman, lanjut update
    const sql = `
      UPDATE komisi_setting
      SET id_capster = ?, persentase_capster = ?, updated_at = ?
      WHERE id_setting = ?
    `;

    db.query(
      sql,
      [
        id_capster,
        persentase_capster,
        dayjs().format("YYYY-MM-DD HH:mm:ss"),
        id,
      ],
      (err2, result2) => {
        if (err2) {
          console.error("❌ DB Error (updateKomisiSetting):", err2);
          return res
            .status(500)
            .json({ message: "Gagal memperbarui data komisi capster" });
        }

        if (result2.affectedRows === 0) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        res.json({ message: "Data komisi capster berhasil diperbarui" });
      }
    );
  });
};

/**
 * 🗑️ Hapus komisi setting berdasarkan ID
 */
export const deleteKomisiSetting = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM komisi_setting WHERE id_setting = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ DB Error (deleteKomisiSetting):", err);
      return res
        .status(500)
        .json({ message: "Gagal menghapus data komisi capster" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Data komisi capster berhasil dihapus" });
  });
};
