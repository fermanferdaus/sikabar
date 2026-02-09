import fs from "fs";
import path from "path";
import db from "../config/db.js";

/* ======================================================
   🧾 GET Semua Pengeluaran
====================================================== */
export const getPengeluaran = async (req, res) => {
  try {
    const role = req.user?.role;
    const id_store = req.user?.id_store;

    let sql = `
      SELECT 
        p.*, 
        s.nama_store, 
        u.nama_user AS nama_user
      FROM pengeluaran p
      LEFT JOIN store s ON p.id_store = s.id_store
      LEFT JOIN users u ON p.id_user = u.id_user
    `;

    const params = [];
    if (role === "kasir") {
      sql += " WHERE p.id_store = ?";
      params.push(id_store);
    }
    sql += " ORDER BY p.tanggal DESC";

    const [rows] = await db.query(sql, params);
    res.json({ status: "success", data: rows });
  } catch {
    res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil data pengeluaran" });
  }
};

/* ======================================================
   💰 GET Total Pengeluaran per Cabang (ADMIN)
====================================================== */
export const getTotalPengeluaran = async (req, res) => {
  try {
    const role = req.user?.role;
    const id_store = req.user?.id_store;
    const { tipe, tanggal } = req.query;

    let dateFilter = "";

    if (tanggal && tipe === "Harian") {
      dateFilter = `AND DATE(p.tanggal) = '${tanggal}'`;
    } else if (tanggal && tipe === "Bulanan") {
      const bulan = tanggal.slice(0, 7);
      dateFilter = `AND DATE_FORMAT(p.tanggal, '%Y-%m') = '${bulan}'`;
    }

    const sql = `
      SELECT 
        s.id_store,
        s.nama_store,
        COUNT(p.id_pengeluaran) AS total_transaksi,
        COALESCE(SUM(p.jumlah), 0) AS total_pengeluaran
      FROM store s
      LEFT JOIN pengeluaran p 
        ON s.id_store = p.id_store
        ${dateFilter}   -- ⬅ filter dipindah ke ON, bukan WHERE
      ${role === "kasir" ? "WHERE s.id_store = ?" : ""}
      GROUP BY s.id_store
      ORDER BY s.nama_store ASC
    `;

    const params = role === "kasir" ? [id_store] : [];
    const [rows] = await db.query(sql, params);

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("❌ getTotalPengeluaran Error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal menghitung total pengeluaran",
    });
  }
};

/* ======================================================
   ➕ POST Tambah Pengeluaran
====================================================== */
export const addPengeluaran = async (req, res) => {
  try {
    const {
      id_store: idStoreFromBody,
      kategori,
      deskripsi,
      jumlah,
      tanggal,
    } = req.body;

    let id_store = idStoreFromBody || req.user?.id_store || null;
    if (id_store === "null" || id_store === "") id_store = null;

    if (!id_store) {
      return res.status(400).json({
        status: "error",
        message: "id_store wajib diisi",
      });
    }

    if (!kategori || !jumlah || !tanggal) {
      return res.status(400).json({
        status: "error",
        message: "Kategori, jumlah, dan tanggal wajib diisi.",
      });
    }

    // ===============================
    // 🔑 TENTUKAN id_user (KASIR)
    // ===============================
    let id_user = null;

    if (req.user.role === "kasir") {
      // kasir normal
      id_user = req.user.id_user;
    } else if (req.user.role === "admin") {
      // admin → cari kasir store
      const [kasirRows] = await db.query(
        `
        SELECT id_user 
        FROM users 
        WHERE role = 'kasir' 
          AND id_store = ?
        ORDER BY id_user ASC
        LIMIT 1
        `,
        [id_store]
      );

      if (!kasirRows.length) {
        return res.status(400).json({
          status: "error",
          message: "Kasir untuk store ini tidak ditemukan",
        });
      }

      id_user = kasirRows[0].id_user;
    }

    const bukti_path = req.file
      ? `/uploads/pengeluaran/${req.file.filename}`
      : null;

    await db.query(
      `
      INSERT INTO pengeluaran 
      (id_store, id_user, kategori, deskripsi, jumlah, tanggal, bukti_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id_store, id_user, kategori, deskripsi, jumlah, tanggal, bukti_path]
    );

    res.json({
      status: "success",
      message: "Pengeluaran berhasil ditambahkan",
    });
  } catch (err) {
    console.error("❌ addPengeluaran error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal menambah pengeluaran",
    });
  }
};

/* ======================================================
   🗑️ DELETE Pengeluaran
====================================================== */
export const deletePengeluaran = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT bukti_path FROM pengeluaran WHERE id_pengeluaran = ?",
      [id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ status: "error", message: "Data tidak ditemukan" });

    const buktiPath = rows[0].bukti_path;
    let fullPath = null;

    if (buktiPath) {
      const uploadPath1 = path.join(process.cwd(), "public", buktiPath);
      const uploadPath2 = path.join(process.cwd(), buktiPath);
      if (fs.existsSync(uploadPath1)) fullPath = uploadPath1;
      else if (fs.existsSync(uploadPath2)) fullPath = uploadPath2;
    }

    await db.query("DELETE FROM pengeluaran WHERE id_pengeluaran = ?", [id]);

    if (fullPath) {
      try {
        fs.unlinkSync(fullPath);
      } catch {}
    }

    res.json({
      status: "success",
      message: "Pengeluaran dan file bukti berhasil dihapus",
    });
  } catch {
    res
      .status(500)
      .json({ status: "error", message: "Gagal menghapus data pengeluaran" });
  }
};

/* ======================================================
   🏪 GET Pengeluaran per Cabang (DETAIL)
====================================================== */
export const getPengeluaranByStore = async (req, res) => {
  try {
    const { id_store } = req.params;
    const [rows] = await db.query(
      `
      SELECT 
        p.*, 
        u.nama_user, 
        s.nama_store
      FROM pengeluaran p
      LEFT JOIN users u ON p.id_user = u.id_user
      LEFT JOIN store s ON p.id_store = s.id_store
      WHERE p.id_store = ?
      ORDER BY p.tanggal DESC
    `,
      [id_store]
    );

    res.json({ status: "success", data: rows });
  } catch {
    res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil pengeluaran cabang" });
  }
};

/* ======================================================
   ✏️ UPDATE Pengeluaran
====================================================== */
export const updatePengeluaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, deskripsi, jumlah, tanggal } = req.body;
    const bukti_path = req.file
      ? `/uploads/pengeluaran/${req.file.filename}`
      : null;

    const [rows] = await db.query(
      "SELECT bukti_path FROM pengeluaran WHERE id_pengeluaran = ?",
      [id]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ status: "error", message: "Data pengeluaran tidak ditemukan" });

    const oldBukti = rows[0].bukti_path;

    const updates = [];
    const params = [];

    if (kategori) {
      updates.push("kategori = ?");
      params.push(kategori);
    }
    if (deskripsi) {
      updates.push("deskripsi = ?");
      params.push(deskripsi);
    }
    if (jumlah) {
      updates.push("jumlah = ?");
      params.push(jumlah);
    }
    if (tanggal) {
      updates.push("tanggal = ?");
      params.push(tanggal);
    }
    if (bukti_path) {
      updates.push("bukti_path = ?");
      params.push(bukti_path);
    }

    if (!updates.length)
      return res
        .status(400)
        .json({ status: "error", message: "Tidak ada data yang diubah" });

    params.push(id);
    const sql = `UPDATE pengeluaran SET ${updates.join(
      ", "
    )} WHERE id_pengeluaran = ?`;

    await db.query(sql, params);

    // 🔹 Hapus bukti lama jika upload baru
    if (bukti_path && oldBukti) {
      const oldPath = path.join(process.cwd(), "public", oldBukti);
      fs.unlink(oldPath, (fsErr) => {
        if (fsErr && fsErr.code !== "ENOENT") {
          console.error("⚠️ Gagal hapus bukti lama:", fsErr);
        }
      });
    }

    res.json({
      status: "success",
      message: "Data pengeluaran berhasil diperbarui",
    });
  } catch {
    res
      .status(500)
      .json({ status: "error", message: "Gagal memperbarui pengeluaran" });
  }
};
