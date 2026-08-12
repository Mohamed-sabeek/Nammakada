const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to create notifications internally
exports.createNotification = async ({ recipient, recipientRole, type, title, message, order = null, metadata = {} }) => {
    try {
        const notification = new Notification({
            recipient,
            recipientRole,
            type,
            title,
            message,
            order,
            metadata
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        // We don't throw here to prevent blocking the main business logic (like order creation) if notification fails
    }
};

// Helper to create notifications for all admins
exports.notifyAdmins = async ({ type, title, message, order = null, metadata = {} }) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('_id');
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            recipientRole: 'admin',
            type,
            title,
            message,
            order,
            metadata
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error("Error notifying admins:", error);
    }
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const query = { recipient: req.user.userId };

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('order', 'orderStatus paymentStatus totalAmount'); // Optional context

        const count = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            recipient: req.user.userId, 
            isRead: false 
        });

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id, 
            recipient: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
