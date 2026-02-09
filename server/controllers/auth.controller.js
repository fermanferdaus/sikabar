import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    // 🔹 Cek user berdasarkan username
    const [result] = await db.query(
      "SELECT * FROM users WHERE BINARY username = ?",
      [username]
    );

    if (result.length === 0)
      return res.status(404).json({ message: "Username tidak ditemukan" });

    const user = result[0];

    // 🔹 Verifikasi password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    // =======================================================
    // 🔹 Ambil id_capster kalau role capster
    // =======================================================
    let id_capster = user.id_capster;
    if (user.role === "capster" && !id_capster) {
      const [rows] = await db.query(
        "SELECT id_capster FROM capster WHERE id_user = ?",
        [user.id_user]
      );
      if (rows.length > 0) id_capster = rows[0].id_capster;
    }

    // =======================================================
    // 🔹 Ambil id_kasir kalau role kasir
    // =======================================================
    let id_kasir = user.id_kasir;
    if (user.role === "kasir" && !id_kasir) {
      const [rows] = await db.query(
        "SELECT id_kasir FROM kasir WHERE id_user = ?",
        [user.id_user]
      );
      if (rows.length > 0) id_kasir = rows[0].id_kasir;
    }

    // =======================================================
    // 🔑 Buat token JWT lengkap
    // =======================================================
    const token = jwt.sign(
      {
        id_user: user.id_user,
        id_store: user.id_store,
        id_capster,
        id_kasir,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // =======================================================
    // ✅ RESPON LOGIN
    // =======================================================
    res.status(200).json({
      message: "Login berhasil",
      token,
      role: user.role,
      user: {
        id_user: user.id_user,
        id_store: user.id_store,
        id_capster,
        id_kasir,
        nama_user: user.nama_user,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Kesalahan database" });
  }
};

// ====================== CHECK TOKEN ======================
export const checkToken = (req, res) => {
  const user = req.user;
  res.json({
    valid: true,
    message: "Token valid",
    user,
  });
};
