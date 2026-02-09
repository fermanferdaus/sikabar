import db from "../config/db.js";
import fs from "fs";
import path from "path";

/* ============================================================
   GET PROFIL
============================================================ */
export const getProfil = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id_profil,
        nama_barbershop,
        nama_owner,
        telepon,
        instagram,
        tiktok,
        logo
      FROM profil
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profil belum tersedia." });
    }

    const profil = rows[0];

    return res.json({
      success: true,
      ...profil,
      logo_url: profil.logo
        ? `${req.protocol}://${req.get("host")}/${profil.logo}`
        : null,
    });
  } catch (error) {
    console.error("GET PROFIL ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data profil." });
  }
};

/* ============================================================
   UPDATE PROFIL (tanpa logo)
============================================================ */
export const updateProfil = async (req, res) => {
  try {
    const { nama_barbershop, nama_owner, telepon, instagram, tiktok } =
      req.body;

    const [rows] = await db.query("SELECT * FROM profil LIMIT 1");

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profil belum tersedia." });
    }

    await db.query(
      `
      UPDATE profil 
      SET 
        nama_barbershop = ?, 
        nama_owner = ?, 
        telepon = ?, 
        instagram = ?, 
        tiktok = ?
      WHERE id_profil = ?
      `,
      [
        nama_barbershop,
        nama_owner,
        telepon,
        instagram,
        tiktok,
        rows[0].id_profil,
      ],
    );

    return res.json({
      success: true,
      message: "Profil berhasil diperbarui.",
    });
  } catch (error) {
    console.error("UPDATE PROFIL ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
};

/* ============================================================
   UPDATE LOGO (upload + overwrite current-logo.png)
============================================================ */
export const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File logo tidak ditemukan.",
      });
    }

    const originalFile = req.file.path; // path asli upload multer
    const newLogoName = `logo-${Date.now()}${path.extname(
      req.file.originalname,
    )}`;
    const newLogoPath = `uploads/logo/${newLogoName}`;

    // Ambil data profil
    const [rows] = await db.query("SELECT * FROM profil LIMIT 1");
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profil belum tersedia." });
    }

    const profil = rows[0];

    // ============ HAPUS LOGO LAMA ============
    if (profil.logo && fs.existsSync(profil.logo)) {
      try {
        fs.unlinkSync(profil.logo);
      } catch (err) {
        console.warn("Gagal menghapus logo lama:", err.message);
      }
    }

    // ============ PINDAHKAN LOGO BARU ============
    fs.renameSync(originalFile, newLogoPath);

    // ============ BUAT / OVERWRITE current-logo.png ============
    const publicLogo = path.resolve("uploads/logo/current-logo.png");
    fs.copyFileSync(newLogoPath, publicLogo);

    // ============ SIMPAN DI DATABASE ============
    await db.query(`UPDATE profil SET logo = ? WHERE id_profil = ?`, [
      newLogoPath,
      profil.id_profil,
    ]);

    return res.json({
      success: true,
      message: "Logo berhasil diperbarui.",
      logo_url: `${req.protocol}://${req.get("host")}/${newLogoPath}`,
      public_url: `${req.protocol}://${req.get(
        "host",
      )}/uploads/logo/current-logo.png`,
    });
  } catch (error) {
    console.error("UPDATE LOGO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui logo.",
    });
  }
};
