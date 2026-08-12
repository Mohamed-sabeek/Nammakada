require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error("No admin found. Run seedAdmin.js first.");
            process.exit(1);
        }

        await Product.deleteMany({}); // Clear existing

        const products = [
            {
                name: "Organic Honey 500g",
                description: "Pure, locally sourced organic honey from local farms. Perfect for your daily health routine.",
                price: 350,
                discountPrice: 299,
                image: "https://images.unsplash.com/photo-1587049352847-4d4b170c0c0e?q=80&w=600&auto=format&fit=crop",
                category: "Groceries",
                stock: 20,
                rating: 4.8,
                reviewCount: 15,
                createdBy: admin._id
            },
            {
                name: "Handwoven Cotton Saree",
                description: "Beautiful traditional handwoven cotton saree. Comfortable and elegant for all occasions.",
                price: 2500,
                image: "https://images.unsplash.com/photo-1610189013532-60b64d1f56be?q=80&w=600&auto=format&fit=crop",
                category: "Fashion",
                stock: 10,
                rating: 4.5,
                reviewCount: 8,
                createdBy: admin._id
            },
            {
                name: "Local Filter Coffee Powder 250g",
                description: "Authentic South Indian filter coffee blend roasted to perfection.",
                price: 200,
                discountPrice: 180,
                image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop",
                category: "Groceries",
                stock: 50,
                rating: 4.9,
                reviewCount: 32,
                createdBy: admin._id
            },
            {
                name: "Handmade Clay Water Jug",
                description: "Traditional terracotta water jug that naturally cools water.",
                price: 450,
                image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop",
                category: "Home & Kitchen",
                stock: 15,
                rating: 4.6,
                reviewCount: 12,
                createdBy: admin._id
            }
        ];

        await Product.insertMany(products);
        console.log("✅ Seeded 4 local products successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding products:", error);
        process.exit(1);
    }
};

seedProducts();
