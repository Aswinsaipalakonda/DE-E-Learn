const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', analyticsController.getStats);
router.get('/logs', analyticsController.getAuditLogs);

module.exports = router;
