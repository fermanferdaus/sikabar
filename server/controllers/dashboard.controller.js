import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🧾 Dashboard Capster (Pendapatan Bulanan)
   ============================================================ */
export const getCapsterDashboard = async (req, res) => {
  try {
    const { id_capster } = req.params;
    if (!id_capster) {
      return res.status(400).json({
        success: false,
        message: "ID capster tidak ditemukan",
      });
    }

    const bulanSekarang = dayjs().format("YYYY-MM");

    // ============================================================
    // 1️⃣ KOMISI CAPSTER
    // ============================================================
    const [komisiRows] = await db.query(
      `
      SELECT SUM(tsd.komisi_capster) AS komisi
      FROM transaksi_service_detail tsd
      WHERE tsd.id_capster = ?
      AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?
      `,
      [id_capster, bulanSekarang],
    );

    const pendapatan_bersih = Number(komisiRows[0]?.komisi || 0);

    // ============================================================
    // 2️⃣ GAJI POKOK
    // ============================================================
    const [gajiRows] = await db.query(
      `SELECT gaji_pokok FROM gaji_setting WHERE id_capster = ? LIMIT 1`,
      [id_capster],
    );

    const gaji_pokok = Number(gajiRows[0]?.gaji_pokok || 0);

    // ============================================================
    // 3️⃣ BONUS
    // ============================================================
    const [bonusRows] = await db.query(
      `
      SELECT 
        SUM(jumlah) AS total_bonus,
        (SELECT judul_bonus FROM bonus WHERE id_capster = ? AND periode = ? LIMIT 1) AS judul
      FROM bonus 
      WHERE id_capster = ? AND periode = ?
      `,
      [id_capster, bulanSekarang, id_capster, bulanSekarang],
    );

    const bonus_bulanan = Number(bonusRows[0]?.total_bonus || 0);
    const judul_bonus = bonusRows[0]?.judul || "-";

    // ============================================================
    // 4️⃣ POTONGAN BULAN INI (umum + kasbon)
    // ============================================================
    const [potonganRows] = await db.query(
      `
      SELECT SUM(jumlah_potongan) AS total_potongan
      FROM potongan_kasbon
      WHERE (
          id_capster = ? 
          OR id_kasbon IN (
               SELECT id_kasbon FROM kasbon WHERE id_capster = ?
          )
      )
      AND DATE_FORMAT(tanggal_potong, '%Y-%m') = ?
      `,
      [id_capster, id_capster, bulanSekarang],
    );

    const potongan_bulan_ini = Number(potonganRows[0]?.total_potongan || 0);

    // ============================================================
    // 5️⃣ KASBON (Sisa Kasbon Aktif)
    // ============================================================
    const [kasbonRows] = await db.query(
      `
      SELECT SUM(sisa_kasbon) AS sisa
      FROM kasbon
      WHERE id_capster = ?
      AND status = 'aktif'
      `,
      [id_capster],
    );

    const kasbon_aktif = Number(kasbonRows[0]?.sisa || 0);

    // ============================================================
    // 6️⃣ TOTAL PENDAPATAN
    // ============================================================
    const total_pendapatan =
      pendapatan_bersih + gaji_pokok + bonus_bulanan - potongan_bulan_ini;

    // ============================================================
    // 🔚 RESPONSE
    // ============================================================
    res.json({
      success: true,
      periode: bulanSekarang,
      pendapatan_bersih,
      gaji_pokok,
      bonus_bulanan,
      judul_bonus,
      potongan_bulan_ini,
      kasbon_aktif,
      total_pendapatan,
    });
  } catch (err) {
    console.error("❌ DB Error getCapsterDashboard:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard capster",
    });
  }
};

/* ============================================================
   📊 Grafik Capster (Pendapatan per Bulan)
   ============================================================ */
export const getCapsterChartData = async (req, res) => {
  try {
    const { id_capster } = req.params;
    if (!id_capster)
      return res.status(400).json({ message: "ID capster tidak ditemukan" });

    const sql = `
      SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m') AS periode,
        SUM(tsd.komisi_capster) AS pendapatan_bersih
      FROM transaksi_service_detail tsd
      JOIN transaksi t ON tsd.id_transaksi = t.id_transaksi
      WHERE tsd.id_capster = ?
      GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
      ORDER BY periode ASC
      LIMIT 12
    `;

    const [rows] = await db.query(sql, [id_capster]);
    res.json(rows);
  } catch (err) {
    console.error("❌ DB Error getCapsterChartData:", err);
    res.status(500).json({ message: "Gagal mengambil data chart capster" });
  }
};

/* ============================================================
   💼 Dashboard Kasir (Pendapatan & Bonus Bulanan)
   ============================================================ */
export const getKasirDashboard = async (req, res) => {
  try {
    const { id_kasir } = req.params;

    // ===============================
    // 🟢 Pakai id_kasir langsung (bukan id_user)
    // ===============================
    if (!id_kasir) {
      return res.json({
        success: false,
        message: "ID kasir tidak valid",
      });
    }

    const bulanSekarang = dayjs().format("YYYY-MM");

    // ===============================
    // 🟢 GAJI
    // ===============================
    const [gajiRows] = await db.query(
      `SELECT COALESCE(gaji_pokok,0) AS gaji_pokok
       FROM gaji_setting
       WHERE id_kasir = ?
       LIMIT 1`,
      [id_kasir],
    );

    const gajiPokok = Number(gajiRows[0]?.gaji_pokok || 0);

    // ===============================
    // 🟢 BONUS
    // ===============================
    const [bonusRows] = await db.query(
      `SELECT 
        COALESCE(SUM(jumlah),0) AS total_bonus,
        GROUP_CONCAT(DISTINCT judul_bonus ORDER BY judul_bonus SEPARATOR ', ') 
          AS judul_bonus
      FROM bonus
      WHERE id_kasir = ?
      AND periode = ?
      `,
      [id_kasir, bulanSekarang],
    );

    const bonusKasir = Number(bonusRows[0]?.total_bonus || 0);
    const judulBonus = bonusRows[0]?.judul_bonus || "-";

    // ===============================
    // 🟢 POTONGAN (SAMA SEPERTI SLIP GAJI)
    // ===============================
    const [potonganRows] = await db.query(
      `
      SELECT pk.jumlah_potongan
      FROM potongan_kasbon pk
      LEFT JOIN kasbon k ON k.id_kasbon = pk.id_kasbon
      WHERE 
          (pk.id_kasir = ? OR k.id_kasir = ?)
          AND (
            DATE_FORMAT(pk.tanggal_potong, '%Y-%m') = ?
            OR pk.periode = ?
          )
      `,
      [id_kasir, id_kasir, bulanSekarang, bulanSekarang],
    );

    const potongan = potonganRows.reduce(
      (a, b) => a + Number(b.jumlah_potongan || 0),
      0,
    );

    // ===============================
    // 🟢 KASBON AKTIF
    // ===============================
    const [kasbonRows] = await db.query(
      `SELECT COALESCE(SUM(sisa_kasbon),0) AS kasbon_aktif
       FROM kasbon
       WHERE id_kasir = ?
       AND (status = 'aktif' OR status IS NULL OR status = '')`,
      [id_kasir],
    );

    const kasbonAktif = Number(kasbonRows[0]?.kasbon_aktif || 0);

    // ===============================
    // 🟢 TOTAL
    // ===============================
    const totalPendapatan = gajiPokok + bonusKasir;
    const pendapatanBersihKasir = gajiPokok + bonusKasir - potongan;

    // ===============================
    // 🟢 RESPONSE
    // ===============================
    res.json({
      success: true,
      periode: bulanSekarang,
      gaji_pokok: gajiPokok,
      bonus_kasir: bonusKasir,
      judul_bonus: judulBonus,
      total_potongan: potongan,
      kasbon_aktif: kasbonAktif,
      total_pendapatan: totalPendapatan,
      pendapatan_bersih_kasir: pendapatanBersihKasir,
    });
  } catch (err) {
    console.error("❌ ERROR getKasirDashboard:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard kasir",
      error: err.message,
    });
  }
};
