import db from "../config/db.js";
import dayjs from "dayjs";

// ============================================================
// 🧍 Capster lihat komisi sendiri
// ============================================================
export const getKomisiCapster = async (req, res) => {
  try {
    const capsterId = req.user?.id_capster;
    const { type = "Bulanan", tanggal } = req.query;
    if (!capsterId)
      return res.status(400).json({ message: "ID Capster tidak ditemukan" });

    await ambilKomisiCapster(capsterId, res, type, tanggal);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data komisi capster" });
  }
};

// ============================================================
// 👑 Admin lihat semua capster (ringkasan komisi)
// ============================================================
export const getAllKomisi = async (req, res) => {
  try {
    const { type = "Bulanan", tanggal } = req.query;
    const date = tanggal ? dayjs(tanggal) : dayjs();

    let dateCondition = "";
    if (type === "Harian") {
      dateCondition = "AND DATE(tsd.created_at) = ?";
    } else if (type === "Bulanan") {
      dateCondition = "AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?";
    }

    const paramTanggal =
      type === "Harian"
        ? [date.format("YYYY-MM-DD")]
        : [date.format("YYYY-MM")];

    const sql = `
      SELECT 
        c.id_capster,
        c.nama_capster, 
        s.nama_store, 
        COALESCE(SUM(tsd.harga), 0) AS pendapatan_kotor,
        COALESCE(SUM(tsd.komisi_capster), 0) AS total_komisi
      FROM capster c
      LEFT JOIN store s ON c.id_store = s.id_store
      LEFT JOIN transaksi_service_detail tsd 
        ON c.id_capster = tsd.id_capster ${dateCondition}
      GROUP BY c.id_capster, c.nama_capster, s.nama_store
      ORDER BY total_komisi DESC
    `;

    const [rows] = await db.query(sql, paramTanggal);
    res.json(rows);
  } catch (err) {
    console.error("❌ DB Error getAllKomisi:", err);
    res.status(500).json({ message: "Gagal ambil data komisi" });
  }
};

// ============================================================
// 👑 Admin lihat komisi 1 capster berdasarkan id_capster
// ============================================================
export const getKomisiCapsterById = async (req, res) => {
  try {
    const { id_capster } = req.params;
    const { type = "Bulanan", tanggal } = req.query;

    if (!id_capster)
      return res.status(400).json({ message: "ID Capster wajib disertakan" });

    await ambilKomisiCapster(id_capster, res, type, tanggal);
  } catch {
    res.status(500).json({ message: "Gagal ambil data komisi capster" });
  }
};

// ============================================================
// 🔁 Fungsi reusable ambil detail komisi capster
// ============================================================
async function ambilKomisiCapster(capsterId, res, type = "Bulanan", tanggal) {
  try {
    const date = tanggal ? dayjs(tanggal) : dayjs();
    let dateCondition = "";
    let paramTanggal;

    if (type === "Harian") {
      dateCondition = "AND DATE(tsd.created_at) = ?";
      paramTanggal = date.format("YYYY-MM-DD");
    } else if (type === "Bulanan") {
      dateCondition = "AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?";
      paramTanggal = date.format("YYYY-MM");
    }

    const sql = `
      SELECT 
        c.nama_capster,
        s.nama_store,
        p.service AS nama_service,
        tsd.harga AS harga_service,
        tsd.persentase_capster,
        tsd.komisi_capster,
        tsd.created_at
      FROM transaksi_service_detail tsd
      JOIN capster c ON tsd.id_capster = c.id_capster
      JOIN store s ON c.id_store = s.id_store
      JOIN pricelist p ON tsd.id_pricelist = p.id_pricelist
      WHERE c.id_capster = ? ${dateCondition}
      ORDER BY tsd.created_at DESC
    `;

    const [rows] = await db.query(sql, [capsterId, paramTanggal]);

    if (!rows.length) {
      return res.json({
        nama_capster: null,
        store: null,
        pendapatan_kotor: 0,
        pendapatan_bersih: 0,
        riwayat: [],
      });
    }

    const pendapatanKotor = rows.reduce(
      (sum, r) => sum + Number(r.harga_service || 0),
      0
    );
    const pendapatanBersih = rows.reduce(
      (sum, r) => sum + Number(r.komisi_capster || 0),
      0
    );

    res.json({
      nama_capster: rows[0].nama_capster,
      store: rows[0].nama_store,
      pendapatan_kotor: pendapatanKotor,
      pendapatan_bersih: pendapatanBersih,
      riwayat: rows.map((r) => ({
        tanggal: r.created_at,
        service: r.nama_service,
        harga: +r.harga_service || 0,
        persentase_capster: +r.persentase_capster || 0,
        komisi: +r.komisi_capster || 0,
      })),
    });
  } catch (err) {
    console.error("❌ DB Error ambilKomisiCapster:", err);
    res.status(500).json({ message: "Gagal ambil data komisi capster" });
  }
}
