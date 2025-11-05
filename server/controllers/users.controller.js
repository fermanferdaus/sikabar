import db from "../config/db.js";
import bcrypt from "bcrypt";

/* ============================================================
   🟢 GET Semua User (Admin Only)
   ============================================================ */
export const getAllUsers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id_user, u.nama_user, u.username, u.role,
        s.nama_store, u.id_store, u.id_capster
      FROM users u
      LEFT JOIN store s ON u.id_store = s.id_store
      ORDER BY u.id_user DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllUsers:", err.message);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

/* ============================================================
   🔵 GET User by ID
   ============================================================ */
export const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_user, nama_user, username, role, id_store, id_capster 
       FROM users WHERE id_user = ?`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getUserById:", err.message);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

/* ============================================================
   🟡 CREATE User (Admin Only)
   ============================================================ */
export const createUser = async (req, res) => {
  try {
    const { nama_user, username, password, role, id_store } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // 🔍 Cek username duplikat
    const [exist] = await db.query(
      "SELECT id_user FROM users WHERE username = ?",
      [username]
    );
    if (exist.length)
      return res.status(400).json({ message: "Username sudah digunakan!" });

    const hashed = await bcrypt.hash(password, 10);

    // 🆕 Tambah ke tabel users
    const [userResult] = await db.query(
      "INSERT INTO users (nama_user, username, password, role, id_store) VALUES (?,?,?,?,?)",
      [nama_user, username, hashed, role, id_store || null]
    );

    const id_user = userResult.insertId;
    let id_capster = null;

    // 🧍 Jika role = capster → otomatis tambah ke tabel capster
    if (role === "capster") {
      const [capsterResult] = await db.query(
        "INSERT INTO capster (nama_capster, id_store, id_user) VALUES (?, ?, ?)",
        [nama_user, id_store, id_user]
      );
      id_capster = capsterResult.insertId;

      // Update id_capster di users
      await db.query("UPDATE users SET id_capster = ? WHERE id_user = ?", [
        id_capster,
        id_user,
      ]);
    }

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      user: { id_user, nama_user, username, role, id_store, id_capster },
    });
  } catch (err) {
    console.error("❌ createUser:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/* ============================================================
   🟠 UPDATE User (Admin Only)
   ============================================================ */
export const updateUser = async (req, res) => {
  try {
    const { nama_user, username, password, role, id_store, id_capster } =
      req.body;

    // 🔐 Jika ada password baru → hash ulang
    let sql, params;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      sql = `
        UPDATE users 
        SET nama_user = ?, username = ?, password = ?, role = ?, id_store = ?, id_capster = ?
        WHERE id_user = ?
      `;
      params = [
        nama_user,
        username,
        hashed,
        role,
        id_store || null,
        id_capster || null,
        req.params.id,
      ];
    } else {
      sql = `
        UPDATE users 
        SET nama_user = ?, username = ?, role = ?, id_store = ?, id_capster = ?
        WHERE id_user = ?
      `;
      params = [
        nama_user,
        username,
        role,
        id_store || null,
        id_capster || null,
        req.params.id,
      ];
    }

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ success: true, message: "User berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateUser:", err.message);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
};

/* ============================================================
   🔴 DELETE User (Admin Only)
   ============================================================ */
export const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id_user = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteUser:", err.message);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};
