import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axios';
import { showBrowserNotification, requestNotificationPermission } from '../utils/notificationHelper';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();
        requestNotificationPermission();

        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_user', user._id);
        });

        newSocket.on('notification_received', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show Browser Notification
            showBrowserNotification(notification.title, notification.message, notification.link);
        });

        return () => newSocket.disconnect();
    }, [user?.id]); // Re-run if user changes

    const markAsRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            fetchNotifications,
            socket
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
