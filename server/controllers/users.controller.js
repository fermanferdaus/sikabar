import db from "../config/db.js";
import bcrypt from "bcrypt";

// 🟢 Get Semua User (Admin Only)
export const getAllUsers = (req, res) => {
  db.query(
    `SELECT u.id_user, u.nama_user, u.username, u.role, 
            s.nama_store, u.id_store, u.id_capster
     FROM users u
     LEFT JOIN store s ON u.id_store = s.id_store
     ORDER BY u.id_user DESC`,
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal mengambil data user" });
      res.json(result);
    }
  );
};

// 🔵 Get User by ID (Admin Only)
export const getUserById = (req, res) => {
  db.query(
    `SELECT id_user, nama_user, username, role, id_store, id_capster 
     FROM users WHERE id_user = ?`,
    [req.params.id],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal mengambil data user" });
      if (result.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

export const createUser = async (req, res) => {
  try {
    const { nama_user, username, password, role, id_store } = req.body;
    console.log("📥 Data diterima:", req.body);

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // 🔍 Cek username sudah ada belum
    const [existing] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan!" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [userResult] = await db
      .promise()
      .query(
        "INSERT INTO users (nama_user, username, password, role, id_store) VALUES (?,?,?,?,?)",
        [nama_user, username, hashed, role, id_store || null]
      );

    console.log("✅ User berhasil ditambah:", userResult.insertId);

    const id_user = userResult.insertId;
    let id_capster = null;

    // Jika role capster → tambahkan ke tabel capster
    if (role === "capster") {
      console.log("🟢 Menambahkan ke tabel capster...");
      const [capsterResult] = await db
        .promise()
        .query(
          "INSERT INTO capster (nama_capster, id_store, id_user) VALUES (?, ?, ?)",
          [nama_user, id_store, id_user]
        );

      id_capster = capsterResult.insertId;

      await db
        .promise()
        .query("UPDATE users SET id_capster = ? WHERE id_user = ?", [
          id_capster,
          id_user,
        ]);
      console.log("🔁 User diperbarui dengan id_capster:", id_capster);
    }

    res.status(201).json({
      message: "User berhasil ditambahkan",
      user: {
        id_user,
        nama_user,
        username,
        role,
        id_store,
        id_capster,
      },
    });
  } catch (error) {
    console.error("❌ Gagal menambahkan user:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 🟠 Update User (Admin Only)
export const updateUser = async (req, res) => {
  try {
    const { nama_user, username, password, role, id_store, id_capster } =
      req.body;

    // Jika ada password baru, hash ulang
    let sql, params;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      sql = `UPDATE users 
             SET nama_user=?, username=?, password=?, role=?, id_store=?, id_capster=? 
             WHERE id_user=?`;
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
      sql = `UPDATE users 
             SET nama_user=?, username=?, role=?, id_store=?, id_capster=? 
             WHERE id_user=?`;
      params = [
        nama_user,
        username,
        role,
        id_store || null,
        id_capster || null,
        req.params.id,
      ];
    }

    db.query(sql, params, (err, result) => {
      if (err)
        return res.status(500).json({ message: "Gagal memperbarui user" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json({ message: "User berhasil diperbarui" });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 🔴 Hapus User (Admin Only)
export const deleteUser = (req, res) => {
  db.query(
    "DELETE FROM users WHERE id_user=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal menghapus user" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json({ message: "User berhasil dihapus" });
    }
  );
};
