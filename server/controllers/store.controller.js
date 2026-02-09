import db from "../config/db.js";

/* ============================================================
   🏪 GET Semua Store
   ============================================================ */
export const getStores = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM store ORDER BY id_store DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ getStores:", err.message);
    res.status(500).json({ message: "Gagal mengambil data store" });
  }
};

/* ============================================================
   🔍 GET Store by ID
   ============================================================ */
export const getStoreById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM store WHERE id_store = ?", [
      req.params.id,
    ]);

    if (!rows.length)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getStoreById:", err.message);
    res.status(500).json({ message: "Gagal mengambil data store" });
  }
};

/* ============================================================
   🟡 CREATE Store
   ============================================================ */
export const createStore = async (req, res) => {
  try {
    const { nama_store, alamat_store } = req.body;

    if (!nama_store)
      return res.status(400).json({ message: "Nama store wajib diisi" });

    // 🔍 Cek duplikasi
    const [exist] = await db.query(
      "SELECT id_store FROM store WHERE nama_store = ?",
      [nama_store]
    );

    if (exist.length)
      return res.status(400).json({ message: "Nama store sudah terdaftar!" });

    // ✅ Insert data baru
    const [result] = await db.query(
      "INSERT INTO store (nama_store, alamat_store) VALUES (?, ?)",
      [nama_store, alamat_store || "-"]
    );

    res.status(201).json({
      success: true,
      message: "Store berhasil ditambahkan",
      id_store: result.insertId,
    });
  } catch (err) {
    console.error("❌ createStore:", err.message);
    res.status(500).json({ message: "Gagal menambah store" });
  }
};

/* ============================================================
   ✏️ UPDATE Store
   ============================================================ */
export const updateStore = async (req, res) => {
  try {
    const { nama_store, alamat_store } = req.body;

    if (!nama_store)
      return res.status(400).json({ message: "Nama store wajib diisi" });

    const [result] = await db.query(
      "UPDATE store SET nama_store = ?, alamat_store = ? WHERE id_store = ?",
      [nama_store, alamat_store || "-", req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    res.json({ success: true, message: "Store berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateStore:", err.message);
    res.status(500).json({ message: "Gagal memperbarui store" });
  }
};

/* ============================================================
   🗑️ DELETE Store
   ============================================================ */
export const deleteStore = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM store WHERE id_store = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    res.json({ success: true, message: "Store berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteStore:", err.message);
    res.status(500).json({ message: "Gagal menghapus store" });
  }
};
