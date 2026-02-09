import db from "../config/db.js";
import dayjs from "dayjs";

// 🟢 Get Semua Produk (bisa filter by store)
export const getAllProduk = async (req, res) => {
  try {
    const id_store = req.user?.id_store || req.query.id_store;
    const query = `
      SELECT 
        p.id_produk, p.nama_produk, p.harga_awal, p.harga_jual,
        COALESCE(s.stok_akhir, 0) AS stok
      FROM produk p
      LEFT JOIN stok_produk s 
        ON p.id_produk = s.id_produk 
        ${id_store ? "AND s.id_store = ?" : ""}
      ORDER BY p.id_produk DESC
    `;
    const [rows] = await db.query(query, id_store ? [id_store] : []);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "DB Error" });
  }
};

// 🟢 Get Produk by ID
export const getProdukById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM produk WHERE id_produk = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB Error" });
  }
};

// 🟡 Tambah Produk (dengan validasi duplikasi nama/harga)
export const createProduk = async (req, res) => {
  try {
    const { nama_produk, harga_awal, harga_jual } = req.body;
    if (!nama_produk || !harga_awal || !harga_jual)
      return res.status(400).json({ message: "Data produk tidak lengkap" });

    const [exist] = await db.query(
      `SELECT id_produk, harga_awal, harga_jual FROM produk WHERE LOWER(nama_produk) = LOWER(?)`,
      [nama_produk],
    );

    if (exist.length) {
      const p = exist[0];
      if (
        Number(p.harga_awal) === Number(harga_awal) &&
        Number(p.harga_jual) === Number(harga_jual)
      ) {
        await db.query(
          `UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?`,
          [nama_produk, harga_awal, harga_jual, p.id_produk],
        );
        return res.json({
          message: "Produk sudah ada, data diperbarui",
          id: p.id_produk,
          updated: true,
        });
      } else {
        return res.status(400).json({
          message:
            "Nama produk sudah terdaftar dengan harga berbeda. Silakan ubah harga atau nama produk.",
        });
      }
    } else {
      const [result] = await db.query(
        `INSERT INTO produk (nama_produk, harga_awal, harga_jual) VALUES (?, ?, ?)`,
        [nama_produk, harga_awal, harga_jual],
      );
      res.json({
        message: "Produk baru berhasil ditambahkan",
        id: result.insertId,
        updated: false,
      });
    }
  } catch {
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

// 🟠 Update Produk
export const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_store, nama_produk, harga_awal, harga_jual, jumlah_stok } =
      req.body;

    await db.query(
      `
      UPDATE produk
      SET nama_produk=?, harga_awal=?, harga_jual=?
      WHERE id_produk=?
      `,
      [nama_produk, harga_awal, harga_jual, id],
    );

    if (id_store && jumlah_stok !== undefined) {
      const [[stok]] = await db.query(
        `
        SELECT jumlah_stok
        FROM stok_produk
        WHERE id_store=? AND id_produk=?
        `,
        [id_store, id],
      );

      if (!stok) {
        return res.status(404).json({
          message: "Data stok produk tidak ditemukan",
        });
      }

      const stokBaru = Number(jumlah_stok);
      const stokLama = Number(stok.jumlah_stok);
      const delta = stokBaru - stokLama;

      if (delta !== 0) {
        await db.query(
          `
          INSERT INTO stok_ledger
          (id_store, id_produk, tanggal, perubahan, tipe, keterangan)
          VALUES (?, ?, CURDATE(), ?, 'adjustment', 'Edit stok produk')
          `,
          [id_store, id, delta],
        );

        await db.query(
          `
          UPDATE stok_produk
          SET
            jumlah_stok = ?,
            stok_akhir  = stok_akhir + ?
          WHERE id_store=? AND id_produk=?
          `,
          [stokBaru, delta, id_store, id],
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("updateProduk Error:", err);
    res.status(500).json({
      message: "Gagal memperbarui produk",
    });
  }
};

// 🔴 Hapus Produk
export const deleteProduk = async (req, res) => {
  try {
    await db.query("DELETE FROM produk WHERE id_produk=?", [req.params.id]);
    res.json({ message: "Produk dihapus" });
  } catch {
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
};

// === 1️⃣ Total stok per store ===
export const getStokPerStore = async (req, res) => {
  try {
    const sql = `
      SELECT 
        st.id_store,
        st.nama_store,
        COUNT(DISTINCT sp.id_produk) AS total_produk,
        SUM(sp.stok_akhir) AS total_stok
      FROM store st
      LEFT JOIN stok_produk sp ON st.id_store = sp.id_store
      GROUP BY st.id_store, st.nama_store
      ORDER BY st.nama_store ASC
    `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ getStokPerStore Error:", err);
    res.status(500).json({ message: "Gagal mengambil data stok" });
  }
};

// 🗑️ Hapus stok produk di toko tertentu
export const deleteStokProduk = async (req, res) => {
  try {
    const { id_store, id_produk } = req.params;
    const role = req.user.role;
    const userStore = req.user.id_store;

    if (!id_store || !id_produk)
      return res.status(400).json({ message: "Data tidak lengkap" });

    if (role === "kasir" && userStore != id_store)
      return res
        .status(403)
        .json({ message: "Kasir tidak boleh hapus produk di store lain" });

    // 🔹 Cek stok
    const [cek] = await db.query(
      "SELECT stok_akhir FROM stok_produk WHERE id_store=? AND id_produk=?",
      [id_store, id_produk],
    );

    if (!cek.length)
      return res.status(404).json({ message: "Data stok tidak ditemukan" });

    // 🔹 Hapus langsung barisnya tanpa reset dulu
    await db.query("DELETE FROM stok_produk WHERE id_store=? AND id_produk=?", [
      id_store,
      id_produk,
    ]);

    res.json({ message: "Data stok produk berhasil dihapus permanen" });
  } catch (err) {
    console.error("❌ deleteStokProduk Error:", err);
    res.status(500).json({ message: "Gagal menghapus stok produk" });
  }
};

// === 2️⃣ Detail stok produk untuk store tertentu ===
export const getProdukByStore = async (req, res) => {
  try {
    const { id_store } = req.params;
    const { filterType, tanggal } = req.query;

    const bulanSekarang = dayjs().format("YYYY-MM");
    const bulanDipilih =
      filterType === "Bulanan" && tanggal ? tanggal.slice(0, 7) : bulanSekarang;

    const isBulanAktif = bulanDipilih === bulanSekarang;

    let sql;
    let params;

    if (isBulanAktif) {
      sql = `
        SELECT 
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          sp.jumlah_stok AS stok_awal,
          sp.stok_akhir AS stok_sekarang,
          s.nama_store,
          COALESCE(SUM(tp.jumlah), 0) AS terjual,
          COALESCE(SUM(tp.laba_rugi), 0) AS total_laba
        FROM stok_produk sp
        JOIN produk p ON p.id_produk = sp.id_produk
        JOIN store s ON s.id_store = sp.id_store
        LEFT JOIN transaksi_produk_detail tp
          ON tp.id_produk = p.id_produk
        LEFT JOIN transaksi t
          ON t.id_transaksi = tp.id_transaksi
         AND t.id_store = sp.id_store
         AND DATE_FORMAT(t.created_at, '%Y-%m') = ?
        WHERE sp.id_store = ?
        GROUP BY p.id_produk
        ORDER BY p.nama_produk ASC
      `;
      params = [bulanDipilih, id_store];
    } else {
      sql = `
        SELECT 
          p.id_produk,
          p.nama_produk,
          p.harga_awal,
          p.harga_jual,
          ss.stok_awal,
          ss.stok_akhir AS stok_sekarang,
          s.nama_store,
          0 AS terjual,
          0 AS total_laba
        FROM stok_snapshot_bulanan ss
        JOIN produk p ON p.id_produk = ss.id_produk
        JOIN store s ON s.id_store = ss.id_store
        WHERE ss.id_store = ?
          AND ss.bulan = ?
        ORDER BY p.nama_produk ASC
      `;
      params = [id_store, bulanDipilih];
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("getProdukByStore Error:", err);
    res.status(500).json({ message: "Gagal mengambil data stok" });
  }
};

// 🟢 Tambah stok untuk produk di store
export const addStokProduk = async (req, res) => {
  try {
    const { id_store, id_produk, jumlah_stok } = req.body;
    const role = req.user.role;
    const userStore = req.user.id_store;

    if (!id_store || !id_produk || jumlah_stok == null)
      return res.status(400).json({ message: "Data stok tidak lengkap" });

    if (role === "kasir" && userStore != id_store)
      return res
        .status(403)
        .json({ message: "Kasir tidak boleh menambah stok di store lain" });

    /* ======================================================
       1️⃣ PASTIKAN stok_produk ADA (CACHE)
    ====================================================== */
    await db.query(
      `
      INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
      VALUES (?, ?, 0, 0)
      ON DUPLICATE KEY UPDATE id_store = id_store
      `,
      [id_store, id_produk],
    );

    /* ======================================================
       2️⃣ CEK stok_awal DI LEDGER
    ====================================================== */
    const [[stokAwal]] = await db.query(
      `
      SELECT perubahan
      FROM stok_ledger
      WHERE id_store=? AND id_produk=? AND tipe='stok_awal'
      `,
      [id_store, id_produk],
    );

    if (!stokAwal) {
      /* ======================================================
         3️⃣ BELUM ADA stok_awal → INPUT INI JADI stok_awal
      ====================================================== */
      await db.query(
        `
        INSERT INTO stok_ledger
        (id_store, id_produk, tanggal, perubahan, tipe, keterangan)
        VALUES (?, ?, CURDATE(), ?, 'stok_awal', 'Stok awal produk')
        `,
        [id_store, id_produk, Number(jumlah_stok)],
      );

      await db.query(
        `
        UPDATE stok_produk
        SET jumlah_stok = ?
        WHERE id_store=? AND id_produk=?
        `,
        [jumlah_stok, id_store, id_produk],
      );
    } else {
      /* ======================================================
         4️⃣ SUDAH ADA stok_awal → INI RESTOCK
      ====================================================== */
      await db.query(
        `
        INSERT INTO stok_ledger
        (id_store, id_produk, tanggal, perubahan, tipe, keterangan)
        VALUES (?, ?, CURDATE(), ?, 'restock', 'Tambah stok')
        `,
        [id_store, id_produk, Number(jumlah_stok)],
      );
    }

    /* ======================================================
       5️⃣ SYNC stok_sekarang DARI LEDGER
    ====================================================== */
    await db.query(
      `
      UPDATE stok_produk
      SET stok_akhir = (
        SELECT COALESCE(SUM(perubahan),0)
        FROM stok_ledger
        WHERE id_store=? AND id_produk=?
      )
      WHERE id_store=? AND id_produk=?
      `,
      [id_store, id_produk, id_store, id_produk],
    );

    res.json({
      success: true,
      message: "Stok berhasil ditambahkan",
    });
  } catch (err) {
    console.error("❌ addStokProduk Error:", err);
    res.status(500).json({ message: "Gagal menambah stok" });
  }
};

// 🟢 Ambil stok + detail produk di store tertentu
export const getStokByStoreAndProduk = async (req, res) => {
  try {
    const { id_store, id_produk } = req.params;
    if (!id_store || !id_produk)
      return res.status(400).json({ message: "Parameter tidak lengkap" });

    const sql = `
      SELECT 
        p.id_produk, p.nama_produk, p.harga_awal, p.harga_jual,
        COALESCE(sp.jumlah_stok, 0) AS stok_sekarang,
        COALESCE(sp.stok_akhir, 0) AS stok_akhir,
        COALESCE(s.nama_store, '') AS nama_store
      FROM produk p
      LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk AND sp.id_store = ?
      LEFT JOIN store s ON s.id_store = ?
      WHERE p.id_produk = ?
    `;
    const [rows] = await db.query(sql, [id_store, id_store, id_produk]);
    if (!rows.length)
      return res
        .status(404)
        .json({ message: "Produk tidak ditemukan di tabel produk" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data produk" });
  }
};

// 🟠 Update stok produk di store tertentu (VERSI HISTORIS BENAR)
export const updateStokProduk = async (req, res) => {
  try {
    const { id_store, id_produk, jumlah_stok: stokAwalBaru } = req.body;

    // 1️⃣ Ambil kondisi saat ini
    const [[data]] = await db.query(
      `
      SELECT jumlah_stok AS stok_awal_lama, stok_akhir
      FROM stok_produk
      WHERE id_store=? AND id_produk=?
      `,
      [id_store, id_produk],
    );

    if (!data)
      return res.status(404).json({ message: "Data stok tidak ditemukan" });

    const { stok_awal_lama, stok_akhir } = data;

    // 2️⃣ Hitung selisih stok_awal
    const delta = stokAwalBaru - stok_awal_lama;

    // 3️⃣ SIMPAN SEBAGAI ADJUSTMENT (BUKAN stok_awal)
    await db.query(
      `
      INSERT INTO stok_ledger
      (id_store, id_produk, tanggal, perubahan, tipe, keterangan)
      VALUES (?, ?, CURDATE(), ?, 'adjustment', 'Edit stok awal')
      `,
      [id_store, id_produk, delta],
    );

    // 4️⃣ Update cache
    await db.query(
      `
      UPDATE stok_produk
      SET
        jumlah_stok = ?,
        stok_akhir  = stok_akhir + ?
      WHERE id_store=? AND id_produk=?
      `,
      [stokAwalBaru, delta, id_store, id_produk],
    );

    res.json({
      success: true,
      stok_awal_lama,
      stok_awal_baru: stokAwalBaru,
      stok_sekarang_baru: stok_akhir + delta,
    });
  } catch (err) {
    console.error("updateStokProduk Error:", err);
    res.status(500).json({ message: "Gagal update stok" });
  }
};

// 🟢 Kasir Tambah Produk + Stok Sekaligus
export const addProdukByKasir = async (req, res) => {
  try {
    const {
      id_store,
      nama_produk,
      harga_awal,
      harga_jual,
      jumlah_stok = 0,
    } = req.body;

    // 1️⃣ cek / buat produk
    const [exist] = await db.query(
      `SELECT id_produk FROM produk WHERE LOWER(nama_produk)=LOWER(?)`,
      [nama_produk],
    );

    let id_produk;
    if (exist.length) {
      id_produk = exist[0].id_produk;
    } else {
      const [inserted] = await db.query(
        `INSERT INTO produk (nama_produk, harga_awal, harga_jual)
         VALUES (?, ?, ?)`,
        [nama_produk, harga_awal, harga_jual],
      );
      id_produk = inserted.insertId;
    }

    // 2️⃣ simpan stok awal (CACHE)
    await db.query(
      `
      INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        jumlah_stok = VALUES(jumlah_stok),
        stok_akhir  = VALUES(stok_akhir)
      `,
      [id_store, id_produk, jumlah_stok, jumlah_stok],
    );

    // stok_awal HANYA SAAT PERTAMA KALI
    await db.query(
      `
      INSERT INTO stok_ledger
      (id_store, id_produk, tanggal, perubahan, tipe, keterangan)
      VALUES (?, ?, CURDATE(), ?, 'stok_awal', 'Stok awal produk')
      `,
      [id_store, id_produk, jumlah_stok],
    );

    // 🔥 SYNC stok_akhir dari ledger (WAJIB)
    await db.query(
      `
      UPDATE stok_produk
      SET stok_akhir = (
        SELECT COALESCE(SUM(perubahan),0)
        FROM stok_ledger
        WHERE id_store=? AND id_produk=?
      )
      WHERE id_store=? AND id_produk=?
      `,
      [id_store, id_produk, id_store, id_produk],
    );

    res.json({ success: true, id_produk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

export const closingStokBulanan = async (req, res) => {
  try {
    const { bulan } = req.body;
    if (!bulan) return res.status(400).json({ message: "Bulan wajib diisi" });

    const [[exist]] = await db.query(
      `SELECT 1 FROM stok_snapshot_bulanan WHERE bulan=? LIMIT 1`,
      [bulan],
    );

    if (exist) {
      return res.json({
        success: true,
        message: `Closing bulan ${bulan} sudah ada (skip)`,
        skipped: true,
      });
    }

    await db.query(
      `
      INSERT INTO stok_snapshot_bulanan
      (id_store, id_produk, bulan, stok_awal, stok_akhir)
      SELECT
        sp.id_store,
        sp.id_produk,
        ?,
        sp.jumlah_stok,
        sp.stok_akhir
      FROM stok_produk sp
      WHERE EXISTS (
        SELECT 1 FROM stok_ledger sl
        WHERE sl.id_store = sp.id_store
          AND sl.id_produk = sp.id_produk
          AND DATE_FORMAT(sl.tanggal, '%Y-%m') <= ?
      )
      `,
      [bulan, bulan],
    );

    res.json({
      success: true,
      message: `Closing stok bulan ${bulan} berhasil`,
    });
  } catch (err) {
    console.error("❌ closingStokBulanan Error:", err);
    res.status(500).json({ message: "Gagal closing stok" });
  }
};
