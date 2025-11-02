import db from "../config/db.js";
import dayjs from "dayjs";

// 🟢 Get Semua Transaksi berdasarkan store kasir login (lengkap + pendapatan bersih)
export const getTransaksiByStore = (req, res) => {
  const { id_store } = req.user;
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
      COALESCE(GROUP_CONCAT(DISTINCT c.nama_capster SEPARATOR ', '), '-') AS capster,
      COALESCE(GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', '), '-') AS layanan,
      COALESCE(GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', '), '-') AS produk,

      -- 💰 Total Komisi capster
      COALESCE((
        SELECT COALESCE(SUM(tsd.komisi_capster), 0)
        FROM transaksi_service_detail tsd
        WHERE tsd.id_transaksi = t.id_transaksi
      ), 0) AS total_komisi,

      -- 📦 Total Laba Produk
      COALESCE((
        SELECT COALESCE(SUM(tpd.laba_rugi), 0)
        FROM transaksi_produk_detail tpd
        WHERE tpd.id_transaksi = t.id_transaksi
      ), 0) AS laba_produk,

      -- 💸 Pendapatan Bersih per transaksi
      (
        COALESCE((
          SELECT COALESCE(SUM(tpd.laba_rugi), 0)
          FROM transaksi_produk_detail tpd
          WHERE tpd.id_transaksi = t.id_transaksi
        ), 0)
        +
        COALESCE((
          SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0)
          FROM transaksi_service_detail tsd
          WHERE tsd.id_transaksi = t.id_transaksi
        ), 0)
      ) AS pendapatan_bersih

    FROM transaksi t
    JOIN users u ON t.id_user = u.id_user
    JOIN store s ON t.id_store = s.id_store
    LEFT JOIN transaksi_service_detail tsd ON t.id_transaksi = tsd.id_transaksi
    LEFT JOIN pricelist pr ON tsd.id_pricelist = pr.id_pricelist
    LEFT JOIN capster c ON tsd.id_capster = c.id_capster
    LEFT JOIN transaksi_produk_detail tpd ON t.id_transaksi = tpd.id_transaksi
    LEFT JOIN produk p ON tpd.id_produk = p.id_produk
    WHERE t.id_store = ? ${dateCondition}
    GROUP BY t.id_transaksi
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [id_store], (err, result) => {
    if (err) {
      console.error("❌ DB Error getTransaksiByStore:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil riwayat transaksi" });
    }

    // ✅ Tambahkan summary agar bisa langsung dipakai di frontend
    const summary = {
      total_transaksi: result.length,
      pendapatan_kotor: result.reduce(
        (sum, r) => sum + Number(r.subtotal || 0),
        0
      ),
      pendapatan_bersih: result.reduce(
        (sum, r) => sum + Number(r.pendapatan_bersih || 0),
        0
      ),
    };

    res.json({ status: "success", data: result, summary });
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

// 🟢 Laporan transaksi per toko (admin) - lengkap dengan laba & komisi
export const getLaporanTransaksi = (req, res) => {
  const { type = "Bulanan", tanggal } = req.query;
  const date = tanggal ? dayjs(tanggal) : dayjs();

  // 🔹 Filter waktu
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
      s.id_store,
      s.nama_store,
      COUNT(DISTINCT t.id_transaksi) AS total_transaksi,

      -- 💰 Pendapatan Kotor: total subtotal transaksi (produk + layanan)
      COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,

      -- 📦 Total Laba Produk dari subquery per transaksi
      COALESCE(SUM((
        SELECT COALESCE(SUM(tp.laba_rugi), 0)
        FROM transaksi_produk_detail tp
        WHERE tp.id_transaksi = t.id_transaksi
      )), 0) AS laba_produk,

      -- ✂️ Total Pendapatan Layanan (harga service)
      COALESCE(SUM((
        SELECT COALESCE(SUM(tsd.harga), 0)
        FROM transaksi_service_detail tsd
        WHERE tsd.id_transaksi = t.id_transaksi
      )), 0) AS pendapatan_service,

      -- 👨‍🔧 Total Komisi Capster
      COALESCE(SUM((
        SELECT COALESCE(SUM(tsd.komisi_capster), 0)
        FROM transaksi_service_detail tsd
        WHERE tsd.id_transaksi = t.id_transaksi
      )), 0) AS total_komisi_capster,

      -- 💸 Pendapatan Bersih = laba_produk + (pendapatan_service - komisi)
      (
        COALESCE(SUM((
          SELECT COALESCE(SUM(tp.laba_rugi), 0)
          FROM transaksi_produk_detail tp
          WHERE tp.id_transaksi = t.id_transaksi
        )), 0)
        +
        COALESCE(SUM((
          SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0)
          FROM transaksi_service_detail tsd
          WHERE tsd.id_transaksi = t.id_transaksi
        )), 0)
      ) AS pendapatan_bersih

    FROM store s
    LEFT JOIN transaksi t ON s.id_store = t.id_store ${dateCondition}
    GROUP BY s.id_store, s.nama_store
    ORDER BY pendapatan_kotor DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ DB Error getLaporanTransaksi:", err);
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
      COALESCE(GROUP_CONCAT(DISTINCT c.nama_capster SEPARATOR ', '), '-') AS capster,
      COALESCE(GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', '), '-') AS layanan,
      COALESCE(GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', '), '-') AS produk,

      -- 💰 Pendapatan Bersih per transaksi
      (
        COALESCE((
          SELECT COALESCE(SUM(tp.laba_rugi), 0)
          FROM transaksi_produk_detail tp
          WHERE tp.id_transaksi = t.id_transaksi
        ), 0)
        +
        COALESCE((
          SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0)
          FROM transaksi_service_detail tsd
          WHERE tsd.id_transaksi = t.id_transaksi
        ), 0)
      ) AS pendapatan_bersih

    FROM transaksi t
    JOIN users u ON t.id_user = u.id_user
    JOIN store s ON t.id_store = s.id_store
    LEFT JOIN transaksi_service_detail tsd ON t.id_transaksi = tsd.id_transaksi
    LEFT JOIN pricelist pr ON tsd.id_pricelist = pr.id_pricelist
    LEFT JOIN capster c ON tsd.id_capster = c.id_capster
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
  ) {
    return res.status(400).json({ message: "Data transaksi tidak lengkap" });
  }

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

        // 2️⃣ Simpan struk
        const file_path = `/uploads/struk/${nomor_struk}.pdf`;
        db.query(
          `INSERT INTO struk (id_transaksi, nomor_struk, file_path) VALUES (?, ?, ?)`,
          [id_transaksi, nomor_struk, file_path],
          (err) => {
            if (err) {
              console.error("❌ Gagal simpan struk:", err);
              db.rollback(() =>
                res.status(500).json({ message: "Gagal simpan struk" })
              );
              return;
            }

            // Helper commit akhir
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
                  subtotal,
                  jumlah_bayar,
                  kembalian,
                });
              });
            };

            // === Simpan detail produk
            const saveProduk = (cb) => {
              const produkValues = items
                .filter((i) => i.tipe === "produk")
                .map((i) => {
                  const jumlah = Number(i.jumlah) || 0;
                  const hargaAwal = Number(i.harga_awal) || 0;
                  const hargaJual = Number(i.harga_jual) || 0;
                  const totalPenjualan = jumlah * hargaJual;
                  const totalModal = jumlah * hargaAwal;
                  const labaRugi = totalPenjualan - totalModal;
                  return [
                    id_transaksi,
                    i.id_produk,
                    jumlah,
                    hargaAwal,
                    hargaJual,
                    totalPenjualan,
                    totalModal,
                    labaRugi,
                  ];
                });

              if (!produkValues.length) return cb();

              db.query(
                `INSERT INTO transaksi_produk_detail 
                 (id_transaksi, id_produk, jumlah, harga_awal, harga_jual, total_penjualan, total_modal, laba_rugi)
                 VALUES ?`,
                [produkValues],
                (err) => {
                  if (err) {
                    console.error("❌ Gagal simpan detail produk:", err);
                    db.rollback(() =>
                      res
                        .status(500)
                        .json({ message: "Gagal simpan detail produk" })
                    );
                    return;
                  }

                  // Update stok akhir
                  let done = 0;
                  produkValues.forEach((p) => {
                    const [_, id_produk, jumlah] = p;
                    db.query(
                      `
                        UPDATE stok_produk
                        SET stok_akhir = GREATEST(stok_akhir - ?, 0),
                            updated_at = NOW()
                        WHERE id_produk = ? AND id_store = ?
                      `,
                      [jumlah, id_produk, id_store],
                      () => {
                        done++;
                        if (done === produkValues.length) cb();
                      }
                    );
                  });
                }
              );
            };

            // === Simpan detail service (dengan komisi per capster)
            const saveService = (cb) => {
              const serviceItems = items.filter((i) => i.tipe === "service");
              if (!serviceItems.length) return cb();

              // Ambil daftar id_capster unik
              const capsterIds = [
                ...new Set(serviceItems.map((i) => i.id_capster)),
              ];

              db.query(
                `SELECT id_capster, persentase_capster FROM komisi_setting WHERE id_capster IN (?)`,
                [capsterIds],
                (err, rows) => {
                  if (err) {
                    console.error("❌ Gagal ambil data komisi:", err);
                    db.rollback(() =>
                      res
                        .status(500)
                        .json({ message: "Gagal ambil data komisi capster" })
                    );
                    return;
                  }

                  // Buat mapping { id_capster: persentase }
                  const komisiMap = Object.fromEntries(
                    rows.map((r) => [
                      r.id_capster,
                      parseFloat(r.persentase_capster),
                    ])
                  );

                  const serviceValues = serviceItems.map((srv) => {
                    const persentase = komisiMap[srv.id_capster] || 0;
                    const komisiNominal = (srv.harga * persentase) / 100;
                    return [
                      id_transaksi,
                      srv.id_pricelist,
                      srv.id_capster,
                      srv.harga,
                      persentase, // simpan persentase di sini
                      komisiNominal,
                    ];
                  });

                  db.query(
                    `INSERT INTO transaksi_service_detail 
                     (id_transaksi, id_pricelist, id_capster, harga, persentase_capster, komisi_capster)
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

            // Jalankan sesuai tipe
            if (tipe_transaksi === "service") saveService(() => finish());
            else if (tipe_transaksi === "produk") saveProduk(() => finish());
            else if (tipe_transaksi === "campuran")
              saveService(() => saveProduk(() => finish()));
            else finish();
          }
        );
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

// 🟢 Get Keuangan (Pendapatan + Pengeluaran) per Store untuk Dashboard Kasir
export const getKeuanganByStore = (req, res) => {
  const { id_store } = req.params;
  const { type = "Bulanan", tanggal } = req.query;
  const date = tanggal ? dayjs(tanggal) : dayjs();

  // 🔹 Filter waktu (harian/bulanan)
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
      tanggal,
      SUM(pendapatan_kotor) AS pendapatan_kotor,
      SUM(pengeluaran) AS pengeluaran,
      SUM(pendapatan_bersih) AS pendapatan_bersih
    FROM (
      -- 🧾 Pendapatan (Transaksi)
      SELECT 
        DATE(t.created_at) AS tanggal,
        COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
        0 AS pengeluaran,
        (
          COALESCE(SUM(
            (SELECT COALESCE(SUM(tp.laba_rugi), 0)
             FROM transaksi_produk_detail tp
             WHERE tp.id_transaksi = t.id_transaksi)
          ), 0)
          +
          COALESCE(SUM(
            (SELECT COALESCE(SUM(tsd.harga - tsd.komisi_capster), 0)
             FROM transaksi_service_detail tsd
             WHERE tsd.id_transaksi = t.id_transaksi)
          ), 0)
        ) AS pendapatan_bersih
      FROM transaksi t
      WHERE t.id_store = ? ${dateCondition}
      GROUP BY DATE(t.created_at)

      UNION ALL

      -- 💸 Pengeluaran
      SELECT 
        DATE(p.tanggal) AS tanggal,
        0 AS pendapatan_kotor,
        COALESCE(SUM(p.jumlah), 0) AS pengeluaran,
        0 AS pendapatan_bersih
      FROM pengeluaran p
      WHERE p.id_store = ?
      GROUP BY DATE(p.tanggal)
    ) gabungan
    GROUP BY tanggal
    ORDER BY tanggal ASC;
  `;

  db.query(sql, [id_store, id_store], (err, result) => {
    if (err) {
      console.error("❌ DB Error getKeuanganByStore:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengambil data keuangan store" });
    }

    // ✅ Hitung ulang pendapatan bersih akhir
    const formatted = result.map((r) => ({
      tanggal: r.tanggal,
      pendapatan_kotor: Number(r.pendapatan_kotor || 0),
      pengeluaran: Number(r.pengeluaran || 0),
      pendapatan_bersih:
        Number(r.pendapatan_bersih || 0) - Number(r.pengeluaran || 0),
    }));

    res.json({ status: "success", data: formatted });
  });
};
