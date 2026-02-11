import multer from "multer";
import fs from "fs";
import path from "path";

// 📁 Pastikan folder upload tersedia
const uploadDir = "uploads/logo";
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
    cb(null, `logo-${unique}${ext}`);
  },
});

// ✅ MIME yang diizinkan
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/jpg"];

// 🔍 File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format logo harus PNG, JPG, atau JPEG"));
  }
};

// 📦 Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

// 🚀 EXPORT MIDDLEWARE YANG SUDAH HANDLE ERROR
const uploadLogo = (req, res, next) => {
  upload.single("logo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

export default uploadLogo;
