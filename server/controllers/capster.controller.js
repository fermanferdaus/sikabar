import db from "../config/db.js";

/* ======================================================
   🟢 GET Semua Capster (Admin) / Filter per Store (Kasir)
   ------------------------------------------------------
   - Admin: GET /capster
   - Kasir: GET /capster?store=2
====================================================== */
export const getCapsters = (req, res) => {
  const { store } = req.query;

  // 🔹 Jika ada query ?store=id_store → filter berdasarkan toko
  if (store) {
    db.query(
      `SELECT c.*, s.nama_store 
       FROM capster c 
       JOIN store s ON c.id_store = s.id_store
       WHERE c.id_store = ?
       ORDER BY c.id_capster DESC`,
      [store],
      (err, result) => {
        if (err) {
          console.error("❌ DB Error getCapsters by store:", err);
          return res
            .status(500)
            .json({ message: "Gagal mengambil data capster per store" });
        }
        return res.json(result);
      }
    );
  } else {
    // 🔹 Jika tidak ada query → ambil semua capster
    db.query(
      `SELECT c.*, s.nama_store 
       FROM capster c 
       JOIN store s ON c.id_store = s.id_store
       ORDER BY c.id_capster DESC`,
      (err, result) => {
        if (err) {
          console.error("❌ DB Error getCapsters:", err);
          return res
            .status(500)
            .json({ message: "Gagal mengambil data capster" });
        }
        res.json(result);
      }
    );
  }
};

/* ======================================================
   🔵 GET Capster by ID
   ------------------------------------------------------
   GET /capster/:id
====================================================== */
export const getCapsterById = (req, res) => {
  db.query(
    "SELECT * FROM capster WHERE id_capster = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error getCapsterById:", err);
        return res.status(500).json({ message: "Kesalahan database" });
      }
      if (result.length === 0)
        return res.status(404).json({ message: "Capster tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

/* ======================================================
   🔵 GET Capster per Store (khusus endpoint terpisah)
   ------------------------------------------------------
   GET /capster/store/:id_store
====================================================== */
export const getCapsterByStore = (req, res) => {
  const { id_store } = req.params;
  db.query(
    "SELECT id_capster, nama_capster, status FROM capster WHERE id_store = ? ORDER BY id_capster DESC",
    [id_store],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error getCapsterByStore:", err);
        return res.status(500).json({ message: "Gagal mengambil data capster store" });
      }
      res.json(result);
    }
  );
};

/* ======================================================
   🟡 POST Tambah Capster
   ------------------------------------------------------
   POST /capster
====================================================== */
export const createCapster = (req, res) => {
  const { nama_capster, id_store, status } = req.body;

  if (!nama_capster || !id_store) {
    return res.status(400).json({ message: "Nama dan store wajib diisi" });
  }

  // 🔍 Cek apakah capster dengan nama sama sudah ada di store yang sama
  db.query(
    `SELECT * FROM capster WHERE nama_capster = ? AND id_store = ?`,
    [nama_capster, id_store],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Kesalahan database" });
      if (result.length > 0) {
        return res
          .status(400)
          .json({ message: "Nama capster sudah terdaftar di store ini" });
      }

      // ✅ Jika belum ada, lanjutkan insert
      db.query(
        `INSERT INTO capster (nama_capster, id_store, status) VALUES (?, ?, ?)`,
        [nama_capster, id_store, status],
        (err, insertResult) => {
          if (err) {
            console.error("❌ Gagal menambahkan capster:", err);
            return res
              .status(500)
              .json({ message: "Gagal menambahkan capster" });
          }
          res.json({
            message: "Capster berhasil ditambahkan",
            id_capster: insertResult.insertId,
          });
        }
      );
    }
  );
};

/* ======================================================
   🟠 PUT Update Capster
   ------------------------------------------------------
   PUT /capster/:id
====================================================== */
export const updateCapster = (req, res) => {
  const { nama_capster, id_store, status } = req.body;

  if (!nama_capster || !id_store) {
    return res
      .status(400)
      .json({ message: "Nama capster dan store wajib diisi" });
  }

  db.query(
    "UPDATE capster SET nama_capster = ?, id_store = ?, status = ? WHERE id_capster = ?",
    [nama_capster, id_store, status || "aktif", req.params.id],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error updateCapster:", err);
        return res.status(500).json({ message: "Gagal memperbarui capster" });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Capster tidak ditemukan" });
      res.json({ message: "Capster berhasil diperbarui" });
    }
  );
};

/* ======================================================
   🔴 DELETE Capster
   ------------------------------------------------------
   DELETE /capster/:id
====================================================== */
export const deleteCapster = (req, res) => {
  db.query(
    "DELETE FROM capster WHERE id_capster = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error deleteCapster:", err);
        return res.status(500).json({ message: "Gagal menghapus capster" });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Capster tidak ditemukan" });
      res.json({ message: "Capster berhasil dihapus" });
    }
  );
};

/* ==========================================================
   🟢 Dashboard Capster (Pendapatan Bulanan)
   ========================================================== */
export const getCapsterDashboard = (req, res) => {
  const { id_capster } = req.params;
  if (!id_capster)
    return res.status(400).json({ message: "ID capster tidak ditemukan" });

  const bulanSekarang = dayjs().format("YYYY-MM");

  const sql = `
    SELECT 
      IFNULL(SUM(t.harga), 0) AS pendapatan_kotor,
      IFNULL((
        SELECT gaji_pokok 
        FROM gaji_setting 
        WHERE id_capster = ? 
        LIMIT 1
      ), 0) AS gaji_pokok,
      IFNULL((
        SELECT SUM(b.jumlah) 
        FROM bonus b 
        WHERE b.id_capster = ? AND b.periode = ?
      ), 0) AS bonus_bulanan
    FROM transaksi t
    WHERE t.id_capster = ? 
      AND DATE_FORMAT(t.tanggal, '%Y-%m') = ?
  `;

  db.query(sql, [id_capster, id_capster, bulanSekarang, id_capster, bulanSekarang], (err, result) => {
    if (err) {
      console.error("❌ DB Error getCapsterDashboard:", err);
      return res.status(500).json({ message: "Gagal mengambil data dashboard capster" });
    }

    const row = result[0];
    const totalPendapatan =
      Number(row.pendapatan_kotor) +
      Number(row.bonus_bulanan) +
      Number(row.gaji_pokok);

    res.json({
      success: true,
      periode: bulanSekarang,
      pendapatan_kotor: row.pendapatan_kotor,
      gaji_pokok: row.gaji_pokok,
      bonus_bulanan: row.bonus_bulanan,
      total_pendapatan: totalPendapatan,
    });
  });
};