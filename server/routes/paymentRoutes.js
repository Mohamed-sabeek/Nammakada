const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/razorpay/create-order', authMiddleware, createRazorpayOrder);
router.post('/razorpay/verify', authMiddleware, verifyRazorpayPayment);

module.exports = router;
