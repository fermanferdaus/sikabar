import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🧍 GET Semua Kasir
   ============================================================ */
export const getKasir = async (req, res) => {
  try {
    const { store } = req.query;

    const sql = store
      ? `
        SELECT k.*, s.nama_store 
        FROM kasir k
        JOIN store s ON k.id_store = s.id_store
        WHERE k.id_store = ?
        ORDER BY k.id_kasir DESC
      `
      : `
        SELECT k.*, s.nama_store 
        FROM kasir k
        JOIN store s ON k.id_store = s.id_store
        ORDER BY k.id_kasir DESC
      `;

    const [rows] = await db.query(sql, store ? [store] : []);
    res.json(rows);
  } catch (err) {
    console.error("❌ getKasir:", err.message);
    res.status(500).json({ message: "Gagal mengambil data kasir" });
  }
};

/* ============================================================
   🔍 GET Kasir by ID
   ============================================================ */
export const getKasirById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kasir WHERE id_kasir = ?", [
      req.params.id,
    ]);

    if (!rows.length)
      return res.status(404).json({ message: "Kasir tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getKasirById:", err.message);
    res.status(500).json({ message: "Kesalahan database" });
  }
};

/* ============================================================
   🏪 GET Kasir per Store
   ============================================================ */
export const getKasirByStore = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT k.*
      FROM kasir k
      WHERE k.id_store = ?
      ORDER BY k.id_kasir DESC
      `,
      [req.params.id_store]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getKasirByStore:", err.message);
    res.status(500).json({ message: "Gagal mengambil data kasir per store" });
  }
};

/* ============================================================
   ➕ Tambah Kasir
   ============================================================ */
export const createKasir = async (req, res) => {
  try {
    const {
      nama_kasir,
      id_store,
      telepon,
      email,
      alamat,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
    } = req.body;

    if (!nama_kasir || !id_store)
      return res
        .status(400)
        .json({ message: "Nama kasir dan store wajib diisi" });

    // Cek duplikat
    const [exist] = await db.query(
      "SELECT id_kasir FROM kasir WHERE nama_kasir = ? AND id_store = ?",
      [nama_kasir, id_store]
    );

    if (exist.length)
      return res.status(400).json({
        message: "Nama kasir sudah terdaftar di store ini",
      });

    const [result] = await db.query(
      `
      INSERT INTO kasir 
      (nama_kasir, id_store, telepon, email, alamat, jenis_kelamin, tempat_lahir, tanggal_lahir)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nama_kasir,
        id_store,
        telepon || null,
        email || null,
        alamat || null,
        jenis_kelamin || null,
        tempat_lahir || null,
        tanggal_lahir || null,
      ]
    );

    res.json({
      success: true,
      message: "Kasir berhasil ditambahkan",
      id_kasir: result.insertId,
    });
  } catch (err) {
    console.error("❌ createKasir:", err.message);
    res.status(500).json({ message: "Gagal menambahkan kasir" });
  }
};

/* ============================================================
   ✏️ Update Kasir
   ============================================================ */
export const updateKasir = async (req, res) => {
  try {
    const {
      nama_kasir,
      id_store,
      telepon,
      email,
      alamat,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
    } = req.body;

    if (!nama_kasir || !id_store)
      return res
        .status(400)
        .json({ message: "Nama kasir dan store wajib diisi" });

    const [result] = await db.query(
      `
      UPDATE kasir SET 
        nama_kasir = ?, 
        id_store = ?, 
        telepon = ?, 
        email = ?, 
        alamat = ?, 
        jenis_kelamin = ?, 
        tempat_lahir = ?, 
        tanggal_lahir = ?
      WHERE id_kasir = ?
      `,
      [
        nama_kasir,
        id_store,
        telepon || null,
        email || null,
        alamat || null,
        jenis_kelamin || null,
        tempat_lahir || null,
        tanggal_lahir || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Kasir tidak ditemukan" });

    res.json({ success: true, message: "Kasir berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateKasir:", err.message);
    res.status(500).json({ message: "Gagal memperbarui kasir" });
  }
};

/* ============================================================
   🗑️ Hapus Kasir
   ============================================================ */
export const deleteKasir = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM kasir WHERE id_kasir = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Kasir tidak ditemukan" });

    res.json({ success: true, message: "Kasir berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteKasir:", err.message);
    res.status(500).json({ message: "Gagal menghapus kasir" });
  }
};

/* ============================================================
   💼 Dashboard Kasir (Pendapatan + Bonus)
   ============================================================ */
export const getKasirDashboard = async (req, res) => {
  try {
    const { id_kasir } = req.params;
    if (!id_kasir)
      return res.status(400).json({ message: "ID kasir wajib diisi" });

    const bulan = dayjs().format("YYYY-MM");

    const sql = `
      SELECT 
        IFNULL(
          (SELECT SUM(t.subtotal) 
           FROM transaksi t 
           WHERE t.id_user = (SELECT id_user FROM kasir WHERE id_kasir = ?) 
           AND DATE_FORMAT(t.created_at, '%Y-%m') = ?
          ), 
          0
        ) AS pendapatan_kotor,

        IFNULL(
          (SELECT SUM(b.jumlah) 
           FROM bonus b 
           WHERE b.id_user = (SELECT id_user FROM kasir WHERE id_kasir = ?)
           AND b.periode = ?
          ), 
          0
        ) AS bonus_bulanan
    `;

    const [rows] = await db.query(sql, [id_kasir, bulan, id_kasir, bulan]);

    const row = rows[0];

    res.json({
      success: true,
      periode: bulan,
      pendapatan_kotor: Number(row.pendapatan_kotor) || 0,
      bonus_bulanan: Number(row.bonus_bulanan) || 0,
      total_pendapatan:
        Number(row.pendapatan_kotor || 0) + Number(row.bonus_bulanan || 0),
    });
  } catch (err) {
    console.error("❌ getKasirDashboard:", err.message);
    res.status(500).json({ message: "Gagal mengambil dashboard kasir" });
  }
};
