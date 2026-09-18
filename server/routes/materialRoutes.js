const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Optional auth helper to attach user if logged in
function optionalAuth(req, res, next) {
  const hasToken = (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) || (req.cookies && req.cookies.de_token);
  if (hasToken) {
    return authenticate(req, res, next);
  }
  next();
}

// Public or student filtered
router.get('/', optionalAuth, materialController.getMaterials);
router.get('/:id', optionalAuth, materialController.getMaterialById);

// Faculty or Admin uploads
router.post(
  '/upload',
  authenticate,
  authorizeRoles('faculty', 'admin'),
  upload.array('files', 10),
  materialController.uploadMaterial
);

router.put('/:id', authenticate, authorizeRoles('faculty', 'admin'), materialController.updateMaterial);
router.delete('/:id', authenticate, authorizeRoles('faculty', 'admin'), materialController.deleteMaterial);

// File download & bookmarks
router.get('/file/:fileId/download', optionalAuth, materialController.downloadFile);
router.get('/file/*', optionalAuth, materialController.downloadFile);
router.post('/:materialId/bookmark', authenticate, materialController.toggleBookmark);

module.exports = router;
