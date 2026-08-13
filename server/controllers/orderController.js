const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification, notifyAdmins } = require('./notificationController');

const DELIVERY_FEE = 50; // Fixed delivery fee configuration

// Place Order
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { deliveryAddress, paymentMethod = 'COD' } = req.body;

        if (!deliveryAddress) {
            return res.status(400).json({ success: false, message: "Delivery address is required" });
        }

        if (paymentMethod !== 'COD' && paymentMethod !== 'ONLINE') {
            return res.status(400).json({ success: false, message: "Invalid payment method" });
        }

        // Retrieve Cart
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product').session(session);
        
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let subtotal = 0;
        const orderItems = [];
        const stockAlerts = [];

        // Verify products and calculate totals from source of truth
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
            // Deduct stock
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
                price: product.price, // Save price snapshot
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
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending'
        });

        await order.save({ session });

        // Clear Cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Fire notifications after successful transaction
        const shortId = `NK-${order._id.toString().slice(-4).toUpperCase()}`;
        
        createNotification({
            recipient: req.user.userId,
            recipientRole: 'customer',
            type: 'order_placed',
            title: 'Order Placed',
            message: `Your order #${shortId} has been placed successfully.`,
            order: order._id
        });

        // Get customer name for admin notification
        const customerUser = await User.findById(req.user.userId).select('name');
        
        notifyAdmins({
            type: 'order_placed',
            title: 'New Order Received',
            message: `New order #${shortId} has been placed by ${customerUser?.name || 'a customer'}.`,
            order: order._id
        });

        stockAlerts.forEach(alert => notifyAdmins(alert));

        res.status(201).json({ success: true, data: order, message: "Order placed successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Customer: Get Orders
exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', date = '', sort = 'newest' } = req.query;
        let query = { customer: req.user.userId };

        // 1. Status Filter
        if (status && status !== 'all') {
            if (status === 'active') {
                query.orderStatus = { $in: ['pending', 'confirmed', 'packed', 'out_for_delivery'] };
            } else if (status === 'completed') {
                query.orderStatus = 'delivered';
            } else {
                query.orderStatus = status;
            }
        }

        // 2. Date Filter
        if (date && date !== 'all_time') {
            const now = new Date();
            let startDate;
            if (date === 'today') {
                startDate = new Date(now.setHours(0,0,0,0));
            } else if (date === 'last_7_days') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
            } else if (date === 'last_30_days') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
            } else if (date === 'this_year') {
                startDate = new Date(now.getFullYear(), 0, 1);
            }
            if (startDate) query.createdAt = { $gte: startDate };
        }

        // 3. Search Filter
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [
                { 'items.name': searchRegex }
            ];
            if (search.length >= 4) {
                if (mongoose.Types.ObjectId.isValid(search)) {
                    query.$or.push({ _id: search });
                }
            }
        }

        // 4. Sort
        let sortObj = { createdAt: -1 };
        if (sort === 'oldest') sortObj = { createdAt: 1 };
        if (sort === 'highest_amount') sortObj = { totalAmount: -1 };
        if (sort === 'lowest_amount') sortObj = { totalAmount: 1 };

        const orders = await Order.find(query)
            .sort(sortObj)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
            
        const count = await Order.countDocuments(query);

        res.status(200).json({ 
            success: true, 
            data: {
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                totalOrders: count
            }
        });
    } catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Customer: Get Order Summary
exports.getCustomerOrderSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const all = await Order.countDocuments({ customer: userId });
        const pending = await Order.countDocuments({ customer: userId, orderStatus: 'pending' });
        const active = await Order.countDocuments({ customer: userId, orderStatus: { $in: ['pending', 'confirmed', 'packed', 'out_for_delivery'] } });
        const completed = await Order.countDocuments({ customer: userId, orderStatus: 'delivered' });
        const cancelled = await Order.countDocuments({ customer: userId, orderStatus: 'cancelled' });

        res.status(200).json({
            success: true,
            data: { all, pending, active, completed, cancelled }
        });
    } catch (error) {
        console.error("Customer Order Summary Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Customer: Get Single Order
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, customer: req.user.userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Get Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Customer: Cancel Order
exports.cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ _id: req.params.id, customer: req.user.userId }).session(session);
        
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.orderStatus !== 'pending') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "This order can no longer be cancelled." });
        }

        order.orderStatus = 'cancelled';
        await order.save({ session });

        // Restore inventory
        for (const item of order.items) {
            const product = await Product.findById(item.product).session(session);
            if (product) {
                product.stock += item.quantity;
                await product.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        const customerUser = await User.findById(req.user.userId).select('name');
        const shortId = `NK-${order._id.toString().slice(-4).toUpperCase()}`;

        notifyAdmins({
            type: 'order_cancelled',
            title: 'Order Cancelled',
            message: `Order #${shortId} has been cancelled by ${customerUser?.name || 'a customer'}.`,
            order: order._id
        });

        res.status(200).json({ success: true, data: order, message: "Order cancelled successfully" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Cancel Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Get All Orders
exports.adminGetOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = '', paymentStatus = '', date = '', sort = 'newest' } = req.query;
        let query = {};

        if (status && status !== 'all') {
            if (status === 'completed') query.orderStatus = 'delivered';
            else query.orderStatus = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            query.paymentStatus = paymentStatus;
        }

        // Date Filter
        if (date && date !== 'all_time') {
            const now = new Date();
            let startDate;
            if (date === 'today') {
                startDate = new Date(now.setHours(0,0,0,0));
            } else if (date === 'last_7_days') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
            } else if (date === 'last_30_days') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
            } else if (date === 'this_year') {
                startDate = new Date(now.getFullYear(), 0, 1);
            }
            if (startDate) query.createdAt = { $gte: startDate };
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            const users = await mongoose.model('User').find({
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);

            query.$or = [
                { customer: { $in: userIds } },
                { 'items.name': searchRegex }
            ];
            
            if (mongoose.Types.ObjectId.isValid(search)) {
                query.$or.push({ _id: search });
            }
        }

        // Sort
        let sortObj = { createdAt: -1 };
        if (sort === 'oldest') sortObj = { createdAt: 1 };
        if (sort === 'highest_amount') sortObj = { totalAmount: -1 };
        if (sort === 'lowest_amount') sortObj = { totalAmount: 1 };

        const orders = await Order.find(query)
            .sort(sortObj)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('customer', 'name email phone');

        const count = await Order.countDocuments(query);

        res.status(200).json({ 
            success: true, 
            data: {
                orders,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                totalOrders: count
            }
        });
    } catch (error) {
        console.error("Admin Get Orders Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Get Order Summary
exports.adminGetOrderSummary = async (req, res) => {
    try {
        const all = await Order.countDocuments();
        const pending = await Order.countDocuments({ orderStatus: 'pending' });
        const confirmed = await Order.countDocuments({ orderStatus: 'confirmed' });
        const packed = await Order.countDocuments({ orderStatus: 'packed' });
        const out_for_delivery = await Order.countDocuments({ orderStatus: 'out_for_delivery' });
        const completed = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelled = await Order.countDocuments({ orderStatus: 'cancelled' });

        res.status(200).json({
            success: true,
            data: { all, pending, confirmed, packed, out_for_delivery, completed, cancelled }
        });
    } catch (error) {
        console.error("Admin Order Summary Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Get Single Order
exports.adminGetOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Admin Get Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Update Order Status
exports.adminUpdateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        
        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // 1. Lock Verification
        if (oldOrder.orderStatus === 'delivered') {
            return res.status(400).json({ success: false, message: "Completed orders cannot be modified." });
        }

        let updateData = {};

        if (orderStatus && orderStatus !== oldOrder.orderStatus) {
            const validStatuses = ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];
            if (!validStatuses.includes(orderStatus)) {
                return res.status(400).json({ success: false, message: "Invalid order status" });
            }

            updateData.orderStatus = orderStatus;

            // Auto-update COD to paid if delivered
            if (orderStatus === 'delivered' && oldOrder.paymentMethod === 'COD') {
                updateData.paymentStatus = 'paid';
            }
        }

        if (paymentStatus && paymentStatus !== oldOrder.paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ success: true, data: oldOrder, message: "No changes made" });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true }
        ).populate('customer', 'name email phone');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Notification Logic
        const shortId = `NK-${order._id.toString().slice(-4).toUpperCase()}`;

        if (updateData.orderStatus && oldOrder.orderStatus !== updateData.orderStatus) {
            let title = '';
            let message = '';
            let type = '';
            switch(updateData.orderStatus) {
                case 'confirmed':
                    title = 'Order Confirmed';
                    message = `Your order #${shortId} has been confirmed.`;
                    type = 'order_confirmed';
                    break;
                case 'packed':
                    title = 'Order Packed';
                    message = `Your order #${shortId} has been packed and is ready for delivery.`;
                    type = 'order_packed';
                    break;
                case 'out_for_delivery':
                    title = 'Out for Delivery';
                    message = `Your order #${shortId} is out for delivery.`;
                    type = 'order_out_for_delivery';
                    break;
                case 'delivered':
                    title = 'Order Delivered';
                    message = `Your order #${shortId} has been delivered successfully.`;
                    type = 'order_delivered';
                    break;
                case 'cancelled':
                    title = 'Order Cancelled';
                    message = `Your order #${shortId} has been cancelled.`;
                    type = 'order_cancelled';
                    break;
            }
            if (type) {
                createNotification({
                    recipient: order.customer._id,
                    recipientRole: 'customer',
                    type,
                    title,
                    message,
                    order: order._id
                });
            }
        }

        if (updateData.paymentStatus && oldOrder.paymentStatus !== updateData.paymentStatus && updateData.paymentStatus === 'paid') {
            createNotification({
                recipient: order.customer._id,
                recipientRole: 'customer',
                type: 'payment_received',
                title: 'Payment Received',
                message: `Payment for order #${shortId} has been received.`,
                order: order._id
            });
        }

        res.status(200).json({ success: true, data: order, message: "Order updated successfully" });
    } catch (error) {
        console.error("Admin Update Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
