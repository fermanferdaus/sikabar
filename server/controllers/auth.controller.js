import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ====================== LOGIN ======================
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Kesalahan database" });
      if (result.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });

      const user = result[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Password salah" });

      // 🔹 Ambil id_capster jika role = capster
      let id_capster = user.id_capster;
      if (user.role === "capster" && !id_capster) {
        const [rows] = await db
          .promise()
          .query("SELECT id_capster FROM capster WHERE id_user = ?", [
            user.id_user,
          ]);
        if (rows.length > 0) id_capster = rows[0].id_capster;
      }

      // 🔑 Buat token JWT
      const token = jwt.sign(
        {
          id_user: user.id_user,
          id_store: user.id_store,
          id_capster, // ✅ Sekarang id_capster pasti ada
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // ✅ Format respons ke frontend
      res.status(200).json({
        message: "Login berhasil",
        token,
        role: user.role,
        user: {
          id_user: user.id_user,
          id_store: user.id_store,
          id_capster,
          nama_user: user.nama_user,
        },
      });
    }
  );
};

// ====================== CHECK TOKEN ======================
export const checkToken = (req, res) => {
  const user = req.user; // diisi dari verifyToken middleware
  res.json({
    valid: true,
    message: "Token valid",
    user,
  });
};
