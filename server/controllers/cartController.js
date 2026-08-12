const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
        await cart.save();
    }
    return cart;
};

// Get Cart
exports.getCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user.userId);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: "Product not found or inactive" });
        }
        
        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        
        if (itemIndex > -1) {
            // Check stock
            if (cart.items[itemIndex].quantity + quantity > product.stock) {
                return res.status(400).json({ success: false, message: "Not enough stock available" });
            }
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = product.price; // Update to latest price
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: "Not enough stock available" });
            }
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate('items.product');
        
        res.status(200).json({ success: true, data: cart, message: "Added to cart" });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update Cart Item Quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
            return res.status(400).json({ success: false, message: "Product no longer available and removed from cart" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Not enough stock available" });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price; // sync price

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({ success: true, data: cart, message: "Cart updated" });
    } catch (error) {
        console.error("Update Cart Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({ success: true, data: cart, message: "Item removed from cart" });
    } catch (error) {
        console.error("Remove from Cart Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Clear Cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ success: true, data: cart, message: "Cart cleared" });
    } catch (error) {
        console.error("Clear Cart Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
