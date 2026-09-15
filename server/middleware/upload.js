const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

try {
  if (!fs.existsSync(uploadBaseDir)) {
    fs.mkdirSync(uploadBaseDir, { recursive: true });
  }
} catch (e) {
  // Directory might already exist or running in restricted environment
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadBaseDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File format "${ext}" is not supported. Allowed: PDF, Word, PowerPoint, TXT, Images.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB per file
  },
});

module.exports = {
  upload,
  uploadBaseDir,
};
