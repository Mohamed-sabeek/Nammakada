const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All order routes require auth
router.use(authMiddleware);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/summary', orderController.getCustomerOrderSummary);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.get('/admin/summary', roleMiddleware('admin'), orderController.adminGetOrderSummary);
router.get('/admin/all', roleMiddleware('admin'), orderController.adminGetOrders);
router.put('/admin/:id/status', roleMiddleware('admin'), orderController.adminUpdateOrderStatus);

module.exports = router;
