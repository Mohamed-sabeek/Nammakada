import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Cart
    const fetchCart = async () => {
        if (!isAuthenticated || user?.role !== 'customer') return;
        try {
            setIsLoading(true);
            const { data } = await api.get('/cart');
            setCart(data.data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated]);

    // Add to Cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            const { data } = await api.post('/cart', { productId, quantity });
            setCart(data.data);
            return { success: true, message: "Added to cart" };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Failed to add to cart"
            };
        }
    };

    // Update Quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            const { data } = await api.put(`/cart/${productId}`, { quantity });
            setCart(data.data);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || "Failed to update quantity"
            };
        }
    };

    // Remove Item
    const removeItem = async (productId) => {
        try {
            const { data } = await api.delete(`/cart/${productId}`);
            setCart(data.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: "Failed to remove item" };
        }
    };

    // Clear Cart
    const clearCart = async () => {
        try {
            await api.delete('/cart');
            setCart(prev => ({ ...prev, items: [] }));
            return { success: true };
        } catch (error) {
            return { success: false, message: "Failed to clear cart" };
        }
    };

    // Derived State
    const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    
    // Note: the backend recalculates this during checkout, but we calculate it here for display
    const subtotal = cart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    const deliveryFee = 50;
    const total = subtotal > 0 ? subtotal + deliveryFee : 0;

    return (
        <CartContext.Provider value={{
            cart,
            isLoading,
            itemCount,
            subtotal,
            deliveryFee,
            total,
            fetchCart,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
