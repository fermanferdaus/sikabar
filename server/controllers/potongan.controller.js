import db from "../config/db.js";

/* ============================================================
   🔹 GET SEMUA POTONGAN (HARIAN / BULANAN)
============================================================ */
export const getAllPotongan = async (req, res) => {
  try {
    const { periode } = req.query;
    let where = "";
    const params = [];

    if (periode) {
      if (periode.length === 7) {
        where = "WHERE DATE_FORMAT(p.tanggal_potong, '%Y-%m') = ?";
      } else if (periode.length === 10) {
        where = "WHERE DATE(p.tanggal_potong) = ?";
      }
      params.push(periode);
    }

    const [rows] = await db.query(
      `
      SELECT
        p.id_potongan,
        p.id_kasir,
        p.id_capster, 
        p.tipe_potongan,
        p.jumlah_potongan AS jumlah,
        p.keterangan,
        DATE_FORMAT(p.tanggal_potong, '%Y-%m-%d') AS tanggal,

        CASE 
          WHEN p.id_capster IS NOT NULL THEN c.nama_capster
          WHEN p.id_kasir IS NOT NULL THEN k.nama_kasir
          ELSE '(Tidak diketahui)'
        END AS nama,

        CASE
          WHEN p.id_capster IS NOT NULL THEN s1.nama_store
          WHEN p.id_kasir IS NOT NULL THEN s2.nama_store
          ELSE '-'
        END AS nama_store

      FROM potongan_kasbon p

      LEFT JOIN capster c ON p.id_capster = c.id_capster
      LEFT JOIN store s1 ON c.id_store = s1.id_store

      LEFT JOIN kasir k ON p.id_kasir = k.id_kasir
      LEFT JOIN store s2 ON k.id_store = s2.id_store

      ${where}
      ORDER BY p.tanggal_potong DESC
      `,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error getAllPotongan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data potongan",
      error: error.message,
    });
  }
};

/* ============================================================
   🔹 GET POTONGAN BY ID
============================================================ */
export const getPotonganById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        COALESCE(c.nama_capster, k.nama_kasir, '(Tidak diketahui)') AS nama,
        COALESCE(s1.nama_store, s2.nama_store, '-') AS nama_store
      FROM potongan_kasbon p

      LEFT JOIN capster c ON p.id_capster = c.id_capster
      LEFT JOIN store s1 ON c.id_store = s1.id_store

      LEFT JOIN kasir k ON p.id_kasir = k.id_kasir
      LEFT JOIN store s2 ON k.id_store = s2.id_store

      WHERE p.id_potongan = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({
        success: false,
        message: "Potongan tidak ditemukan",
      });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("❌ Error getPotonganById:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat detail potongan",
      error: error.message,
    });
  }
};

/* ============================================================
   🔹 GET POTONGAN PER CAPSTER
============================================================ */
export const getPotonganByCapster = async (req, res) => {
  const { id_capster } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        c.nama_capster,
        s.nama_store
      FROM potongan_kasbon p
      LEFT JOIN capster c ON p.id_capster = c.id_capster
      LEFT JOIN store s ON c.id_store = s.id_store
      WHERE p.id_capster = ?
      ORDER BY p.tanggal_potong DESC
      `,
      [id_capster]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error getPotonganByCapster:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data potongan capster",
      error: error.message,
    });
  }
};

/* ============================================================
   🔹 CREATE POTONGAN (UMUM / KASBON)
============================================================ */
export const createPotongan = async (req, res) => {
  try {
    const {
      id_kasbon,
      id_capster,
      id_kasir,
      periode,
      jumlah_potongan,
      keterangan,
      tanggal_potong,
      tipe_potongan = "umum",
    } = req.body;

    if (!jumlah_potongan || !keterangan)
      return res.status(400).json({
        success: false,
        message: "Jumlah potongan dan keterangan wajib diisi!",
      });

    /* ============================================================
       🔹 POTONGAN UMUM
    ============================================================ */
    if (tipe_potongan === "umum") {
      await db.query(
        `
        INSERT INTO potongan_kasbon
        (id_capster, id_kasir, jumlah_potongan, keterangan, tanggal_potong, tipe_potongan)
        VALUES (?, ?, ?, ?, ?, 'umum')
        `,
        [
          id_capster || null,
          id_kasir || null,
          jumlah_potongan,
          keterangan,
          tanggal_potong,
        ]
      );
    } else if (tipe_potongan === "kasbon") {
      /* ============================================================
       🔹 POTONGAN KASBON (CICILAN)
    ============================================================ */
      await db.query(
        `
        INSERT INTO potongan_kasbon
        (id_kasbon, id_capster, id_kasir, periode, jumlah_potongan, keterangan, tanggal_potong, tipe_potongan)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'kasbon')
        `,
        [
          id_kasbon,
          id_capster || null,
          id_kasir || null,
          periode,
          jumlah_potongan,
          keterangan,
          tanggal_potong || new Date(),
        ]
      );

      // 🔥 Update kasbon
      await db.query(
        `
        UPDATE kasbon
        SET 
          sisa_kasbon = GREATEST(sisa_kasbon - ?, 0),
          cicilan_terbayar = cicilan_terbayar + 1,
          status = CASE WHEN (sisa_kasbon - ?) <= 0 THEN 'lunas' ELSE 'aktif' END
        WHERE id_kasbon = ?
        `,
        [jumlah_potongan, jumlah_potongan, id_kasbon]
      );
    }

    res.json({ success: true, message: "Potongan berhasil ditambahkan" });
  } catch (error) {
    console.error("❌ Error createPotongan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan potongan",
      error: error.message,
    });
  }
};

/* ============================================================
   🔹 UPDATE POTONGAN
============================================================ */
export const updatePotongan = async (req, res) => {
  const { id } = req.params;
  const { jumlah_potongan, keterangan, tanggal_potong } = req.body;

  try {
    await db.query(
      `
      UPDATE potongan_kasbon
      SET jumlah_potongan=?, keterangan=?, tanggal_potong=?
      WHERE id_potongan=?
      `,
      [jumlah_potongan, keterangan, tanggal_potong, id]
    );

    res.json({ success: true, message: "Potongan berhasil diperbarui" });
  } catch (error) {
    console.error("❌ Error updatePotongan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui potongan",
      error: error.message,
    });
  }
};

/* ============================================================
   🔹 DELETE POTONGAN
============================================================ */
export const deletePotongan = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM potongan_kasbon WHERE id_potongan=?`, [id]);
    res.json({ success: true, message: "Potongan berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error deletePotongan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus potongan",
      error: error.message,
    });
  }
};
