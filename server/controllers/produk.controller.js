import db from "../config/db.js";

export const getAllProduk = (req, res) => {
  const id_store = req.user?.id_store || req.query.id_store;

  const query = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      p.harga_awal,
      p.harga_jual,
      COALESCE(s.jumlah_stok, 0) AS stok
    FROM produk p
    LEFT JOIN stok_produk s 
      ON p.id_produk = s.id_produk 
      ${id_store ? "AND s.id_store = ?" : ""}
    ORDER BY p.id_produk DESC
  `;

  db.query(query, id_store ? [id_store] : [], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    res.json(result);
  });
};

export const getProdukById = (req, res) => {
  db.query(
    "SELECT * FROM produk WHERE id_produk = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error" });
      if (result.length === 0)
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

export const createProduk = (req, res) => {
  const { nama_produk, harga_awal, harga_jual } = req.body;

  if (!nama_produk || !harga_awal || !harga_jual) {
    return res.status(400).json({ message: "Data produk tidak lengkap" });
  }

  // 🔹 Cek apakah nama produk sudah ada di tabel
  const checkNameSql = `
    SELECT id_produk, harga_awal, harga_jual 
    FROM produk 
    WHERE LOWER(nama_produk) = LOWER(?)
  `;

  db.query(checkNameSql, [nama_produk], (err, rows) => {
    if (err) {
      console.error("  DB Error saat cek produk:", err);
      return res.status(500).json({ message: "Gagal mengecek produk" });
    }

    if (rows.length > 0) {
      const existing = rows[0];

      // 🔸 Kasus 1: nama sama & harga juga sama → update
      if (
        Number(existing.harga_awal) === Number(harga_awal) &&
        Number(existing.harga_jual) === Number(harga_jual)
      ) {
        const id_produk = existing.id_produk;
        db.query(
          `UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?`,
          [nama_produk, harga_awal, harga_jual, id_produk],
          (err) => {
            if (err) {
              console.error("  Gagal update produk:", err);
              return res
                .status(500)
                .json({ message: "Gagal memperbarui produk" });
            }
            return res.json({
              message: "Produk sudah ada, data diperbarui",
              id: id_produk,
              updated: true,
            });
          }
        );
      } else {
        // 🔸 Kasus 2: nama sama tapi harga beda → kirim alert error
        return res.status(400).json({
          message:
            "Nama produk sudah terdaftar dengan harga berbeda. Silakan ubah harga atau nama produk.",
        });
      }
    } else {
      // 🔹 Kasus 3: nama belum ada → tambahkan
      db.query(
        `INSERT INTO produk (nama_produk, harga_awal, harga_jual) VALUES (?, ?, ?)`,
        [nama_produk, harga_awal, harga_jual],
        (err, result) => {
          if (err) {
            console.error("  Gagal menambah produk:", err);
            return res.status(500).json({ message: "Gagal menambah produk" });
          }

          res.json({
            message: "Produk baru berhasil ditambahkan",
            id: result.insertId,
            updated: false,
          });
        }
      );
    }
  });
};

export const updateProduk = (req, res) => {
  const { nama_produk, harga_awal, harga_jual } = req.body;
  db.query(
    "UPDATE produk SET nama_produk=?, harga_awal=?, harga_jual=? WHERE id_produk=?",
    [nama_produk, harga_awal, harga_jual, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal update produk" });
      res.json({ message: "Produk diperbarui" });
    }
  );
};

export const deleteProduk = (req, res) => {
  db.query("DELETE FROM produk WHERE id_produk=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus" });
    res.json({ message: "Produk dihapus" });
  });
};

// === 1. Ambil total stok per store ===
export const getStokPerStore = (req, res) => {
  const sql = `
    SELECT 
      st.id_store,
      st.nama_store,
      IFNULL(COUNT(DISTINCT s.id_produk), 0) AS total_produk,
      IFNULL(SUM(s.stok_akhir), 0) AS total_stok
    FROM store st
    LEFT JOIN stok_produk s ON st.id_store = s.id_store
    GROUP BY st.id_store, st.nama_store
    ORDER BY st.nama_store ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "DB Error", err });
    }
    res.json(result);
  });
};

// 🗑️ Hapus stok produk hanya di toko tertentu (bukan hapus produk global)
export const deleteStokProduk = (req, res) => {
  const { id_store, id_produk } = req.params;
  const role = req.user.role;
  const userStore = req.user.id_store;

  if (!id_store || !id_produk) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // 🔒 Cegah kasir hapus produk di store lain
  if (role === "kasir" && userStore != id_store) {
    return res
      .status(403)
      .json({ message: "Kasir tidak boleh menghapus produk di store lain" });
  }

  const sql = `DELETE FROM stok_produk WHERE id_store = ? AND id_produk = ?`;

  db.query(sql, [id_store, id_produk], (err, result) => {
    if (err) {
      console.error("  DB Error deleteStokProduk:", err);
      return res.status(500).json({ message: "Gagal menghapus stok produk" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stok produk tidak ditemukan" });
    }

    res.json({ message: "Stok produk berhasil dihapus dari toko ini" });
  });
};

// === 2. Ambil detail stok produk untuk store tertentu ===
export const getProdukByStore = (req, res) => {
  const { id_store } = req.params;

  const sql = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      p.harga_awal,
      p.harga_jual,
      COALESCE(sp.jumlah_stok, 0) AS stok_awal,
      COALESCE(sp.stok_akhir, sp.jumlah_stok) AS stok_sekarang,
      COALESCE((
        SELECT SUM(tp.laba_rugi)
        FROM transaksi_produk_detail tp
        JOIN transaksi t ON t.id_transaksi = tp.id_transaksi
        WHERE tp.id_produk = p.id_produk
        AND t.id_store = ?
      ), 0) AS total_laba,
      s.nama_store
    FROM produk p
    INNER JOIN stok_produk sp 
      ON sp.id_produk = p.id_produk 
      AND sp.id_store = ?
    LEFT JOIN store s 
      ON s.id_store = sp.id_store
    ORDER BY p.nama_produk ASC;
  `;

  db.query(sql, [id_store, id_store], (err, result) => {
    if (err) {
      console.error("  DB Error getProdukByStore:", err);
      return res.status(500).json({ message: "Gagal mengambil data stok" });
    }
    res.json(result);
  });
};

// === Tambah stok untuk produk tertentu di store ===
export const addStokProduk = (req, res) => {
  const { id_store, id_produk, jumlah_stok } = req.body;
  const role = req.user.role;
  const userStore = req.user.id_store;

  if (!id_store || !id_produk || jumlah_stok == null) {
    return res.status(400).json({ message: "Data stok tidak lengkap" });
  }

  if (role === "kasir" && userStore != id_store) {
    return res
      .status(403)
      .json({ message: "Kasir tidak boleh menambah stok di store lain" });
  }

  const sql = `
    INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      jumlah_stok = jumlah_stok + VALUES(jumlah_stok),
      stok_akhir = stok_akhir + VALUES(stok_akhir)
  `;

  db.query(
    sql,
    [id_store, id_produk, jumlah_stok, jumlah_stok],
    (err, result) => {
      if (err) {
        console.error("  DB Error addStokProduk:", err);
        return res.status(500).json({ message: "Gagal menambah stok", err });
      }

      res.json({
        message: "Stok berhasil ditambahkan atau diperbarui",
        affectedRows: result.affectedRows,
      });
    }
  );
};

// === Ambil stok dan detail produk di store tertentu ===
export const getStokByStoreAndProduk = (req, res) => {
  const { id_store, id_produk } = req.params;

  if (!id_store || !id_produk)
    return res.status(400).json({ message: "Parameter tidak lengkap" });

  const sql = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      p.harga_awal,
      p.harga_jual,
      COALESCE(sp.jumlah_stok, 0) AS stok_sekarang,
      COALESCE(sp.stok_akhir, 0) AS stok_akhir,
      COALESCE(s.nama_store, '') AS nama_store
    FROM produk p
    LEFT JOIN stok_produk sp 
      ON sp.id_produk = p.id_produk 
      AND sp.id_store = ?
    LEFT JOIN store s 
      ON s.id_store = ?
    WHERE p.id_produk = ?
  `;

  db.query(sql, [id_store, id_store, id_produk], (err, result) => {
    if (err) {
      console.error("  DB Error getStokByStoreAndProduk:", err);
      return res.status(500).json({ message: "Gagal mengambil data produk" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Produk tidak ditemukan di tabel produk" });
    }

    const produk = result[0];
    produk.stok_sekarang = produk.stok_sekarang || 0;

    res.json(produk);
  });
};

// === Update stok produk di store tertentu ===
export const updateStokProduk = (req, res) => {
  const { id_store, id_produk, jumlah_stok } = req.body;

  if (!id_store || !id_produk || jumlah_stok == null) {
    return res.status(400).json({ message: "Data stok tidak lengkap" });
  }

  // 🔹 Ambil stok lama untuk hitung selisih
  const getSql = `
    SELECT jumlah_stok, stok_akhir 
    FROM stok_produk 
    WHERE id_store = ? AND id_produk = ?
  `;

  db.query(getSql, [id_store, id_produk], (err, rows) => {
    if (err) {
      console.error("  DB Error saat ambil stok lama:", err);
      return res.status(500).json({ message: "Gagal mengambil stok lama" });
    }

    const stokLama = rows[0] || { jumlah_stok: 0, stok_akhir: 0 };
    const selisih = jumlah_stok - stokLama.jumlah_stok;
    let stokAkhirBaru = stokLama.stok_akhir + selisih;

    // Pastikan stok_akhir tidak negatif
    if (stokAkhirBaru < 0) stokAkhirBaru = 0;

    // 🔹 Update stok
    const updateSql = `
      INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        jumlah_stok = VALUES(jumlah_stok),
        stok_akhir = VALUES(stok_akhir),
        updated_at = NOW()
    `;

    db.query(
      updateSql,
      [id_store, id_produk, jumlah_stok, stokAkhirBaru],
      (err2) => {
        if (err2) {
          console.error("  DB Error updateStokProduk:", err2);
          return res.status(500).json({ message: "Gagal memperbarui stok" });
        }

        res.json({
          message:
            "Stok berhasil diperbarui dengan penyesuaian proporsional",
          stok_awal_lama: stokLama.jumlah_stok,
          stok_awal_baru: jumlah_stok,
          stok_akhir_baru: stokAkhirBaru,
        });
      }
    );
  });
};

// === Kasir Tambah Produk + Stok Sekaligus ===
export const addProdukByKasir = (req, res) => {
  const { id_store, nama_produk, harga_awal, harga_jual, jumlah_stok } =
    req.body;

  if (!id_store || !nama_produk || !harga_awal || !harga_jual) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // 🔹 1️⃣ Cek apakah nama produk sudah ada
  const checkNameSql = `
    SELECT id_produk, harga_awal, harga_jual 
    FROM produk 
    WHERE LOWER(nama_produk) = LOWER(?)
  `;

  db.query(checkNameSql, [nama_produk], (err, rows) => {
    if (err) {
      console.error("  DB Error saat cek produk (kasir):", err);
      return res.status(500).json({ message: "Gagal mengecek produk" });
    }

    if (rows.length > 0) {
      const existing = rows[0];

      // 🔸 Kasus 1: nama sama & harga sama → pakai id lama
      if (
        Number(existing.harga_awal) === Number(harga_awal) &&
        Number(existing.harga_jual) === Number(harga_jual)
      ) {
        const id_produk = existing.id_produk;

        // Tambahkan stok di toko kasir
        const insertStokSql = `
          INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            jumlah_stok = jumlah_stok + VALUES(jumlah_stok),
            stok_akhir = stok_akhir + VALUES(stok_akhir)
        `;

        db.query(
          insertStokSql,
          [id_store, id_produk, jumlah_stok || 0, jumlah_stok || 0],
          (err2) => {
            if (err2) {
              console.error("  DB Error saat tambah stok:", err2);
              return res
                .status(500)
                .json({ message: "Produk sudah ada tapi gagal menambah stok" });
            }

            return res.json({
              message: "Produk sudah ada, stok diperbarui di toko ini",
              id_produk,
            });
          }
        );
      } else {
        // 🔸 Kasus 2: nama sama tapi harga beda → error
        return res.status(400).json({
          message:
            "Nama produk sudah terdaftar dengan harga berbeda. Silakan ubah nama atau sesuaikan harga.",
        });
      }
    } else {
      // 🔹 2️⃣ Jika produk belum ada → buat baru
      const insertProdukSql = `
        INSERT INTO produk (nama_produk, harga_awal, harga_jual)
        VALUES (?, ?, ?)
      `;
      db.query(
        insertProdukSql,
        [nama_produk, harga_awal, harga_jual],
        (err, result) => {
          if (err) {
            console.error("  DB Error saat menambah produk (kasir):", err);
            return res
              .status(500)
              .json({ message: "Gagal menambah produk baru" });
          }

          const id_produk = result.insertId;

          const insertStokSql = `
            INSERT INTO stok_produk (id_store, id_produk, jumlah_stok, stok_akhir)
            VALUES (?, ?, ?, ?)
          `;
          db.query(
            insertStokSql,
            [id_store, id_produk, jumlah_stok || 0, jumlah_stok || 0],
            (err2) => {
              if (err2) {
                console.error("DB Error saat menambah stok (kasir):", err2);
                return res.status(500).json({
                  message: "Produk dibuat, tapi gagal menambah stok",
                });
              }

              return res.json({
                message: "Produk dan stok berhasil ditambahkan oleh kasir",
                id_produk,
              });
            }
          );
        }
      );
    }
  });
};
