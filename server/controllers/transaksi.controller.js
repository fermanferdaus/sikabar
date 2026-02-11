import db from "../config/db.js";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import heicConvert from "heic-convert";

// 🟢 Get Semua Transaksi berdasarkan store kasir login (lengkap + pendapatan bersih)
export const getTransaksiByStore = async (req, res) => {
  try {
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
        t.id_transaksi, t.tipe_transaksi, t.metode_bayar, t.subtotal, t.jumlah_bayar, t.created_at, t.bukti_qris,
        u.nama_user AS kasir, k.id_kasir, s.nama_store,
        COALESCE(GROUP_CONCAT(DISTINCT c.nama_capster SEPARATOR ', '), '-') AS capster,
        COALESCE(GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', '), '-') AS layanan,
        COALESCE(GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', '), '-') AS produk,
        COALESCE((SELECT SUM(tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi), 0) AS total_komisi,
        COALESCE((SELECT SUM(tpd.laba_rugi) FROM transaksi_produk_detail tpd WHERE tpd.id_transaksi = t.id_transaksi), 0) AS laba_produk,
        (
          COALESCE((SELECT SUM(tpd.laba_rugi) FROM transaksi_produk_detail tpd WHERE tpd.id_transaksi = t.id_transaksi), 0)
          +
          COALESCE((SELECT SUM(tsd.harga - tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi), 0)
        ) AS pendapatan_bersih
      FROM transaksi t
      JOIN users u ON t.id_user = u.id_user
      LEFT JOIN kasir k ON u.id_kasir = k.id_kasir
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

    const [result] = await db.query(sql, [id_store]);
    const summary = {
      total_transaksi: result.length,
      pendapatan_kotor: result.reduce(
        (sum, r) => sum + Number(r.subtotal || 0),
        0,
      ),
      pendapatan_bersih: result.reduce(
        (sum, r) => sum + Number(r.pendapatan_bersih || 0),
        0,
      ),
    };

    res.json({ status: "success", data: result, summary });
  } catch {
    res.status(500).json({ message: "Gagal mengambil riwayat transaksi" });
  }
};

// 🟢 Get Semua Transaksi (Admin)
export const getAllTransaksi = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, s.nama_store, u.nama_user 
      FROM transaksi t 
      JOIN store s ON t.id_store = s.id_store 
      JOIN users u ON t.id_user = u.id_user
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal ambil data transaksi" });
  }
};

// 🟢 Laporan transaksi per toko (admin) - lengkap dengan laba & komisi
export const getLaporanTransaksi = async (req, res) => {
  try {
    const { type = "Bulanan", tanggal } = req.query;
    const date = tanggal ? dayjs(tanggal) : dayjs();

    let dateCondition = "";
    if (type === "Harian") {
      dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
    } else {
      const start = date.startOf("month").format("YYYY-MM-DD");
      const end = date.endOf("month").format("YYYY-MM-DD");
      dateCondition = `AND DATE(t.created_at) BETWEEN '${start}' AND '${end}'`;
    }

    const [rows] = await db.query(`
      SELECT 
        s.id_store, s.nama_store,
        COUNT(DISTINCT t.id_transaksi) AS total_transaksi,
        COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor,
        COALESCE(SUM((SELECT SUM(tp.laba_rugi) FROM transaksi_produk_detail tp WHERE tp.id_transaksi = t.id_transaksi)), 0) AS laba_produk,
        COALESCE(SUM((SELECT SUM(tsd.harga) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi)), 0) AS pendapatan_service,
        COALESCE(SUM((SELECT SUM(tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi)), 0) AS total_komisi_capster,
        (
          COALESCE(SUM((SELECT SUM(tp.laba_rugi) FROM transaksi_produk_detail tp WHERE tp.id_transaksi = t.id_transaksi)), 0)
          +
          COALESCE(SUM((SELECT SUM(tsd.harga - tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi)), 0)
        ) AS pendapatan_bersih
      FROM store s
      LEFT JOIN transaksi t ON s.id_store = t.id_store ${dateCondition}
      GROUP BY s.id_store, s.nama_store
      ORDER BY pendapatan_kotor DESC
    `);

    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal ambil laporan transaksi" });
  }
};

// 🟢 Laporan transaksi per toko (admin)
export const getTransaksiByStoreAdmin = async (req, res) => {
  try {
    const { id_store } = req.params;
    const { type = "Bulanan", tanggal } = req.query;
    const date = tanggal ? dayjs(tanggal) : dayjs();

    let dateCondition = "";
    if (type === "Harian") {
      dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
    } else {
      const start = date.startOf("month").format("YYYY-MM-DD");
      const end = date.endOf("month").format("YYYY-MM-DD");
      dateCondition = `AND DATE(t.created_at) BETWEEN '${start}' AND '${end}'`;
    }

    const [rows] = await db.query(
      `
      SELECT 
        t.id_transaksi, t.tipe_transaksi, t.metode_bayar, t.subtotal, t.jumlah_bayar, t.created_at,t.bukti_qris,
        u.nama_user AS kasir, k.id_kasir, s.nama_store,
        COALESCE(GROUP_CONCAT(DISTINCT c.nama_capster SEPARATOR ', '), '-') AS capster,
        COALESCE(GROUP_CONCAT(DISTINCT pr.service SEPARATOR ', '), '-') AS layanan,
        COALESCE(GROUP_CONCAT(DISTINCT p.nama_produk SEPARATOR ', '), '-') AS produk,
        (
          COALESCE((SELECT SUM(tp.laba_rugi) FROM transaksi_produk_detail tp WHERE tp.id_transaksi = t.id_transaksi), 0)
          +
          COALESCE((SELECT SUM(tsd.harga - tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi), 0)
        ) AS pendapatan_bersih
      FROM transaksi t
      JOIN users u ON t.id_user = u.id_user
      LEFT JOIN kasir k ON u.id_kasir = k.id_kasir
      JOIN store s ON t.id_store = s.id_store
      LEFT JOIN transaksi_service_detail tsd ON t.id_transaksi = tsd.id_transaksi
      LEFT JOIN pricelist pr ON tsd.id_pricelist = pr.id_pricelist
      LEFT JOIN capster c ON tsd.id_capster = c.id_capster
      LEFT JOIN transaksi_produk_detail tpd ON t.id_transaksi = tpd.id_transaksi
      LEFT JOIN produk p ON tpd.id_produk = p.id_produk
      WHERE t.id_store = ? ${dateCondition}
      GROUP BY t.id_transaksi
      ORDER BY t.created_at DESC
    `,
      [id_store],
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal ambil transaksi toko" });
  }
};

// 🟡 Tambah Transaksi (Kasir)
export const createTransaksi = async (req, res) => {
  const {
    id_store,
    id_user,
    tipe_transaksi,
    metode_bayar,
    items,
    jumlah_bayar,
  } = req.body;

  if (!id_store || !id_user || !tipe_transaksi || !items?.length) {
    return res.status(400).json({ message: "Data transaksi tidak lengkap" });
  }

  let subtotal = 0;
  items.forEach((i) => (subtotal += i.total || i.harga * (i.jumlah || 1)));
  const kembalian = jumlah_bayar - subtotal;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Hitung transaksi hari ini per cabang
    const [rows] = await conn.query(
      `
      SELECT COUNT(*) AS total 
      FROM transaksi 
      WHERE id_store = ? AND DATE(created_at) = CURDATE()
      `,
      [id_store],
    );

    const countToday = rows[0]?.total || 0;
    const now = new Date();
    const tanggal = now.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const kodeStore = String(id_store).padStart(2, "0"); // 02, 03, dst
    const nomorUrut = String(countToday + 1).padStart(4, "0"); // 001, 002, dst
    const nomor_struk = `${kodeStore}/${tanggal}/${nomorUrut}`;

    const [transaksi] = await conn.query(
      `
      INSERT INTO transaksi 
      (id_store, id_user, tipe_transaksi, metode_bayar, subtotal, jumlah_bayar, kembalian)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_store,
        id_user,
        tipe_transaksi,
        metode_bayar,
        subtotal,
        jumlah_bayar,
        kembalian,
      ],
    );

    const id_transaksi = transaksi.insertId;

    await conn.query(
      `INSERT INTO struk (id_transaksi, nomor_struk) VALUES (?, ?)`,
      [id_transaksi, nomor_struk],
    );

    const produkItems = items.filter((i) => i.tipe === "produk");

    if (produkItems.length > 0) {
      const produkMerged = Object.values(
        produkItems.reduce((acc, item) => {
          if (!acc[item.id_produk]) acc[item.id_produk] = { ...item };
          else acc[item.id_produk].jumlah += item.jumlah;
          return acc;
        }, {}),
      );

      const produkValues = [];

      // 🔒 VALIDASI + LOCK STOK
      for (const item of produkMerged) {
        const [stok] = await conn.query(
          `
      SELECT stok_akhir
      FROM stok_produk
      WHERE id_produk = ? AND id_store = ?
      FOR UPDATE
      `,
          [item.id_produk, id_store],
        );

        if (!stok.length) {
          throw new Error("Produk belum punya stok");
        }

        if (stok[0].stok_akhir < item.jumlah) {
          throw new Error("Stok produk tidak mencukupi");
        }

        const [produkRow] = await conn.query(
          "SELECT harga_awal, harga_jual FROM produk WHERE id_produk = ?",
          [item.id_produk],
        );

        const harga_awal = produkRow[0].harga_awal;
        const harga_jual = item.harga || produkRow[0].harga_jual;

        produkValues.push([
          id_transaksi,
          item.id_produk,
          item.jumlah,
          harga_awal,
          harga_jual,
          item.jumlah * harga_jual,
          item.jumlah * harga_awal,
          item.jumlah * harga_jual - item.jumlah * harga_awal,
        ]);
      }

      // ✅ INSERT DETAIL SEKALI
      await conn.query(
        `
    INSERT INTO transaksi_produk_detail
    (id_transaksi, id_produk, jumlah, harga_awal, harga_jual, total_penjualan, total_modal, laba_rugi)
    VALUES ?
    `,
        [produkValues],
      );

      // ✅ UPDATE STOK
      for (const item of produkMerged) {
        await conn.query(
          `
      UPDATE stok_produk
      SET stok_akhir = stok_akhir - ?,
          updated_at = NOW()
      WHERE id_produk = ? AND id_store = ?
      `,
          [item.jumlah, item.id_produk, id_store],
        );
      }
    }

    const serviceItems = items.filter((i) => i.tipe === "service");

    if (serviceItems.length > 0) {
      const capsterIds = [...new Set(serviceItems.map((i) => i.id_capster))];

      const [rowsKomisi] = await conn.query(
        `SELECT id_capster, persentase_capster FROM komisi_setting WHERE id_capster IN (?)`,
        [capsterIds],
      );

      const komisiMap = Object.fromEntries(
        rowsKomisi.map((r) => [r.id_capster, parseFloat(r.persentase_capster)]),
      );

      const serviceValues = serviceItems.map((srv) => {
        const persentase = komisiMap[srv.id_capster] || 0;
        const komisiNominal = (srv.harga * persentase) / 100;
        return [
          id_transaksi,
          srv.id_pricelist,
          srv.id_capster,
          srv.harga,
          persentase,
          komisiNominal,
        ];
      });

      await conn.query(
        `
        INSERT INTO transaksi_service_detail 
        (id_transaksi, id_pricelist, id_capster, harga, persentase_capster, komisi_capster)
        VALUES ?
        `,
        [serviceValues],
      );
    }

    await conn.commit();

    res.json({
      message: "Transaksi berhasil disimpan",
      id: id_transaksi,
      nomor_struk,
      subtotal,
      jumlah_bayar,
      kembalian,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Gagal menyimpan transaksi:", err);
    res.status(500).json({ message: "Gagal menyimpan transaksi" });
  } finally {
    conn.release();
  }
};

// 🔴 Hapus Transaksi (Admin)
export const deleteTransaksi = async (req, res) => {
  try {
    await db.query("DELETE FROM transaksi WHERE id_transaksi = ?", [
      req.params.id,
    ]);
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch {
    res.status(500).json({ message: "Gagal hapus transaksi" });
  }
};

// 🟢 Get Keuangan (Pendapatan + Pengeluaran) per Store untuk Dashboard Kasir
export const getKeuanganByStore = async (req, res) => {
  try {
    const { id_store } = req.params;
    const { type = "Bulanan", tanggal } = req.query;
    const date = tanggal ? dayjs(tanggal) : dayjs();

    let dateCondition = "";
    if (type === "Harian") {
      dateCondition = `AND DATE(t.created_at) = '${date.format("YYYY-MM-DD")}'`;
    } else {
      const start = date.startOf("month").format("YYYY-MM-DD");
      const end = date.endOf("month").format("YYYY-MM-DD");
      dateCondition = `AND DATE(t.created_at) BETWEEN '${start}' AND '${end}'`;
    }

    const [rows] = await db.query(
      `
      SELECT tanggal, SUM(pendapatan_kotor) AS pendapatan_kotor, SUM(pengeluaran) AS pengeluaran, SUM(pendapatan_bersih) AS pendapatan_bersih
      FROM (
        SELECT DATE(t.created_at) AS tanggal, COALESCE(SUM(t.subtotal), 0) AS pendapatan_kotor, 0 AS pengeluaran,
          (COALESCE(SUM((SELECT SUM(tp.laba_rugi) FROM transaksi_produk_detail tp WHERE tp.id_transaksi = t.id_transaksi)), 0)
          + COALESCE(SUM((SELECT SUM(tsd.harga - tsd.komisi_capster) FROM transaksi_service_detail tsd WHERE tsd.id_transaksi = t.id_transaksi)), 0)) AS pendapatan_bersih
        FROM transaksi t
        WHERE t.id_store = ? ${dateCondition}
        GROUP BY DATE(t.created_at)
        UNION ALL
        SELECT DATE(p.tanggal) AS tanggal, 0 AS pendapatan_kotor, COALESCE(SUM(p.jumlah), 0) AS pengeluaran, 0 AS pendapatan_bersih
        FROM pengeluaran p WHERE p.id_store = ? GROUP BY DATE(p.tanggal)
      ) gabungan
      GROUP BY tanggal ORDER BY tanggal ASC
    `,
      [id_store, id_store],
    );

    const formatted = rows.map((r) => ({
      tanggal: r.tanggal,
      pendapatan_kotor: Number(r.pendapatan_kotor || 0),
      pengeluaran: Number(r.pengeluaran || 0),
      pendapatan_bersih:
        Number(r.pendapatan_bersih || 0) - Number(r.pengeluaran || 0),
    }));

    res.json({ status: "success", data: formatted });
  } catch {
    res.status(500).json({ message: "Gagal mengambil data keuangan store" });
  }
};

export const uploadBuktiQris = async (req, res) => {
  try {
    const { id_transaksi } = req.body;

    if (!id_transaksi) {
      return res.status(400).json({ message: "ID transaksi wajib dikirim" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File bukti tidak ditemukan" });
    }

    let finalPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // 🔁 KONVERSI HEIC / HEIF → JPG (pakai heic-convert)
    if (ext === ".heic" || ext === ".heif") {
      const inputBuffer = fs.readFileSync(req.file.path);

      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: "JPEG",
        quality: 0.9,
      });

      const jpgPath = req.file.path.replace(ext, ".jpg");

      fs.writeFileSync(jpgPath, outputBuffer);
      fs.unlinkSync(req.file.path); // hapus file HEIC

      finalPath = jpgPath;
    }

    const bukti_qris = `/uploads/qris/${path.basename(finalPath)}`;

    await db.query(
      "UPDATE transaksi SET bukti_qris = ? WHERE id_transaksi = ?",
      [bukti_qris, id_transaksi],
    );

    res.json({
      success: true,
      message: "Bukti QRIS berhasil diupload",
      bukti_qris,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Gagal upload bukti" });
  }
};
