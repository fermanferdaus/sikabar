import fs from "fs";
import path from "path";
import db from "../config/db.js";

/* ======================================================
   🧾 GET Semua Pengeluaran
====================================================== */
export const getPengeluaran = (req, res) => {
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

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error getPengeluaran:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data pengeluaran",
      });
    }

    return res.json({ status: "success", data: results });
  });
};

/* ======================================================
   💰 GET Total Pengeluaran per Cabang (UNTUK ADMIN PAGE)
====================================================== */
export const getTotalPengeluaran = (req, res) => {
  const role = req.user?.role;
  const id_store = req.user?.id_store;
  const { tipe, tanggal } = req.query; // ← ambil dari query params frontend

  let sql = `
    SELECT 
      s.id_store,
      s.nama_store,
      COUNT(p.id_pengeluaran) AS total_transaksi,
      COALESCE(SUM(p.jumlah), 0) AS total_pengeluaran
    FROM store s
    LEFT JOIN pengeluaran p ON s.id_store = p.id_store
  `;

  const params = [];
  const whereClauses = [];

  // 🔹 Filter role kasir
  if (role === "kasir") {
    whereClauses.push("s.id_store = ?");
    params.push(id_store);
  }

  // 🔹 Filter tanggal dari query
  if (tanggal && tipe === "Harian") {
    whereClauses.push("DATE(p.tanggal) = ?");
    params.push(tanggal);
  } else if (tanggal && tipe === "Bulanan") {
    whereClauses.push("MONTH(p.tanggal) = MONTH(?) AND YEAR(p.tanggal) = YEAR(?)");
    params.push(tanggal, tanggal);
  }

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  sql += " GROUP BY s.id_store ORDER BY s.nama_store ASC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Error getTotalPengeluaran:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal menghitung total pengeluaran",
      });
    }

    return res.json({ status: "success", data: results });
  });
};

/* ======================================================
   ➕ POST Tambah Pengeluaran
====================================================== */
export const addPengeluaran = (req, res) => {
  const {
    id_store: idStoreFromBody,
    kategori,
    deskripsi,
    jumlah,
    tanggal,
  } = req.body;

  // ✅ Perbaikan di sini
  let id_store = idStoreFromBody || req.user?.id_store || null;
  const id_user = req.user?.id_user || null;

  // ✅ Pastikan string 'null' atau '' tidak ikut dikirim ke SQL
  if (id_store === "null" || id_store === "") {
    id_store = null;
  }

  const bukti_path = req.file
    ? `/uploads/pengeluaran/${req.file.filename}`
    : null;

  if (!kategori || !jumlah || !tanggal) {
    return res.status(400).json({
      status: "error",
      message: "Kategori, jumlah, dan tanggal wajib diisi.",
    });
  }

  const sql = `
    INSERT INTO pengeluaran (id_store, id_user, kategori, deskripsi, jumlah, tanggal, bukti_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [id_store, id_user, kategori, deskripsi, jumlah, tanggal, bukti_path],
    (err) => {
      if (err) {
        console.error("❌ Error addPengeluaran:", err);
        return res.status(500).json({
          status: "error",
          message: "Gagal menambah pengeluaran",
        });
      }

      res.json({
        status: "success",
        message: "Pengeluaran berhasil ditambahkan",
        id_store, // tambahkan ini biar frontend tahu masuk cabang mana
      });
    }
  );
};

/* ======================================================
   🗑️ DELETE Pengeluaran
====================================================== */
export const deletePengeluaran = (req, res) => {
  const { id } = req.params;

  // 🔹 Ambil path bukti dari DB
  db.query(
    "SELECT bukti_path FROM pengeluaran WHERE id_pengeluaran = ?",
    [id],
    (err, rows) => {
      if (err)
        return res.status(500).json({
          status: "error",
          message: "Gagal mengambil data bukti",
        });

      if (rows.length === 0)
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });

      const buktiPath = rows[0].bukti_path;
      let fullPath = null;

      if (buktiPath) {
        // Coba dua kemungkinan lokasi file
        const uploadPath1 = path.join(process.cwd(), "public", buktiPath);
        const uploadPath2 = path.join(process.cwd(), buktiPath);

        // Pilih path yang benar-benar ada
        if (fs.existsSync(uploadPath1)) {
          fullPath = uploadPath1;
        } else if (fs.existsSync(uploadPath2)) {
          fullPath = uploadPath2;
        }
      }

      // 🔹 Hapus data dari database
      db.query(
        "DELETE FROM pengeluaran WHERE id_pengeluaran = ?",
        [id],
        (errDel, result) => {
          if (errDel)
            return res.status(500).json({
              status: "error",
              message: "Gagal menghapus data pengeluaran",
            });

          // 🔹 Hapus file jika ditemukan
          if (fullPath) {
            try {
              fs.unlinkSync(fullPath);
              console.log("🗑️ File bukti dihapus:", fullPath);
            } catch (fsErr) {
              console.error("⚠️ Gagal menghapus file:", fsErr);
            }
          } else {
            console.warn("⚠️ File bukti tidak ditemukan di folder uploads");
          }

          res.json({
            status: "success",
            message: "Pengeluaran dan file bukti berhasil dihapus",
          });
        }
      );
    }
  );
};

/* ======================================================
   🏪 GET Pengeluaran per Cabang (DETAIL)
====================================================== */
export const getPengeluaranByStore = (req, res) => {
  const { id_store } = req.params;

  const sql = `
    SELECT 
      p.*, 
      u.nama_user, 
      s.nama_store
    FROM pengeluaran p
    LEFT JOIN users u ON p.id_user = u.id_user
    LEFT JOIN store s ON p.id_store = s.id_store
    WHERE p.id_store = ?
    ORDER BY p.tanggal DESC
  `;

  db.query(sql, [id_store], (err, results) => {
    if (err) {
      console.error("❌ Error getPengeluaranByStore:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil pengeluaran cabang.",
      });
    }
    res.json({ status: "success", data: results });
  });
};

/* ======================================================
   ✏️ UPDATE Pengeluaran
====================================================== */
export const updatePengeluaran = (req, res) => {
  const { id } = req.params;
  const { kategori, deskripsi, jumlah, tanggal } = req.body;
  const bukti_path = req.file
    ? `/uploads/pengeluaran/${req.file.filename}`
    : null;

  // Ambil data lama untuk tahu apakah ada file bukti lama
  db.query(
    "SELECT bukti_path FROM pengeluaran WHERE id_pengeluaran = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ Error get data lama:", err);
        return res.status(500).json({
          status: "error",
          message: "Gagal mengambil data pengeluaran lama",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Data pengeluaran tidak ditemukan",
        });
      }

      const oldBukti = rows[0].bukti_path;
      const updateFields = [];
      const params = [];

      if (kategori) {
        updateFields.push("kategori = ?");
        params.push(kategori);
      }
      if (deskripsi) {
        updateFields.push("deskripsi = ?");
        params.push(deskripsi);
      }
      if (jumlah) {
        updateFields.push("jumlah = ?");
        params.push(jumlah);
      }
      if (tanggal) {
        updateFields.push("tanggal = ?");
        params.push(tanggal);
      }
      if (bukti_path) {
        updateFields.push("bukti_path = ?");
        params.push(bukti_path);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Tidak ada data yang diubah",
        });
      }

      params.push(id);

      const sql = `UPDATE pengeluaran SET ${updateFields.join(
        ", "
      )} WHERE id_pengeluaran = ?`;

      db.query(sql, params, (errUpdate) => {
        if (errUpdate) {
          console.error("❌ Error update pengeluaran:", errUpdate);
          return res.status(500).json({
            status: "error",
            message: "Gagal memperbarui pengeluaran",
          });
        }

        // 🔹 Hapus file lama jika ada file baru diunggah
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
      });
    }
  );
};
