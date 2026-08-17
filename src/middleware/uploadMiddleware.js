const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = path.join(__dirname, '../../uploads/videos');
    if (file.mimetype.startsWith('image/')) {
      dest = path.join(__dirname, '../../uploads/thumbnails');
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow video and image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  ];
  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a valid video or image file.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
