const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quality: { type: String, default: 'Standard', trim: true },
    discountPrice: { type: Number, default: null },
    image: {
        type: String,
        required: [true, 'Please provide an image URL'],
    },
    imagePublicId: {
        type: String,
        default: null
    },
    images: [{ type: String }],
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
