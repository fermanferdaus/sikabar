import db from "../config/db.js";
import dayjs from "dayjs";

/**
 * 🧾 Dashboard Capster (Pendapatan Bulanan)
 */
export const getCapsterDashboard = (req, res) => {
  const { id_capster } = req.params;
  if (!id_capster) {
    return res
      .status(400)
      .json({ success: false, message: "ID capster tidak ditemukan" });
  }

  const bulanSekarang = dayjs().format("YYYY-MM");

  const sql = `
    SELECT 
      IFNULL(SUM(tsd.komisi_capster), 0) AS pendapatan_bersih,

      IFNULL((
        SELECT gaji_pokok 
        FROM gaji_setting 
        WHERE id_capster = ? 
        LIMIT 1
      ), 0) AS gaji_pokok,

      IFNULL((
        SELECT SUM(b.jumlah) 
        FROM bonus b 
        WHERE b.id_capster = ? 
        AND b.periode = ?
      ), 0) AS bonus_bulanan,

      IFNULL((
        SELECT b.judul_bonus 
        FROM bonus b 
        WHERE b.id_capster = ? 
        AND b.periode = ? 
        LIMIT 1
      ), '-') AS judul_bonus

    FROM transaksi_service_detail tsd
    WHERE tsd.id_capster = ? 
    AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?
  `;

  db.query(
    sql,
    [
      id_capster, // untuk gaji_pokok
      id_capster,
      bulanSekarang, // untuk bonus_bulanan
      id_capster,
      bulanSekarang, // untuk judul_bonus
      id_capster,
      bulanSekarang, // untuk transaksi_service_detail
    ],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error getCapsterDashboard:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal mengambil data dashboard capster",
        });
      }

      const row = result[0];
      const pendapatan_bersih = Number(row.pendapatan_bersih) || 0;
      const gaji_pokok = Number(row.gaji_pokok) || 0;
      const bonus_bulanan = Number(row.bonus_bulanan) || 0;
      const total_pendapatan = pendapatan_bersih + gaji_pokok + bonus_bulanan;
      const judul_bonus = row.judul_bonus || "-";

      res.json({
        success: true,
        periode: bulanSekarang,
        pendapatan_bersih,
        gaji_pokok,
        bonus_bulanan,
        judul_bonus,
        total_pendapatan,
      });
    }
  );
};

export const getCapsterChartData = (req, res) => {
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

  db.query(sql, [id_capster], (err, result) => {
    if (err) {
      console.error("❌ DB Error getCapsterChartData:", err);
      return res.status(500).json({ message: "Gagal mengambil data chart" });
    }

    res.json(result);
  });
};

/**
 * 💼 Dashboard Kasir (Pendapatan & Bonus Bulanan)
 */
export const getKasirDashboard = (req, res) => {
  const { id_kasir } = req.params;
  if (!id_kasir) {
    return res
      .status(400)
      .json({ success: false, message: "ID kasir tidak ditemukan" });
  }

  const bulanSekarang = dayjs().format("YYYY-MM");

  const sql = `
    SELECT
      COALESCE(
        (SELECT gaji_pokok FROM gaji_setting WHERE id_user = ? LIMIT 1),
        0
      ) AS gaji_pokok,

      COALESCE(
        (SELECT SUM(jumlah) FROM bonus WHERE id_user = ? AND periode = ?),
        0
      ) AS bonus_kasir,

      COALESCE(
        (SELECT judul_bonus FROM bonus WHERE id_user = ? AND periode = ? LIMIT 1),
        '-'
      ) AS judul_bonus
  `;

  db.query(
    sql,
    [id_kasir, id_kasir, bulanSekarang, id_kasir, bulanSekarang],
    (err, result) => {
      if (err) {
        console.error("❌ DB Error getKasirDashboard:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal mengambil data dashboard kasir",
        });
      }

      const row = result[0];
      const gaji = Number(row.gaji_pokok) || 0;
      const bonus = Number(row.bonus_kasir) || 0;
      const total_pendapatan = gaji + bonus;
      const judul_bonus = row.judul_bonus || "-";

      res.json({
        success: true,
        periode: bulanSekarang,
        gaji_pokok: gaji,
        bonus_kasir: bonus,
        pendapatan_kasir: gaji,
        total_pendapatan: total_pendapatan,
        judul_bonus: judul_bonus,
      });
    }
  );
};
