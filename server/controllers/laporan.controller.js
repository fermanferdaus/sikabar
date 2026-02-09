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
      [id_store],
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

export const getLaporanProduk = async (req, res) => {
  try {
    const { store, filter, tanggal, bulan, startDate, endDate } = req.query;

    const hariIni = dayjs().format("YYYY-MM-DD");
    const bulanSekarang = dayjs().format("YYYY-MM");

    let tanggalAkhir;
    let bulanDipilih;

    if (filter === "bulan" && bulan) {
      tanggalAkhir = dayjs(bulan + "-01")
        .endOf("month")
        .format("YYYY-MM-DD");
      bulanDipilih = bulan;
    } else {
      tanggalAkhir = hariIni;
      bulanDipilih = bulanSekarang;
    }

    const isBulanAktif = bulanDipilih === bulanSekarang;

    let whereStore = "";
    let params = [];

    if (store && store !== "Semua") {
      whereStore = "AND s.id_store = ?";
      params.push(store);
    }

    let sql;

    // ===============================
    // 🔥 BULAN AKTIF → REAL TIME
    // ===============================
    if (isBulanAktif) {
      sql = `
        SELECT
          sp.id_store,
          s.nama_store,
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          sp.stok_akhir AS jumlah_stok
        FROM stok_produk sp
        JOIN produk p ON p.id_produk = sp.id_produk
        JOIN store s ON s.id_store = sp.id_store
        WHERE 1=1
        ${whereStore}
        AND sp.stok_akhir > 0
        ORDER BY s.nama_store ASC, p.nama_produk ASC
      `;
    }

    // ===============================
    // 🔒 BULAN HISTORI → SNAPSHOT
    // ===============================
    else {
      sql = `
        SELECT
          ss.id_store,
          s.nama_store,
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          ss.stok_akhir AS jumlah_stok
        FROM stok_snapshot_bulanan ss
        JOIN produk p ON p.id_produk = ss.id_produk
        JOIN store s ON s.id_store = ss.id_store
        WHERE ss.bulan = ?
        ${whereStore}
        AND ss.stok_akhir > 0
        ORDER BY s.nama_store ASC, p.nama_produk ASC
      `;
      params = [bulanDipilih, ...params];
    }

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      bulan: bulanDipilih,
      data: rows,
    });
  } catch (err) {
    console.error("❌ getLaporanProduk Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan produk",
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

    const [[storeData]] = await db.query(
      `SELECT nama_store FROM store WHERE id_store = ? LIMIT 1`,
      [id_store],
    );

    const namaStore = storeData?.nama_store || "-";

    const bulanSekarang = dayjs().format("YYYY-MM");

    let bulanDipilih;

    if (filter === "bulan" && bulan) {
      bulanDipilih = bulan;
    } else {
      bulanDipilih = bulanSekarang;
    }

    const isBulanAktif = bulanDipilih === bulanSekarang;

    let sql;
    let params;

    // ===============================
    // 🔥 BULAN AKTIF → REAL TIME
    // ===============================
    if (isBulanAktif) {
      sql = `
        SELECT
          sp.id_store,
          s.nama_store,
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          sp.stok_akhir AS jumlah_stok
        FROM stok_produk sp
        JOIN produk p ON p.id_produk = sp.id_produk
        JOIN store s ON s.id_store = sp.id_store
        WHERE sp.id_store = ?
          AND sp.stok_akhir > 0
        ORDER BY p.nama_produk ASC
      `;
      params = [id_store];
    }

    // ===============================
    // 🔒 BULAN HISTORI → SNAPSHOT
    // ===============================
    else {
      sql = `
        SELECT
          ss.id_store,
          s.nama_store,
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          ss.stok_akhir AS jumlah_stok
        FROM stok_snapshot_bulanan ss
        JOIN produk p ON p.id_produk = ss.id_produk
        JOIN store s ON s.id_store = ss.id_store
        WHERE ss.id_store = ?
          AND ss.bulan = ?
          AND ss.stok_akhir > 0
        ORDER BY p.nama_produk ASC
      `;
      params = [id_store, bulanDipilih];
    }

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      store: namaStore,
      bulan: bulanDipilih,
      data: rows,
    });
  } catch (err) {
    console.error("❌ getLaporanProdukKasir Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal memuat laporan produk kasir",
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
      [id_store],
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
      [id_store],
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
      [id_store],
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

// ======================================================
// 🟣 LAPORAN ARUS KAS (ADMIN) – FIXED
// ======================================================
export const getLaporanKas = async (req, res) => {
  try {
    const { filter, store, tanggal, bulan, startDate, endDate } = req.query;

    // ==============================
    // WHERE TRANSAKSI (jasa & produk & komisi)
    // ==============================
    let where = ["1=1"];
    const params = [];

    // === FILTER STORE ===
    if (store && store !== "Semua") {
      where.push("t.id_store = ?");
      params.push(store);
    }

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

    const whereSql = where.join(" AND ");

    // ==============================
    // PENDAPATAN JASA
    // ==============================
    const [pendapatanJasa] = await db.query(
      `
      SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0) AS total
      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==============================
    // PENDAPATAN PRODUK
    // ==============================
    const [pendapatanProduk] = await db.query(
      `
      SELECT COALESCE(SUM(tpd.laba_rugi), 0) AS total
      FROM transaksi_produk_detail tpd
      JOIN transaksi t ON t.id_transaksi = tpd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==============================
    // KOMISI CAPSTER
    // ==============================
    const [komisi] = await db.query(
      `
      SELECT COALESCE(SUM(tsd.komisi_capster), 0) AS total
      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==============================
    // PENGELUARAN
    // ==============================
    let whereOut = ["1=1"];
    const paramsOut = [];

    if (store && store !== "Semua") {
      whereOut.push("p.id_store = ?");
      paramsOut.push(store);
    }

    if (filter === "hari" && tanggal) {
      whereOut.push("DATE(p.tanggal) = ?");
      paramsOut.push(tanggal);
    }

    if (filter === "bulan" && bulan) {
      whereOut.push("DATE_FORMAT(p.tanggal, '%Y-%m') = ?");
      paramsOut.push(bulan);
    }

    if (filter === "periode" && startDate && endDate) {
      whereOut.push("DATE(p.tanggal) BETWEEN ? AND ?");
      paramsOut.push(startDate, endDate);
    }

    const [pengeluaran] = await db.query(
      `
      SELECT COALESCE(SUM(p.jumlah), 0) AS total
      FROM pengeluaran p
      WHERE ${whereOut.join(" AND ")}
      `,
      paramsOut,
    );

    // ==============================
    // KASBON
    // ==============================
    const [kasbon] = await db.query(
      `
      SELECT COALESCE(SUM(ka.jumlah_total), 0) AS total
      FROM kasbon ka
      LEFT JOIN kasir k ON ka.id_kasir = k.id_kasir
      LEFT JOIN capster c ON ka.id_capster = c.id_capster
      WHERE 1=1
        ${
          store && store !== "Semua"
            ? " AND (k.id_store = ? OR c.id_store = ?)"
            : ""
        }
        ${filter === "hari" ? " AND DATE(ka.tanggal_pinjam) = ?" : ""}
        ${
          filter === "bulan"
            ? " AND DATE_FORMAT(ka.tanggal_pinjam, '%Y-%m') = ?"
            : ""
        }
        ${
          filter === "periode"
            ? " AND DATE(ka.tanggal_pinjam) BETWEEN ? AND ?"
            : ""
        }
      `,
      store && store !== "Semua"
        ? filter === "periode"
          ? [store, store, startDate, endDate]
          : filter === "bulan"
            ? [store, store, bulan]
            : filter === "hari"
              ? [store, store, tanggal]
              : [store, store]
        : filter === "periode"
          ? [startDate, endDate]
          : filter === "bulan"
            ? [bulan]
            : filter === "hari"
              ? [tanggal]
              : [],
    );

    // ==============================
    // POTONGAN KASBON
    // ==============================
    const [potonganKasbon] = await db.query(
      `
      SELECT COALESCE(SUM(pk.jumlah_potongan), 0) AS total
      FROM potongan_kasbon pk
      LEFT JOIN kasbon ka ON ka.id_kasbon = pk.id_kasbon
      LEFT JOIN kasir k ON pk.id_kasir = k.id_kasir
      LEFT JOIN capster c ON pk.id_capster = c.id_capster
      WHERE 1=1
        ${
          store && store !== "Semua"
            ? " AND (k.id_store = ? OR c.id_store = ?)"
            : ""
        }
        ${filter === "hari" ? " AND DATE(pk.tanggal_potong) = ?" : ""}
        ${
          filter === "bulan"
            ? " AND DATE_FORMAT(pk.tanggal_potong, '%Y-%m') = ?"
            : ""
        }
        ${
          filter === "periode"
            ? " AND DATE(pk.tanggal_potong) BETWEEN ? AND ?"
            : ""
        }
      `,
      store && store !== "Semua"
        ? filter === "periode"
          ? [store, store, startDate, endDate]
          : filter === "bulan"
            ? [store, store, bulan]
            : filter === "hari"
              ? [store, store, tanggal]
              : [store, store]
        : filter === "periode"
          ? [startDate, endDate]
          : filter === "bulan"
            ? [bulan]
            : filter === "hari"
              ? [tanggal]
              : [],
    );

    // ==============================
    // BONUS
    // ==============================
    const [bonus] = await db.query(
      `
      SELECT COALESCE(SUM(b.jumlah), 0) AS total
      FROM bonus b
      LEFT JOIN kasir k ON b.id_kasir = k.id_kasir
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      WHERE b.status = 'sudah_diberikan'
        ${
          store && store !== "Semua"
            ? " AND (k.id_store = ? OR c.id_store = ?)"
            : ""
        }
        ${filter === "hari" ? " AND DATE(b.tanggal_diberikan) = ?" : ""}
        ${filter === "bulan" ? " AND b.periode = ?" : ""}
        ${
          filter === "periode"
            ? " AND DATE(b.tanggal_diberikan) BETWEEN ? AND ?"
            : ""
        }
      `,
      store && store !== "Semua"
        ? filter === "periode"
          ? [store, store, startDate, endDate]
          : filter === "bulan"
            ? [store, store, bulan]
            : filter === "hari"
              ? [store, store, tanggal]
              : [store, store]
        : filter === "periode"
          ? [startDate, endDate]
          : filter === "bulan"
            ? [bulan]
            : filter === "hari"
              ? [tanggal]
              : [],
    );

    /// ==============================
    // HITUNG TOTAL KAS
    // ==============================
    const kasMasuk =
      Number(pendapatanJasa[0].total) +
      Number(pendapatanProduk[0].total) +
      Number(potonganKasbon[0].total);

    // komisi & bonus ikut sebagai pengeluaran
    const kasKeluar =
      Number(pengeluaran[0].total) +
      Number(kasbon[0].total) +
      Number(komisi[0].total) +
      Number(bonus[0].total);

    const saldoAkhir = kasMasuk - kasKeluar;

    // ==============================
    // RESPONSE
    // ==============================
    res.json({
      success: true,
      kas_masuk: kasMasuk,
      kas_keluar: kasKeluar,
      saldo_akhir: saldoAkhir,
      detail: {
        pendapatan_jasa: pendapatanJasa[0].total,
        pendapatan_produk: pendapatanProduk[0].total,
        komisi: komisi[0].total,
        pengeluaran: pengeluaran[0].total,
        kasbon_keluar: kasbon[0].total,
        potongan_kasbon: potonganKasbon[0].total,
        bonus: bonus[0].total,
      },
    });
  } catch (err) {
    console.error("❌ ERROR getLaporanKas:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan kas",
      error: err.message,
    });
  }
};

// ======================================================
// 🟣 LAPORAN ARUS KAS (KASIR)
// ======================================================
export const getLaporanKasKasir = async (req, res) => {
  try {
    const { filter, tanggal, bulan, startDate, endDate, id_store } = req.query;

    if (!id_store) {
      return res.status(400).json({
        success: false,
        message: "ID Store tidak ditemukan",
      });
    }

    const [[storeData]] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ? LIMIT 1",
      [id_store],
    );

    const storeName = storeData?.nama_store || "-";

    // ==========================
    // WHERE TRANSAKSI (jasa & produk & komisi)
    // ==========================
    let where = ["t.id_store = ?"];
    const params = [id_store];

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

    const whereSql = where.join(" AND ");

    // ==========================
    // PENDAPATAN JASA
    // ==========================
    const [pendapatanJasa] = await db.query(
      `
      SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0) AS total
      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==========================
    // PENDAPATAN PRODUK
    // ==========================
    const [pendapatanProduk] = await db.query(
      `
      SELECT COALESCE(SUM(tpd.laba_rugi), 0) AS total
      FROM transaksi_produk_detail tpd
      JOIN transaksi t ON t.id_transaksi = tpd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==========================
    // KOMISI CAPSTER
    // ==========================
    const [komisi] = await db.query(
      `
      SELECT COALESCE(SUM(tsd.komisi_capster), 0) AS total
      FROM transaksi_service_detail tsd
      JOIN transaksi t ON t.id_transaksi = tsd.id_transaksi
      WHERE ${whereSql}
      `,
      params,
    );

    // ==========================
    // PENGELUARAN
    // ==========================
    let whereOut = ["p.id_store = ?"];
    const paramsOut = [id_store];

    if (filter === "hari" && tanggal) {
      whereOut.push("DATE(p.tanggal) = ?");
      paramsOut.push(tanggal);
    }

    if (filter === "bulan" && bulan) {
      whereOut.push("DATE_FORMAT(p.tanggal, '%Y-%m') = ?");
      paramsOut.push(bulan);
    }

    if (filter === "periode" && startDate && endDate) {
      whereOut.push("DATE(p.tanggal) BETWEEN ? AND ?");
      paramsOut.push(startDate, endDate);
    }

    const [pengeluaran] = await db.query(
      `
      SELECT COALESCE(SUM(p.jumlah), 0) AS total
      FROM pengeluaran p
      WHERE ${whereOut.join(" AND ")}
      `,
      paramsOut,
    );

    // ==========================
    // KASBON
    // ==========================
    const [kasbon] = await db.query(
      `
      SELECT COALESCE(SUM(ka.jumlah_total), 0) AS total
      FROM kasbon ka
      LEFT JOIN kasir k ON ka.id_kasir = k.id_kasir
      LEFT JOIN capster c ON ka.id_capster = c.id_capster
      WHERE (k.id_store = ? OR c.id_store = ?)
        ${filter === "hari" ? " AND DATE(ka.tanggal_pinjam) = ?" : ""}
        ${
          filter === "bulan"
            ? " AND DATE_FORMAT(ka.tanggal_pinjam, '%Y-%m') = ?"
            : ""
        }
        ${
          filter === "periode"
            ? " AND DATE(ka.tanggal_pinjam) BETWEEN ? AND ?"
            : ""
        }
      `,
      filter === "periode"
        ? [id_store, id_store, startDate, endDate]
        : filter === "bulan"
          ? [id_store, id_store, bulan]
          : filter === "hari"
            ? [id_store, id_store, tanggal]
            : [id_store, id_store],
    );

    // ==========================
    // POTONGAN KASBON
    // ==========================
    const [potonganKasbon] = await db.query(
      `
      SELECT COALESCE(SUM(pk.jumlah_potongan), 0) AS total
      FROM potongan_kasbon pk
      LEFT JOIN kasbon ka ON ka.id_kasbon = pk.id_kasbon
      LEFT JOIN kasir k ON pk.id_kasir = k.id_kasir
      LEFT JOIN capster c ON pk.id_capster = c.id_capster
      WHERE (k.id_store = ? OR c.id_store = ?)
        ${filter === "hari" ? " AND DATE(pk.tanggal_potong) = ?" : ""}
        ${
          filter === "bulan"
            ? " AND DATE_FORMAT(pk.tanggal_potong, '%Y-%m') = ?"
            : ""
        }
        ${
          filter === "periode"
            ? " AND DATE(pk.tanggal_potong) BETWEEN ? AND ?"
            : ""
        }
      `,
      filter === "periode"
        ? [id_store, id_store, startDate, endDate]
        : filter === "bulan"
          ? [id_store, id_store, bulan]
          : filter === "hari"
            ? [id_store, id_store, tanggal]
            : [id_store, id_store],
    );

    // ==========================
    // BONUS
    // ==========================
    const [bonus] = await db.query(
      `
      SELECT COALESCE(SUM(b.jumlah), 0) AS total
      FROM bonus b
      LEFT JOIN kasir k ON b.id_kasir = k.id_kasir
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      WHERE b.status = 'sudah_diberikan'
        AND (k.id_store = ? OR c.id_store = ?)
        ${filter === "hari" ? " AND DATE(b.tanggal_diberikan) = ?" : ""}
        ${filter === "bulan" ? " AND b.periode = ?" : ""}
        ${
          filter === "periode"
            ? " AND DATE(b.tanggal_diberikan) BETWEEN ? AND ?"
            : ""
        }
      `,
      filter === "periode"
        ? [id_store, id_store, startDate, endDate]
        : filter === "bulan"
          ? [id_store, id_store, bulan]
          : filter === "hari"
            ? [id_store, id_store, tanggal]
            : [id_store, id_store],
    );

    // ==========================
    // HITUNG TOTAL
    // ==========================
    const kasMasuk =
      Number(pendapatanJasa[0].total) +
      Number(pendapatanProduk[0].total) +
      Number(potonganKasbon[0].total);

    const kasKeluar =
      Number(pengeluaran[0].total) +
      Number(kasbon[0].total) +
      Number(komisi[0].total) +
      Number(bonus[0].total);

    const saldoAkhir = kasMasuk - kasKeluar;

    return res.json({
      success: true,
      store: storeName,
      kas_masuk: kasMasuk,
      kas_keluar: kasKeluar,
      saldo_akhir: saldoAkhir,
      detail: {
        pendapatan_jasa: pendapatanJasa[0].total,
        pendapatan_produk: pendapatanProduk[0].total,
        komisi: komisi[0].total,
        pengeluaran: pengeluaran[0].total,
        kasbon_keluar: kasbon[0].total,
        potongan_kasbon: potonganKasbon[0].total,
        bonus: bonus[0].total,
      },
    });
  } catch (err) {
    console.error("❌ ERROR getLaporanKasKasir:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan kas kasir",
      error: err.message,
    });
  }
};

export const getLaporanPendapatan = async (req, res) => {
  try {
    const { bulan } = req.query;

    if (!bulan) {
      return res.status(400).json({
        success: false,
        message: "Parameter bulan wajib diisi (YYYY-MM)",
      });
    }

    const sql = `
      SELECT
        /* ===== Pendapatan ===== */
        (SELECT COALESCE(SUM(t.subtotal),0)
         FROM transaksi t
         WHERE DATE_FORMAT(t.created_at,'%Y-%m') = ?
        ) AS pendapatan_kotor,

        /* ===== Komisi Capster ===== */
        (SELECT COALESCE(SUM(tsd.komisi_capster),0)
         FROM transaksi_service_detail tsd
         JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi
         WHERE DATE_FORMAT(t.created_at,'%Y-%m') = ?
        ) AS komisi_capster,

        /* ===== Pengeluaran ===== */
        (SELECT COALESCE(SUM(p.jumlah),0)
         FROM pengeluaran p
         WHERE DATE_FORMAT(p.tanggal,'%Y-%m') = ?
        ) AS pengeluaran,

        /* ===== Bonus ===== */
        (SELECT COALESCE(SUM(b.jumlah),0)
         FROM bonus b
         WHERE b.id_capster IS NOT NULL
           AND b.periode = ?
        ) AS bonus_capster,

        (SELECT COALESCE(SUM(b.jumlah),0)
         FROM bonus b
         WHERE b.id_kasir IS NOT NULL
           AND b.periode = ?
        ) AS bonus_kasir,

        /* ===== Gaji ===== */
        (SELECT COALESCE(SUM(gs.gaji_pokok),0)
         FROM gaji_setting gs
         WHERE gs.id_capster IS NOT NULL
        ) AS gaji_capster,

        (SELECT COALESCE(SUM(gs.gaji_pokok),0)
         FROM gaji_setting gs
         WHERE gs.id_kasir IS NOT NULL
        ) AS gaji_kasir,

        /* ===== Kasbon Cair ===== */
        (SELECT COALESCE(SUM(kb.jumlah_total),0)
         FROM kasbon kb
         WHERE DATE_FORMAT(kb.tanggal_pinjam,'%Y-%m') = ?
        ) AS kasbon_cair,

        /* ===== Potongan ===== */
        (SELECT COALESCE(SUM(pk.jumlah_potongan),0)
         FROM potongan_kasbon pk
         WHERE pk.tipe_potongan = 'kasbon'
           AND DATE_FORMAT(pk.tanggal_potong,'%Y-%m') = ?
        ) AS potongan_kasbon,

        (SELECT COALESCE(SUM(pk.jumlah_potongan),0)
         FROM potongan_kasbon pk
         WHERE pk.tipe_potongan = 'umum'
           AND DATE_FORMAT(pk.tanggal_potong,'%Y-%m') = ?
        ) AS potongan_umum
    `;

    const params = [
      bulan, // pendapatan
      bulan, // komisi
      bulan, // pengeluaran
      bulan, // bonus capster
      bulan, // bonus kasir
      bulan, // kasbon cair
      bulan, // potongan kasbon
      bulan, // potongan umum
    ];

    const [rows] = await db.query(sql, params);
    const r = rows[0];

    const n = (v) => Number(v) || 0;

    const pendapatan_bersih =
      n(r.pendapatan_kotor) -
      (n(r.komisi_capster) +
        n(r.pengeluaran) +
        n(r.gaji_capster) +
        n(r.gaji_kasir) +
        n(r.bonus_capster) +
        n(r.bonus_kasir) +
        n(r.kasbon_cair)) +
      (n(r.potongan_kasbon) + n(r.potongan_umum));

    res.json({
      success: true,
      data: {
        bulan,
        pendapatan_kotor: n(r.pendapatan_kotor),
        komisi_capster: n(r.komisi_capster),
        pengeluaran: n(r.pengeluaran),
        bonus_capster: n(r.bonus_capster),
        bonus_kasir: n(r.bonus_kasir),
        gaji_capster: n(r.gaji_capster),
        gaji_kasir: n(r.gaji_kasir),
        kasbon_cair: n(r.kasbon_cair),
        potongan_kasbon: n(r.potongan_kasbon),
        potongan_umum: n(r.potongan_umum),
        pendapatan_bersih,
      },
    });
  } catch (err) {
    console.error("❌ getLaporanPendapatan:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan keseluruhan",
    });
  }
};

export const getLaporanPendapatanStore = async (req, res) => {
  try {
    const { id_store, bulan } = req.query;

    if (!id_store || !bulan) {
      return res.status(400).json({
        success: false,
        message: "id_store dan bulan wajib diisi",
      });
    }

    const trxFilter =
      "t.id_store = ? AND DATE_FORMAT(t.created_at,'%Y-%m') = ?";
    const trxParams = [id_store, bulan];

    const pengeluaranFilter =
      "p.id_store = ? AND DATE_FORMAT(p.tanggal,'%Y-%m') = ?";
    const pengeluaranParams = [id_store, bulan];

    const [storeRows] = await db.query(
      "SELECT nama_store FROM store WHERE id_store = ?",
      [id_store]
    );

    const nama_store = storeRows[0]?.nama_store || "-";

    const sql = `
      SELECT
        (SELECT COALESCE(SUM(t.subtotal),0)
         FROM transaksi t
         WHERE ${trxFilter}
        ) AS pendapatan_kotor,

        (SELECT COALESCE(SUM(tsd.komisi_capster),0)
         FROM transaksi_service_detail tsd
         JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi
         WHERE ${trxFilter}
        ) AS komisi_capster,

        (SELECT COALESCE(SUM(p.jumlah),0)
         FROM pengeluaran p
         WHERE ${pengeluaranFilter}
        ) AS pengeluaran,

        (SELECT COALESCE(SUM(b.jumlah),0)
         FROM bonus b
         JOIN capster c ON b.id_capster = c.id_capster
         WHERE c.id_store = ? AND b.periode = ?
        ) AS bonus_capster,

        (SELECT COALESCE(SUM(b.jumlah),0)
         FROM bonus b
         JOIN kasir k ON b.id_kasir = k.id_kasir
         WHERE k.id_store = ? AND b.periode = ?
        ) AS bonus_kasir,

        (SELECT COALESCE(SUM(gs.gaji_pokok),0)
         FROM gaji_setting gs
         JOIN capster c ON gs.id_capster = c.id_capster
         WHERE c.id_store = ?
        ) AS gaji_capster,

        (SELECT COALESCE(SUM(gs.gaji_pokok),0)
         FROM gaji_setting gs
         JOIN kasir k ON gs.id_kasir = k.id_kasir
         WHERE k.id_store = ?
        ) AS gaji_kasir,

        (SELECT COALESCE(SUM(kb.jumlah_total),0)
         FROM kasbon kb
         JOIN capster c ON kb.id_capster = c.id_capster
         WHERE c.id_store = ?
           AND DATE_FORMAT(kb.tanggal_pinjam,'%Y-%m') = ?
        ) AS kasbon_capster,

        (SELECT COALESCE(SUM(kb.jumlah_total),0)
         FROM kasbon kb
         JOIN kasir k ON kb.id_kasir = k.id_kasir
         WHERE k.id_store = ?
           AND DATE_FORMAT(kb.tanggal_pinjam,'%Y-%m') = ?
        ) AS kasbon_kasir,

        (SELECT COALESCE(SUM(pk.jumlah_potongan),0)
         FROM potongan_kasbon pk
         JOIN capster c ON pk.id_capster = c.id_capster
         WHERE c.id_store = ?
           AND DATE_FORMAT(pk.tanggal_potong,'%Y-%m') = ?
        ) AS potongan_capster,

        (SELECT COALESCE(SUM(pk.jumlah_potongan),0)
         FROM potongan_kasbon pk
         JOIN kasir k ON pk.id_kasir = k.id_kasir
         WHERE k.id_store = ?
           AND DATE_FORMAT(pk.tanggal_potong,'%Y-%m') = ?
        ) AS potongan_kasir
    `;

    const params = [
      ...trxParams,
      ...trxParams,
      ...pengeluaranParams,

      id_store,
      bulan,
      id_store,
      bulan,

      id_store,
      id_store,

      id_store,
      bulan,
      id_store,
      bulan,

      id_store,
      bulan,
      id_store,
      bulan,
    ];

    const [rows] = await db.query(sql, params);
    const r = rows[0];

    const n = (v) => Number(v) || 0;

    const pendapatan_bersih =
      n(r.pendapatan_kotor) -
      (n(r.komisi_capster) +
        n(r.pengeluaran) +
        n(r.gaji_capster) +
        n(r.gaji_kasir) +
        n(r.bonus_capster) +
        n(r.bonus_kasir) +
        n(r.kasbon_capster) +
        n(r.kasbon_kasir)) +
      (n(r.potongan_capster) + n(r.potongan_kasir));

    res.json({
      success: true,
      store: nama_store,
      data: { ...r, pendapatan_bersih },
    });
  } catch (err) {
    console.error("❌ getLaporanPendapatanStore:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pendapatan store",
    });
  }
};
