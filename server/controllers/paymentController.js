const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification, notifyAdmins } = require('./notificationController');

const DELIVERY_FEE = 50;

// Initialize Razorpay
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { deliveryAddress } = req.body;

        if (!deliveryAddress) {
            return res.status(400).json({ success: false, message: "Delivery address is required" });
        }

        // Retrieve Cart without starting a transaction yet, since we are only calculating price
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let subtotal = 0;

        // Verify products and calculate totals from source of truth
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            
            if (!product || !product.isActive) {
                return res.status(400).json({ success: false, message: `Product ${item.product.name || 'Unknown'} is no longer available` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${product.name}` });
            }

            subtotal += product.price * item.quantity;
        }

        const totalAmount = subtotal + DELIVERY_FEE;
        const amountInPaise = Math.round(totalAmount * 100);

        const instance = getRazorpayInstance();
        
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `NK_RECEIPT_${req.user.userId}_${Date.now()}`
        };

        const razorpayOrder = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to initiate payment" });
    }
};

// Verify Razorpay Payment & Create NammaKada Order
exports.verifyRazorpayPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, deliveryAddress } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Invalid payment details" });
        }

        if (!deliveryAddress) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Delivery address is required" });
        }

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // Check for duplicate processing
        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id }).session(session);
        if (existingOrder) {
            await session.abortTransaction();
            session.endSession();
            // Return existing order successfully so frontend doesn't break if they double-clicked
            return res.status(200).json({ success: true, data: existingOrder });
        }

        // Retrieve Cart and apply same logic as createOrder
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product').session(session);
        
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let subtotal = 0;
        const orderItems = [];
        const stockAlerts = [];

        // Verify stock again inside transaction
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id).session(session);
            
            if (!product || !product.isActive) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: `Product ${item.product.name || 'Unknown'} is no longer available` });
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: `Not enough stock for ${product.name}` });
            }

            const oldStock = product.stock;
            product.stock -= item.quantity;
            await product.save({ session });

            if (oldStock > 5 && product.stock <= 5 && product.stock > 0) {
                stockAlerts.push({ type: 'low_stock_alert', title: 'Low Stock Alert', message: `${product.name} has only ${product.stock} items remaining.`, metadata: { productId: product._id } });
            } else if (oldStock > 0 && product.stock === 0) {
                stockAlerts.push({ type: 'product_out_of_stock', title: 'Product Out of Stock', message: `${product.name} is now out of stock.`, metadata: { productId: product._id } });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        const totalAmount = subtotal + DELIVERY_FEE;

        // Create Order
        const order = new Order({
            customer: req.user.userId,
            items: orderItems,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            totalAmount,
            deliveryAddress,
            paymentMethod: 'ONLINE',
            paymentStatus: 'paid',
            orderStatus: 'pending',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        await order.save({ session });

        // Clear Cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Notifications
        const shortId = `NK-${order._id.toString().slice(-4).toUpperCase()}`;
        
        createNotification({
            recipient: req.user.userId,
            recipientRole: 'customer',
            type: 'order_placed',
            title: 'Order Confirmed',
            message: `Your online payment for order #${shortId} was successful and your order has been placed.`,
            order: order._id
        });

        // Get customer name for admin notification
        const customerUser = await User.findById(req.user.userId).select('name');
        
        notifyAdmins({
            type: 'order_placed',
            title: 'New Order Received',
            message: `New online order #${shortId} has been placed by ${customerUser?.name || 'a customer'}.`,
            order: order._id
        });

        // Process stock alerts
        for (const alert of stockAlerts) {
            notifyAdmins(alert);
        }

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};
