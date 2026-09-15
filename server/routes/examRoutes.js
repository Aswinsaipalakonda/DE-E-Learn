const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.get('/', examController.getExams);
router.post('/', authenticate, authorizeRoles('admin'), examController.createExam);
router.delete('/:id', authenticate, authorizeRoles('admin'), examController.deleteExam);

module.exports = router;
