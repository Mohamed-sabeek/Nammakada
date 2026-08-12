const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Get all active products with pagination, search, category, sort
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '', category = '', sort = '' } = req.query;

        const query = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                totalProducts: count
            }
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Get all products (including inactive)
exports.getAdminProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category = '', status = '', sort = '' } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        if (status) {
            if (status === 'active') query.isActive = true;
            if (status === 'inactive') query.isActive = false;
            if (status === 'out_of_stock') query.stock = 0;
            if (status === 'low_stock') query.stock = { $gt: 0, $lte: 5 };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'stock_asc') sortOption = { stock: 1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                totalProducts: count
            }
        });
    } catch (error) {
        console.error("Admin Get Products Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get single active product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Get Product Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Create Product
exports.createProduct = async (req, res) => {
    try {
        let imageUrl = null;
        let imagePublicId = null;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        } else if (req.body.image) {
            // Fallback for seeded data or URL provided directly
            imageUrl = req.body.image;
        }

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "Please provide a product image" });
        }

        const product = new Product({
            ...req.body,
            image: imageUrl,
            imagePublicId: imagePublicId,
            createdBy: req.user.userId
        });
        
        await product.save();
        res.status(201).json({ success: true, data: product, message: "Product created successfully" });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

// Admin: Update Product
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let updateData = { ...req.body };

        if (req.file) {
            // Upload new image
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;
            updateData.imagePublicId = result.public_id;

            // Delete old image if it existed in Cloudinary
            if (product.imagePublicId) {
                await deleteFromCloudinary(product.imagePublicId);
            }
        }

        product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        
        res.status(200).json({ success: true, data: product, message: "Product updated successfully" });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Admin: Delete Product (Actually deactivates for data safety unless specified otherwise)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Hard delete is requested if ?force=true is passed
        if (req.query.force === 'true') {
            if (product.imagePublicId) {
                await deleteFromCloudinary(product.imagePublicId);
            }
            await Product.findByIdAndDelete(req.params.id);
            return res.status(200).json({ success: true, message: "Product permanently deleted" });
        }

        // Otherwise deactivate
        product.isActive = !product.isActive;
        await product.save();

        res.status(200).json({ success: true, data: product, message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
