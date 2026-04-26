import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    Check, 
    X, 
    Clock, 
    Briefcase, 
    MessageSquare, 
    Target, 
    ShieldCheck, 
    ExternalLink,
    MailCheck
} from 'lucide-react';
import { notificationService } from '../../services/api';
import './NotificationCenter.css';

const NotificationCenter = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAll();
            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application_submitted':
            case 'application_accepted':
            case 'application_refused':
                return <Briefcase size={16} />;
            case 'new_message':
                return <MessageSquare size={16} />;
            case 'challenge_passed':
            case 'skill_verified':
                return <Target size={16} />;
            case 'convention_validated':
            case 'company_validated':
                return <ShieldCheck size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-center-container" ref={dropdownRef}>
            <button 
                className="nav-action-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="action-badge"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="notification-dropdown"
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="dropdown-header">
                            <h3>Notifications</h3>
                            <div className="header-actions">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="btn-mark-all">
                                        <Check size={14} /> Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="notifications-list custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <motion.div 
                                        key={notification.id}
                                        className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className={`notification-icon ${notification.type}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title-row">
                                                <h4>{notification.title}</h4>
                                                <span className="notification-time">
                                                    <Clock size={10} /> {formatTime(notification.created_at)}
                                                </span>
                                            </div>
                                            <p>{notification.message}</p>
                                            {notification.action_url && (
                                                <a href={notification.action_url} className="notification-action">
                                                    {notification.action_text || 'View details'} <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                        {!notification.is_read && <div className="unread-dot"></div>}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-notifications">
                                    <MailCheck size={40} className="empty-icon" />
                                    <p>All caught up!</p>
                                    <span>No new notifications at the moment.</span>
                                </div>
                            )}
                        </div>

                        <div className="dropdown-footer">
                            <button onClick={() => { setIsOpen(false); /* Navigate to settings? */ }}>
                                Notification Settings
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
