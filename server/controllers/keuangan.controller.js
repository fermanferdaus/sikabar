import db from "../config/db.js";
import dayjs from "dayjs";

// ============================================================
// 🟢 GET /keuangan — Grafik Harian Semua Cabang
// ============================================================
export const getKeuangan = async (req, res) => {
  try {
    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const sql = `
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
        SUM(pendapatan_kotor) AS pendapatan_kotor,
        SUM(total_komisi_capster) AS total_komisi_capster,
        SUM(laba_produk) AS laba_produk,
        SUM(pengeluaran) AS pengeluaran
      FROM (
        SELECT 
          DATE(t.created_at) AS tanggal,
          COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
          COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi_capster,
          COALESCE(SUM(tpd.laba_rugi), 0) AS laba_produk,
          0 AS pengeluaran
        FROM transaksi t
        LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
        LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
        WHERE MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
        GROUP BY DATE(t.created_at)

        UNION ALL

        SELECT 
          DATE(p.tanggal) AS tanggal,
          0 AS pendapatan_kotor,
          0 AS total_komisi_capster,
          0 AS laba_produk,
          COALESCE(SUM(p.jumlah), 0) AS pengeluaran
        FROM pengeluaran p
        WHERE MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
        GROUP BY DATE(p.tanggal)
      ) gabungan
      GROUP BY tanggal
      ORDER BY tanggal ASC
    `;

    const [rows] = await db.query(sql, [bulan, tahun, bulan, tahun]);

    const result = rows.map((r) => ({
      tanggal: r.tanggal,
      pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
      komisi_capster: Number(r.total_komisi_capster) || 0,
      laba_produk: Number(r.laba_produk) || 0,
      pengeluaran: Number(r.pengeluaran) || 0,
      pendapatan_bersih:
        (Number(r.pendapatan_kotor) || 0) -
        (Number(r.total_komisi_capster) || 0) +
        (Number(r.laba_produk) || 0) -
        (Number(r.pengeluaran) || 0),
    }));

    res.json({ status: "success", data: result });
  } catch (err) {
    console.error("❌ getKeuangan error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data keuangan",
    });
  }
};

// ============================================================
// 🟢 GET /keuangan/summary — Ringkasan Semua Cabang
// ============================================================
export const getKeuanganSummary = async (req, res) => {
  try {
    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const sql = `
      SELECT 
        s.id_store,
        s.nama_store,
        COALESCE(SUM(
          CASE WHEN MONTH(t.created_at) = ? AND YEAR(t.created_at) = ? 
          THEN t.subtotal ELSE 0 END
        ), 0) AS pendapatan_kotor,
        COALESCE((
          SELECT SUM(tsd.komisi_capster)
          FROM transaksi_service_detail tsd
          JOIN transaksi tx ON tsd.id_transaksi = tx.id_transaksi
          WHERE tx.id_store = s.id_store
          AND MONTH(tx.created_at) = ? AND YEAR(tx.created_at) = ?
        ), 0) AS total_komisi_capster,
        COALESCE((
          SELECT SUM(tpd.laba_rugi)
          FROM transaksi_produk_detail tpd
          JOIN transaksi tx2 ON tpd.id_transaksi = tx2.id_transaksi
          WHERE tx2.id_store = s.id_store
          AND MONTH(tx2.created_at) = ? AND YEAR(tx2.created_at) = ?
        ), 0) AS total_laba_produk,
        COALESCE((
          SELECT SUM(p.jumlah)
          FROM pengeluaran p
          WHERE p.id_store = s.id_store
          AND MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
        ), 0) AS total_pengeluaran,
        COALESCE((
          SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN capster c ON b.id_capster = c.id_capster
          WHERE c.id_store = s.id_store
          AND MONTH(b.tanggal_diberikan) = ? AND YEAR(b.tanggal_diberikan) = ?
        ), 0) AS total_bonus_capster,
        COALESCE((
          SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN users u ON b.id_user = u.id_user
          WHERE u.id_store = s.id_store AND u.role = 'kasir'
          AND MONTH(b.tanggal_diberikan) = ? AND YEAR(b.tanggal_diberikan) = ?
        ), 0) AS total_bonus_kasir,
        COALESCE((
          SELECT SUM(g.gaji_pokok)
          FROM gaji_setting g
          JOIN capster c ON g.id_capster = c.id_capster
          WHERE c.id_store = s.id_store
        ), 0) AS total_gaji_capster,
        COALESCE((
          SELECT SUM(g.gaji_pokok)
          FROM gaji_setting g
          JOIN users u ON g.id_user = u.id_user
          WHERE u.id_store = s.id_store AND u.role = 'kasir'
        ), 0) AS total_gaji_kasir
      FROM store s
      LEFT JOIN transaksi t ON t.id_store = s.id_store
      GROUP BY s.id_store, s.nama_store
      ORDER BY s.id_store
    `;

    const params = Array(12).fill([bulan, tahun]).flat();
    const [rows] = await db.query(sql, params);

    // 🔹 Pengeluaran global (bukan per cabang)
    const [globalRow] = await db.query(
      `
      SELECT COALESCE(SUM(p.jumlah), 0) AS pengeluaran_global
      FROM pengeluaran p
      WHERE p.id_store IS NULL
      AND MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
    `,
      [bulan, tahun]
    );

    const pengeluaranGlobal = Number(globalRow[0]?.pengeluaran_global) || 0;

    // 🔹 Akumulasi total semua cabang
    const total = rows.reduce(
      (acc, r) => {
        const bersih =
          (Number(r.pendapatan_kotor) || 0) -
          (Number(r.total_komisi_capster) || 0) +
          (Number(r.total_laba_produk) || 0) -
          ((Number(r.total_pengeluaran) || 0) +
            (Number(r.total_bonus_capster) || 0) +
            (Number(r.total_bonus_kasir) || 0) +
            (Number(r.total_gaji_capster) || 0) +
            (Number(r.total_gaji_kasir) || 0));

        return {
          pendapatan_kotor: acc.pendapatan_kotor + Number(r.pendapatan_kotor),
          komisi_capster: acc.komisi_capster + Number(r.total_komisi_capster),
          laba_produk: acc.laba_produk + Number(r.total_laba_produk),
          pengeluaran: acc.pengeluaran + Number(r.total_pengeluaran),
          bonus_capster: acc.bonus_capster + Number(r.total_bonus_capster),
          bonus_kasir: acc.bonus_kasir + Number(r.total_bonus_kasir),
          gaji_capster: acc.gaji_capster + Number(r.total_gaji_capster),
          gaji_kasir: acc.gaji_kasir + Number(r.total_gaji_kasir),
          pendapatan_bersih: acc.pendapatan_bersih + bersih,
        };
      },
      {
        pendapatan_kotor: 0,
        komisi_capster: 0,
        laba_produk: 0,
        pengeluaran: pengeluaranGlobal,
        bonus_capster: 0,
        bonus_kasir: 0,
        gaji_capster: 0,
        gaji_kasir: 0,
        pendapatan_bersih: 0,
      }
    );

    total.pendapatan_bersih -= pengeluaranGlobal;

    res.json({
      status: "success",
      bulan,
      tahun,
      data: { per_cabang: rows, pengeluaran_global: pengeluaranGlobal, total },
    });
  } catch (err) {
    console.error("❌ getKeuanganSummary error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil ringkasan keuangan",
    });
  }
};

// ============================================================
// 🏪 GET /keuangan/store/:id_store — Ringkasan per Cabang
// ============================================================
export const getKeuanganStoreSummary = async (req, res) => {
  try {
    const { id_store } = req.params;
    if (!id_store)
      return res
        .status(400)
        .json({ status: "error", message: "id_store wajib disertakan" });

    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const sql = `
      SELECT
        COALESCE((SELECT SUM(t.subtotal) FROM transaksi t WHERE t.id_store = ? AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?), 0) AS pendapatan_kotor,
        COALESCE((SELECT SUM(tsd.komisi_capster) FROM transaksi_service_detail tsd JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi WHERE t.id_store = ? AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?), 0) AS total_komisi_capster,
        COALESCE((SELECT SUM(tpd.laba_rugi) FROM transaksi_produk_detail tpd JOIN transaksi t ON tpd.id_transaksi = t.id_transaksi WHERE t.id_store = ? AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?), 0) AS total_laba_produk,
        COALESCE((SELECT SUM(p.jumlah) FROM pengeluaran p WHERE p.id_store = ? AND MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?), 0) AS total_pengeluaran,
        COALESCE((SELECT SUM(b.jumlah) FROM bonus b JOIN capster c ON b.id_capster = c.id_capster WHERE c.id_store = ? AND MONTH(b.tanggal_diberikan) = ? AND YEAR(b.tanggal_diberikan) = ?), 0) AS total_bonus_capster,
        COALESCE((SELECT SUM(b.jumlah) FROM bonus b JOIN users u ON b.id_user = u.id_user WHERE u.id_store = ? AND u.role = 'kasir' AND MONTH(b.tanggal_diberikan) = ? AND YEAR(b.tanggal_diberikan) = ?), 0) AS total_bonus_kasir,
        COALESCE((SELECT SUM(g.gaji_pokok) FROM gaji_setting g JOIN capster c ON g.id_capster = c.id_capster WHERE c.id_store = ?), 0) AS total_gaji_capster,
        COALESCE((SELECT SUM(g.gaji_pokok) FROM gaji_setting g JOIN users u ON g.id_user = u.id_user WHERE u.id_store = ? AND u.role = 'kasir'), 0) AS total_gaji_kasir
    `;

    const params = [
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
      id_store,
      id_store,
    ];

    const [rows] = await db.query(sql, params);
    const row = rows[0] || {};

    const bersih =
      Number(row.pendapatan_kotor) +
      Number(row.total_laba_produk) -
      (Number(row.total_komisi_capster) +
        Number(row.total_bonus_capster) +
        Number(row.total_bonus_kasir) +
        Number(row.total_gaji_capster) +
        Number(row.total_gaji_kasir) +
        Number(row.total_pengeluaran));

    res.json({
      status: "success",
      bulan,
      tahun,
      data: {
        id_store,
        pendapatan_kotor: Number(row.pendapatan_kotor) || 0,
        komisi_capster: Number(row.total_komisi_capster) || 0,
        laba_produk: Number(row.total_laba_produk) || 0,
        pengeluaran: Number(row.total_pengeluaran) || 0,
        bonus_capster: Number(row.total_bonus_capster) || 0,
        bonus_kasir: Number(row.total_bonus_kasir) || 0,
        gaji_capster: Number(row.total_gaji_capster) || 0,
        gaji_kasir: Number(row.total_gaji_kasir) || 0,
        pendapatan_bersih: bersih,
      },
    });
  } catch (err) {
    console.error("❌ getKeuanganStoreSummary error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data keuangan cabang",
    });
  }
};

// ============================================================
// 📊 GET /keuangan/store/:id_store/grafik — Grafik Harian Cabang
// ============================================================
export const getKeuanganStoreGrafik = async (req, res) => {
  try {
    const { id_store } = req.params;
    if (!id_store) {
      return res.status(400).json({
        status: "error",
        message: "id_store wajib disertakan",
      });
    }

    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const sql = `
      SELECT 
        DATE(t.created_at) AS tanggal,
        COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
        COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi_capster,
        COALESCE(SUM(tpd.laba_rugi), 0) AS laba_produk,
        (
          SELECT COALESCE(SUM(p.jumlah), 0)
          FROM pengeluaran p
          WHERE p.id_store = ? 
          AND DATE(p.tanggal) = DATE(t.created_at)
        ) AS pengeluaran
      FROM transaksi t
      LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
      LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      WHERE t.id_store = ? 
      AND MONTH(t.created_at) = ? 
      AND YEAR(t.created_at) = ?
      GROUP BY DATE(t.created_at)
      ORDER BY tanggal ASC
    `;

    const [rows] = await db.query(sql, [id_store, id_store, bulan, tahun]);

    const result = rows.map((r) => ({
      tanggal: r.tanggal,
      pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
      komisi_capster: Number(r.total_komisi_capster) || 0,
      laba_produk: Number(r.laba_produk) || 0,
      pengeluaran: Number(r.pengeluaran) || 0,
      pendapatan_bersih:
        (Number(r.pendapatan_kotor) || 0) -
        (Number(r.total_komisi_capster) || 0) +
        (Number(r.laba_produk) || 0) -
        (Number(r.pengeluaran) || 0),
    }));

    res.json({ status: "success", data: result });
  } catch (err) {
    console.error("❌ getKeuanganStoreGrafik error:", err);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data grafik keuangan toko",
    });
  }
};
