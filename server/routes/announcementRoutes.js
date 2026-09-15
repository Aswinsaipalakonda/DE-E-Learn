const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

function optionalAuth(req, res, next) {
  const hasToken = (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) || (req.cookies && req.cookies.de_token);
  if (hasToken) {
    return authenticate(req, res, next);
  }
  next();
}

router.get('/', optionalAuth, announcementController.getAnnouncements);
router.post('/', authenticate, authorizeRoles('admin'), announcementController.createAnnouncement);
router.delete('/:id', authenticate, authorizeRoles('admin'), announcementController.deleteAnnouncement);

module.exports = router;
