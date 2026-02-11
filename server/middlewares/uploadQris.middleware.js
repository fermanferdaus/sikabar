import multer from "multer";
import fs from "fs";
import path from "path";

// 📁 Pastikan folder upload tersedia
const uploadDir = "uploads/qris";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎯 Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

// ✅ MIME & EXTENSION yang diizinkan
const ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".pdf"];

// 🎯 File filter (AMAN UNTUK iPhone)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXT.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak diizinkan. Gunakan JPG, PNG, HEIC, atau PDF."
      ),
      false
    );
  }
};

// 📦 Multer instance
const uploadQris = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default uploadQris.single("bukti");
