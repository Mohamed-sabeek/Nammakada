const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const { upload } = require('../config/cloudinary');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/profile/avatar', authMiddleware, upload.single('image'), authController.uploadAvatar);
router.delete('/profile/avatar', authMiddleware, authController.removeAvatar);

module.exports = router;
