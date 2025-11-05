import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   📋 GET Semua Komisi Setting (per Capster)
   ============================================================ */
export const getAllKomisiSetting = async (req, res) => {
  try {
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

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllKomisiSetting:", err.message);
    res.status(500).json({ message: "Gagal mengambil data komisi capster" });
  }
};

/* ============================================================
   🔍 GET Komisi Setting by ID
   ============================================================ */
export const getKomisiSettingById = async (req, res) => {
  try {
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

    const [rows] = await db.query(sql, [id]);
    if (!rows.length)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getKomisiSettingById:", err.message);
    res.status(500).json({ message: "Gagal mengambil data komisi capster" });
  }
};

/* ============================================================
   ➕ Tambah Komisi Setting Baru (per Capster)
   ============================================================ */
export const createKomisiSetting = async (req, res) => {
  try {
    const { id_capster, persentase_capster } = req.body;
    if (!id_capster || !persentase_capster)
      return res
        .status(400)
        .json({ message: "id_capster dan persentase_capster wajib diisi" });

    // 🔍 Cek apakah capster sudah punya komisi
    const [exist] = await db.query(
      "SELECT id_setting FROM komisi_setting WHERE id_capster = ?",
      [id_capster]
    );
    if (exist.length)
      return res.status(400).json({ message: "Komisi capster sudah ada" });

    // ✅ Insert data baru
    const [result] = await db.query(
      `
      INSERT INTO komisi_setting (id_capster, persentase_capster, updated_at)
      VALUES (?, ?, ?)
    `,
      [id_capster, persentase_capster, dayjs().format("YYYY-MM-DD HH:mm:ss")]
    );

    res.status(201).json({
      success: true,
      message: "Data komisi capster berhasil ditambahkan",
      id_setting: result.insertId,
    });
  } catch (err) {
    console.error("❌ createKomisiSetting:", err.message);
    res.status(500).json({ message: "Gagal menambah data komisi capster" });
  }
};

/* ============================================================
   ✏️ Update Komisi Setting by ID
   ============================================================ */
export const updateKomisiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_capster, persentase_capster } = req.body;

    if (!id_capster || !persentase_capster)
      return res.status(400).json({ message: "Data tidak lengkap" });

    // 🔍 Cek apakah capster sudah punya komisi lain
    const [exist] = await db.query(
      "SELECT id_setting FROM komisi_setting WHERE id_capster = ? AND id_setting != ?",
      [id_capster, id]
    );
    if (exist.length)
      return res.status(400).json({ message: "Komisi capster sudah ada" });

    // ✅ Update
    const [result] = await db.query(
      `
      UPDATE komisi_setting
      SET id_capster = ?, persentase_capster = ?, updated_at = ?
      WHERE id_setting = ?
    `,
      [
        id_capster,
        persentase_capster,
        dayjs().format("YYYY-MM-DD HH:mm:ss"),
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json({
      success: true,
      message: "Data komisi capster berhasil diperbarui",
    });
  } catch (err) {
    console.error("❌ updateKomisiSetting:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data komisi capster" });
  }
};

/* ============================================================
   🗑️ Hapus Komisi Setting by ID
   ============================================================ */
export const deleteKomisiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM komisi_setting WHERE id_setting = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json({
      success: true,
      message: "Data komisi capster berhasil dihapus",
    });
  } catch (err) {
    console.error("❌ deleteKomisiSetting:", err.message);
    res.status(500).json({ message: "Gagal menghapus data komisi capster" });
  }
};
