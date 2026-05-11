import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { API_URL } from '../config';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { message, isConnected } = useWebSocket('/notifications/');

    // Load initial notifications (could be from API)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_URL}/api/notifications/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setNotifications(data.results || data);
                setUnreadCount(data.unread_count || 0);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    // Handle incoming real-time notifications
    useEffect(() => {
        if (message) {
            if (message.type === 'notification_message') {
                const newNotif = message.notification;
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show a toast notification if possible
                if (window.Notification && window.Notification.permission === 'granted') {
                    new window.Notification(newNotif.title, { body: newNotif.message });
                }
            } else if (message.type === 'notification_read') {
                setNotifications(prev => prev.map(n => 
                    n.id === message.notification_id ? { ...n, is_read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else if (message.type === 'all_notifications_read') {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        }
    }, [message]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/notifications/${id}/mark-read/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                // Optimistic update
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/notifications/mark-all-read/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead };
};
