const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public contact submission
router.post('/', inquiryController.createInquiry);

// Admin review and resolution
router.get('/', authenticate, authorizeRoles('admin'), inquiryController.getInquiries);
router.put('/:id', authenticate, authorizeRoles('admin'), inquiryController.updateInquiry);

module.exports = router;
