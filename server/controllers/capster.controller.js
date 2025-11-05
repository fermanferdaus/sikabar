import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🧍 GET Semua Capster
   ============================================================ */
export const getCapsters = async (req, res) => {
  try {
    const { store } = req.query;

    const sql = store
      ? `
        SELECT c.*, s.nama_store 
        FROM capster c 
        JOIN store s ON c.id_store = s.id_store
        WHERE c.id_store = ?
        ORDER BY c.id_capster DESC
      `
      : `
        SELECT c.*, s.nama_store 
        FROM capster c 
        JOIN store s ON c.id_store = s.id_store
        ORDER BY c.id_capster DESC
      `;

    const [rows] = await db.query(sql, store ? [store] : []);
    res.json(rows);
  } catch (err) {
    console.error("❌ getCapsters:", err.message);
    res.status(500).json({ message: "Gagal mengambil data capster" });
  }
};

/* ============================================================
   🔍 GET Capster by ID
   ============================================================ */
export const getCapsterById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM capster WHERE id_capster = ?",
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Capster tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getCapsterById:", err.message);
    res.status(500).json({ message: "Kesalahan database" });
  }
};

/* ============================================================
   🏪 GET Capster per Store
   ============================================================ */
export const getCapsterByStore = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id_capster, nama_capster, status FROM capster WHERE id_store = ? ORDER BY id_capster DESC",
      [req.params.id_store]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getCapsterByStore:", err.message);
    res.status(500).json({ message: "Gagal mengambil data capster per store" });
  }
};

/* ============================================================
   ➕ Tambah Capster
   ============================================================ */
export const createCapster = async (req, res) => {
  try {
    const { nama_capster, id_store, status } = req.body;

    if (!nama_capster || !id_store)
      return res.status(400).json({ message: "Nama dan store wajib diisi" });

    const [exist] = await db.query(
      "SELECT id_capster FROM capster WHERE nama_capster = ? AND id_store = ?",
      [nama_capster, id_store]
    );

    if (exist.length)
      return res.status(400).json({
        message: "Nama capster sudah terdaftar di store ini",
      });

    const [result] = await db.query(
      "INSERT INTO capster (nama_capster, id_store, status) VALUES (?, ?, ?)",
      [nama_capster, id_store, status || "aktif"]
    );

    res.json({
      success: true,
      message: "Capster berhasil ditambahkan",
      id_capster: result.insertId,
    });
  } catch (err) {
    console.error("❌ createCapster:", err.message);
    res.status(500).json({ message: "Gagal menambahkan capster" });
  }
};

/* ============================================================
   ✏️ Update Capster
   ============================================================ */
export const updateCapster = async (req, res) => {
  try {
    const { nama_capster, id_store, status } = req.body;

    if (!nama_capster || !id_store)
      return res
        .status(400)
        .json({ message: "Nama capster dan store wajib diisi" });

    const [result] = await db.query(
      "UPDATE capster SET nama_capster = ?, id_store = ?, status = ? WHERE id_capster = ?",
      [nama_capster, id_store, status || "aktif", req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Capster tidak ditemukan" });

    res.json({ success: true, message: "Capster berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateCapster:", err.message);
    res.status(500).json({ message: "Gagal memperbarui capster" });
  }
};

/* ============================================================
   🗑️ Hapus Capster
   ============================================================ */
export const deleteCapster = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM capster WHERE id_capster = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Capster tidak ditemukan" });

    res.json({ success: true, message: "Capster berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteCapster:", err.message);
    res.status(500).json({ message: "Gagal menghapus capster" });
  }
};

/* ============================================================
   💼 Dashboard Capster (Pendapatan + Bonus + Gaji)
   ============================================================ */
export const getCapsterDashboard = async (req, res) => {
  try {
    const { id_capster } = req.params;
    if (!id_capster)
      return res.status(400).json({ message: "ID capster wajib diisi" });

    const bulan = dayjs().format("YYYY-MM");

    const sql = `
      SELECT 
        IFNULL(SUM(tsd.harga), 0) AS pendapatan_kotor,
        IFNULL(
          (SELECT gaji_pokok FROM gaji_setting WHERE id_capster = ? LIMIT 1),
          0
        ) AS gaji_pokok,
        IFNULL(
          (SELECT SUM(b.jumlah) FROM bonus b WHERE b.id_capster = ? AND b.periode = ?),
          0
        ) AS bonus_bulanan
      FROM transaksi_service_detail tsd
      WHERE tsd.id_capster = ? 
      AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?
    `;

    const [rows] = await db.query(sql, [
      id_capster,
      id_capster,
      bulan,
      id_capster,
      bulan,
    ]);

    const row = rows[0];
    const pendapatan_kotor = Number(row.pendapatan_kotor) || 0;
    const gaji_pokok = Number(row.gaji_pokok) || 0;
    const bonus_bulanan = Number(row.bonus_bulanan) || 0;
    const total_pendapatan = pendapatan_kotor + gaji_pokok + bonus_bulanan;

    res.json({
      success: true,
      periode: bulan,
      pendapatan_kotor,
      gaji_pokok,
      bonus_bulanan,
      total_pendapatan,
    });
  } catch (err) {
    console.error("❌ getCapsterDashboard:", err.message);
    res.status(500).json({ message: "Gagal mengambil data dashboard capster" });
  }
};
