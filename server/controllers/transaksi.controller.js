import db from "../config/db.js";
import dayjs from "dayjs";

// 🟢 Get Semua Transaksi berdasarkan store kasir login
export const getTransaksiByStore = (req, res) => {
  const { id_store } = req.user;
  const { type = "Bulanan", tanggal } = req.query;
  const date = tanggal ? dayjs(tanggal) : dayjs();

  let dateCondition = "";
  if (type === "Harian") {
    dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
  } else if (type === "Bulanan") {
    dateCondition = `AND MONTH(t.created_at) = ${date.month() + 1}
                     AND YEAR(t.created_at) = ${date.year()}`;
  }

  const sql = `
    SELECT 
      t.id_transaksi,
      t.tipe_transaksi,
      t.metode_bayar,
      t.subtotal,
      t.jumlah_bayar,
      t.created_at,
      u.nama_user AS kasir,
      s.nama_store,
      GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', ') AS produk,
      GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', ') AS layanan
    FROM transaksi t
    JOIN users u ON t.id_user = u.id_user
    JOIN store s ON t.id_store = s.id_store
    LEFT JOIN transaksi_produk_detail tpd ON t.id_transaksi = tpd.id_transaksi
    LEFT JOIN produk p ON tpd.id_produk = p.id_produk
    LEFT JOIN transaksi_service_detail tsd ON t.id_transaksi = tsd.id_transaksi
    LEFT JOIN pricelist pr ON tsd.id_pricelist = pr.id_pricelist
    WHERE t.id_store = ? ${dateCondition}
    GROUP BY 
      t.id_transaksi, 
      t.tipe_transaksi, 
      t.metode_bayar, 
      t.subtotal, 
      t.jumlah_bayar, 
      t.created_at, 
      u.nama_user, 
      s.nama_store
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [id_store], (err, result) => {
    if (err) {
      console.error("❌ DB Error getTransaksiByStore:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil riwayat transaksi" });
    }
    res.json(result);
  });
};

// 🟢 Get Semua Transaksi (Admin)
export const getAllTransaksi = (req, res) => {
  db.query(
    `SELECT t.*, s.nama_store, u.nama_user 
     FROM transaksi t 
     JOIN store s ON t.id_store = s.id_store 
     JOIN users u ON t.id_user = u.id_user
     ORDER BY t.created_at DESC`,
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal ambil data transaksi" });
      res.json(result);
    }
  );
};

// 🟢 Laporan transaksi per toko (admin)
export const getLaporanTransaksi = (req, res) => {
  const { type = "Bulanan", tanggal } = req.query;
  const date = tanggal ? dayjs(tanggal) : dayjs();

  // filter tanggal dinamis
  let dateCondition = "";
  if (type === "Harian") {
    dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
  } else if (type === "Bulanan") {
    dateCondition = `AND MONTH(t.created_at) = ${date.month() + 1}
                     AND YEAR(t.created_at) = ${date.year()}`;
  }

  const sql = `
    SELECT 
      s.id_store,
      s.nama_store,
      COUNT(t.id_transaksi) AS total_transaksi,
      COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor
    FROM store s
    LEFT JOIN transaksi t ON s.id_store = t.id_store ${dateCondition}
    GROUP BY s.id_store, s.nama_store
    ORDER BY pendapatan_kotor DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error laporan:", err);
      return res.status(500).json({ message: "Gagal ambil laporan transaksi" });
    }
    res.json(result);
  });
};

export const getTransaksiByStoreAdmin = (req, res) => {
  const { id_store } = req.params;
  const { type = "Bulanan", tanggal } = req.query;
  const date = tanggal ? dayjs(tanggal) : dayjs();

  let dateCondition = "";
  if (type === "Harian") {
    dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
  } else if (type === "Bulanan") {
    const start = date.startOf("month").format("YYYY-MM-DD");
    const end = date.endOf("month").format("YYYY-MM-DD");
    dateCondition = `AND DATE(t.created_at) BETWEEN '${start}' AND '${end}'`;
  }

  const sql = `
    SELECT 
      t.id_transaksi,
      t.tipe_transaksi,
      t.metode_bayar,
      t.subtotal,
      t.jumlah_bayar,
      t.created_at,
      u.nama_user AS kasir,
      s.nama_store,
      -- ambil daftar layanan & produk
      COALESCE(GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', '), '-') AS layanan,
      COALESCE(GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', '), '-') AS produk
    FROM transaksi t
    JOIN users u ON t.id_user = u.id_user
    JOIN store s ON t.id_store = s.id_store
    LEFT JOIN transaksi_service_detail tsd ON t.id_transaksi = tsd.id_transaksi
    LEFT JOIN pricelist pr ON tsd.id_pricelist = pr.id_pricelist
    LEFT JOIN transaksi_produk_detail tpd ON t.id_transaksi = tpd.id_transaksi
    LEFT JOIN produk p ON tpd.id_produk = p.id_produk
    WHERE t.id_store = ? ${dateCondition}
    GROUP BY t.id_transaksi
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [id_store], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Gagal ambil transaksi toko" });
    }
    res.json(result);
  });
};

// 🟡 Tambah Transaksi (Kasir)
export const createTransaksi = (req, res) => {
  const {
    id_store,
    id_user,
    nomor_struk,
    tipe_transaksi,
    metode_bayar,
    items,
    jumlah_bayar,
  } = req.body;

  if (
    !id_store ||
    !id_user ||
    !nomor_struk ||
    !tipe_transaksi ||
    !items?.length
  )
    return res.status(400).json({ message: "Data transaksi tidak lengkap" });

  // Hitung subtotal dan kembalian
  let subtotal = 0;
  items.forEach((i) => (subtotal += i.total || i.harga * (i.jumlah || 1)));
  const kembalian = jumlah_bayar - subtotal;

  db.beginTransaction((err) => {
    if (err)
      return res.status(500).json({ message: "Transaksi gagal dimulai" });

    // 1️⃣ Simpan transaksi utama
    const sqlTransaksi = `
      INSERT INTO transaksi 
      (id_store, id_user, tipe_transaksi, metode_bayar, subtotal, jumlah_bayar, kembalian)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sqlTransaksi,
      [
        id_store,
        id_user,
        tipe_transaksi,
        metode_bayar,
        subtotal,
        jumlah_bayar,
        kembalian,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Gagal simpan transaksi:", err);
          db.rollback(() =>
            res.status(500).json({ message: "Gagal simpan transaksi utama" })
          );
          return;
        }

        const id_transaksi = result.insertId;

        // 2️⃣ Simpan ke tabel struk
        const file_path = `/uploads/struk/${nomor_struk}.pdf`;
        const sqlStruk = `
          INSERT INTO struk (id_transaksi, nomor_struk, file_path)
          VALUES (?, ?, ?)
        `;
        db.query(sqlStruk, [id_transaksi, nomor_struk, file_path], (err) => {
          if (err) {
            console.error("❌ Gagal simpan struk:", err);
            db.rollback(() =>
              res.status(500).json({ message: "Gagal simpan data struk" })
            );
            return;
          }

          // === Helper commit akhir ===
          const finish = () => {
            db.commit((err) => {
              if (err) {
                db.rollback(() =>
                  res.status(500).json({ message: "Gagal commit transaksi" })
                );
                return;
              }
              res.json({
                message: "Transaksi berhasil disimpan",
                id: id_transaksi,
                nomor_struk,
                metode_bayar,
                subtotal,
                jumlah_bayar,
                kembalian,
              });
            });
          };

          // === Simpan detail service (komisi otomatis per store) ===
          const saveService = (cb) => {
            const serviceItems = items.filter((i) => i.tipe === "service");
            if (serviceItems.length === 0) return cb();

            // Ambil persentase komisi capster berdasarkan id_store dari tabel komisi_setting
            db.query(
              `SELECT persentase_capster 
     FROM komisi_setting 
     WHERE id_store = ? 
     LIMIT 1`,
              [id_store],
              (err, rows) => {
                if (err) {
                  console.error("❌ Gagal ambil data komisi_setting:", err);
                  db.rollback(() =>
                    res
                      .status(500)
                      .json({ message: "Gagal ambil data komisi capster" })
                  );
                  return;
                }

                // Ambil nilai persentase (jika tidak ada = 0)
                const persentase =
                  rows.length > 0 ? parseFloat(rows[0].persentase_capster) : 0;

                // Hitung komisi berdasarkan harga × persentase_store
                const serviceValues = serviceItems.map((srv) => {
                  const komisiNominal = (srv.harga * persentase) / 100;
                  return [
                    id_transaksi,
                    srv.id_pricelist,
                    srv.id_capster,
                    srv.harga,
                    komisiNominal,
                  ];
                });

                db.query(
                  `INSERT INTO transaksi_service_detail 
         (id_transaksi, id_pricelist, id_capster, harga, komisi_capster)
         VALUES ?`,
                  [serviceValues],
                  (err) => {
                    if (err) {
                      console.error("❌ Gagal simpan detail layanan:", err);
                      db.rollback(() =>
                        res.status(500).json({
                          message:
                            "Gagal simpan detail layanan: " + err.message,
                        })
                      );
                      return;
                    }
                    cb();
                  }
                );
              }
            );
          };

          // === Simpan detail produk (jika ada) ===
          const saveProduk = (cb) => {
            const produkValues = items
              .filter((i) => i.tipe === "produk")
              .map((i) => [
                id_transaksi,
                i.id_produk,
                i.jumlah,
                i.harga_awal,
                i.harga_jual,
                i.jumlah * i.harga_jual,
                i.jumlah * i.harga_awal,
                i.jumlah * (i.harga_jual - i.harga_awal),
              ]);

            if (produkValues.length === 0) return cb();

            db.query(
              `INSERT INTO transaksi_produk_detail 
               (id_transaksi, id_produk, jumlah, harga_awal, harga_jual, total_penjualan, total_modal, laba_rugi)
               VALUES ?`,
              [produkValues],
              (err) => {
                if (err) {
                  console.error("❌ Gagal simpan detail produk:", err);
                  db.rollback(() =>
                    res.status(500).json({
                      message: "Gagal simpan detail produk: " + err.message,
                    })
                  );
                  return;
                }

                // Kurangi stok otomatis
                let done = 0;
                produkValues.forEach((p) => {
                  db.query(
                    `UPDATE produk SET stok = stok - ? WHERE id_produk = ?`,
                    [p[2], p[1]],
                    () => {
                      done++;
                      if (done === produkValues.length) cb();
                    }
                  );
                });
              }
            );
          };

          // Jalankan sequence
          if (tipe_transaksi === "service") saveService(() => finish());
          else if (tipe_transaksi === "produk") saveProduk(() => finish());
          else if (tipe_transaksi === "campuran")
            saveService(() => saveProduk(() => finish()));
          else finish();
        });
      }
    );
  });
};

// 🔴 Hapus Transaksi (Admin)
export const deleteTransaksi = (req, res) => {
  db.query(
    "DELETE FROM transaksi WHERE id_transaksi = ?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Gagal hapus transaksi" });
      res.json({ message: "Transaksi berhasil dihapus" });
    }
  );
};
