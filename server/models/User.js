const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    profileImage: {
        url: {
            type: String,
            default: ""
        },
        publicId: {
            type: String,
            default: ""
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure at least one of email or phone is provided
userSchema.pre('validate', function() {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Email or Phone is required');
        this.invalidate('phone', 'Email or Phone is required');
    }
});

module.exports = mongoose.model('User', userSchema);
