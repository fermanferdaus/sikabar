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
        SUM(pengeluaran) AS pengeluaran,
        SUM(potongan_umum) AS potongan_umum,
        SUM(potongan_kasbon) AS potongan_kasbon
      FROM (
        /* ===== Pendapatan ===== */
        SELECT 
          DATE(t.created_at) AS tanggal,
          SUM(t.subtotal) AS pendapatan_kotor,
          SUM(tsd.komisi_capster) AS total_komisi_capster,
          SUM(tpd.laba_rugi) AS laba_produk,
          0 AS pengeluaran,
          0 AS potongan_umum,
          0 AS potongan_kasbon
        FROM transaksi t
        LEFT JOIN transaksi_service_detail tsd 
            ON tsd.id_transaksi = t.id_transaksi
        LEFT JOIN transaksi_produk_detail tpd 
            ON tpd.id_transaksi = t.id_transaksi
        WHERE MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
        GROUP BY DATE(t.created_at)

        UNION ALL

        /* ===== Pengeluaran ===== */
        SELECT 
          DATE(p.tanggal) AS tanggal,
          0,0,0,
          SUM(p.jumlah) AS pengeluaran,
          0,0
        FROM pengeluaran p
        WHERE MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
        GROUP BY DATE(p.tanggal)

        UNION ALL

        /* ===== Potongan umum ===== */
        SELECT 
          tanggal_potong AS tanggal,
          0,0,0,0,
          SUM(jumlah_potongan) AS potongan_umum,
          0
        FROM potongan_kasbon
        WHERE tipe_potongan = 'umum'
        AND MONTH(tanggal_potong) = ? AND YEAR(tanggal_potong) = ?
        GROUP BY tanggal_potong

        UNION ALL

        /* ===== Potongan kasbon ===== */
        SELECT 
          tanggal_potong AS tanggal,
          0,0,0,0,
          0,
          SUM(jumlah_potongan) AS potongan_kasbon
        FROM potongan_kasbon
        WHERE tipe_potongan = 'kasbon'
        AND MONTH(tanggal_potong) = ? AND YEAR(tanggal_potong) = ?
        GROUP BY tanggal_potong
      ) gabungan

      GROUP BY tanggal
      ORDER BY tanggal ASC
    `;

    const [rows] = await db.query(sql, [
      bulan,
      tahun,
      bulan,
      tahun,
      bulan,
      tahun,
      bulan,
      tahun,
    ]);

    const result = rows.map((r) => ({
      tanggal: r.tanggal,
      pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
      komisi_capster: Number(r.total_komisi_capster) || 0,
      laba_produk: Number(r.laba_produk) || 0,
      pengeluaran: Number(r.pengeluaran) || 0,
      potongan_umum: Number(r.potongan_umum) || 0,
      potongan_kasbon: Number(r.potongan_kasbon) || 0,

      pendapatan_bersih:
        (Number(r.pendapatan_kotor) || 0) -
        (Number(r.total_komisi_capster) || 0) +
        (Number(r.laba_produk) || 0) -
        (Number(r.pengeluaran) || 0) -
        (Number(r.potongan_umum) || 0) -
        (Number(r.potongan_kasbon) || 0),
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
    const periode = `${tahun}-${String(bulan).padStart(2, "0")}`;

    const sql = `
      SELECT 
        s.id_store,
        s.nama_store,

        /* ===== Pendapatan ===== */
        COALESCE((
          SELECT SUM(t.subtotal)
          FROM transaksi t
          WHERE t.id_store = s.id_store
          AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
        ), 0) AS pendapatan_kotor,

        /* ===== Komisi Capster ===== */
        COALESCE((
          SELECT SUM(tsd.komisi_capster)
          FROM transaksi_service_detail tsd
          JOIN transaksi tx ON tsd.id_transaksi = tx.id_transaksi
          WHERE tx.id_store = s.id_store
          AND MONTH(tx.created_at) = ? AND YEAR(tx.created_at) = ?
        ), 0) AS total_komisi_capster,

        /* ===== Laba Produk ===== */
        COALESCE((
          SELECT SUM(tpd.laba_rugi)
          FROM transaksi_produk_detail tpd
          JOIN transaksi tx2 ON tpd.id_transaksi = tx2.id_transaksi
          WHERE tx2.id_store = s.id_store
          AND MONTH(tx2.created_at) = ? AND YEAR(tx2.created_at) = ?
        ), 0) AS total_laba_produk,

        /* ===== Pengeluaran ===== */
        COALESCE((
          SELECT SUM(p.jumlah)
          FROM pengeluaran p
          WHERE p.id_store = s.id_store
          AND MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
        ), 0) AS total_pengeluaran,

        /* ===== Bonus Capster ===== */
        COALESCE((
          SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN capster c ON b.id_capster = c.id_capster
          WHERE c.id_store = s.id_store
          AND b.periode = ?
        ), 0) AS total_bonus_capster,

        /* ===== Bonus Kasir ===== */
        COALESCE((
          SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN kasir k ON b.id_kasir = k.id_kasir
          WHERE k.id_store = s.id_store
          AND b.periode = ?
        ), 0) AS total_bonus_kasir,

        /* ===== Gaji Capster ===== */
        COALESCE((
          SELECT SUM(gs.gaji_pokok)
          FROM gaji_setting gs
          JOIN capster c ON gs.id_capster = c.id_capster
          WHERE c.id_store = s.id_store
        ), 0) AS total_gaji_capster,

        /* ===== Gaji Kasir ===== */
        COALESCE((
          SELECT SUM(gs.gaji_pokok)
          FROM gaji_setting gs
          JOIN kasir k ON gs.id_kasir = k.id_kasir
          WHERE k.id_store = s.id_store
        ), 0) AS total_gaji_kasir,

        /* ===== Potongan Umum ===== */
        COALESCE((
          SELECT SUM(pk.jumlah_potongan)
          FROM potongan_kasbon pk
          WHERE pk.tipe_potongan = 'umum'
          AND (pk.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = s.id_store)
            OR pk.id_capster IN (SELECT id_capster FROM capster WHERE id_store = s.id_store))
          AND MONTH(pk.tanggal_potong) = ? AND YEAR(pk.tanggal_potong) = ?
        ), 0) AS total_potongan_umum,

        /* ===== Potongan Kasbon ===== */
        COALESCE((
          SELECT SUM(pk.jumlah_potongan)
          FROM potongan_kasbon pk
          JOIN kasbon k ON pk.id_kasbon = k.id_kasbon
          WHERE pk.tipe_potongan = 'kasbon'
          AND (k.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = s.id_store)
            OR k.id_capster IN (SELECT id_capster FROM capster WHERE id_store = s.id_store))
          AND MONTH(pk.tanggal_potong) = ? AND YEAR(pk.tanggal_potong) = ?
        ), 0) AS total_potongan_kasbon,

        /* ===== KASBON CAIR ===== */
        COALESCE((
          SELECT SUM(k.jumlah_total)
          FROM kasbon k
          WHERE
            (
              k.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = s.id_store)
              OR k.id_capster IN (SELECT id_capster FROM capster WHERE id_store = s.id_store)
            )
            AND MONTH(k.tanggal_pinjam) = ?
            AND YEAR(k.tanggal_pinjam) = ?
        ), 0) AS total_kasbon_cair

      FROM store s
      ORDER BY s.id_store;
    `;

    // ada 16 parameter pengulangan (bulan,tahun)
    const params = [
      bulan,
      tahun, // pendapatan
      bulan,
      tahun, // komisi
      bulan,
      tahun, // laba produk
      bulan,
      tahun, // pengeluaran
      periode, // bonus capster
      periode, // bonus kasir
      bulan,
      tahun, // potongan umum
      bulan,
      tahun, // potongan kasbon
      bulan,
      tahun, // kasbon cair
    ];

    const [rows] = await db.query(sql, params);

    // 🔹 Hitung global pengeluaran (tanpa id_store)
    const [globalRow] = await db.query(
      `
      SELECT SUM(jumlah) AS pengeluaran_global
      FROM pengeluaran
      WHERE id_store IS NULL
      AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?
      `,
      [bulan, tahun],
    );

    const pengeluaranGlobal = Number(globalRow[0]?.pengeluaran_global || 0);

    // 🔹 Hitung total keseluruhan
    const total = rows.reduce(
      (acc, r) => {
        const bersih =
          Number(r.pendapatan_kotor) -
          (Number(r.total_komisi_capster) +
            Number(r.total_pengeluaran) +
            Number(r.total_gaji_capster) +
            Number(r.total_gaji_kasir) +
            Number(r.total_bonus_capster) +
            Number(r.total_bonus_kasir) +
            Number(r.total_kasbon_cair)) +
          (Number(r.total_potongan_kasbon) + Number(r.total_potongan_umum));

        return {
          pendapatan_kotor: acc.pendapatan_kotor + Number(r.pendapatan_kotor),
          komisi_capster: acc.komisi_capster + Number(r.total_komisi_capster),
          laba_produk: acc.laba_produk + Number(r.total_laba_produk),
          pengeluaran: acc.pengeluaran + Number(r.total_pengeluaran),
          potongan_umum: acc.potongan_umum + Number(r.total_potongan_umum),
          potongan_kasbon:
            acc.potongan_kasbon + Number(r.total_potongan_kasbon),
          bonus_capster: acc.bonus_capster + Number(r.total_bonus_capster),
          bonus_kasir: acc.bonus_kasir + Number(r.total_bonus_kasir),
          gaji_capster: acc.gaji_capster + Number(r.total_gaji_capster),
          gaji_kasir: acc.gaji_kasir + Number(r.total_gaji_kasir),
          total_kasbon_cair:
            acc.total_kasbon_cair + Number(r.total_kasbon_cair),
          pendapatan_bersih: acc.pendapatan_bersih + bersih,
        };
      },
      {
        pendapatan_kotor: 0,
        komisi_capster: 0,
        laba_produk: 0,
        pengeluaran: 0,
        potongan_umum: 0,
        potongan_kasbon: 0,
        bonus_capster: 0,
        bonus_kasir: 0,
        gaji_capster: 0,
        gaji_kasir: 0,
        total_kasbon_cair: 0,
        pendapatan_bersih: 0,
      },
    );

    // global pengeluaran dikurangkan sekali
    total.pendapatan_bersih -= pengeluaranGlobal;

    res.json({
      status: "success",
      bulan,
      tahun,
      data: {
        per_cabang: rows,
        pengeluaran_global: pengeluaranGlobal,
        total,
      },
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
    if (!id_store) {
      return res.status(400).json({
        status: "error",
        message: "id_store wajib disertakan",
      });
    }

    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const periode = `${tahun}-${String(bulan).padStart(2, "0")}`;

    const sql = `
      SELECT
        /* ===== Pendapatan ===== */
        COALESCE((SELECT SUM(t.subtotal)
          FROM transaksi t
          WHERE t.id_store = ? 
            AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
        ), 0) AS pendapatan_kotor,

        /* ===== Komisi Capster ===== */
        COALESCE((SELECT SUM(tsd.komisi_capster)
          FROM transaksi_service_detail tsd
          JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi
          WHERE t.id_store = ? 
            AND MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
        ), 0) AS total_komisi_capster,

        /* ===== Laba Produk ===== */
        COALESCE((SELECT SUM(tpd.laba_rugi)
          FROM transaksi_produk_detail tpd
          JOIN transaksi tx ON tx.id_transaksi = tpd.id_transaksi
          WHERE tx.id_store = ?
            AND MONTH(tx.created_at) = ? AND YEAR(tx.created_at) = ?
        ), 0) AS total_laba_produk,

        /* ===== Pengeluaran ===== */
        COALESCE((SELECT SUM(p.jumlah)
          FROM pengeluaran p
          WHERE p.id_store = ?
            AND MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
        ), 0) AS total_pengeluaran,

        /* ===== Bonus Capster ===== */
        COALESCE((SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN capster c ON b.id_capster = c.id_capster
          WHERE c.id_store = ?
            AND b.periode = ?
        ), 0) AS total_bonus_capster,

        /* ===== Bonus Kasir ===== */
        COALESCE((SELECT SUM(b.jumlah)
          FROM bonus b
          JOIN kasir k ON b.id_kasir = k.id_kasir
          WHERE k.id_store = ?
            AND b.periode = ?
        ), 0) AS total_bonus_kasir,

        /* ===== Gaji Capster ===== */
        COALESCE((SELECT SUM(gs.gaji_pokok)
          FROM gaji_setting gs
          JOIN capster c ON gs.id_capster = c.id_capster
          WHERE c.id_store = ?
        ), 0) AS total_gaji_capster,

        /* ===== Gaji Kasir ===== */
        COALESCE((SELECT SUM(gs.gaji_pokok)
          FROM gaji_setting gs
          JOIN kasir k ON gs.id_kasir = k.id_kasir
          WHERE k.id_store = ?
        ), 0) AS total_gaji_kasir,

        /* ===== POTONGAN UMUM ===== */
        COALESCE((SELECT SUM(pk.jumlah_potongan)
          FROM potongan_kasbon pk
          WHERE pk.tipe_potongan = 'umum'
            AND (
                pk.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = ?)
              OR pk.id_capster IN (SELECT id_capster FROM capster WHERE id_store = ?)
            )
            AND MONTH(pk.tanggal_potong) = ? AND YEAR(pk.tanggal_potong) = ?
        ), 0) AS total_potongan_umum,

        /* ===== POTONGAN KASBON ===== */
        COALESCE((SELECT SUM(pk.jumlah_potongan)
          FROM potongan_kasbon pk
          JOIN kasbon k ON pk.id_kasbon = k.id_kasbon
          WHERE pk.tipe_potongan = 'kasbon'
            AND (
                k.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = ?)
              OR k.id_capster IN (SELECT id_capster FROM capster WHERE id_store = ?)
            )
            AND MONTH(pk.tanggal_potong) = ? AND YEAR(pk.tanggal_potong) = ?
        ), 0) AS total_potongan_kasbon,

        /* ===== KASBON CAIR BULAN INI ===== */
        COALESCE((
          SELECT SUM(k.jumlah_total)
          FROM kasbon k
          WHERE
            (
              k.id_kasir IN (SELECT id_kasir FROM kasir WHERE id_store = ?)
              OR k.id_capster IN (SELECT id_capster FROM capster WHERE id_store = ?)
            )
            AND MONTH(k.tanggal_pinjam) = ?
            AND YEAR(k.tanggal_pinjam) = ?
        ), 0) AS total_kasbon_cair
    `;

    const params = [
      id_store,
      bulan,
      tahun, // pendapatan
      id_store,
      bulan,
      tahun, // komisi
      id_store,
      bulan,
      tahun, // laba produk
      id_store,
      bulan,
      tahun, // pengeluaran
      id_store,
      periode, // bonus capster
      id_store,
      periode, // bonus kasir
      id_store, // gaji capster
      id_store, // gaji kasir
      id_store,
      id_store,
      bulan,
      tahun, // potongan umum
      id_store,
      id_store,
      bulan,
      tahun, // potongan kasbon
      id_store,
      id_store,
      bulan,
      tahun, // kasbon cair
    ];

    const [rows] = await db.query(sql, params);
    const r = rows[0];

    // Hitung pendapatan bersih lengkap
    const bersih =
      Number(r.pendapatan_kotor) -
      (Number(r.total_komisi_capster) +
        Number(r.total_pengeluaran) +
        Number(r.total_gaji_capster) +
        Number(r.total_gaji_kasir) +
        Number(r.total_bonus_capster) +
        Number(r.total_bonus_kasir) +
        Number(r.total_kasbon_cair)) +
      (Number(r.total_potongan_kasbon) + Number(r.total_potongan_umum));

    res.json({
      status: "success",
      bulan,
      tahun,
      data: {
        id_store,
        pendapatan_kotor: Number(r.pendapatan_kotor) || 0,
        komisi_capster: Number(r.total_komisi_capster) || 0,
        laba_produk: Number(r.total_laba_produk) || 0,
        pengeluaran: Number(r.total_pengeluaran) || 0,
        bonus_capster: Number(r.total_bonus_capster) || 0,
        bonus_kasir: Number(r.total_bonus_kasir) || 0,
        gaji_capster: Number(r.total_gaji_capster) || 0,
        gaji_kasir: Number(r.total_gaji_kasir) || 0,
        potongan_umum: Number(r.total_potongan_umum) || 0,
        potongan_kasbon: Number(r.total_potongan_kasbon) || 0,
        pendapatan_bersih: bersih,
        total_kasbon_cair: Number(r.total_kasbon_cair) || 0,
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

    const now = dayjs();
    const bulan = now.month() + 1;
    const tahun = now.year();

    const sql = `
      SELECT 
        tanggal,
        SUM(pendapatan_kotor) AS pendapatan_kotor,
        SUM(total_komisi_capster) AS komisi_capster,
        SUM(laba_produk) AS laba_produk,
        SUM(pengeluaran) AS pengeluaran
      FROM (
        /* Pendapatan */
        SELECT
          DATE_FORMAT(t.created_at, '%Y-%m-%d') AS tanggal,
          SUM(t.subtotal) AS pendapatan_kotor,
          SUM(tsd.komisi_capster) AS total_komisi_capster,
          SUM(tpd.laba_rugi) AS laba_produk,
          0 AS pengeluaran
        FROM transaksi t
        LEFT JOIN transaksi_service_detail tsd 
          ON tsd.id_transaksi = t.id_transaksi
        LEFT JOIN transaksi_produk_detail tpd
          ON tpd.id_transaksi = t.id_transaksi
        WHERE t.id_store = ?
          AND MONTH(t.created_at) = ?
          AND YEAR(t.created_at) = ?
        GROUP BY DATE(t.created_at)

        UNION ALL

        /* Pengeluaran */
        SELECT
          DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
          0 AS pendapatan_kotor,
          0 AS total_komisi_capster,
          0 AS laba_produk,
          SUM(p.jumlah) AS pengeluaran
        FROM pengeluaran p
        WHERE p.id_store = ?
          AND MONTH(p.tanggal) = ?
          AND YEAR(p.tanggal) = ?
        GROUP BY DATE(p.tanggal)
      ) gabungan
      GROUP BY tanggal
      ORDER BY tanggal ASC
    `;

    const [rows] = await db.query(sql, [
      id_store,
      bulan,
      tahun,
      id_store,
      bulan,
      tahun,
    ]);

    const result = rows.map((r) => ({
      tanggal: r.tanggal, // ← string Y-M-D aman
      pendapatan_kotor: Number(r.pendapatan_kotor || 0),
      komisi_capster: Number(r.komisi_capster || 0),
      laba_produk: Number(r.laba_produk || 0),
      pengeluaran: Number(r.pengeluaran || 0),
      pendapatan_bersih:
        (Number(r.pendapatan_kotor) || 0) -
        (Number(r.komisi_capster) || 0) +
        (Number(r.laba_produk) || 0) -
        (Number(r.pengeluaran) || 0),
    }));

    res.json({ status: "success", data: result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
