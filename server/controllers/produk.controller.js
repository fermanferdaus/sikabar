import db from "../config/db.js";

// 🟢 Get Semua Produk (bisa filter by store)
export const getAllProduk = async (req, res) => {
  try {
    const id_store = req.user?.id_store || req.query.id_store;
    const query = `
      SELECT 
        p.id_produk, p.nama_produk, p.harga_awal, p.harga_jual,
        COALESCE(s.jumlah_stok, 0) AS stok
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
      [nama_produk]
    );

    if (exist.length) {
      const p = exist[0];
      if (
        Number(p.harga_awal) === Number(harga_awal) &&
        Number(p.harga_jual) === Number(harga_jual)
      ) {
        await db.query(
          `UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?`,
          [nama_produk, harga_awal, harga_jual, p.id_produk]
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
        [nama_produk, harga_awal, harga_jual]
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
    const { nama_produk, harga_awal, harga_jual } = req.body;
    await db.query(
      "UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?",
      [nama_produk, harga_awal, harga_jual, req.params.id]
    );
    res.json({ message: "Produk diperbarui" });
  } catch {
    res.status(500).json({ message: "Gagal update produk" });
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
    const { filterType, tanggal } = req.query;
    let dateFilter = "";
    if (filterType === "Harian" && tanggal)
      dateFilter = `WHERE DATE(sp.updated_at) = '${tanggal}'`;
    else if (filterType === "Bulanan" && tanggal) {
      const bulan = tanggal.slice(0, 7);
      dateFilter = `WHERE DATE_FORMAT(sp.updated_at, '%Y-%m') = '${bulan}'`;
    }

    const sql = `
      SELECT 
        st.id_store, st.nama_store,
        IFNULL(COUNT(DISTINCT sp.id_produk), 0) AS total_produk,
        IFNULL(SUM(sp.stok_akhir), 0) AS total_stok
      FROM store st
      LEFT JOIN stok_produk sp ON st.id_store = sp.id_store
      ${dateFilter}
      GROUP BY st.id_store, st.nama_store
      ORDER BY st.nama_store ASC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch {
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

    const [result] = await db.query(
      "DELETE FROM stok_produk WHERE id_store=? AND id_produk=?",
      [id_store, id_produk]
    );

    if (!result.affectedRows)
      return res.status(404).json({ message: "Stok produk tidak ditemukan" });

    res.json({ message: "Stok produk berhasil dihapus dari toko ini" });
  } catch {
    res.status(500).json({ message: "Gagal menghapus stok produk" });
  }
};

// === 2️⃣ Detail stok produk untuk store tertentu ===
export const getProdukByStore = async (req, res) => {
  try {
    const { id_store } = req.params;
    const { filterType, tanggal } = req.query;
    let dateCondition = "";
    if (filterType === "Harian" && tanggal)
      dateCondition = `AND DATE(t.created_at) = '${tanggal}'`;
    else if (filterType === "Bulanan" && tanggal) {
      const bulan = tanggal.slice(0, 7);
      dateCondition = `AND DATE_FORMAT(t.created_at, '%Y-%m') = '${bulan}'`;
    }

    const sql = `
      SELECT 
        p.id_produk, p.nama_produk, p.harga_awal, p.harga_jual,
        COALESCE(sp.stok_akhir, 0) AS stok_akhir_sistem,
        COALESCE((
          SELECT SUM(tp.jumlah)
          FROM transaksi_produk_detail tp
          JOIN transaksi t ON t.id_transaksi = tp.id_transaksi
          WHERE tp.id_produk = p.id_produk AND t.id_store = ?
          ${dateCondition}
        ), 0) AS terjual_periode,
        (COALESCE(sp.stok_akhir, 0) + COALESCE((
          SELECT SUM(tp.jumlah)
          FROM transaksi_produk_detail tp
          JOIN transaksi t ON t.id_transaksi = tp.id_transaksi
          WHERE tp.id_produk = p.id_produk AND t.id_store = ?
          ${dateCondition}
        ), 0)) AS stok_awal,
        (COALESCE(sp.stok_akhir, 0) - COALESCE((
          SELECT SUM(tp.jumlah)
          FROM transaksi_produk_detail tp
          JOIN transaksi t ON t.id_transaksi = tp.id_transaksi
          WHERE tp.id_produk = p.id_produk AND t.id_store = ?
          ${dateCondition}
        ), 0)) AS stok_sekarang,
        COALESCE((
          SELECT SUM(tp.laba_rugi)
          FROM transaksi_produk_detail tp
          JOIN transaksi t ON t.id_transaksi = tp.id_transaksi
          WHERE tp.id_produk = p.id_produk AND t.id_store = ?
          ${dateCondition}
        ), 0) AS total_laba,
        s.nama_store
      FROM produk p
      LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk AND sp.id_store = ?
      LEFT JOIN store s ON s.id_store = ?
      ORDER BY p.nama_produk ASC
    `;
    const [rows] = await db.query(sql, [
      id_store,
      id_store,
      id_store,
      id_store,
      id_store,
      id_store,
      id_store,
    ]);
    res.json(rows);
  } catch {
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

    const sql = `
      INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        jumlah_stok = jumlah_stok + VALUES(jumlah_stok),
        stok_akhir = stok_akhir + VALUES(stok_akhir)
    `;
    const [result] = await db.query(sql, [
      id_store,
      id_produk,
      jumlah_stok,
      jumlah_stok,
    ]);

    res.json({
      message: "Stok berhasil ditambahkan atau diperbarui",
      affectedRows: result.affectedRows,
    });
  } catch {
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

// 🟠 Update stok produk di store tertentu
export const updateStokProduk = async (req, res) => {
  try {
    const { id_store, id_produk, jumlah_stok } = req.body;
    if (!id_store || !id_produk || jumlah_stok == null)
      return res.status(400).json({ message: "Data stok tidak lengkap" });

    const [rows] = await db.query(
      "SELECT jumlah_stok, stok_akhir FROM stok_produk WHERE id_store=? AND id_produk=?",
      [id_store, id_produk]
    );
    const stokLama = rows[0] || { jumlah_stok: 0, stok_akhir: 0 };
    const selisih = jumlah_stok - stokLama.jumlah_stok;
    let stokAkhirBaru = stokLama.stok_akhir + selisih;
    if (stokAkhirBaru < 0) stokAkhirBaru = 0;

    await db.query(
      `
      INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        jumlah_stok = VALUES(jumlah_stok),
        stok_akhir = VALUES(stok_akhir),
        updated_at = NOW()
    `,
      [id_store, id_produk, jumlah_stok, stokAkhirBaru]
    );

    res.json({
      message: "Stok berhasil diperbarui dengan penyesuaian proporsional",
      stok_awal_lama: stokLama.jumlah_stok,
      stok_awal_baru: jumlah_stok,
      stok_akhir_baru: stokAkhirBaru,
    });
  } catch {
    res.status(500).json({ message: "Gagal memperbarui stok" });
  }
};

// 🟢 Kasir Tambah Produk + Stok Sekaligus
export const addProdukByKasir = async (req, res) => {
  try {
    const { id_store, nama_produk, harga_awal, harga_jual, jumlah_stok } =
      req.body;
    if (!id_store || !nama_produk || !harga_awal || !harga_jual)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const [exist] = await db.query(
      "SELECT id_produk, harga_awal, harga_jual FROM produk WHERE LOWER(nama_produk)=LOWER(?)",
      [nama_produk]
    );

    if (exist.length) {
      const p = exist[0];
      if (
        Number(p.harga_awal) === Number(harga_awal) &&
        Number(p.harga_jual) === Number(harga_jual)
      ) {
        await db.query(
          `
          INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            jumlah_stok = jumlah_stok + VALUES(jumlah_stok),
            stok_akhir = stok_akhir + VALUES(stok_akhir)
        `,
          [id_store, p.id_produk, jumlah_stok || 0, jumlah_stok || 0]
        );
        return res.json({
          message: "Produk sudah ada, stok diperbarui di toko ini",
          id_produk: p.id_produk,
        });
      } else {
        return res.status(400).json({
          message:
            "Nama produk sudah terdaftar dengan harga berbeda. Silakan ubah nama atau sesuaikan harga.",
        });
      }
    } else {
      const [inserted] = await db.query(
        "INSERT INTO produk (nama_produk, harga_awal, harga_jual) VALUES (?, ?, ?)",
        [nama_produk, harga_awal, harga_jual]
      );
      const id_produk = inserted.insertId;
      await db.query(
        "INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir) VALUES (?, ?, ?, ?)",
        [id_store, id_produk, jumlah_stok || 0, jumlah_stok || 0]
      );
      res.json({
        message: "Produk dan stok berhasil ditambahkan oleh kasir",
        id_produk,
      });
    }
  } catch {
    res.status(500).json({ message: "Gagal menambah produk oleh kasir" });
  }
};
