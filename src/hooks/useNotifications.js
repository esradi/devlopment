import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { message, isConnected } = useWebSocket('/notifications/');

    // Load initial notifications (could be from API)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://127.0.0.1:8000/api/notifications/', {
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

    return { notifications, unreadCount, isConnected };
};
