const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Admin only routes
router.use(authenticate, authorizeRoles('admin'));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.post('/:id/reset-password', userController.resetPassword);
router.delete('/:id', userController.deleteUser);
router.post('/bulk-import', userController.bulkImportUsers);

module.exports = router;
