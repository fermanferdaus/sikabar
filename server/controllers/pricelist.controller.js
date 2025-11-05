import db from "../config/db.js";

/* ============================================================
   🟢 GET Semua Pricelist (bisa filter per store)
   ============================================================ */
export const getAllPricelist = async (req, res) => {
  try {
    const { store } = req.query;
    let sql = "SELECT * FROM pricelist";
    const params = [];

    if (store) {
      sql += " WHERE id_store = ?";
      params.push(store);
    }

    sql += " ORDER BY id_pricelist DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllPricelist:", err.message);
    res.status(500).json({ message: "Gagal mengambil data pricelist" });
  }
};

/* ============================================================
   🔵 GET Pricelist by ID
   ============================================================ */
export const getPricelistById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pricelist WHERE id_pricelist = ?",
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getPricelistById:", err.message);
    res.status(500).json({ message: "Gagal mengambil data service" });
  }
};

/* ============================================================
   🟡 CREATE Pricelist (Tambah Service Baru)
   ============================================================ */
export const createPricelist = async (req, res) => {
  try {
    const { service, keterangan, harga, id_store } = req.body;

    if (!service || !harga) {
      return res
        .status(400)
        .json({ message: "Nama layanan dan harga wajib diisi" });
    }

    // 🔍 Cek duplikasi
    const [exist] = await db.query(
      "SELECT id_pricelist FROM pricelist WHERE service = ? AND (id_store = ? OR ? IS NULL)",
      [service, id_store || null, id_store || null]
    );

    if (exist.length)
      return res.status(400).json({ message: "Nama layanan sudah terdaftar!" });

    // ✅ Insert data baru
    const [result] = await db.query(
      "INSERT INTO pricelist (service, keterangan, harga, id_store) VALUES (?, ?, ?, ?)",
      [service, keterangan || "-", harga, id_store || null]
    );

    res.status(201).json({
      success: true,
      message: "Service berhasil ditambahkan",
      id_pricelist: result.insertId,
    });
  } catch (err) {
    console.error("❌ createPricelist:", err.message);
    res.status(500).json({ message: "Gagal menambahkan service" });
  }
};

/* ============================================================
   🟠 UPDATE Pricelist
   ============================================================ */
export const updatePricelist = async (req, res) => {
  try {
    const { service, keterangan, harga } = req.body;

    if (!service || !harga)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const [result] = await db.query(
      "UPDATE pricelist SET service = ?, keterangan = ?, harga = ? WHERE id_pricelist = ?",
      [service, keterangan || "-", harga, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json({ success: true, message: "Service berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updatePricelist:", err.message);
    res.status(500).json({ message: "Gagal memperbarui service" });
  }
};

/* ============================================================
   🔴 DELETE Pricelist
   ============================================================ */
export const deletePricelist = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM pricelist WHERE id_pricelist = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    res.json({ success: true, message: "Service berhasil dihapus" });
  } catch (err) {
    console.error("❌ deletePricelist:", err.message);
    res.status(500).json({ message: "Gagal menghapus service" });
  }
};
