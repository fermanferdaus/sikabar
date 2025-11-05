import db from "../config/db.js";
import dayjs from "dayjs";

// ======================================================
// 🟢 LAPORAN PEMASUKAN (ADMIN)
// ======================================================
export const getLaporanPemasukan = async (req, res) => {
  try {
    const { filter, startDate, endDate, store, tipe_transaksi } = req.query;
    let where = ["1=1"];
    const params = [];

    if (filter === "harian" && startDate) {
      where = ["DATE(t.created_at) = ?"];
      params.push(startDate);
    } else if (filter === "bulanan" && startDate) {
      where = ["MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?"];
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      params.push(bulan, tahun);
    } else if (filter === "periode" && startDate && endDate) {
      where = ["DATE(t.created_at) BETWEEN ? AND ?"];
      params.push(startDate, endDate);
    }

    if (store && store !== "Semua") {
      where.push("t.id_store = ?");
      params.push(store);
    }
    if (tipe_transaksi && tipe_transaksi !== "Semua") {
      where.push("t.tipe_transaksi = ?");
      params.push(tipe_transaksi);
    }

    const sql = `
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
      WHERE ${where.join(" AND ")}
      GROUP BY t.id_transaksi
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);
    const formatted = rows.map((r) => ({
      id_transaksi: r.id_transaksi,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || "-",
      tipe_transaksi: r.tipe_transaksi || "-",
      total_service: +r.total_service || 0,
      laba_produk: +r.laba_produk || 0,
      komisi_capster: +r.komisi_capster || 0,
      total_bersih: +r.total_bersih || 0,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pemasukan.",
      error: err.message,
    });
  }
};

// ======================================================
// 🔵 LAPORAN PENGELUARAN (ADMIN)
// ======================================================
export const getLaporanPengeluaran = async (req, res) => {
  try {
    const { filter, startDate, endDate, store } = req.query;
    let where = ["1=1"];
    const params = [];

    if (filter === "harian" && startDate) {
      where = ["DATE(p.tanggal) = ?"];
      params.push(startDate);
    } else if (filter === "bulanan" && startDate) {
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      where = ["MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?"];
      params.push(bulan, tahun);
    } else if (filter === "periode" && startDate && endDate) {
      where = ["DATE(p.tanggal) BETWEEN ? AND ?"];
      params.push(startDate, endDate);
    }

    if (store && store !== "Semua") {
      where.push("p.id_store = ?");
      params.push(store);
    }

    const sql = `
      SELECT 
        p.id_pengeluaran,
        s.nama_store AS store,
        p.kategori,
        p.deskripsi,
        p.jumlah,
        DATE(p.tanggal) AS tanggal
      FROM pengeluaran p
      LEFT JOIN store s ON s.id_store = p.id_store
      WHERE ${where.join(" AND ")}
      ORDER BY p.tanggal DESC
    `;

    const [rows] = await db.query(sql, params);
    const formatted = rows.map((r) => ({
      id_pengeluaran: r.id_pengeluaran,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || "Admin",
      kategori: r.kategori || "-",
      deskripsi: r.deskripsi || "-",
      jumlah: +r.jumlah || 0,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pengeluaran.",
      error: err.message,
    });
  }
};

// ======================================================
// 🟠 LAPORAN PEMASUKAN KASIR
// ======================================================
export const getLaporanPemasukanKasir = async (req, res) => {
  try {
    const { filter, startDate, endDate, id_store, tipe_transaksi } = req.query;
    if (!id_store)
      return res
        .status(400)
        .json({ success: false, message: "ID Store tidak ditemukan." });

    const [[storeData]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store]
    );
    const storeName = storeData?.nama_store || "-";

    let where = ["t.id_store = ?"];
    const params = [id_store];

    if (filter === "harian" && startDate) {
      where.push("DATE(t.created_at) = ?");
      params.push(startDate);
    } else if (filter === "bulanan" && startDate) {
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      where.push("MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?");
      params.push(bulan, tahun);
    } else if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    if (tipe_transaksi && tipe_transaksi !== "Semua") {
      where.push("t.tipe_transaksi = ?");
      params.push(tipe_transaksi);
    }

    const sql = `
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
      WHERE ${where.join(" AND ")}
      GROUP BY t.id_transaksi
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);
    const formatted = rows.map((r) => ({
      id_transaksi: r.id_transaksi,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || storeName,
      tipe_transaksi: r.tipe_transaksi || "-",
      total_service: +r.total_service || 0,
      laba_produk: +r.laba_produk || 0,
      komisi_capster: +r.komisi_capster || 0,
      total_bersih: +r.total_bersih || 0,
    }));

    res.json({ success: true, data: formatted, store: storeName });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pemasukan kasir.",
      error: err.message,
    });
  }
};

// ======================================================
// 🔴 LAPORAN PENGELUARAN KASIR
// ======================================================
export const getLaporanPengeluaranKasir = async (req, res) => {
  try {
    const { filter, startDate, endDate, id_store, kategori } = req.query;
    if (!id_store)
      return res
        .status(400)
        .json({ success: false, message: "ID Store tidak ditemukan." });

    const [[storeData]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store]
    );
    const storeName = storeData?.nama_store || "-";

    let where = ["p.id_store = ?"];
    const params = [id_store];

    if (filter === "harian" && startDate) {
      where.push("DATE(p.tanggal) = ?");
      params.push(startDate);
    } else if (filter === "bulanan" && startDate) {
      const bulan = startDate.slice(5, 7);
      const tahun = startDate.slice(0, 4);
      where.push("MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?");
      params.push(bulan, tahun);
    } else if (filter === "periode" && startDate && endDate) {
      where.push("DATE(p.tanggal) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    if (kategori && kategori !== "Semua") {
      where.push("p.kategori = ?");
      params.push(kategori);
    }

    const sql = `
      SELECT 
        p.id_pengeluaran,
        s.nama_store AS store,
        p.kategori,
        p.deskripsi,
        p.jumlah,
        DATE(p.tanggal) AS tanggal
      FROM pengeluaran p
      LEFT JOIN store s ON s.id_store = p.id_store
      WHERE ${where.join(" AND ")}
      ORDER BY p.tanggal DESC
    `;

    const [rows] = await db.query(sql, params);
    const formatted = rows.map((r) => ({
      id_pengeluaran: r.id_pengeluaran,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || storeName,
      kategori: r.kategori || "-",
      deskripsi: r.deskripsi || "-",
      jumlah: +r.jumlah || 0,
    }));

    res.json({ success: true, data: formatted, store: storeName });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pengeluaran kasir.",
      error: err.message,
    });
  }
};
