import multer from "multer";
import fs from "fs";
import path from "path";

// 📁 Pastikan folder upload tersedia
const uploadDir = "uploads/pengeluaran";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎯 Konfigurasi penyimpanan file bukti
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

// ✅ Filter tipe file
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error("Format file tidak diizinkan. Gunakan JPG, PNG, atau PDF."),
      false
    );
  }
};

// 📦 Batas ukuran 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload.single("bukti");
