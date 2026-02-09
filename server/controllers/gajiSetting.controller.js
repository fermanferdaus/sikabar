import db from "../config/db.js";
import dayjs from "dayjs";

/* ============================================================
   🟢 GET Semua Data Gaji Pokok (Capster & Kasir)
   ============================================================ */
export const getAllGajiSetting = async (req, res) => {
  try {
    const sql = `
      SELECT 
        gs.id_gaji_setting,
        gs.id_capster,
        gs.id_kasir,
        COALESCE(c.nama_capster, k.nama_kasir) AS nama,
        COALESCE(s.nama_store, '-') AS nama_store,
        gs.gaji_pokok,
        gs.periode,
        gs.updated_at,
        CASE
          WHEN gs.id_capster IS NOT NULL THEN 'Capster'
          WHEN gs.id_kasir IS NOT NULL THEN 'Kasir'
          ELSE '-'
        END AS jabatan
      FROM gaji_setting gs
      LEFT JOIN capster c ON gs.id_capster = c.id_capster
      LEFT JOIN kasir k ON gs.id_kasir = k.id_kasir
      LEFT JOIN store s ON (c.id_store = s.id_store OR k.id_store = s.id_store)
      ORDER BY jabatan, nama ASC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data gaji pokok" });
  }
};

/* ============================================================
   🟢 CREATE / UPDATE Gaji Pokok (Cegah duplikasi)
   ============================================================ */
export const createOrUpdateGajiSetting = async (req, res) => {
  try {
    const { id_capster, id_kasir, gaji_pokok, periode } = req.body;

    if (!gaji_pokok || (!id_capster && !id_kasir))
      return res.status(400).json({ message: "Data tidak lengkap" });

    const field = id_capster ? "id_capster" : "id_kasir";
    const id = id_capster || id_kasir;

    const [exist] = await db.query(
      `SELECT id_gaji_setting FROM gaji_setting WHERE ${field} = ?`,
      [id],
    );

    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama ini sudah memiliki data gaji pokok",
      });
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    await db.query(
      `INSERT INTO gaji_setting (${field}, gaji_pokok, periode, updated_at)
       VALUES (?, ?, ?, ?)`,
      [id, gaji_pokok, periode || "Bulanan", now],
    );

    res.json({ success: true, message: "Gaji pokok berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan gaji pokok" });
  }
};

/* ============================================================
   🟢 Tambah Bonus (Capster / Kasir)
   ============================================================ */
export const addBonus = async (req, res) => {
  try {
    const { id_capster, id_kasir, judul_bonus, jumlah, keterangan, periode } =
      req.body;

    // ===============================
    // 🔹 VALIDASI DASAR
    // ===============================
    if ((!id_capster && !id_kasir) || !judul_bonus || !jumlah) {
      return res.status(400).json({
        success: false,
        message: "Data bonus tidak lengkap",
      });
    }

    // ===============================
    // 🔹 TANGGAL OTOMATIS (HARI INI)
    // ===============================
    const periodeFinal = periode || dayjs().format("YYYY-MM");

    // Field utk where
    const field = id_capster ? "id_capster" : "id_kasir";
    const id = id_capster || id_kasir;

    // ===============================
    // 🔹 CEK DUPLIKASI BONUS
    // ===============================
    const [exist] = await db.query(
      `SELECT id_bonus FROM bonus 
       WHERE ${field} = ? 
         AND judul_bonus = ? 
         AND periode = ?`,
      [id, judul_bonus, periodeFinal],
    );

    if (exist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bonus ini sudah pernah diberikan pada periode tersebut",
      });
    }

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // ===============================
    // 🔹 INSERT BONUS
    // ===============================
    await db.query(
      `INSERT INTO bonus 
       (id_capster, id_kasir, judul_bonus, jumlah, keterangan, periode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_capster || null,
        id_kasir || null,
        judul_bonus,
        jumlah,
        keterangan || "-",
        periodeFinal,
        now,
      ],
    );

    res.json({
      success: true,
      message: "Bonus berhasil ditambahkan",
    });
  } catch (err) {
    console.error("❌ addBonus Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan bonus",
    });
  }
};

/* ============================================================
   🟢 UPDATE Gaji Pokok Berdasarkan ID
   ============================================================ */
export const updateGajiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { gaji_pokok, periode } = req.body;
    if (!gaji_pokok)
      return res.status(400).json({ message: "Gaji pokok wajib diisi" });

    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const [result] = await db.query(
      `UPDATE gaji_setting 
       SET gaji_pokok = ?, periode = ?, updated_at = ?
       WHERE id_gaji_setting = ?`,
      [gaji_pokok, periode || "Bulanan", now, id],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data gaji tidak ditemukan" });

    res.json({ success: true, message: "Data gaji pokok berhasil diperbarui" });
  } catch (err) {
    console.error("❌ DB Error updateGajiSetting:", err);
    res.status(500).json({ message: "Gagal memperbarui data gaji pokok" });
  }
};

/* ============================================================
   🟢 GET Semua Bonus
   ============================================================ */
export const getAllBonus = async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.id_bonus,
        b.id_capster,
        b.id_kasir,
        COALESCE(c.nama_capster, k.nama_kasir) AS nama,
        COALESCE(s.nama_store, '-') AS nama_store,
        CASE
          WHEN b.id_capster IS NOT NULL THEN 'Capster'
          WHEN b.id_kasir IS NOT NULL THEN 'Kasir'
        END AS jabatan,
        b.judul_bonus,
        b.jumlah,
        b.keterangan,
        b.periode,
        b.status,
        DATE_FORMAT(b.created_at, '%d %M %Y') AS tanggal
      FROM bonus b
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      LEFT JOIN kasir k ON b.id_kasir = k.id_kasir
      LEFT JOIN store s 
        ON s.id_store = COALESCE(c.id_store, k.id_store)
      ORDER BY b.created_at DESC
    `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllBonus Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data bonus",
    });
  }
};

/* ============================================================
   🟢 DELETE Gaji Pokok & Bonus
   ============================================================ */
export const deleteGajiSetting = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM gaji_setting WHERE id_gaji_setting = ?", [id]);
    res.json({ success: true, message: "Data gaji berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error deleteGajiSetting:", err);
    res.status(500).json({ message: "Gagal menghapus data gaji" });
  }
};

export const deleteBonus = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM bonus WHERE id_bonus = ?", [id]);
    res.json({ success: true, message: "Data bonus berhasil dihapus" });
  } catch (err) {
    console.error("❌ DB Error deleteBonus:", err);
    res.status(500).json({ message: "Gagal menghapus data bonus" });
  }
};

/* ============================================================
   🟢 GET Bonus by ID
   ============================================================ */
export const getBonusById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        b.*,
        COALESCE(c.nama_capster, k.nama_kasir) AS nama,
        CASE
          WHEN b.id_capster IS NOT NULL THEN 'Capster'
          WHEN b.id_kasir IS NOT NULL THEN 'Kasir'
        END AS jabatan
      FROM bonus b
      LEFT JOIN capster c ON b.id_capster = c.id_capster
      LEFT JOIN kasir k ON b.id_kasir = k.id_kasir
      WHERE b.id_bonus = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (!rows.length)
      return res.status(404).json({ message: "Bonus tidak ditemukan" });

    res.json(rows[0]); // ⬅ PENTING !!!
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil detail bonus" });
  }
};

/* ============================================================
   🟢 UPDATE Bonus
   ============================================================ */
export const updateBonus = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_capster, id_kasir, judul_bonus, jumlah, keterangan, periode } =
      req.body;

    // ===============================
    // 🔹 VALIDASI DASAR
    // ===============================
    if ((!id_capster && !id_kasir) || !judul_bonus || !jumlah) {
      return res.status(400).json({
        success: false,
        message: "Data bonus tidak lengkap",
      });
    }

    const periodeFinal = periode || dayjs().format("YYYY-MM");

    const [result] = await db.query(
      `UPDATE bonus 
       SET 
         id_capster = ?, 
         id_kasir = ?, 
         judul_bonus = ?, 
         jumlah = ?, 
         keterangan = ?, 
         periode = ?
       WHERE id_bonus = ?`,
      [
        id_capster || null,
        id_kasir || null,
        judul_bonus,
        jumlah,
        keterangan || "-",
        periodeFinal,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Bonus tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Bonus berhasil diperbarui",
    });
  } catch (err) {
    console.error("❌ updateBonus Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui bonus",
    });
  }
};

/* ============================================================
   🟢 UPDATE Status Bonus
   ============================================================ */
export const updateBonusStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["belum_diberikan", "sudah_diberikan"].includes(status))
      return res.status(400).json({ message: "Status tidak valid" });

    const [result] = await db.query(
      "UPDATE bonus SET status=? WHERE id_bonus=?",
      [status, id],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Bonus tidak ditemukan" });

    res.json({ success: true, message: "Status bonus berhasil diperbarui" });
  } catch (err) {
    console.error("❌ DB Error updateBonusStatus:", err);
    res.status(500).json({ message: "Gagal memperbarui status bonus" });
  }
};

/* ============================================================
   🟢 GET Slip Gaji
   ============================================================ */
export const getSlipGaji = async (req, res) => {
  try {
    const { role, id_kasir, id_capster, periode } = req.query;

    // =============================
    // 🎯 Gunakan periode FILTER
    // =============================
    let currentMonth = dayjs().format("YYYY-MM");

    if (periode && /^\d{4}-\d{2}$/.test(periode)) {
      currentMonth = periode;
    }

    // =============================
    // 🎯 AUTO POTONGAN KASBON
    // =============================
    const [kasbonAktif] = await db.query(
      `
      SELECT id_kasbon, sisa_kasbon, jumlah_total, jumlah_cicilan, 
             cicilan_terbayar, tanggal_pinjam
      FROM kasbon
      WHERE status = 'aktif'
        AND (
          (id_kasir = ? AND ? = 'kasir')
          OR (id_capster = ? AND ? = 'capster')
        )
      `,
      [id_kasir, role, id_capster, role],
    );

    for (const k of kasbonAktif) {
      const kasbonMonth = dayjs(k.tanggal_pinjam).format("YYYY-MM");

      // Jika bulan kasbon ≠ bulan slip yang diminta
      if (kasbonMonth !== currentMonth && k.sisa_kasbon > 0) {
        const [cek] = await db.query(
          `SELECT 1 FROM potongan_kasbon WHERE id_kasbon = ? AND periode = ?`,
          [k.id_kasbon, currentMonth],
        );

        if (cek.length === 0) {
          const totalCicilan = k.jumlah_cicilan > 0 ? k.jumlah_cicilan : 5;
          const potongan = Math.ceil(k.jumlah_total / totalCicilan);
          const sisaBaru = Math.max(0, k.sisa_kasbon - potongan);
          const cicilanTerbayarBaru = (k.cicilan_terbayar || 0) + 1;

          await db.query(
            `
            INSERT INTO potongan_kasbon 
            (id_kasbon, periode, jumlah_potongan, keterangan, tanggal_potong, tipe_potongan)
            VALUES (?, ?, ?, ?, CURDATE(), 'kasbon')
            `,
            [
              k.id_kasbon,
              currentMonth,
              potongan,
              `Potongan otomatis kasbon bulan ${dayjs(currentMonth).format(
                "MMMM YYYY",
              )}`,
            ],
          );

          await db.query(
            `
            UPDATE kasbon 
            SET sisa_kasbon = ?, cicilan_terbayar = ?, 
                status = IF(? <= 0, 'lunas', 'aktif')
            WHERE id_kasbon = ?
            `,
            [sisaBaru, cicilanTerbayarBaru, sisaBaru, k.id_kasbon],
          );
        }
      }
    }

    // =============================
    // 🎯 QUERY SLIP GAJI
    // =============================
    let sql, params;

    // === KASIR ===
    if (role === "kasir" && id_kasir) {
      sql = `
        SELECT 
          k.nama_kasir AS nama,
          s.nama_store,
          s.alamat_store,
          gs.gaji_pokok,
          gs.periode,
          (
            SELECT IFNULL(SUM(b.jumlah), 0)
            FROM bonus b
            WHERE b.id_kasir = k.id_kasir
              AND b.periode = ?
              AND b.status = 'sudah_diberikan'
          ) AS total_bonus,
          (
            SELECT GROUP_CONCAT(
              CONCAT(
                '{"judul_bonus":"', REPLACE(b.judul_bonus,'"','\\"'),
                '","jumlah":', b.jumlah,
                ',"keterangan":"', IFNULL(REPLACE(b.keterangan,'"','\\"'),'-'), '"}'
              ) SEPARATOR ','
            )
            FROM bonus b
            WHERE b.id_kasir = k.id_kasir
              AND b.periode = ?
              AND b.status = 'sudah_diberikan'
          ) AS daftar_bonus_raw
        FROM kasir k
        LEFT JOIN store s ON k.id_store = s.id_store
        LEFT JOIN gaji_setting gs ON gs.id_kasir = k.id_kasir
        WHERE k.id_kasir = ?
        GROUP BY k.id_kasir;
      `;
      params = [currentMonth, currentMonth, id_kasir];
    }

    // === CAPSTER ===
    else if (role === "capster" && id_capster) {
      sql = `
        SELECT 
          c.nama_capster AS nama,
          s.nama_store,
          s.alamat_store,
          gs.gaji_pokok,
          gs.periode,
          (
            SELECT IFNULL(SUM(b.jumlah), 0)
            FROM bonus b
            WHERE b.id_capster = c.id_capster
              AND b.periode = ?
              AND b.status = 'sudah_diberikan'
          ) AS total_bonus,
          (
            SELECT GROUP_CONCAT(
              CONCAT(
                '{"judul_bonus":"', REPLACE(b.judul_bonus,'"','\\"'),
                '","jumlah":', b.jumlah,
                ',"keterangan":"', IFNULL(REPLACE(b.keterangan,'"','\\"'),'-'), '"}'
              ) SEPARATOR ','
            )
            FROM bonus b
            WHERE b.id_capster = c.id_capster
              AND b.periode = ?
              AND b.status = 'sudah_diberikan'
          ) AS daftar_bonus_raw,
          (
            SELECT IFNULL(SUM(tsd.komisi_capster), 0)
            FROM transaksi_service_detail tsd
            WHERE tsd.id_capster = c.id_capster
              AND DATE_FORMAT(tsd.created_at, '%Y-%m') = ?
          ) AS total_komisi
        FROM capster c
        LEFT JOIN store s ON c.id_store = s.id_store
        LEFT JOIN gaji_setting gs ON gs.id_capster = c.id_capster
        WHERE c.id_capster = ?
        GROUP BY c.id_capster;
      `;
      params = [currentMonth, currentMonth, currentMonth, id_capster];
    } else {
      return res.status(400).json({
        success: false,
        message: "Parameter tidak valid (role, id_kasir/id_capster)",
      });
    }

    const [rows] = await db.query(sql, params);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: `Slip gaji bulan ${dayjs(currentMonth).format(
          "MMMM YYYY",
        )} tidak ditemukan`,
      });
    }

    const row = rows[0];

    // =============================
    // 🎯 Parse Daftar Bonus
    // =============================
    let daftar_bonus = [];
    try {
      if (row.daftar_bonus_raw)
        daftar_bonus = JSON.parse(`[${row.daftar_bonus_raw}]`);
    } catch {
      daftar_bonus = [];
    }

    // =============================
    // 🎯 AMBIL POTONGAN UMUM & KASBON
    // =============================
    const pegawaiId = role === "kasir" ? id_kasir : id_capster;

    const [potonganRows] = await db.query(
      `
      SELECT 
        pk.keterangan, 
        pk.jumlah_potongan AS jumlah,
        pk.tipe_potongan
      FROM potongan_kasbon pk
      LEFT JOIN kasbon k ON k.id_kasbon = pk.id_kasbon
      WHERE 
        (
          (pk.tipe_potongan = 'umum' AND ${
            role === "kasir" ? "pk.id_kasir = ?" : "pk.id_capster = ?"
          })
          OR
          (pk.tipe_potongan = 'kasbon' AND ${
            role === "kasir" ? "k.id_kasir = ?" : "k.id_capster = ?"
          })
        )
        AND (
          DATE_FORMAT(pk.tanggal_potong, '%Y-%m') = ?
          OR pk.periode = ?
        )
      ORDER BY pk.tanggal_potong DESC
      `,
      [pegawaiId, pegawaiId, currentMonth, currentMonth],
    );

    // =============================
    // 🎯 DETAIL KASBON (optional)
    // =============================
    const [kasbonRows] = await db.query(
      `
      SELECT k.keterangan, k.jumlah_total, k.sisa_kasbon,
             k.jumlah_cicilan, k.cicilan_terbayar, k.tanggal_pinjam
      FROM kasbon k
      WHERE ${role === "kasir" ? "k.id_kasir" : "k.id_capster"} = ?
        AND DATE_FORMAT(k.tanggal_pinjam, '%Y-%m') = ?
      `,
      [pegawaiId, currentMonth],
    );

    // =============================
    // 🎯 HITUNG TOTAL
    // =============================
    const potongan_bulan_ini = potonganRows.reduce(
      (a, b) => a + Number(b.jumlah || 0),
      0,
    );

    const total_diterima =
      Number(row.gaji_pokok || 0) +
      Number(row.total_bonus || 0) +
      (role === "capster" ? Number(row.total_komisi || 0) : 0) -
      potongan_bulan_ini;

    const [ownerRows] = await db.query(`SELECT nama_owner FROM profil LIMIT 1`);

    const nama_owner = ownerRows[0]?.nama_owner;

    // =============================
    // 🎯 RESPONSE FINAL
    // =============================
    res.json({
      success: true,
      data: {
        nama: row.nama,
        nama_store: row.nama_store,
        alamat_store: row.alamat_store,
        gaji_pokok: Number(row.gaji_pokok || 0),
        total_bonus: Number(row.total_bonus || 0),
        total_komisi: Number(row.total_komisi || 0),
        daftar_bonus,
        daftar_potongan: potonganRows,
        daftar_kasbon: kasbonRows,
        potongan_bulan_ini,
        total_diterima,
        periode: dayjs(currentMonth).format("MMMM YYYY"),
        periode_raw: currentMonth,
        nama_owner,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil slip gaji",
      error: err.message,
    });
  }
};

export const getAllPegawaiGaji = async (req, res) => {
  try {
    const sql = `
      SELECT 
        COALESCE(c.id_capster, NULL) AS id_capster,
        COALESCE(k.id_kasir, NULL) AS id_kasir,
        COALESCE(c.nama_capster, k.nama_kasir) AS nama,
        COALESCE(s.nama_store, '-') AS nama_store,
        COALESCE(gs.gaji_pokok, 0) AS gaji_pokok,
        CASE 
          WHEN c.id_capster IS NOT NULL THEN 'Capster'
          ELSE 'Kasir'
        END AS jabatan
      FROM (
        SELECT id_capster, NULL AS id_kasir FROM capster
        UNION ALL
        SELECT NULL, id_kasir FROM kasir
      ) u
      LEFT JOIN capster c ON u.id_capster = c.id_capster
      LEFT JOIN kasir k ON u.id_kasir = k.id_kasir
      LEFT JOIN store s 
        ON s.id_store = COALESCE(c.id_store, k.id_store)
      LEFT JOIN gaji_setting gs
        ON gs.id_capster = c.id_capster OR gs.id_kasir = k.id_kasir
      ORDER BY jabatan, nama ASC;
    `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data pegawai." });
  }
};
