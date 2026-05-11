import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, MoreVertical, Paperclip, Smile, Bell, User, Plus } from 'lucide-react';
import { messageService, notificationService } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
// mediaUrl handles attachment URLs without hardcoding localhost
import { mediaUrl } from '../../config';
import './StudentMessages.css';

const StudentMessages = ({ userData }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('messages');
    const [alerts, setAlerts] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const myId = userData?.user_id || userData?.id;

    // WebSocket for real-time messages
    const { message: wsMessage } = useWebSocket('/messages/');

    const groupIntoConversations = (msgs, currentUserId) => {
        const convMap = {};
        msgs.forEach(msg => {
            const otherId = String(msg.sender) === String(currentUserId) ? msg.receiver : msg.sender;
            const otherName = String(msg.sender) === String(currentUserId) ? msg.receiver_name : msg.sender_name;
            if (!convMap[otherId]) {
                convMap[otherId] = {
                    id: otherId,
                    name: otherName || `User ${otherId}`,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName || 'U')}&background=9e59ff&color=fff`,
                    messages: [],
                    lastMessage: '',
                    lastTime: ''
                };
            }
            convMap[otherId].messages.push(msg);
            convMap[otherId].lastMessage = msg.content;
            convMap[otherId].lastTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        return Object.values(convMap).sort((a, b) => {
            const lastA = new Date(a.messages[a.messages.length - 1]?.created_at);
            const lastB = new Date(b.messages[b.messages.length - 1]?.created_at);
            return lastB - lastA;
        });
    };

    const fetchData = async () => {
        try {
            const [msgData, notifData] = await Promise.all([
                messageService.getAll(),
                notificationService.getAll()
            ]);
            const msgs = Array.isArray(msgData) ? msgData : msgData?.results || msgData?.messages || [];
            const convs = groupIntoConversations(msgs, myId);
            setConversations(convs);
            if (convs.length > 0 && !activeConvId) {
                const isMobile = window.innerWidth <= 768;
                if (!isMobile) setActiveConvId(convs[0].id);
            }

            const alertsList = Array.isArray(notifData) ? notifData : notifData?.results || notifData?.notifications || [];
            setAlerts(alertsList);
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Handle real-time WebSocket messages
    useEffect(() => {
        if (wsMessage && wsMessage.type === 'chat_message') {
            const newMsg = wsMessage.message;
            const otherId = String(newMsg.sender) === String(myId) ? newMsg.receiver : newMsg.sender;

            setConversations(prev => {
                const existingConv = prev.find(c => String(c.id) === String(otherId));
                let updatedConvs;

                if (existingConv) {
                    if (existingConv.messages.some(m => m.id === newMsg.id)) return prev;

                    updatedConvs = prev.map(c => {
                        if (String(c.id) === String(otherId)) {
                            return {
                                ...c,
                                messages: [...c.messages, newMsg],
                                lastMessage: newMsg.content,
                                lastTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                        }
                        return c;
                    });
                } else {
                    const otherName = String(newMsg.sender) === String(myId) ? newMsg.receiver_name : newMsg.sender_name;
                    const newConv = {
                        id: otherId,
                        name: otherName || `User ${otherId}`,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName || 'U')}&background=9e59ff&color=fff`,
                        messages: [newMsg],
                        lastMessage: newMsg.content,
                        lastTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    updatedConvs = [newConv, ...prev];
                }

                return [...updatedConvs].sort((a, b) => {
                    const timeA = a.messages[a.messages.length - 1]?.created_at;
                    const timeB = b.messages[b.messages.length - 1]?.created_at;
                    return new Date(timeB) - new Date(timeA);
                });
            });

            if (String(otherId) === String(activeConvId)) {
                messageService.markRead(activeConvId).then(() => {
                    window.dispatchEvent(new CustomEvent('messagesRead'));
                });
            }
        }
    }, [wsMessage, myId, activeConvId]);

    // Mark as read when switching conversations
    useEffect(() => {
        if (activeConvId) {
            messageService.markRead(activeConvId).then(() => {
                window.dispatchEvent(new CustomEvent('messagesRead'));
            });
        }
    }, [activeConvId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, conversations]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !activeConvId) return;
        try {
            const res = await messageService.create({
                content: messageInput.trim(),
                receiver: activeConvId
            });
            setMessageInput('');
            // The UI will update via WebSocket broadcast
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConvId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('attachment', file);
        formData.append('receiver', activeConvId);
        formData.append('content', `Shared a ${file.type.startsWith('image/') ? 'photo' : 'file'}`);
        formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'file');

        try {
            await messageService.create(formData);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const activeConv = conversations.find(c => String(c.id) === String(activeConvId));
    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="messages-loading">Loading Messaging Hub...</div>;

    return (
        <div className="messages-container">
            <div className={`messages-sidebar ${activeConvId && activeTab === 'messages' ? 'hidden' : ''}`}>
                <div className="messages-sidebar-header">
                    <div className="header-top">
                        <h2>Messaging Hub</h2>
                    </div>

                    <div className="messages-tabs">
                        <button
                            className={`m-tab ${activeTab === 'messages' ? 'active' : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            <MessageSquare size={16} />
                            <span>Chats</span>
                        </button>
                        <button
                            className={`m-tab ${activeTab === 'alerts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alerts')}
                        >
                            <Bell size={16} />
                            <span>Alerts</span>
                            {alerts.length > 0 && <span className="tab-badge">{alerts.length}</span>}
                        </button>
                    </div>

                    <div className="messages-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="conversations-list">
                    {activeTab === 'alerts' ? (
                        alerts.length === 0 ? (
                            <div className="empty-convs">
                                <Bell size={40} opacity={0.3} />
                                <p>No notifications yet</p>
                            </div>
                        ) : alerts.map(alert => (
                            <div key={alert.id} className="conversation-item alert-item">
                                <div className="alert-icon-circle"><Bell size={18} /></div>
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <h4>{alert.title || 'System Alert'}</h4>
                                        <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p>{alert.message || alert.content}</p>
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length === 0 ? (
                        <div className="empty-convs">
                            <MessageSquare size={40} opacity={0.3} />
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${String(activeConvId) === String(conv.id) ? 'active' : ''}`}
                                onClick={() => setActiveConvId(conv.id)}
                            >
                                <div className="avatar-wrapper">
                                    <img src={conv.avatar} alt={conv.name} className="conv-avatar" />
                                    <div className="status-indicator online"></div>
                                </div>
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <h4>{conv.name}</h4>
                                        <span>{conv.lastTime}</span>
                                    </div>
                                    <p className="last-msg-preview">{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={`messages-main ${activeConvId && activeTab === 'messages' ? 'visible' : ''}`}>
                {activeTab === 'alerts' ? (
                    <div className="no-chat-selected">
                        <div className="empty-state-icon">
                            <Bell size={64} />
                        </div>
                        <h3>Your Notification Center</h3>
                        <p>Stay informed about your internship applications and platform updates.</p>
                    </div>
                ) : activeConv ? (
                    <>
                        <div className="chat-header">
                            <button 
                                className="back-btn-mobile"
                                onClick={() => setActiveConvId(null)}
                            >
                                ←
                            </button>
                            <div className="chat-user-info">
                                <div className="avatar-wrapper">
                                    <img src={activeConv.avatar} alt={activeConv.name} className="chat-avatar" />
                                    <div className="status-indicator online pulse"></div>
                                </div>
                                <div>
                                    <h3>{activeConv.name}</h3>
                                    <div className="chat-subtitle">
                                        <span className="online-text">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button className="chat-tool-btn"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {activeConv.messages.map((msg, idx) => {
                                const isMe = String(msg.sender) === String(myId);
                                return (
                                    <div key={msg.id || idx} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                        {!isMe && <img src={activeConv.avatar} alt="" className="message-mini-avatar" />}
                                        <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                            {msg.message_type === 'image' && msg.attachment && (
                                                <div className="message-attachment image">
                                                    <img
                                                        src={mediaUrl(msg.attachment)}
                                                        alt="Attachment"
                                                        onClick={() => window.open(mediaUrl(msg.attachment))}
                                                    />
                                                </div>
                                            )}
                                            {msg.message_type === 'file' && msg.attachment && (
                                                <div
                                                    className="message-attachment file"
                                                    onClick={() => {
                                                        const url = mediaUrl(msg.attachment);
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    <div className="file-icon-box">
                                                        <Paperclip size={18} />
                                                    </div>
                                                    <div className="file-details">
                                                        <span className="file-name">{msg.attachment.split('/').pop()}</span>
                                                        <span className="file-size">Click to open or download</span>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="message-text">{msg.content}</p>
                                            <span className="message-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <div className="chat-input-wrapper">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    className={`tool-btn ${isUploading ? 'uploading' : ''}`}
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isUploading}
                                >
                                    <Plus size={22} />
                                </button>

                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />

                                <button type="submit" className="send-btn" disabled={!messageInput.trim() || isUploading}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-state-icon">
                            <MessageSquare size={64} />
                        </div>
                        <h3>Select a conversation</h3>
                        <p>Pick a contact from the list to start your internship journey.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMessages;