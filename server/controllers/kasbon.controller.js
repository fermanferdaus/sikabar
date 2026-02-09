import db from "../config/db.js";
import dayjs from "dayjs";
import "dayjs/locale/id.js";

dayjs.locale("id");

// GET Semua Kasbon
export const getAllKasbon = async (req, res) => {
  try {
    await checkAndUpdateKasbonBulan();

    const { periode } = req.query;
    const currentMonth = periode || dayjs().format("YYYY-MM");

    const [rows] = await db.query(
      `
        SELECT 
          k.id_kasbon,
          CASE 
            WHEN k.id_capster IS NOT NULL THEN c.nama_capster
            WHEN k.id_kasir IS NOT NULL THEN ka.nama_kasir
            ELSE '(Tidak diketahui)'
          END AS nama,
          COALESCE(s.nama_store, '-') AS nama_store,
          k.id_capster,
          k.id_kasir,
          k.jumlah_total,
          k.sisa_kasbon,
          k.jumlah_cicilan,
          k.cicilan_terbayar,
          k.keterangan,
          k.status,
          DATE_FORMAT(k.tanggal_pinjam, '%Y-%m-%d') AS tanggal
        FROM kasbon k
        LEFT JOIN capster c ON k.id_capster = c.id_capster
        LEFT JOIN kasir ka ON k.id_kasir = ka.id_kasir
        LEFT JOIN store s ON 
            (c.id_store = s.id_store OR ka.id_store = s.id_store)
        WHERE DATE_FORMAT(k.tanggal_pinjam, '%Y-%m') = ?
        ORDER BY k.tanggal_pinjam DESC
      `,
      [currentMonth],
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error getAllKasbon:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data kasbon",
      error: error.message,
    });
  }
};

// GET Kasbon per Capster (per bulan)
export const getKasbonByCapster = async (req, res) => {
  const { id_capster } = req.params;
  const { periode } = req.query;
  const currentMonth = periode || dayjs().format("YYYY-MM");

  try {
    const [rows] = await db.query(
      `
        SELECT 
          k.id_kasbon,
          k.id_capster,
          c.nama_capster,
          s.nama_store,
          k.jumlah_total,
          k.sisa_kasbon,
          k.jumlah_cicilan,
          k.cicilan_terbayar,
          k.keterangan,
          k.status,
          DATE_FORMAT(k.tanggal_pinjam, '%Y-%m-%d') AS tanggal
        FROM kasbon k
        LEFT JOIN capster c ON k.id_capster = c.id_capster
        LEFT JOIN store s ON c.id_store = s.id_store
        WHERE k.id_capster = ? 
          AND DATE_FORMAT(k.tanggal_pinjam, '%Y-%m') = ?
        ORDER BY k.tanggal_pinjam DESC
      `,
      [id_capster, currentMonth],
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error getKasbonByCapster:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data kasbon capster",
      error: error.message,
    });
  }
};

// POST Tambah Kasbon
export const createKasbon = async (req, res) => {
  try {
    const { id_kasir, id_capster, jumlah_total, jumlah_cicilan, keterangan } =
      req.body;

    const kasirId = id_kasir && id_kasir !== "" ? id_kasir : null;
    const capsterId = id_capster && id_capster !== "" ? id_capster : null;

    const LIMIT_KASBON = 5_000_000;

    // VALIDASI DASAR
    if (!jumlah_total || !jumlah_cicilan) {
      return res.status(400).json({
        success: false,
        message: "Jumlah total dan jumlah cicilan wajib diisi.",
      });
    }

    if (!kasirId && !capsterId) {
      return res.status(400).json({
        success: false,
        message: "Penerima kasbon harus dipilih (kasir atau capster).",
      });
    }

    // HITUNG TOTAL KASBON AKTIF
    let totalKasbonAktif = 0;

    if (capsterId) {
      const [[row]] = await db.query(
        `
          SELECT COALESCE(SUM(jumlah_total),0) AS total
          FROM kasbon
          WHERE id_kasbon IN (
            SELECT MIN(id_kasbon)
            FROM kasbon
            WHERE id_capster = ?
              AND status = 'aktif'
            GROUP BY DATE_FORMAT(tanggal_pinjam, '%Y-%m')
          )
        `,
        [capsterId],
      );
      totalKasbonAktif = Number(row.total);
    }

    if (kasirId) {
      const [[row]] = await db.query(
        `
          SELECT COALESCE(SUM(jumlah_total),0) AS total
          FROM kasbon
          WHERE id_kasbon IN (
            SELECT MIN(id_kasbon)
            FROM kasbon
            WHERE id_kasir = ?
              AND status = 'aktif'
            GROUP BY DATE_FORMAT(tanggal_pinjam, '%Y-%m')
          )
        `,
        [kasirId],
      );
      totalKasbonAktif = Number(row.total);
    }

    if (totalKasbonAktif >= LIMIT_KASBON) {
      return res.status(400).json({
        success: false,
        message:
          "Kasbon tidak dapat ditambahkan. Total kasbon aktif sudah mencapai batas Rp5.000.000.",
      });
    }

    if (totalKasbonAktif + Number(jumlah_total) > LIMIT_KASBON) {
      return res.status(400).json({
        success: false,
        message: "Jumlah kasbon melebihi batas maksimum Rp5.000.000.",
      });
    }

    const potonganPerBulan = Math.ceil(jumlah_total / jumlah_cicilan);
    const startDate = dayjs();
    const totalPeriode = jumlah_cicilan;

    for (let i = 0; i < totalPeriode; i++) {
      const bulanKe = startDate.add(i, "month");
      const periode = bulanKe.format("YYYY-MM");
      const tanggalPinjam = bulanKe.startOf("month").format("YYYY-MM-DD");
      const cicilanTerbayar = i + 1;

      const sisaKasbon = Math.max(
        jumlah_total - potonganPerBulan * cicilanTerbayar,
        0,
      );

      const [kasbonResult] = await db.query(
        `
          INSERT INTO kasbon 
          (id_kasir, id_capster, jumlah_total, sisa_kasbon, jumlah_cicilan, cicilan_terbayar, keterangan, status, tanggal_pinjam)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif', ?)
        `,
        [
          kasirId,
          capsterId,
          jumlah_total,
          sisaKasbon,
          jumlah_cicilan,
          cicilanTerbayar,
          keterangan,
          tanggalPinjam,
        ],
      );

      const id_kasbon = kasbonResult.insertId;

      await db.query(
        `
          INSERT INTO potongan_kasbon 
          (id_kasbon, id_kasir, id_capster, periode, jumlah_potongan, keterangan, tanggal_potong)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id_kasbon,
          kasirId,
          capsterId,
          periode,
          potonganPerBulan,
          `Potongan otomatis kasbon bulan ${bulanKe.format("MMMM YYYY")}`,
          tanggalPinjam,
        ],
      );
    }

    res.json({
      success: true,
      message: "Kasbon berhasil dibuat dan dipotong mulai bulan ini.",
    });
  } catch (error) {
    console.error("❌ Error createKasbon:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan kasbon.",
      error: error.message,
    });
  }
};

// PUT Update Kasbon
export const updateKasbon = async (req, res) => {
  const { id } = req.params;
  const { jumlah_total, sisa_kasbon, cicilan_terbayar, status, keterangan } =
    req.body;

  try {
    await db.query(
      `
        UPDATE kasbon 
        SET 
          jumlah_total = ?, 
          sisa_kasbon = ?, 
          cicilan_terbayar = ?, 
          status = ?, 
          keterangan = ?, 
          updated_at = NOW()
        WHERE id_kasbon = ?
      `,
      [jumlah_total, sisa_kasbon, cicilan_terbayar, status, keterangan, id],
    );

    res.json({
      success: true,
      message: "Kasbon berhasil diperbarui (termasuk total & keterangan).",
    });
  } catch (error) {
    console.error("❌ Error updateKasbon:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui kasbon",
      error: error.message,
    });
  }
};

// DELETE Kasbon
export const deleteKasbon = async (req, res) => {
  const { id } = req.params;

  try {
    // Hapus potongan otomatis berdasarkan id_kasbon
    await db.query(`DELETE FROM potongan_kasbon WHERE id_kasbon = ?`, [id]);

    // Hapus kasbon utama
    await db.query(`DELETE FROM kasbon WHERE id_kasbon = ?`, [id]);

    res.json({
      success: true,
      message: "Kasbon berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteKasbon:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kasbon",
      error: error.message,
    });
  }
};

// EK DAN UPDATE STATUS KASBON SAAT GANTI BULAN
export const checkAndUpdateKasbonBulan = async () => {
  try {
    const now = dayjs();

    const [kasbonList] = await db.query(`
      SELECT id_kasbon, tanggal_pinjam, jumlah_cicilan, sisa_kasbon
      FROM kasbon
      WHERE status = 'aktif'
    `);

    for (const k of kasbonList) {
      const bulanAwal = dayjs(k.tanggal_pinjam);
      const bulanBerakhir = bulanAwal
        .add(k.jumlah_cicilan - 1, "month")
        .endOf("month");

      if (
        now.isSame(bulanBerakhir, "day") ||
        now.isAfter(bulanBerakhir, "day")
      ) {
        await db.query(
          `UPDATE kasbon SET status='lunas', sisa_kasbon=0 WHERE id_kasbon=?`,
          [k.id_kasbon],
        );
      }
    }

    console.log("✔ Auto update status kasbon berjalan");
  } catch (error) {
    console.error("❌ Error checkAndUpdateKasbonBulan:", error);
  }
};

// ======================================================
// 🔹 GET Kasbon by ID (untuk halaman Edit)
// ======================================================
export const getKasbonById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        k.id_kasbon,
        k.id_capster,
        k.id_kasir,
        c.nama_capster,
        ka.nama_kasir,
        COALESCE(s.nama_store, '-') AS nama_store,
        k.jumlah_total,
        k.sisa_kasbon,
        k.jumlah_cicilan,
        k.cicilan_terbayar,
        k.keterangan,
        k.status,
        DATE_FORMAT(k.tanggal_pinjam, '%Y-%m-%d') AS tanggal_pinjam
      FROM kasbon k
      LEFT JOIN capster c ON k.id_capster = c.id_capster
      LEFT JOIN kasir ka ON k.id_kasir = ka.id_kasir
      LEFT JOIN store s ON 
            (c.id_store = s.id_store OR ka.id_store = s.id_store)
      WHERE k.id_kasbon = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kasbon tidak ditemukan",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Error getKasbonById:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data kasbon",
      error: error.message,
    });
  }
};

// ======================================================
// 🔹 CEK STATUS KASBON SECARA OTOMATIS
// ======================================================
export const autoUpdateStatusKasbon = async () => {
  try {
    const now = dayjs();

    const [kasbonList] = await db.query(`
      SELECT id_kasbon, tanggal_pinjam, jumlah_cicilan
      FROM kasbon
      WHERE status = 'aktif'
    `);

    for (const k of kasbonList) {
      const tanggalLunas = dayjs(k.tanggal_pinjam)
        .add(k.jumlah_cicilan, "month")
        .endOf("month");

      if (now.isSameOrAfter(tanggalLunas, "day")) {
        await db.query(`UPDATE kasbon SET status='lunas' WHERE id_kasbon=?`, [
          k.id_kasbon,
        ]);
      }
    }
  } catch (error) {
    console.error("❌ Error autoUpdateStatusKasbon:", error);
  }
};

// ======================================================
// 🔹 GET TOTAL KASBON AKTIF (CAPSTER / KASIR)
// ======================================================
export const getTotalKasbonAktif = async (req, res) => {
  try {
    const { id_capster, id_kasir } = req.query;

    if (!id_capster && !id_kasir) {
      return res.json({ success: true, total: 0 });
    }

    let total = 0;

    // 🔥 HITUNG TOTAL PINJAMAN, BUKAN SISA
    if (id_capster) {
      const [[row]] = await db.query(
        `
      SELECT COALESCE(SUM(jumlah_total),0) AS total
      FROM kasbon
      WHERE id_kasbon IN (
        SELECT MIN(id_kasbon)
        FROM kasbon
        WHERE id_capster = ?
          AND status = 'aktif'
        GROUP BY tanggal_pinjam
      )
      `,
        [id_capster],
      );
      total = Number(row.total);
    }

    if (id_kasir) {
      const [[row]] = await db.query(
        `
        SELECT COALESCE(SUM(jumlah_total),0) AS total
        FROM kasbon
        WHERE id_kasbon IN (
          SELECT MIN(id_kasbon)
          FROM kasbon
          WHERE id_kasir = ?
            AND status = 'aktif'
          GROUP BY tanggal_pinjam
        )
      `,
        [id_kasir],
      );
      total = Number(row.total);
    }

    return res.json({
      success: true,
      total,
      limitReached: total >= 5_000_000,
    });
  } catch (err) {
    console.error("❌ getTotalKasbonAktif error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil total kasbon aktif",
    });
  }
};
