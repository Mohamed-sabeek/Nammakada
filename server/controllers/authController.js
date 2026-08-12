const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || (!email && !phone) || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        let query = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });
        
        const existingUser = await User.findOne({ $or: query });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email or phone already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'customer'
        });

        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Please provide identifier and password' });
        }

        const user = await User.findOne({ 
            $or: [{ email: identifier }, { phone: identifier }] 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileImage: user.profileImage
        } });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update Customer Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name) user.name = name;
        if (phone) {
            // Check if phone is already taken by another user
            const existingPhone = await User.findOne({ phone, _id: { $ne: req.user.userId } });
            if (existingPhone) {
                return res.status(400).json({ success: false, message: "Phone number already in use" });
            }
            user.phone = phone;
        }

        await user.save();
        
        res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully",
            data: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, profileImage: user.profileImage }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Please provide current and new password" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check current password
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const folder = user.role === 'admin' ? 'NammaKada/profiles/admin' : 'NammaKada/profiles/customers';

        const options = {
            folder,
            public_id: user._id.toString(),
            width: 400,
            height: 400,
            crop: "fill",
            overwrite: true
        };

        const result = await uploadToCloudinary(req.file.buffer, options);

        if (user.profileImage?.publicId && user.profileImage.publicId !== result.public_id) {
            await deleteFromCloudinary(user.profileImage.publicId);
        }

        user.profileImage = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Upload Avatar Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Unable to upload profile picture' });
    }
};

exports.removeAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.profileImage?.publicId) {
            await deleteFromCloudinary(user.profileImage.publicId);
        }

        user.profileImage = {
            url: "",
            publicId: ""
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture removed successfully'
        });
    } catch (error) {
        console.error('Remove Avatar Error:', error);
        res.status(500).json({ success: false, message: 'Unable to remove profile picture' });
    }
};
