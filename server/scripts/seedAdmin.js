require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ MONGODB_URI is not defined in .env");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully.");

        const adminEmail = "admin@nammakada.com";
        const adminPhone = "9000000000";
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log(`⚠️ Admin account with email ${adminEmail} already exists.`);
            console.log("Exiting without creating duplicates.");
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@123", salt);

        // Create admin user
        const admin = new User({
            name: "NammaKada Admin",
            email: adminEmail,
            phone: adminPhone,
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        await admin.save();
        
        console.log("✅ Admin created successfully!");
        console.log("-----------------------------------------");
        console.log("Admin Login Credentials:");
        console.log(`Email: ${adminEmail}`);
        console.log("Password: Admin@123");
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
