const router = require('express').Router();
const { auth } = require('../middleware/auth');
const cloudinary = require('../lib/cloudinary');
const crypto = require('crypto');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { generalLimiter } = require('../middleware/rateLimiter');


router.get('/cloudinary-signature',generalLimiter, auth, async (req, res, next) => {
  try {
    // allow folder per user; lock down allowed params you expect on client
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { timestamp, folder: `jiji/${req.user.id}` };
    const toSign = Object.keys(paramsToSign)
      .sort()
      .map(k => `${k}=${paramsToSign[k]}`)
      .join('&');
    const signature = crypto
      .createHash('sha1')
      .update(toSign + process.env.CLOUD_API_SECRET)
      .digest('hex');

    res.json({
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_API_KEY,
      timestamp,
      folder: paramsToSign.folder,
      signature
    });
  } catch (e) { next(e); }
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => ({
    folder: `jiji/${req.user.id}`,
    allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  })
});
const upload = multer({ storage });

router.post('/image',generalLimiter, auth, upload.single('image'), (req, res) => {
  // req.file.path is the secure_url
  res.status(201).json({ url: req.file.path, public_id: req.file.filename });
})
module.exports = router;
// src/routes/uploads.routes.js