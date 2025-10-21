import db from "../config/db.js";
import dayjs from "dayjs";

/**
 * 📋 GET semua komisi setting
 */
export const getAllKomisiSetting = (req, res) => {
  const sql = `
    SELECT 
      ks.id_setting,
      ks.id_store,
      s.nama_store,
      ks.persentase_capster,
      ks.updated_at
    FROM komisi_setting ks
    JOIN store s ON ks.id_store = s.id_store
    ORDER BY ks.id_setting ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error (getAllKomisiSetting):", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data komisi_setting" });
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
      ks.id_store,
      s.nama_store,
      ks.persentase_capster,
      ks.updated_at
    FROM komisi_setting ks
    JOIN store s ON ks.id_store = s.id_store
    WHERE ks.id_setting = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ DB Error (getKomisiSettingById):", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data komisi_setting" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result[0]);
  });
};

/**
 * ➕ Tambah komisi setting baru
 */
export const createKomisiSetting = (req, res) => {
  const { id_store, persentase_capster } = req.body;

  if (!id_store || !persentase_capster) {
    return res
      .status(400)
      .json({ message: "id_store dan persentase_capster wajib diisi" });
  }

  const sql = `
    INSERT INTO komisi_setting (id_store, persentase_capster, updated_at)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [id_store, persentase_capster, dayjs().format("YYYY-MM-DD HH:mm:ss")],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error (createKomisiSetting):", err);
        return res
          .status(500)
          .json({ message: "Gagal menambah data komisi_setting" });
      }

      res.status(201).json({
        message: "Data komisi_setting berhasil ditambahkan",
        id_setting: result.insertId,
      });
    }
  );
};

/**
 * ✏️ Update komisi setting berdasarkan ID
 */
export const updateKomisiSetting = (req, res) => {
  const { id } = req.params;
  const { id_store, persentase_capster } = req.body;

  const sql = `
    UPDATE komisi_setting
    SET id_store = ?, persentase_capster = ?, updated_at = ?
    WHERE id_setting = ?
  `;

  db.query(
    sql,
    [id_store, persentase_capster, dayjs().format("YYYY-MM-DD HH:mm:ss"), id],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error (updateKomisiSetting):", err);
        return res
          .status(500)
          .json({ message: "Gagal memperbarui data komisi_setting" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.json({ message: "Data komisi_setting berhasil diperbarui" });
    }
  );
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
        .json({ message: "Gagal menghapus data komisi_setting" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Data komisi_setting berhasil dihapus" });
  });
};
