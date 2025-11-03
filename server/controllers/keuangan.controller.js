import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🟢 GET /keuangan
   ------------------------------------------------------------
   - Laporan keuangan harian (pendapatan kotor, pengeluaran, bersih)
   - Pendapatan bersih = subtotal - komisi capster + laba produk - pengeluaran
   ============================================================ */
export const getKeuangan = (req, res) => {
  const now = dayjs();
  const bulan = now.month() + 1;
  const tahun = now.year();

  const query = `
    SELECT 
      DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
      SUM(pendapatan_kotor) AS pendapatan_kotor,
      SUM(total_komisi_capster) AS total_komisi_capster,
      SUM(laba_produk) AS laba_produk,
      SUM(pengeluaran) AS pengeluaran
    FROM (
      -- 🧾 Transaksi
      SELECT 
        DATE_FORMAT(CONVERT_TZ(t.created_at, '+00:00', '+07:00'), '%Y-%m-%d') AS tanggal,
        COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
        COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi_capster,
        COALESCE(SUM(tpd.laba_rugi), 0) AS laba_produk,
        0 AS pengeluaran
      FROM transaksi t
      LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
      LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
      WHERE MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
      GROUP BY DATE_FORMAT(CONVERT_TZ(t.created_at, '+00:00', '+07:00'), '%Y-%m-%d')

      UNION ALL

      -- 💸 Pengeluaran
      SELECT 
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        0 AS pendapatan_kotor,
        0 AS total_komisi_capster,
        0 AS laba_produk,
        COALESCE(SUM(p.jumlah), 0) AS pengeluaran
      FROM pengeluaran p
      WHERE MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
      GROUP BY DATE_FORMAT(p.tanggal, '%Y-%m-%d')
    ) gabungan
    GROUP BY tanggal
    ORDER BY tanggal ASC;
  `;

  db.query(query, [bulan, tahun, bulan, tahun], (err, rows) => {
    if (err) {
      console.error("❌ Error getKeuangan:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data keuangan",
      });
    }

    const result = rows.map((r) => {
      const pendapatanBersih =
        Number(r.pendapatan_kotor || 0) -
        Number(r.total_komisi_capster || 0) +
        Number(r.laba_produk || 0) -
        Number(r.pengeluaran || 0);

      return {
        tanggal: r.tanggal,
        pendapatan_kotor: Number(r.pendapatan_kotor || 0),
        komisi_capster: Number(r.total_komisi_capster || 0),
        laba_produk: Number(r.laba_produk || 0),
        pengeluaran: Number(r.pengeluaran || 0),
        pendapatan_bersih: pendapatanBersih,
      };
    });

    res.json({ status: "success", data: result });
  });
};

/* ============================================================
   🟢 GET /keuangan/summary
   ------------------------------------------------------------
   - Ringkasan keuangan semua cabang (total komisi capster, laba produk, pengeluaran admin)
   ============================================================ */
export const getKeuanganSummary = (req, res) => {
  const now = dayjs();
  const bulan = now.month() + 1;
  const tahun = now.year();

  const query = `
    SELECT 
      s.id_store,
      s.nama_store,

      -- Pendapatan kotor (subtotal transaksi)
      COALESCE(SUM(
        CASE WHEN MONTH(t.created_at) = ? AND YEAR(t.created_at) = ? 
        THEN t.subtotal ELSE 0 END
      ), 0) AS pendapatan_kotor,

      -- Komisi capster
      COALESCE((
        SELECT SUM(tsd.komisi_capster)
        FROM transaksi_service_detail tsd
        JOIN transaksi tx ON tsd.id_transaksi = tx.id_transaksi
        WHERE tx.id_store = s.id_store
        AND MONTH(tx.created_at) = ?
        AND YEAR(tx.created_at) = ?
      ), 0) AS total_komisi_capster,

      -- Laba produk
      COALESCE((
        SELECT SUM(COALESCE(tpd.laba_rugi, 0))
        FROM transaksi_produk_detail tpd
        JOIN transaksi tx2 ON tpd.id_transaksi = tx2.id_transaksi
        WHERE tx2.id_store = s.id_store
        AND MONTH(tx2.created_at) = ?
        AND YEAR(tx2.created_at) = ?
      ), 0) AS total_laba_produk,

      -- Pengeluaran toko
      COALESCE((
        SELECT SUM(p.jumlah)
        FROM pengeluaran p
        WHERE p.id_store = s.id_store
        AND MONTH(p.tanggal) = ?
        AND YEAR(p.tanggal) = ?
      ), 0) AS total_pengeluaran,

      -- Bonus capster
      COALESCE((
        SELECT SUM(b.jumlah)
        FROM bonus b
        JOIN capster c ON b.id_capster = c.id_capster
        WHERE c.id_store = s.id_store
        AND MONTH(b.tanggal_diberikan) = ?
        AND YEAR(b.tanggal_diberikan) = ?
      ), 0) AS total_bonus_capster,

      -- Bonus kasir
      COALESCE((
        SELECT SUM(b.jumlah)
        FROM bonus b
        JOIN users u ON b.id_user = u.id_user
        WHERE u.id_store = s.id_store AND u.role = 'kasir'
        AND MONTH(b.tanggal_diberikan) = ?
        AND YEAR(b.tanggal_diberikan) = ?
      ), 0) AS total_bonus_kasir,

      -- Gaji capster
      COALESCE((
        SELECT SUM(g.gaji_pokok)
        FROM gaji_setting g
        JOIN capster c ON g.id_capster = c.id_capster
        WHERE c.id_store = s.id_store
      ), 0) AS total_gaji_capster,

      -- Gaji kasir
      COALESCE((
        SELECT SUM(g.gaji_pokok)
        FROM gaji_setting g
        JOIN users u ON g.id_user = u.id_user
        WHERE u.id_store = s.id_store AND u.role = 'kasir'
      ), 0) AS total_gaji_kasir

    FROM store s
    LEFT JOIN transaksi t ON t.id_store = s.id_store
    GROUP BY s.id_store, s.nama_store
    ORDER BY s.id_store;
  `;

  const params = [
    bulan,
    tahun, // subtotal
    bulan,
    tahun, // komisi
    bulan,
    tahun, // laba
    bulan,
    tahun, // pengeluaran
    bulan,
    tahun, // bonus capster
    bulan,
    tahun, // bonus kasir
  ];

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("❌ Error getKeuanganSummary:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil ringkasan keuangan",
      });
    }

    // 🔹 Ambil pengeluaran global (id_store IS NULL)
    const queryGlobal = `
      SELECT COALESCE(SUM(p.jumlah), 0) AS pengeluaran_global
      FROM pengeluaran p
      WHERE p.id_store IS NULL
      AND MONTH(p.tanggal) = ?
      AND YEAR(p.tanggal) = ?;
    `;

    db.query(queryGlobal, [bulan, tahun], (err2, [global]) => {
      if (err2) {
        console.error("❌ Error pengeluaran global:", err2);
        return res.json({
          success: false,
          message: "Gagal ambil pengeluaran global",
        });
      }

      const pengeluaranGlobal = Number(global.pengeluaran_global || 0);

      // 🔹 Hitung total semua cabang
      const total = rows.reduce(
        (acc, r) => {
          // ✅ Rumus final (REAL bulanan)
          const bersih =
            Number(r.pendapatan_kotor || 0) -
            Number(r.total_komisi_capster || 0) +
            Number(r.total_laba_produk || 0) -
            (Number(r.total_pengeluaran || 0) +
              Number(r.total_bonus_capster || 0) +
              Number(r.total_bonus_kasir || 0) +
              Number(r.total_gaji_capster || 0) +
              Number(r.total_gaji_kasir || 0));

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
          pengeluaran: pengeluaranGlobal, // 🧾 pengeluaran global admin ikut
          bonus_capster: 0,
          bonus_kasir: 0,
          gaji_capster: 0,
          gaji_kasir: 0,
          pendapatan_bersih: 0,
        }
      );

      // 💡 Kurangi pengeluaran global dari pendapatan bersih
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
    });
  });
};

export const getKeuanganStoreSummary = (req, res) => {
  const { id_store } = req.params;
  if (!id_store)
    return res.status(400).json({
      status: "error",
      message: "id_store wajib disertakan",
    });

  const now = dayjs();
  const bulan = now.month() + 1;
  const tahun = now.year();

  const query = `
    SELECT
      -- 🧾 Pendapatan kotor
      COALESCE((
        SELECT SUM(t.subtotal)
        FROM transaksi t
        WHERE t.id_store = ?
        AND MONTH(t.created_at) = ?
        AND YEAR(t.created_at) = ?
      ), 0) AS pendapatan_kotor,

      -- 💈 Komisi capster
      COALESCE((
        SELECT SUM(tsd.komisi_capster)
        FROM transaksi_service_detail tsd
        JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi
        WHERE t.id_store = ?
        AND MONTH(t.created_at) = ?
        AND YEAR(t.created_at) = ?
      ), 0) AS total_komisi_capster,

      -- 🧴 Laba produk
      COALESCE((
        SELECT SUM(COALESCE(tpd.laba_rugi, 0))
        FROM transaksi_produk_detail tpd
        JOIN transaksi t ON tpd.id_transaksi = t.id_transaksi
        WHERE t.id_store = ?
        AND MONTH(t.created_at) = ?
        AND YEAR(t.created_at) = ?
      ), 0) AS total_laba_produk,

      -- 💸 Pengeluaran
      COALESCE((
        SELECT SUM(p.jumlah)
        FROM pengeluaran p
        WHERE p.id_store = ?
        AND MONTH(p.tanggal) = ?
        AND YEAR(p.tanggal) = ?
      ), 0) AS total_pengeluaran,

      -- 🎁 Bonus capster
      COALESCE((
        SELECT SUM(b.jumlah)
        FROM bonus b
        JOIN capster c ON b.id_capster = c.id_capster
        WHERE c.id_store = ?
        AND MONTH(b.tanggal_diberikan) = ?
        AND YEAR(b.tanggal_diberikan) = ?
      ), 0) AS total_bonus_capster,

      -- 🎁 Bonus kasir
      COALESCE((
        SELECT SUM(b.jumlah)
        FROM bonus b
        JOIN users u ON b.id_user = u.id_user
        WHERE u.id_store = ?
        AND u.role = 'kasir'
        AND MONTH(b.tanggal_diberikan) = ?
        AND YEAR(b.tanggal_diberikan) = ?
      ), 0) AS total_bonus_kasir,

      -- 💰 Gaji capster
      COALESCE((
        SELECT SUM(g.gaji_pokok)
        FROM gaji_setting g
        JOIN capster c ON g.id_capster = c.id_capster
        WHERE c.id_store = ?
      ), 0) AS total_gaji_capster,

      -- 💰 Gaji kasir
      COALESCE((
        SELECT SUM(g.gaji_pokok)
        FROM gaji_setting g
        JOIN users u ON g.id_user = u.id_user
        WHERE u.id_store = ?
        AND u.role = 'kasir'
      ), 0) AS total_gaji_kasir;
  `;

  const params = [
    id_store,
    bulan,
    tahun, // subtotal
    id_store,
    bulan,
    tahun, // komisi capster
    id_store,
    bulan,
    tahun, // laba produk
    id_store,
    bulan,
    tahun, // pengeluaran
    id_store,
    bulan,
    tahun, // bonus capster (tanggal_diberikan)
    id_store,
    bulan,
    tahun, // bonus kasir (tanggal_diberikan)
    id_store, // gaji capster
    id_store, // gaji kasir
  ];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Error getKeuanganStoreSummary:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data keuangan cabang",
        error: err.message,
      });
    }

    const row = results[0] || {};

    const pendapatanBersih =
      Number(row.pendapatan_kotor || 0) +
      Number(row.total_laba_produk || 0) -
      (Number(row.total_komisi_capster || 0) +
        Number(row.total_bonus_capster || 0) +
        Number(row.total_bonus_kasir || 0) +
        Number(row.total_gaji_capster || 0) +
        Number(row.total_gaji_kasir || 0) +
        Number(row.total_pengeluaran || 0));

    res.json({
      status: "success",
      bulan,
      tahun,
      data: {
        id_store,
        pendapatan_kotor: Number(row.pendapatan_kotor || 0),
        komisi_capster: Number(row.total_komisi_capster || 0),
        laba_produk: Number(row.total_laba_produk || 0),
        pengeluaran: Number(row.total_pengeluaran || 0),
        bonus_capster: Number(row.total_bonus_capster || 0),
        bonus_kasir: Number(row.total_bonus_kasir || 0),
        gaji_capster: Number(row.total_gaji_capster || 0),
        gaji_kasir: Number(row.total_gaji_kasir || 0),
        pendapatan_bersih: pendapatanBersih,
      },
    });
  });
};

// Grafik harian khusus per store (bukan summary saja)
export const getKeuanganStoreGrafik = (req, res) => {
  const { id_store } = req.params;
  if (!id_store)
    return res.status(400).json({
      status: "error",
      message: "id_store wajib disertakan",
    });

  const now = dayjs();
  const bulan = now.month() + 1;
  const tahun = now.year();

  const query = `
    SELECT 
      DATE_FORMAT(CONVERT_TZ(t.created_at, '+00:00', '+07:00'), '%Y-%m-%d') AS tanggal,
      COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
      COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi_capster,
      COALESCE(SUM(tpd.laba_rugi), 0) AS laba_produk,
      (
        SELECT COALESCE(SUM(p.jumlah), 0)
        FROM pengeluaran p
        WHERE p.id_store = ? 
        AND DATE_FORMAT(p.tanggal, '%Y-%m-%d') = DATE_FORMAT(CONVERT_TZ(t.created_at, '+00:00', '+07:00'), '%Y-%m-%d')
      ) AS pengeluaran
    FROM transaksi t
    LEFT JOIN transaksi_service_detail tsd ON tsd.id_transaksi = t.id_transaksi
    LEFT JOIN transaksi_produk_detail tpd ON tpd.id_transaksi = t.id_transaksi
    WHERE t.id_store = ?
    AND MONTH(t.created_at) = ?
    AND YEAR(t.created_at) = ?
    GROUP BY DATE_FORMAT(CONVERT_TZ(t.created_at, '+00:00', '+07:00'), '%Y-%m-%d')
    ORDER BY tanggal ASC;
  `;

  db.query(query, [id_store, id_store, bulan, tahun], (err, rows) => {
    if (err) {
      console.error("❌ Error getKeuanganStoreGrafik:", err);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data grafik keuangan toko",
      });
    }

    const result = rows.map((r) => {
      const pendapatan_bersih =
        Number(r.pendapatan_kotor || 0) -
        Number(r.total_komisi_capster || 0) +
        Number(r.laba_produk || 0) -
        Number(r.pengeluaran || 0);

      return {
        tanggal: r.tanggal,
        pendapatan_kotor: Number(r.pendapatan_kotor || 0),
        komisi_capster: Number(r.total_komisi_capster || 0),
        laba_produk: Number(r.laba_produk || 0),
        pengeluaran: Number(r.pengeluaran || 0),
        pendapatan_bersih,
      };
    });

    res.json({ status: "success", data: result });
  });
};
