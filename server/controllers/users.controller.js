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

    if (!username || !password || !role)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const [exist] = await db.query(
      "SELECT id_user FROM users WHERE username = ?",
      [username]
    );
    if (exist.length)
      return res.status(400).json({ message: "Username sudah digunakan!" });

    let id_capster = null;
    let id_kasir = null;

    // Role capster
    if (role === "capster") {
      const [cekCapster] = await db.query(
        "SELECT id_capster, id_user FROM capster WHERE nama_capster = ? AND id_store = ?",
        [nama_user, id_store]
      );

      if (!cekCapster.length)
        return res
          .status(404)
          .json({ message: "Nama capster tidak ditemukan pada store ini" });

      if (cekCapster[0].id_user)
        return res
          .status(400)
          .json({ message: "Capster ini sudah memiliki akun pengguna" });

      id_capster = cekCapster[0].id_capster;
    }

    // Role kasir
    if (role === "kasir") {
      const [cekKasir] = await db.query(
        "SELECT id_kasir, id_user FROM kasir WHERE nama_kasir = ? AND id_store = ?",
        [nama_user, id_store]
      );

      if (!cekKasir.length)
        return res
          .status(404)
          .json({ message: "Nama kasir tidak ditemukan pada store ini" });

      if (cekKasir[0].id_user)
        return res
          .status(400)
          .json({ message: "Kasir ini sudah memiliki akun pengguna" });

      id_kasir = cekKasir[0].id_kasir;
    }

    // Insert user
    const hashed = await bcrypt.hash(password, 10);
    const [userResult] = await db.query(
      "INSERT INTO users (nama_user, username, password, role, id_store, id_capster, id_kasir) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nama_user,
        username,
        hashed,
        role,
        id_store || null,
        id_capster,
        id_kasir,
      ]
    );

    const id_user = userResult.insertId;

    // Update relasi kasir/capster
    if (role === "capster") {
      await db.query("UPDATE capster SET id_user = ? WHERE id_capster = ?", [
        id_user,
        id_capster,
      ]);
    }

    if (role === "kasir") {
      await db.query("UPDATE kasir SET id_user = ? WHERE id_kasir = ?", [
        id_user,
        id_kasir,
      ]);
    }

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      user: {
        id_user,
        nama_user,
        username,
        role,
        id_store,
        id_capster,
        id_kasir,
      },
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
    const id_user = req.params.id;
    let { nama_user, username, password, role, id_store } = req.body;

    // GET USER LAMA
    const [oldUserRows] = await db.query(
      "SELECT * FROM users WHERE id_user = ?",
      [id_user]
    );
    if (!oldUserRows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const oldUser = oldUserRows[0];

    // Cek username duplikat
    const [exist] = await db.query(
      "SELECT id_user FROM users WHERE username = ? AND id_user != ?",
      [username, id_user]
    );
    if (exist.length)
      return res.status(400).json({ message: "Username sudah digunakan!" });

    // SIMPAN RELASI LAMA (default)
    let finalCapster = oldUser.id_capster;
    let finalKasir = oldUser.id_kasir;

    // ===========================================
    // ROLE = CAPSTER → VALIDASI NAMA
    // ===========================================
    if (role === "capster") {
      const [cek] = await db.query(
        "SELECT id_capster, id_user FROM capster WHERE nama_capster = ? AND id_store = ?",
        [nama_user, id_store]
      );

      if (!cek.length)
        return res.status(404).json({ message: "Nama capster tidak ditemukan!" });

      if (cek[0].id_user && cek[0].id_user != id_user)
        return res
          .status(400)
          .json({ message: "Capster ini sudah memiliki akun!" });

      finalCapster = cek[0].id_capster;
      finalKasir = null;

      await db.query("UPDATE capster SET id_user = ? WHERE id_capster = ?", [
        id_user,
        finalCapster,
      ]);
    }

    // ===========================================
    // ROLE = KASIR → VALIDASI NAMA
    // ===========================================
    if (role === "kasir") {
      const [cek] = await db.query(
        "SELECT id_kasir, id_user FROM kasir WHERE nama_kasir = ? AND id_store = ?",
        [nama_user, id_store]
      );

      if (!cek.length)
        return res.status(404).json({ message: "Nama kasir tidak ditemukan!" });

      if (cek[0].id_user && cek[0].id_user != id_user)
        return res
          .status(400)
          .json({ message: "Kasir ini sudah memiliki akun!" });

      finalKasir = cek[0].id_kasir;
      finalCapster = null;

      await db.query("UPDATE kasir SET id_user = ? WHERE id_kasir = ?", [
        id_user,
        finalKasir,
      ]);
    }

    // ===========================================
    // ROLE = ADMIN → hapus relasi
    // ===========================================
    if (role === "admin") {
      id_store = null;
      finalCapster = null;
      finalKasir = null;
    }

    // PASSWORD
    let hashed = oldUser.password;
    if (password) hashed = await bcrypt.hash(password, 10);

    // ===========================================
    // UPDATE USERS
    // ===========================================
    await db.query(
      `UPDATE users SET
        nama_user=?, username=?, password=?, role=?, id_store=?,
        id_capster=?, id_kasir=?
       WHERE id_user = ?`,
      [
        nama_user,
        username,
        hashed,
        role,
        id_store || null,
        finalCapster,
        finalKasir,
        id_user,
      ]
    );

    res.json({ success: true, message: "User berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updateUser:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
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

// 🔍 Cari berdasarkan nama (capster / kasir)
export const searchUserByName = async (req, res) => {
  try {
    const nama = req.params.nama;

    const [capsterRows] = await db.query(
      `SELECT 'capster' AS role, c.id_capster, NULL AS id_kasir,
              c.nama_capster AS nama, c.id_store, s.nama_store
       FROM capster c
       LEFT JOIN store s ON c.id_store = s.id_store
       WHERE LOWER(c.nama_capster) LIKE LOWER(?)
       LIMIT 1`,
      [`%${nama}%`]
    );

    if (capsterRows.length) return res.json(capsterRows[0]);

    const [kasirRows] = await db.query(
      `SELECT 'kasir' AS role, NULL AS id_capster, k.id_kasir,
              k.nama_kasir AS nama, k.id_store, s.nama_store
       FROM kasir k
       LEFT JOIN store s ON k.id_store = s.id_store
       WHERE LOWER(k.nama_kasir) LIKE LOWER(?)
       LIMIT 1`,
      [`%${nama}%`]
    );

    if (kasirRows.length) return res.json(kasirRows[0]);

    res.status(404).json({ message: "Data tidak ditemukan" });
  } catch (err) {
    res.status(500).json({ message: "Gagal mencari data pengguna" });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const exclude = req.query.exclude || null;

    let sql = `SELECT id_user FROM users WHERE username = ?`;
    let params = [username];

    if (exclude) {
      sql += ` AND id_user <> ?`;
      params.push(exclude);
    }

    const [rows] = await db.query(sql, params);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengecek username" });
  }
};
