import React, { useState } from 'react';
import { Bell, X, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, isConnected } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleNotificationClick = (notif) => {
        if (notif.action_url) {
            navigate(notif.action_url);
        }
        setIsOpen(false);
        // Optional: Call API to mark as read
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" style={{ position: 'relative' }}>
            <button 
                onClick={toggleDropdown}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#8892b0',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                }}
                className={isOpen ? 'active' : ''}
            >
                <Bell size={22} color={isOpen ? '#9e59ff' : 'currentColor'} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#ff1b90',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #050505',
                        boxSizing: 'content-box'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '12px',
                            width: '320px',
                            background: '#111111',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: isConnected ? '#10b981' : '#ff4d4d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                    {isConnected ? 'Live' : 'Offline'}
                                </span>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8892b0' }}>
                                    <Bell size={32} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        style={{
                                            padding: '16px',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            background: notif.is_read ? 'transparent' : 'rgba(158, 89, 255, 0.05)',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(158, 89, 255, 0.05)'}
                                    >
                                        {!notif.is_read && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '8px',
                                                top: '24px',
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: '#9e59ff'
                                            }}></div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{notif.title}</span>
                                            <span style={{ fontSize: '10px', color: '#8892b0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={10} /> {formatTime(notif.created_at)}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#8892b0', lineHeight: '1.4' }}>{notif.message}</p>
                                        {notif.action_text && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#9e59ff', fontSize: '11px', fontWeight: '600' }}>
                                                {notif.action_text} <ExternalLink size={10} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <button style={{ background: 'none', border: 'none', color: '#9e59ff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
