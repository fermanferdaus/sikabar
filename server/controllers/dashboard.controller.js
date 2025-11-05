import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🧾 Dashboard Capster (Pendapatan Bulanan)
   ============================================================ */
export const getCapsterDashboard = async (req, res) => {
  try {
    const { id_capster } = req.params;
    if (!id_capster)
      return res
        .status(400)
        .json({ success: false, message: "ID capster tidak ditemukan" });

    const bulanSekarang = dayjs().format("YYYY-MM");

    const sql = `
      SELECT 
        IFNULL(SUM(tsd.komisi_capster), 0) AS pendapatan_bersih,
        IFNULL((SELECT gaji_pokok FROM gaji_setting WHERE id_capster = ? LIMIT 1), 0) AS gaji_pokok,
        IFNULL((SELECT SUM(b.jumlah) FROM bonus b WHERE b.id_capster = ? AND b.periode = ?), 0) AS bonus_bulanan,
        IFNULL((SELECT b.judul_bonus FROM bonus b WHERE b.id_capster = ? AND b.periode = ? LIMIT 1), '-') AS judul_bonus
      FROM transaksi_service_detail tsd
      WHERE tsd.id_capster = ? 
      AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?
    `;

    const [rows] = await db.query(sql, [
      id_capster, // gaji_pokok
      id_capster, // bonus SUM
      bulanSekarang,
      id_capster, // judul_bonus
      bulanSekarang,
      id_capster, // transaksi_service_detail
      bulanSekarang,
    ]);

    const row = rows[0];
    const pendapatan_bersih = Number(row.pendapatan_bersih) || 0;
    const gaji_pokok = Number(row.gaji_pokok) || 0;
    const bonus_bulanan = Number(row.bonus_bulanan) || 0;
    const total_pendapatan = pendapatan_bersih + gaji_pokok + bonus_bulanan;

    res.json({
      success: true,
      periode: bulanSekarang,
      pendapatan_bersih,
      gaji_pokok,
      bonus_bulanan,
      judul_bonus: row.judul_bonus || "-",
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
    if (!id_kasir)
      return res
        .status(400)
        .json({ success: false, message: "ID kasir tidak ditemukan" });

    const bulanSekarang = dayjs().format("YYYY-MM");

    const sql = `
      SELECT
        COALESCE((SELECT gaji_pokok FROM gaji_setting WHERE id_user = ? LIMIT 1), 0) AS gaji_pokok,
        COALESCE((SELECT SUM(jumlah) FROM bonus WHERE id_user = ? AND periode = ?), 0) AS bonus_kasir,
        COALESCE((SELECT judul_bonus FROM bonus WHERE id_user = ? AND periode = ? LIMIT 1), '-') AS judul_bonus
    `;

    const [rows] = await db.query(sql, [
      id_kasir,
      id_kasir,
      bulanSekarang,
      id_kasir,
      bulanSekarang,
    ]);

    const row = rows[0];
    const gaji = Number(row.gaji_pokok) || 0;
    const bonus = Number(row.bonus_kasir) || 0;
    const total_pendapatan = gaji + bonus;

    res.json({
      success: true,
      periode: bulanSekarang,
      gaji_pokok: gaji,
      bonus_kasir: bonus,
      pendapatan_kasir: gaji,
      total_pendapatan,
      judul_bonus: row.judul_bonus || "-",
    });
  } catch (err) {
    console.error("❌ DB Error getKasirDashboard:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard kasir",
    });
  }
};
