import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        if (token) {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                logout();
            }
        } else {
            setIsAuthenticated(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMe();
    }, [token]);

    const login = async (identifier, password) => {
        try {
            const res = await api.post('/auth/login', { identifier, password });
            const { token: newToken, user: userData } = res.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            const { token: newToken, user: newUserData } = res.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUserData);
            setIsAuthenticated(true);
            return { success: true, user: newUserData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
