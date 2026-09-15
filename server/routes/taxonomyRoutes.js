const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomyController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public read
router.get('/', taxonomyController.getTaxonomy);

// Admin modification
router.post('/branches', authenticate, authorizeRoles('admin'), taxonomyController.createBranch);
router.put('/branches/:code', authenticate, authorizeRoles('admin'), taxonomyController.updateBranch);

router.post('/regulations', authenticate, authorizeRoles('admin'), taxonomyController.createRegulation);

router.post('/subjects', authenticate, authorizeRoles('admin'), taxonomyController.createSubject);
router.put('/subjects/:code/:branch/:regulation', authenticate, authorizeRoles('admin'), taxonomyController.updateSubject);
router.delete('/subjects/:code/:branch/:regulation', authenticate, authorizeRoles('admin'), taxonomyController.deleteSubject);

module.exports = router;
