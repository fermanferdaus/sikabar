import multer from "multer";
import fs from "fs";
import path from "path";

// 📁 Pastikan folder upload untuk logo tersedia
const uploadDir = "uploads/logo";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎯 Konfigurasi penyimpanan file logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${unique}${ext}`); // format nama file
  },
});

// ✅ File filter (hanya gambar)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Format logo tidak valid. Gunakan JPG atau PNG."), false);
  }
};

// 📦 Batas ukuran 3MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// Export untuk satu file input bernama "logo"
export default upload.single("logo");
