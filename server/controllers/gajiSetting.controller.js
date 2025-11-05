import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🟢 GET Semua Data Gaji Pokok (Capster & Kasir)
   ============================================================ */
export const getAllGajiSetting = async (req, res) => {
  try {
    const sql = `
      SELECT 
        gs.id_gaji_setting,
        gs.id_capster,
        gs.id_user,
        COALESCE(c.nama_capster, u.nama_user) AS nama,
        COALESCE(s.nama_store, '-') AS nama_store,
        gs.gaji_pokok,
        gs.periode,
        gs.updated_at,
        CASE
          WHEN gs.id_capster IS NOT NULL THEN 'Capster'
          WHEN gs.id_user IS NOT NULL THEN 'Kasir'
          ELSE '-'
        END AS jabatan
      FROM gaji_setting gs
      LEFT JOIN capster c ON gs.id_capster = c.id_capster
      LEFT JOIN users u ON gs.id_user = u.id_user
      LEFT JOIN store s ON (c.id_store = s.id_store OR u.id_store = s.id_store)
      ORDER BY jabatan, nama ASC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ DB Error getAllGajiSetting:", err);
    res.status(500).json({ message: "Gagal mengambil data gaji pokok" });
  }
};

/* ============================================================
   🟢 CREATE / UPDATE Gaji Pokok (Cegah duplikasi)
   ============================================================ */
export const createOrUpdateGajiSetting = async (req, res) => {
  try {
    const { id_capster, id_user, gaji_pokok, periode } = req.body;
    if (!gaji_pokok || (!id_capster && !id_user))
      return res.status(400).json({ message: "Data tidak lengkap" });

    const field = id_capster ? "id_capster" : "id_user";
    const id = id_capster || id_user;

    const [exist] = await db.query(
      `SELECT id_gaji_setting FROM gaji_setting WHERE ${field} = ?`,
      [id]
    );

    if (exist.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Nama ini sudah memiliki data gaji pokok",
        });
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    await db.query(
      `INSERT INTO gaji_setting (${field}, gaji_pokok, periode, updated_at)
       VALUES (?, ?, ?, ?)`,
      [id, gaji_pokok, periode || "Bulanan", now]
    );

    res.json({ success: true, message: "Gaji pokok berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ DB Error createOrUpdateGajiSetting:", err);
    res.status(500).json({ message: "Gagal menambahkan gaji pokok" });
  }
};

/* ============================================================
   🟢 Tambah Bonus (Capster / Kasir)
   ============================================================ */
export const addBonus = async (req, res) => {
  try {
    const {
      id_capster,
      id_user,
      judul_bonus,
      jumlah,
      keterangan,
      tanggal_diberikan,
      periode,
    } = req.body;

    if (
      (!id_capster && !id_user) ||
      !judul_bonus ||
      !jumlah ||
      !tanggal_diberikan
    )
      return res.status(400).json({ message: "Data bonus tidak lengkap" });

    const tanggal = dayjs(tanggal_diberikan).format("YYYY-MM-DD HH:mm:ss");
    const periodeFinal = periode || dayjs(tanggal_diberikan).format("YYYY-MM");
    const field = id_capster ? "id_capster" : "id_user";
    const id = id_capster || id_user;

    // 🔍 Cek duplikasi
    const [exist] = await db.query(
      `SELECT id_bonus FROM bonus WHERE ${field} = ? AND judul_bonus = ? AND periode = ?`,
      [id, judul_bonus, periodeFinal]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bonus ini sudah diberikan pada periode tersebut",
      });
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    await db.query(
      `INSERT INTO bonus 
       (id_capster, id_user, judul_bonus, jumlah, keterangan, tanggal_diberikan, periode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_capster || null,
        id_user || null,
        judul_bonus,
        jumlah,
        keterangan || "-",
        tanggal,
        periodeFinal,
        now,
      ]
    );

    res.json({ success: true, message: "Bonus berhasil diberikan" });
  } catch (err) {
    console.error("❌ DB Error addBonus:", err);
    res.status(500).json({ message: "Gagal menambahkan bonus" });
  }
};

/* ============================================================
   🟢 UPDATE Gaji Pokok Berdasarkan ID
   ============================================================ */
export const updateGajiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { gaji_pokok, periode } = req.body;
    if (!gaji_pokok)
      return res.status(400).json({ message: "Gaji pokok wajib diisi" });

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const [result] = await db.query(
      `UPDATE gaji_setting 
       SET gaji_pokok = ?, periode = ?, updated_at = ?
       WHERE id_gaji_setting = ?`,
      [gaji_pokok, periode || "Bulanan", now, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data gaji tidak ditemukan" });

    res.json({ success: true, message: "Data gaji pokok berhasil diperbarui" });
  } catch (err) {
    console.error("❌ DB Error updateGajiSetting:", err);
    res.status(500).json({ message: "Gagal memperbarui data gaji pokok" });
  }
};

/* ============================================================
   🟢 GET Semua Bonus
   ============================================================ */
export const getAllBonus = async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.id_bonus,
        COALESCE(c.nama_capster, u.nama_user) AS nama,
        COALESCE(s.nama_store, '-') AS nama_store,
        CASE
          WHEN b.id_capster IS NOT NULL THEN 'Capster'
          WHEN b.id_user IS NOT NULL THEN 'Kasir'
          ELSE '-'
        END AS jabatan,
        b.judul_bonus,
        b.jumlah,
        b.keterangan,
        b.periode,
        b.status,
        DATE_FORMAT(b.tanggal_diberikan, '%d %M %Y %H:%i') AS tanggal
      FROM bonus b
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      LEFT JOIN users u ON b.id_user = u.id_user
      LEFT JOIN store s ON (c.id_store = s.id_store OR u.id_store = s.id_store)
      ORDER BY b.tanggal_diberikan DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ DB Error getAllBonus:", err);
    res.status(500).json({ message: "Gagal mengambil data bonus" });
  }
};

/* ============================================================
   🟢 DELETE Gaji Pokok & Bonus
   ============================================================ */
export const deleteGajiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM gaji_setting WHERE id_gaji_setting = ?", [id]);
    res.json({ success: true, message: "Data gaji berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error deleteGajiSetting:", err);
    res.status(500).json({ message: "Gagal menghapus data gaji" });
  }
};

export const deleteBonus = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM bonus WHERE id_bonus = ?", [id]);
    res.json({ success: true, message: "Data bonus berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error deleteBonus:", err);
    res.status(500).json({ message: "Gagal menghapus data bonus" });
  }
};

/* ============================================================
   🟢 GET Bonus by ID
   ============================================================ */
export const getBonusById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        b.id_bonus,
        b.id_capster,
        b.id_user,
        COALESCE(c.nama_capster, u.nama_user) AS nama,
        b.judul_bonus,
        b.jumlah,
        b.keterangan,
        b.periode,
        DATE_FORMAT(b.tanggal_diberikan, '%Y-%m-%d') AS tanggal_diberikan
      FROM bonus b
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      LEFT JOIN users u ON b.id_user = u.id_user
      WHERE b.id_bonus = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (!rows.length)
      return res.status(404).json({ message: "Bonus tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ DB Error getBonusById:", err);
    res.status(500).json({ message: "Gagal mengambil data bonus" });
  }
};

/* ============================================================
   🟢 UPDATE Bonus
   ============================================================ */
export const updateBonus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_capster,
      id_user,
      judul_bonus,
      jumlah,
      keterangan,
      tanggal_diberikan,
      periode,
    } = req.body;

    if (
      (!id_capster && !id_user) ||
      !judul_bonus ||
      !jumlah ||
      !tanggal_diberikan
    )
      return res.status(400).json({ message: "Data bonus tidak lengkap" });

    const tanggal = dayjs(tanggal_diberikan).format("YYYY-MM-DD HH:mm:ss");
    const periodeFinal = periode || dayjs(tanggal_diberikan).format("YYYY-MM");

    const [result] = await db.query(
      `UPDATE bonus 
       SET id_capster=?, id_user=?, judul_bonus=?, jumlah=?, keterangan=?, tanggal_diberikan=?, periode=?
       WHERE id_bonus=?`,
      [
        id_capster || null,
        id_user || null,
        judul_bonus,
        jumlah,
        keterangan || "-",
        tanggal,
        periodeFinal,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Bonus tidak ditemukan" });

    res.json({ success: true, message: "Bonus berhasil diperbarui" });
  } catch (err) {
    console.error("❌ DB Error updateBonus:", err);
    res.status(500).json({ message: "Gagal memperbarui bonus" });
  }
};

/* ============================================================
   🟢 UPDATE Status Bonus
   ============================================================ */
export const updateBonusStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["belum_diberikan", "sudah_diberikan"].includes(status))
      return res.status(400).json({ message: "Status tidak valid" });

    const [result] = await db.query(
      "UPDATE bonus SET status=? WHERE id_bonus=?",
      [status, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Bonus tidak ditemukan" });

    res.json({ success: true, message: "Status bonus berhasil diperbarui" });
  } catch (err) {
    console.error("❌ DB Error updateBonusStatus:", err);
    res.status(500).json({ message: "Gagal memperbarui status bonus" });
  }
};

/* ============================================================
   🟢 GET Slip Gaji
   ============================================================ */
export const getSlipGaji = async (req, res) => {
  try {
    const { role, id_user, id_capster } = req.query;
    const currentMonth = dayjs().format("YYYY-MM");
    let sql, params;

    if (role === "kasir" && id_user) {
      sql = `
        SELECT 
          u.nama_user AS nama,
          s.nama_store,
          gs.gaji_pokok,
          gs.periode,
          (
            SELECT IFNULL(SUM(b2.jumlah), 0)
            FROM bonus b2
            WHERE b2.id_user = u.id_user AND b2.periode = ?
          ) AS total_bonus,
          0 AS total_komisi
        FROM users u
        LEFT JOIN store s ON u.id_store = s.id_store
        LEFT JOIN gaji_setting gs ON gs.id_user = u.id_user
        WHERE u.id_user = ?
        GROUP BY u.id_user;
      `;
      params = [currentMonth, id_user];
    } else if (role === "capster" && id_capster) {
      sql = `
        SELECT 
          c.nama_capster AS nama,
          s.nama_store,
          gs.gaji_pokok,
          gs.periode,
          (
            SELECT IFNULL(SUM(b2.jumlah), 0)
            FROM bonus b2
            WHERE b2.id_capster = c.id_capster AND b2.periode = ?
          ) AS total_bonus,
          (
            SELECT IFNULL(SUM(tsd2.komisi_capster), 0)
            FROM transaksi_service_detail tsd2
            WHERE tsd2.id_capster = c.id_capster
              AND DATE_FORMAT(tsd2.created_at, '%Y-%m') = ?
          ) AS total_komisi
        FROM capster c
        LEFT JOIN store s ON c.id_store = s.id_store
        LEFT JOIN gaji_setting gs ON gs.id_capster = c.id_capster
        WHERE c.id_capster = ?
        GROUP BY c.id_capster;
      `;
      params = [currentMonth, currentMonth, id_capster];
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Parameter tidak valid" });
    }

    const [rows] = await db.query(sql, params);

    if (!rows.length)
      return res.status(404).json({
        success: false,
        message: `Slip gaji bulan ${dayjs().format(
          "MMMM YYYY"
        )} tidak ditemukan`,
      });

    const data = { ...rows[0], periode: dayjs().format("MMMM YYYY") };
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error getSlipGaji:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil slip gaji",
      error: err.message,
    });
  }
};
