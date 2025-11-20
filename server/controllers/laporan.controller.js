import db from "../config/db.js";
import dayjs from "dayjs";

// ======================================================
// 🔵 LAPORAN PENGELUARAN (ADMIN)
// ======================================================
export const getLaporanPengeluaran = async (req, res) => {
  try {
    const { filter, startDate, endDate, store, kategori } = req.query;
    let where = ["1=1"];
    const params = [];

    // === FILTER WAKTU ===
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

    // === FILTER STORE ===
    if (store && store !== "Semua") {
      where.push("p.id_store = ?");
      params.push(store);
    }

    // === FILTER KATEGORI ===
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
// 🔴 LAPORAN PENGELUARAN KASIR
// ======================================================
export const getLaporanPengeluaranKasir = async (req, res) => {
  try {
    const { filter, startDate, endDate, id_store, kategori } = req.query;

    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan.",
      });
    }

    // === DATA STORE ===
    const [[storeRow]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store]
    );
    const storeName = storeRow?.nama_store || "Store";

    // === WHERE & PARAMS ===
    let where = ["p.id_store = ?"];
    const params = [id_store];

    // === FILTER WAKTU ===
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

    // === FILTER KATEGORI ===
    if (kategori && kategori !== "Semua") {
      where.push("p.kategori = ?");
      params.push(kategori);
    }

    // === QUERY ===
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

    // === FORMATTING ===
    const formatted = rows.map((r) => ({
      id_pengeluaran: r.id_pengeluaran,
      tanggal: dayjs(r.tanggal).format("YYYY-MM-DD"),
      store: r.store || storeName,
      kategori: r.kategori || "-",
      deskripsi: r.deskripsi || "-",
      jumlah: +r.jumlah || 0,
    }));

    // === RESPONSE ===
    res.json({
      success: true,
      store: storeName,
      data: formatted,
    });
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

    // ============================
    // Tentukan batas cutoff transaksi
    // ============================
    let periodeCutoff = null;

    if (filter === "hari" && tanggal) {
      periodeCutoff = `${tanggal} 23:59:59`;
    } else if (filter === "bulan" && bulan) {
      const [y, m] = bulan.split("-");
      const lastDay = new Date(y, m, 0).getDate();
      periodeCutoff = `${bulan}-${lastDay} 23:59:59`;
    } else if (filter === "periode" && endDate) {
      periodeCutoff = `${endDate} 23:59:59`;
    } else {
      periodeCutoff = `${new Date().toISOString().slice(0, 10)} 23:59:59`;
    }

    // ============================
    // WHERE untuk filter store
    // ============================
    let where = [];
    const params = [];

    if (store && store !== "Semua") {
      where.push("sp.id_store = ?");
      params.push(store);
    }

    // ============================
    // QUERY UTAMA
    // ============================
    const sql = `
      SELECT 
        sp.id_store,
        s.nama_store,
        p.id_produk,
        p.nama_produk,
        p.harga_awal,
        p.harga_jual,
        sp.jumlah_stok AS stok_global,

        -- Total terjual sampai batas periode
        (
          SELECT COALESCE(SUM(tpd.jumlah), 0)
          FROM transaksi_produk_detail tpd
          JOIN transaksi t ON t.id_transaksi = tpd.id_transaksi
          WHERE t.id_store = sp.id_store
            AND tpd.id_produk = p.id_produk
            AND t.created_at <= ?
        ) AS total_terjual

      FROM stok_produk sp
      JOIN produk p ON p.id_produk = sp.id_produk
      JOIN store s ON s.id_store = sp.id_store
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY s.nama_store ASC, p.nama_produk ASC
    `;

    const [rows] = await db.query(sql, [periodeCutoff, ...params]);

    // ============================
    // Format hasil
    // ============================
    const formatted = rows.map((r) => {
      const totalTerjual = Number(r.total_terjual || 0);
      const stokGlobal = Number(r.stok_global || 0);
      const sisaStok = stokGlobal - totalTerjual;

      return {
        id_store: r.id_store,
        nama_store: r.nama_store,
        id_produk: r.id_produk,
        nama_produk: r.nama_produk,

        // HARGA DITAMPILKAN
        harga_awal: r.harga_awal,
        harga_jual: r.harga_jual,

        // STOK TAMPILAN YANG BENAR
        jumlah_stok: sisaStok < 0 ? 0 : sisaStok,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("ERR LAPORAN PRODUK:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan produk",
      error: err.message,
    });
  }
};

export const getLaporanProdukKasir = async (req, res) => {
  try {
    const { id_store, filter, tanggal, bulan, startDate, endDate } = req.query;

    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan",
      });
    }

    // ============================
    // AMBIL NAMA STORE
    // ============================
    const [[storeData]] = await db.query(
      `SELECT nama_store FROM store WHERE id_store = ? LIMIT 1`,
      [id_store]
    );

    const storeName = storeData?.nama_store || "-";

    // ============================
    // Tentukan batas cutoff transaksi (PENTING)
    // ============================
    let periodeCutoff = null;

    if (filter === "hari" && tanggal) {
      periodeCutoff = `${tanggal} 23:59:59`;
    } else if (filter === "bulan" && bulan) {
      const [y, m] = bulan.split("-");
      const lastDay = new Date(y, m, 0).getDate();
      periodeCutoff = `${bulan}-${lastDay} 23:59:59`;
    } else if (filter === "periode" && endDate) {
      periodeCutoff = `${endDate} 23:59:59`;
    } else {
      // default = hari ini
      periodeCutoff = `${new Date().toISOString().slice(0, 10)} 23:59:59`;
    }

    // ============================
    // QUERY UTAMA (SAMA PERSIS DENGAN ADMIN)
    // ============================
    const sql = `
      SELECT 
        sp.id_store,
        s.nama_store,
        p.id_produk,
        p.nama_produk,
        p.harga_awal,
        p.harga_jual,
        sp.jumlah_stok AS stok_global,

        (
          SELECT COALESCE(SUM(tpd.jumlah), 0)
          FROM transaksi_produk_detail tpd
          JOIN transaksi t ON t.id_transaksi = tpd.id_transaksi
          WHERE t.id_store = sp.id_store
            AND tpd.id_produk = p.id_produk
            AND t.created_at <= ?
        ) AS total_terjual

      FROM stok_produk sp
      JOIN produk p ON p.id_produk = sp.id_produk
      JOIN store s ON s.id_store = sp.id_store
      WHERE sp.id_store = ?
      ORDER BY p.nama_produk ASC
    `;

    const [rows] = await db.query(sql, [periodeCutoff, id_store]);

    // ============================
    // Format hasil (sama seperti admin)
    // ============================
    const formatted = rows.map((r) => {
      const totalTerjual = Number(r.total_terjual || 0);
      const stokGlobal = Number(r.stok_global || 0);
      const sisaStok = stokGlobal - totalTerjual;

      return {
        id_produk: r.id_produk,
        nama_produk: r.nama_produk,
        harga_awal: r.harga_awal,
        harga_jual: r.harga_jual,

        jumlah_stok: sisaStok < 0 ? 0 : sisaStok,
      };
    });

    res.json({
      success: true,
      store: storeName,
      data: formatted,
    });
  } catch (err) {
    console.log("ERR LAPORAN PRODUK KASIR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal memuat laporan produk kasir",
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

export const getLaporanPenjualanProdukKasir = async (req, res) => {
  try {
    const { id_store, filter, tanggal, bulan, startDate, endDate } = req.query;

    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan",
      });
    }

    // ============================
    // AMBIL NAMA STORE
    // ============================
    const [[storeData]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store]
    );

    const storeName = storeData?.nama_store || "-";

    // ============================
    // WHERE CLAUSE
    // ============================
    let where = [
      "t.id_store = ?", // hanya cabang kasir login
      "t.tipe_transaksi IN ('produk', 'campuran')", // hanya produk
    ];

    const params = [id_store];

    // === FILTER HARIAN ===
    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    // === FILTER BULANAN ===
    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    // === FILTER PERIODE ===
    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // ============================
    // QUERY UTAMA
    // ============================
    const sql = `
      SELECT 
        st.nomor_struk,
        DATE(t.created_at) AS tanggal,
        p.nama_produk,
        tpd.jumlah,
        tpd.harga_jual AS harga_satuan,
        (tpd.jumlah * tpd.harga_jual) AS total
      FROM transaksi t
      JOIN struk st ON st.id_transaksi = t.id_transaksi
      JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      JOIN produk p ON p.id_produk = tpd.id_produk
      WHERE ${where.join(" AND ")}
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);

    const formatted = rows.map((r) => ({
      store: storeName,
      nomor_struk: r.nomor_struk,
      tanggal: r.tanggal,
      nama_produk: r.nama_produk,
      jumlah: r.jumlah,
      harga_satuan: Number(r.harga_satuan),
      total: Number(r.total),
    }));

    return res.json({
      success: true,
      store: storeName,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ ERR getLaporanPenjualanProdukKasir:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan penjualan produk kasir.",
      error: err.message,
    });
  }
};

export const getLaporanPendapatanProduk = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    let where = ["1=1"];
    const params = [];

    // ============================
    // FILTER STORE
    // ============================
    if (store && store !== "Semua") {
      where.push("t.id_store = ?");
      params.push(store);
    }

    // ============================
    // FILTER HARIAN
    // ============================
    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    // ============================
    // FILTER BULANAN
    // ============================
    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    // ============================
    // FILTER PERIODE
    // ============================
    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // ==============================================================
    // 1️⃣ AMBIL SEMUA TRANSAKSI PRODUK (DASAR LAPORAN)
    // ==============================================================
    const sql = `
      SELECT
        s.nama_store AS store,
        DATE(t.created_at) AS tanggal_transaksi,
        p.id_produk,
        p.nama_produk,
        sp.jumlah_stok AS stok_awal,

        -- TERJUAL BERDASARKAN PERIODE
        COALESCE(SUM(tpd.jumlah), 0) AS terjual,

        -- SISA PRODUK = stok_awal - terjual
        (sp.jumlah_stok - COALESCE(SUM(tpd.jumlah), 0)) AS stok_sisa,

        -- PENDAPATAN = TOTAL LABA PRODUK
        COALESCE(SUM(tpd.laba_rugi), 0) AS pendapatan

      FROM transaksi t
      JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      JOIN produk p ON p.id_produk = tpd.id_produk
      JOIN store s ON s.id_store = t.id_store

      -- AMBIL STOK AWAL
      LEFT JOIN stok_produk sp 
        ON sp.id_store = t.id_store 
        AND sp.id_produk = p.id_produk

      WHERE ${where.join(" AND ")}

      GROUP BY 
        s.id_store,
        tanggal_transaksi,
        p.id_produk

      ORDER BY tanggal_transaksi DESC, s.nama_store ASC, p.nama_produk ASC
    `;

    const [rows] = await db.query(sql, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getLaporanPendapatanProduk Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan produk",
      error: err.message,
    });
  }
};

export const getLaporanPendapatanProdukKasir = async (req, res) => {
  try {
    const { id_store, filter, tanggal, bulan, startDate, endDate } = req.query;

    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan",
      });
    }

    // ============================
    // Ambil nama store
    // ============================
    const [[storeData]] = await db.query(
      `SELECT nama_store FROM store WHERE id_store = ? LIMIT 1`,
      [id_store]
    );
    const storeName = storeData?.nama_store || "-";

    // ============================
    // WHERE DASAR
    // ============================
    let where = ["t.id_store = ?"];
    const params = [id_store];

    // ============================
    // FILTER HARIAN
    // ============================
    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    // ============================
    // FILTER BULANAN
    // ============================
    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    // ============================
    // FILTER PERIODE
    // ============================
    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // ==============================================================
    // 1️⃣ QUERY IDENTIK DENGAN ADMIN, TAPI STORE TIDAK BISA DIPILIH
    // ==============================================================
    const sql = `
      SELECT
        '${storeName}' AS store,
        DATE(t.created_at) AS tanggal_transaksi,
        p.id_produk,
        p.nama_produk,
        sp.jumlah_stok AS stok_awal,

        -- TOTAL TERJUAL
        COALESCE(SUM(tpd.jumlah), 0) AS terjual,

        -- SISA PRODUK
        (sp.jumlah_stok - COALESCE(SUM(tpd.jumlah), 0)) AS stok_sisa,

        -- TOTAL LABA PRODUK
        COALESCE(SUM(tpd.laba_rugi), 0) AS pendapatan

      FROM transaksi t
      JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      JOIN produk p ON p.id_produk = tpd.id_produk

      -- STOK AWAL
      LEFT JOIN stok_produk sp
        ON sp.id_store = t.id_store
        AND sp.id_produk = p.id_produk

      WHERE ${where.join(" AND ")}

      GROUP BY 
        t.id_store,
        tanggal_transaksi,
        p.id_produk

      ORDER BY tanggal_transaksi DESC, p.nama_produk ASC
    `;

    const [rows] = await db.query(sql, params);

    return res.json({
      success: true,
      store: storeName,
      data: rows,
    });
  } catch (err) {
    console.error("❌ getLaporanPendapatanProdukKasir Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan produk kasir",
      error: err.message,
    });
  }
};

export const getLaporanPendapatanJasa = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    let where = ["1=1"];
    const params = [];

    // ============================
    // FILTER STORE
    // ============================
    if (store && store !== "Semua") {
      where.push("t.id_store = ?");
      params.push(store);
    }

    // ============================
    // FILTER HARIAN
    // ============================
    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    // ============================
    // FILTER BULANAN
    // ============================
    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    // ============================
    // FILTER PERIODE
    // ============================
    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    const sql = `
      SELECT 
        s.nama_store AS store,
        DATE(t.created_at) AS tanggal,
        st.nomor_struk AS no_faktur,
        
        p.service AS layanan,
        tsd.harga AS harga,
        tsd.komisi_capster,

        (tsd.harga - tsd.komisi_capster) AS laba

      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      JOIN store s ON s.id_store = t.id_store
      JOIN struk st ON st.id_transaksi = t.id_transaksi
      JOIN pricelist p ON p.id_pricelist = tsd.id_pricelist
      WHERE ${where.join(" AND ")}
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getLaporanPendapatanJasa Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan jasa",
      error: err.message,
    });
  }
};

export const getLaporanPendapatanJasaKasir = async (req, res) => {
  try {
    const { id_store, filter, tanggal, bulan, startDate, endDate } = req.query;

    // ============================
    // VALIDASI STORE
    // ============================
    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan",
      });
    }

    // ============================
    // AMBIL NAMA STORE
    // ============================
    const [[storeData]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store]
    );

    const storeName = storeData?.nama_store || "-";

    // ============================
    // WHERE CLAUSE
    // ============================
    let where = ["t.id_store = ?"]; // hanya jasa cabang kasir login
    const params = [id_store];

    // === FILTER HARIAN ===
    if (filter === "hari" && tanggal) {
      where.push("DATE(t.created_at) = ?");
      params.push(tanggal);
    }

    // === FILTER BULANAN ===
    if (filter === "bulan" && bulan) {
      where.push("DATE_FORMAT(t.created_at, '%Y-%m') = ?");
      params.push(bulan);
    }

    // === FILTER PERIODE ===
    if (filter === "periode" && startDate && endDate) {
      where.push("DATE(t.created_at) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // ============================
    // QUERY UTAMA
    // ============================
    const sql = `
      SELECT 
        DATE(t.created_at) AS tanggal,
        st.nomor_struk AS no_faktur,

        p.service AS layanan,
        tsd.harga AS harga,
        tsd.komisi_capster,

        -- Laba jasa (harga - komisi)
        (tsd.harga - tsd.komisi_capster) AS laba

      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      JOIN struk st ON st.id_transaksi = t.id_transaksi
      JOIN pricelist p ON p.id_pricelist = tsd.id_pricelist

      WHERE ${where.join(" AND ")}

      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);

    // ============================
    // FORMAT JAWABAN
    // ============================
    const formatted = rows.map((r) => ({
      tanggal: r.tanggal,
      no_faktur: r.no_faktur,
      layanan: r.layanan,
      harga: Number(r.harga),
      laba: Number(r.laba),
      store: storeName,
    }));

    // ============================
    // RESPONSE
    // ============================
    return res.json({
      success: true,
      store: storeName,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ ERR getLaporanPendapatanJasaKasir:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan jasa kasir",
      error: err.message,
    });
  }
};
