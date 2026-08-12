const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        // Total sales from delivered or paid orders (business logic: completed orders)
        // Here we'll count 'delivered' orders since it's COD focused.
        const salesData = await Order.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalCustomers,
                totalSales,
                pendingOrders,
                outOfStockProducts,
                lowStockProducts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get All Customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Customer Status (Deactivate/Activate)
exports.updateCustomerStatus = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        
        customer.isActive = req.body.isActive;
        await customer.save();

        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
