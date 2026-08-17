const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ⚠️  KNOWN LIMITATION — EPHEMERAL FILE STORAGE ON RENDER FREE TIER
//
// This middleware writes uploaded video/thumbnail files to the local filesystem
// (`uploads/videos/` and `uploads/thumbnails/`). On Render's free-tier web
// services, the filesystem is EPHEMERAL: it is wiped on every redeploy,
// restart, or service cycle. This means:
//
//   1. Any lecture whose video was uploaded via this middleware will have a
//      broken `videoUrl` (404) after the next Render restart or redeploy,
//      even though the Lecture row (with the now-dead URL) still exists in MySQL.
//
//   2. To confirm whether files are already missing, check the browser Network
//      tab for 404s on videoUrl values that point to this Render host
//      (e.g. https://placement-project-2-78ac.onrender.com/uploads/videos/...).
//
// RECOMMENDED FIX (not yet implemented):
//   Replace `multer.diskStorage` below with `multer.memoryStorage()` and add a
//   step to upload the in-memory buffer to a persistent object store:
//     • Firebase Storage (preferred — firebase.json already in repo)
//     • Cloudinary (free tier, generous limits for video)
//     • AWS S3 / R2
//   Store the resulting public URL in the `videoUrl` / `thumbnail` fields of the
//   Lecture model; no schema changes are needed.
//
// Until that migration is done, video lectures uploaded as files will break on
// every Render restart. YouTube-embed lectures (URL mode) are unaffected.


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
