const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes here are strictly for admins
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Dashboard Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Customers
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id/status', adminController.updateCustomerStatus);

// Orders
router.get('/orders', orderController.adminGetOrders);
router.get('/orders/:id', orderController.adminGetOrderById);
router.put('/orders/:id/status', orderController.adminUpdateOrderStatus);

module.exports = router;
