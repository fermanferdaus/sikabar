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

// ======================================================
// 🟦 LAPORAN DATA PRODUK
// ======================================================
export const getLaporanProduk = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    let where = [];
    const params = [];

    // Filter cabang
    if (store && store !== "Semua") {
      where.push("sp.id_store = ?");
      params.push(store);
    }

    // filter tanggal
    if (filter === "hari" && tanggal) {
      where.push("DATE(p.created_at) = ?");
      params.push(tanggal);
    }

    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(p.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(p.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    const sql = `
      SELECT 
        sp.id_store,
        s.nama_store,
        p.id_produk,
        p.nama_produk,
        p.harga_awal,
        p.harga_jual,
        sp.jumlah_stok,
        p.created_at
      FROM stok_produk sp
      JOIN produk p ON p.id_produk = sp.id_produk
      JOIN store s ON s.id_store = sp.id_store
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY sp.id_store ASC, p.nama_produk ASC
    `;

    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.log("ERR LAPORAN PRODUK:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan produk",
      error: err.message,
    });
  }
};

export const getLaporanPenjualanProduk = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    let where = ["t.tipe_transaksi IN ('produk', 'campuran')"];
    const params = [];

    if (store && store !== "Semua") {
      where.push("t.id_store = ?");
      params.push(store);
    }

    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    const sql = `
      SELECT 
        s.nama_store AS store,
        st.nomor_struk,
        DATE(t.created_at) AS tanggal,
        p.nama_produk,
        tpd.jumlah,
        tpd.harga_jual AS harga_satuan,
        (tpd.jumlah * tpd.harga_jual) AS total
      FROM transaksi t
      JOIN store s ON s.id_store = t.id_store
      JOIN struk st ON st.id_transaksi = t.id_transaksi
      JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      JOIN produk p ON p.id_produk = tpd.id_produk
      WHERE ${where.join(" AND ")}
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);

    const formatted = rows.map((r) => ({
      store: r.store,
      nomor_struk: r.nomor_struk,
      tanggal: r.tanggal,
      nama_produk: r.nama_produk,
      jumlah: r.jumlah,
      harga_satuan: Number(r.harga_satuan),
      total: Number(r.total),
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan penjualan produk.",
      error: err.message,
    });
  }
};

export const getLaporanStokProduk = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    let stokWhere = ["1=1"];
    let transWhere = ["1=1"];
    const stokParams = [];
    const transParams = [];

    // ===============================
    // Filter Store
    // ===============================
    if (store && store !== "Semua") {
      stokWhere.push("sp.id_store = ?");
      stokParams.push(store);

      transWhere.push("t.id_store = ?");
      transParams.push(store);
    }

    // ===============================
    // Filter Harian
    // ===============================
    if (filter === "hari" && tanggal) {
      stokWhere.push("DATE(sp.updated_at) = ?");
      stokParams.push(tanggal);

      transWhere.push("DATE(t.created_at) = ?");
      transParams.push(tanggal);
    }

    // ===============================
    // Filter Bulanan
    // ===============================
    if (filter === "bulan" && bulan) {
      stokWhere.push("DATE_FORMAT(sp.updated_at, '%Y-%m') = ?");
      stokParams.push(bulan);

      transWhere.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      transParams.push(bulan);
    }

    // ===============================
    // Filter Periode
    // ===============================
    if (filter === "periode" && startDate && endDate) {
      stokWhere.push("DATE(sp.updated_at) BETWEEN ? AND ?");
      stokParams.push(startDate, endDate);

      transWhere.push("DATE(t.created_at) BETWEEN ? AND ?");
      transParams.push(startDate, endDate);
    }

    // ======================================================
    // (1) Ambil stok dari stok_produk (jumlah_stok = stok awal)
    // ======================================================
    const sqlStok = `
      SELECT
        sp.id_store,
        s.nama_store AS store,
        p.id_produk,
        p.nama_produk,
        sp.jumlah_stok AS stok_awal,      -- stok masuk / stok awal
        DATE(sp.updated_at) AS tanggal
      FROM stok_produk sp
      JOIN produk p ON p.id_produk = sp.id_produk
      JOIN store s ON s.id_store = sp.id_store
      WHERE ${stokWhere.join(" AND ")}
      ORDER BY sp.id_store ASC, p.nama_produk ASC
    `;

    const [stokRows] = await db.query(sqlStok, stokParams);

    if (!stokRows.length)
      return res.json({ success: true, data: [] });

    // ======================================================
    // (2) Hitung TERJUAL berdasarkan transaksi
    // ======================================================
    const sqlTerjual = `
      SELECT
        t.id_store,
        tpd.id_produk,
        SUM(tpd.jumlah) AS terjual
      FROM transaksi t
      JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      WHERE ${transWhere.join(" AND ")}
      GROUP BY t.id_store, tpd.id_produk
    `;

    const [jualRows] = await db.query(sqlTerjual, transParams);

    const mapTerjual = {};
    jualRows.forEach((r) => {
      mapTerjual[`${r.id_store}_${r.id_produk}`] = r.terjual;
    });

    // ======================================================
    // (3) Gabungkan stok_awal + terjual → sisa_produk
    // ======================================================
    const finalData = stokRows.map((row) => {
      const key = `${row.id_store}_${row.id_produk}`;
      const terjual = mapTerjual[key] || 0;

      const stok_awal = row.stok_awal;
      const sisa_produk = Math.max(stok_awal - terjual, 0); // rumus resmi

      return {
        store: row.store,
        tanggal: row.tanggal,
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        produk_tersedia: stok_awal,  // stok awal (jumlah_stok)
        terjual,
        sisa_produk,
      };
    });

    res.json({ success: true, data: finalData });
  } catch (err) {
    console.error("❌ getLaporanStokProduk Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan stok produk",
      error: err.message,
    });
  }
};

