const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// Public/Customer routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), productController.getAdminProducts);
router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('image'), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), productController.deleteProduct);

module.exports = router;
