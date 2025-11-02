import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🟢 GET Semua Data Gaji Pokok (Capster & Kasir)
   ============================================================ */
export const getAllGajiSetting = (req, res) => {
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

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error getAllGajiSetting:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data gaji pokok" });
    }
    res.json(result);
  });
};

// ============================================================
// 🟢 CREATE / UPDATE Gaji Pokok (dengan deteksi duplikasi)
// ============================================================
export const createOrUpdateGajiSetting = (req, res) => {
  const { id_capster, id_user, gaji_pokok, periode } = req.body;

  if (!gaji_pokok || (!id_capster && !id_user)) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const field = id_capster ? "id_capster" : "id_user";
  const id = id_capster || id_user;

  // 🔍 Cek apakah nama sudah ada di tabel gaji_setting
  db.query(
    `SELECT id_gaji_setting FROM gaji_setting WHERE ${field} = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ DB Error check:", err);
        return res.status(500).json({ message: "Gagal memeriksa data gaji" });
      }

      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      if (rows.length > 0) {
        // ⚠️ Sudah ada → kirim alert ke frontend
        return res
          .status(400)
          .json({
            success: false,
            message: "Nama ini sudah memiliki data gaji pokok",
          });
      }

      // 🆕 Insert data baru
      db.query(
        `INSERT INTO gaji_setting (${field}, gaji_pokok, periode, updated_at)
         VALUES (?, ?, ?, ?)`,
        [id, gaji_pokok, periode || "Bulanan", now],
        (err2) => {
          if (err2) {
            console.error("❌ DB Error insert:", err2);
            return res
              .status(500)
              .json({ message: "Gagal menambahkan gaji pokok" });
          }
          res.json({
            success: true,
            message: "Gaji pokok berhasil ditambahkan",
          });
        }
      );
    }
  );
};

/* ============================================================
   🟢 Tambah Bonus (Capster / Kasir)
   ============================================================ */
export const addBonus = (req, res) => {
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
  ) {
    return res.status(400).json({ message: "Data bonus tidak lengkap" });
  }

  const tanggal = dayjs(tanggal_diberikan).format("YYYY-MM-DD HH:mm:ss");
  const periodeFinal = periode || dayjs(tanggal_diberikan).format("YYYY-MM");

  // ✅ Cegah bonus duplikat dalam satu periode
  const field = id_capster ? "id_capster" : "id_user";
  const id = id_capster || id_user;

  db.query(
    `SELECT id_bonus FROM bonus WHERE ${field} = ? AND judul_bonus = ? AND periode = ?`,
    [id, judul_bonus, periodeFinal],
    (err, rows) => {
      if (err) {
        console.error("❌ DB Error check bonus:", err);
        return res
          .status(500)
          .json({ message: "Gagal memeriksa duplikasi bonus" });
      }

      if (rows.length > 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Bonus ini sudah diberikan pada periode tersebut",
          });
      }

      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      db.query(
        `INSERT INTO bonus (id_capster, id_user, judul_bonus, jumlah, keterangan, tanggal_diberikan, periode, created_at)
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
        ],
        (err2) => {
          if (err2) {
            console.error("❌ DB Error insert bonus:", err2);
            return res.status(500).json({ message: "Gagal menambahkan bonus" });
          }
          res.json({ success: true, message: "Bonus berhasil diberikan" });
        }
      );
    }
  );
};

/* ============================================================
   🟢 UPDATE Gaji Pokok Berdasarkan ID
   ============================================================ */
export const updateGajiSetting = (req, res) => {
  const { id } = req.params;
  const { gaji_pokok, periode } = req.body;

  if (!gaji_pokok) {
    return res.status(400).json({ message: "Gaji pokok wajib diisi" });
  }

  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

  db.query(
    `UPDATE gaji_setting 
     SET gaji_pokok = ?, periode = ?, updated_at = ? 
     WHERE id_gaji_setting = ?`,
    [gaji_pokok, periode || "Bulanan", now, id],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error updateGajiSetting:", err);
        return res
          .status(500)
          .json({ message: "Gagal memperbarui data gaji pokok" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Data gaji tidak ditemukan" });
      }

      res.json({
        success: true,
        message: "Data gaji pokok berhasil diperbarui",
      });
    }
  );
};

/* ============================================================
   🟢 GET Semua Bonus
   ============================================================ */
export const getAllBonus = (req, res) => {
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
      DATE_FORMAT(b.tanggal_diberikan, '%d %M %Y %H:%i') AS tanggal
    FROM bonus b
    LEFT JOIN capster c ON b.id_capster = c.id_capster
    LEFT JOIN users u ON b.id_user = u.id_user
    LEFT JOIN store s ON (c.id_store = s.id_store OR u.id_store = s.id_store)
    ORDER BY b.tanggal_diberikan DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error getAllBonus:", err);
      return res.status(500).json({ message: "Gagal mengambil data bonus" });
    }
    res.json(result);
  });
};

// 🟢 Hapus Gaji Pokok
export const deleteGajiSetting = (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM gaji_setting WHERE id_gaji_setting = ?",
    [id],
    (err) => {
      if (err) {
        console.error("❌ DB Error delete gaji:", err);
        return res.status(500).json({ message: "Gagal menghapus data gaji" });
      }
      res.json({ success: true, message: "Data gaji berhasil dihapus" });
    }
  );
};

// 🟢 Hapus Bonus
export const deleteBonus = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bonus WHERE id_bonus = ?", [id], (err) => {
    if (err) {
      console.error("❌ DB Error delete bonus:", err);
      return res.status(500).json({ message: "Gagal menghapus data bonus" });
    }
    res.json({ success: true, message: "Data bonus berhasil dihapus" });
  });
};

/* ============================================================
   🟢 GET Bonus by ID
   ============================================================ */
export const getBonusById = (req, res) => {
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

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ DB Error getBonusById:", err);
      return res.status(500).json({ message: "Gagal mengambil data bonus" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Bonus tidak ditemukan" });
    }
    res.json(result[0]);
  });
};

/* ============================================================
   🟢 UPDATE Bonus
   ============================================================ */
export const updateBonus = (req, res) => {
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
  ) {
    return res.status(400).json({ message: "Data bonus tidak lengkap" });
  }

  const tanggal = dayjs(tanggal_diberikan).format("YYYY-MM-DD HH:mm:ss");
  const periodeFinal = periode || dayjs(tanggal_diberikan).format("YYYY-MM");
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

  db.query(
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
    ],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error updateBonus:", err);
        return res.status(500).json({ message: "Gagal memperbarui bonus" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bonus tidak ditemukan" });
      }

      res.json({ success: true, message: "Bonus berhasil diperbarui" });
    }
  );
};
