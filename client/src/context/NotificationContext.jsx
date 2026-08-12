import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [isAuthenticated]);

    const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
            if (page === 1) {
                setNotifications(data.data.notifications);
            } else {
                setNotifications(prev => [...prev, ...data.data.notifications]);
            }
            // Sync unread count locally just in case
            setUnreadCount(data.data.notifications.filter(n => !n.isRead).length); 
            // Note: In real life, the server count is the source of truth, but local filtering is a good fallback for the visible list.
            await fetchUnreadCount();
            return data.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Polling interval (e.g. every 45 seconds)
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 45000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    // Re-fetch when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated) {
                fetchUnreadCount();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
