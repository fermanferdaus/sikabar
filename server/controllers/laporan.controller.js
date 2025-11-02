import db from "../config/db.js";
import dayjs from "dayjs";

export const getLaporanPemasukan = (req, res) => {
  const { filter, startDate, endDate, store, tipe_transaksi } = req.query;

  // ===============================
  // 🔹 1. Tentukan WHERE Clause
  // ===============================
  let whereClause = "1=1";

  // Filter waktu
  if (filter === "harian" && startDate) {
    whereClause = `DATE(t.created_at) = '${startDate}'`;
  } else if (filter === "bulanan" && startDate) {
    const bulan = startDate.slice(5, 7);
    const tahun = startDate.slice(0, 4);
    whereClause = `MONTH(t.created_at) = ${bulan} AND YEAR(t.created_at) = ${tahun}`;
  } else if (filter === "periode" && startDate && endDate) {
    whereClause = `DATE(t.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
  }

  // Filter store (jika dipilih selain "Semua")
  if (store && store !== "Semua") {
    whereClause += ` AND t.id_store = ${db.escape(store)}`;
  }

  // Filter tipe transaksi (jika dipilih selain "Semua")
  if (tipe_transaksi && tipe_transaksi !== "Semua") {
    whereClause += ` AND t.tipe_transaksi = ${db.escape(tipe_transaksi)}`;
  }

  // ===============================
  // 🔹 2. Query SQL — Detail per transaksi
  // ===============================
  const query = `
    SELECT 
      t.id_transaksi,
      s.nama_store AS store,
      t.tipe_transaksi,
      DATE(t.created_at) AS tanggal,
      IFNULL(SUM(tsd.harga), 0) AS total_service,
      IFNULL(SUM(tsd.komisi_capster), 0) AS komisi_capster,
      IFNULL(SUM(tpd.laba_rugi), 0) AS laba_produk,
      (IFNULL(SUM(tsd.harga), 0) + IFNULL(SUM(tpd.laba_rugi), 0) - IFNULL(SUM(tsd.komisi_capster), 0)) AS total_bersih
    FROM transaksi t
    LEFT JOIN store s ON s.id_store = t.id_store
    LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
    LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
    WHERE ${whereClause}
    GROUP BY t.id_transaksi
    ORDER BY t.created_at DESC;
  `;

  // ===============================
  // 🔹 3. Jalankan Query
  // ===============================
  db.query(query, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil laporan pemasukan.",
        error: err.sqlMessage || err.message,
      });
    }

    // ===============================
    // 🔹 4. Format hasil
    // ===============================
    const formatted = rows.map((r) => ({
      id_transaksi: r.id_transaksi,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || "-",
      tipe_transaksi: r.tipe_transaksi || "-",
      total_service: Number(r.total_service) || 0,
      laba_produk: Number(r.laba_produk) || 0,
      komisi_capster: Number(r.komisi_capster) || 0,
      total_bersih: Number(r.total_bersih) || 0,
    }));

    res.json({ success: true, data: formatted });
  });
};

// ==============================
// 🔹 LAPORAN PENGELUARAN
// ==============================
export const getLaporanPengeluaran = (req, res) => {
  const { filter, startDate, endDate, store } = req.query;
  let whereClause = "1=1";

  // 🕓 Filter waktu
  if (filter === "harian" && startDate) {
    whereClause = `DATE(p.tanggal) = '${startDate}'`;
  } else if (filter === "bulanan" && startDate) {
    const bulan = startDate.slice(5, 7);
    const tahun = startDate.slice(0, 4);
    whereClause = `MONTH(p.tanggal) = ${bulan} AND YEAR(p.tanggal) = ${tahun}`;
  } else if (filter === "periode" && startDate && endDate) {
    whereClause = `DATE(p.tanggal) BETWEEN '${startDate}' AND '${endDate}'`;
  }

  // 🏪 Filter store
  if (store && store !== "Semua") {
    whereClause += ` AND p.id_store = ${db.escape(store)}`;
  }

  const query = `
    SELECT 
      p.id_pengeluaran,
      s.nama_store AS store,
      p.kategori,
      p.deskripsi,
      p.jumlah,
      DATE(p.tanggal) AS tanggal
    FROM pengeluaran p
    LEFT JOIN store s ON s.id_store = p.id_store
    WHERE ${whereClause}
    ORDER BY p.tanggal DESC;
  `;

  db.query(query, (err, rows) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil laporan pengeluaran.",
        error: err.sqlMessage || err.message,
      });

    const formatted = rows.map((r) => ({
      id_pengeluaran: r.id_pengeluaran,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || "Admin",
      kategori: r.kategori || "-",
      deskripsi: r.deskripsi || "-",
      jumlah: Number(r.jumlah) || 0,
    }));

    res.json({ success: true, data: formatted });
  });
};

// ==============================
// 🔹 LAPORAN PEMASUKAN KASIR
// ==============================
// ==============================
// 🔹 LAPORAN PEMASUKAN KASIR — FIX FINAL
// ==============================
export const getLaporanPemasukanKasir = (req, res) => {
  const { filter, startDate, endDate, id_store, tipe_transaksi } = req.query;

  if (!id_store) {
    return res.status(400).json({
      success: false,
      message: "ID Store tidak ditemukan.",
    });
  }

  // 🏪 Ambil nama store dulu
  const storeQuery = `SELECT nama_store FROM store WHERE id_store = ${db.escape(id_store)} LIMIT 1;`;

  db.query(storeQuery, (err, storeRows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil nama store.",
        error: err.sqlMessage || err.message,
      });
    }

    const storeName = storeRows[0]?.nama_store || "-";

    // === Query utama laporan ===
    let whereClause = `t.id_store = ${db.escape(id_store)}`;

    if (filter === "harian" && startDate) {
      whereClause += ` AND DATE(t.created_at) = '${startDate}'`;
    } else if (filter === "bulanan" && startDate) {
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      whereClause += ` AND MONTH(t.created_at) = ${bulan} AND YEAR(t.created_at) = ${tahun}`;
    } else if (filter === "periode" && startDate && endDate) {
      whereClause += ` AND DATE(t.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    if (tipe_transaksi && tipe_transaksi !== "Semua") {
      whereClause += ` AND t.tipe_transaksi = ${db.escape(tipe_transaksi)}`;
    }

    const query = `
      SELECT 
        t.id_transaksi,
        s.nama_store AS store,
        t.tipe_transaksi,
        DATE(t.created_at) AS tanggal,
        IFNULL(SUM(tsd.harga), 0) AS total_service,
        IFNULL(SUM(tsd.komisi_capster), 0) AS komisi_capster,
        IFNULL(SUM(tpd.laba_rugi), 0) AS laba_produk,
        (IFNULL(SUM(tsd.harga), 0) + IFNULL(SUM(tpd.laba_rugi), 0) - IFNULL(SUM(tsd.komisi_capster), 0)) AS total_bersih
      FROM transaksi t
      LEFT JOIN store s ON s.id_store = t.id_store
      LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
      LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      WHERE ${whereClause}
      GROUP BY t.id_transaksi
      ORDER BY t.created_at DESC;
    `;

    db.query(query, (err2, rows) => {
      if (err2) {
        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan saat mengambil laporan pemasukan kasir.",
          error: err2.sqlMessage || err2.message,
        });
      }

      const formatted = rows.map((r) => ({
        id_transaksi: r.id_transaksi,
        tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
        store: r.store || storeName,
        tipe_transaksi: r.tipe_transaksi || "-",
        total_service: Number(r.total_service) || 0,
        laba_produk: Number(r.laba_produk) || 0,
        komisi_capster: Number(r.komisi_capster) || 0,
        total_bersih: Number(r.total_bersih) || 0,
      }));

      return res.json({
        success: true,
        data: formatted,
        store: storeName,
      });
    });
  });
};



// =====================================================
// 🔹 LAPORAN PENGELUARAN KASIR — FIX FINAL
// =====================================================
export const getLaporanPengeluaranKasir = (req, res) => {
  const { filter, startDate, endDate, id_store, kategori } = req.query;

  if (!id_store) {
    return res.status(400).json({
      success: false,
      message: "ID Store tidak ditemukan.",
    });
  }

  // 🏪 Ambil nama store dulu
  const storeQuery = `SELECT nama_store FROM store WHERE id_store = ${db.escape(id_store)} LIMIT 1;`;

  db.query(storeQuery, (err, storeRows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil nama store.",
        error: err.sqlMessage || err.message,
      });
    }

    const storeName = storeRows[0]?.nama_store || "-";

    // === Query utama laporan ===
    let whereClause = `p.id_store = ${db.escape(id_store)}`;

    if (filter === "harian" && startDate) {
      whereClause += ` AND DATE(p.tanggal) = '${startDate}'`;
    } else if (filter === "bulanan" && startDate) {
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      whereClause += ` AND MONTH(p.tanggal) = ${bulan} AND YEAR(p.tanggal) = ${tahun}`;
    } else if (filter === "periode" && startDate && endDate) {
      whereClause += ` AND DATE(p.tanggal) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    if (kategori && kategori !== "Semua") {
      whereClause += ` AND p.kategori = ${db.escape(kategori)}`;
    }

    const query = `
      SELECT 
        p.id_pengeluaran,
        s.nama_store AS store,
        p.kategori,
        p.deskripsi,
        p.jumlah,
        DATE(p.tanggal) AS tanggal
      FROM pengeluaran p
      LEFT JOIN store s ON s.id_store = p.id_store
      WHERE ${whereClause}
      ORDER BY p.tanggal DESC;
    `;

    db.query(query, (err2, rows) => {
      if (err2)
        return res.status(500).json({
          success: false,
          message: "Gagal mengambil laporan pengeluaran kasir.",
          error: err2.sqlMessage || err2.message,
        });

      const formatted = rows.map((r) => ({
        id_pengeluaran: r.id_pengeluaran,
        tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
        store: r.store || storeName,
        kategori: r.kategori || "-",
        deskripsi: r.deskripsi || "-",
        jumlah: Number(r.jumlah) || 0,
      }));

      return res.json({
        success: true,
        data: formatted,
        store: storeName,
      });
    });
  });
};
