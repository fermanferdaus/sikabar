import db from "../config/db.js";
import dayjs from "dayjs";

/**
 * 🧍 Capster lihat komisi sendiri
 */
export const getKomisiCapster = (req, res) => {
  const capsterId = req.user.id_capster;
  const { type = "Bulanan", tanggal } = req.query;
  ambilKomisiCapster(capsterId, res, type, tanggal);
};

/**
 * 👑 Admin lihat semua capster (ringkasan komisi)
 */
export const getAllKomisi = (req, res) => {
  const sql = `
    SELECT 
      c.id_capster,
      c.nama_capster, 
      s.nama_store, 
      COALESCE(SUM(tsd.harga), 0) AS pendapatan_kotor,
      COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi
    FROM capster c
    LEFT JOIN store s ON c.id_store = s.id_store
    LEFT JOIN transaksi_service_detail tsd ON c.id_capster = tsd.id_capster
    GROUP BY c.id_capster, c.nama_capster, s.nama_store
    ORDER BY total_komisi DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Gagal ambil data komisi" });
    }

    res.json(result);
  });
};

/**
 * 👑 Admin lihat komisi 1 capster berdasarkan id_capster
 */
export const getKomisiCapsterById = (req, res) => {
  const { id_capster } = req.params;
  const { type = "Bulanan", tanggal } = req.query;
  ambilKomisiCapster(id_capster, res, type, tanggal);
};

/**
 * 🔁 Fungsi reusable untuk ambil detail komisi capster
 */
function ambilKomisiCapster(capsterId, res, type = "Bulanan", tanggal = null) {
  const date = tanggal ? dayjs(tanggal) : dayjs();

  // 🔹 Filter tanggal berdasarkan query
  let dateCondition = "";
  if (type === "Harian") {
    dateCondition = `AND DATE(tsd.created_at) = '${date.format("YYYY-MM-DD")}'`;
  } else if (type === "Bulanan") {
    dateCondition = `AND DATE_FORMAT(tsd.created_at, '%Y-%m') = '${date.format(
      "YYYY-MM"
    )}'`;
  }

  const sql = `
    SELECT 
      c.nama_capster,
      s.nama_store,
      p.service AS nama_service,
      tsd.harga AS harga_service,
      tsd.komisi_capster,
      tsd.created_at
    FROM transaksi_service_detail tsd
    JOIN capster c ON tsd.id_capster = c.id_capster
    JOIN store s ON c.id_store = s.id_store
    JOIN pricelist p ON tsd.id_pricelist = p.id_pricelist
    WHERE c.id_capster = ? ${dateCondition}
    ORDER BY tsd.created_at DESC
  `;

  db.query(sql, [capsterId], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res
        .status(500)
        .json({ message: "Gagal ambil data komisi capster" });
    }

    if (result.length === 0) {
      return res.json({
        nama_capster: null,
        store: null,
        pendapatan_kotor: 0,
        pendapatan_bersih: 0,
        riwayat: [],
      });
    }

    const pendapatanKotor = result.reduce(
      (sum, r) => sum + Number(r.harga_service || 0),
      0
    );
    const pendapatanBersih = result.reduce(
      (sum, r) => sum + Number(r.komisi_capster || 0),
      0
    );

    res.json({
      nama_capster: result[0].nama_capster,
      store: result[0].nama_store,
      pendapatan_kotor: pendapatanKotor,
      pendapatan_bersih: pendapatanBersih,
      riwayat: result.map((r) => ({
        tanggal: r.created_at,
        service: r.nama_service,
        harga: Number(r.harga_service || 0),
        komisi: Number(r.komisi_capster || 0),
      })),
    });
  });
}
