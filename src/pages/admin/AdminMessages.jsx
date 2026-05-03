import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, MoreVertical, Paperclip, Smile, Plus, UserPlus, X } from 'lucide-react';
import { messageService } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import './AdminMessages.css';

const AdminMessages = ({ userData }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [allContacts, setAllContacts] = useState([]);
    const [showContactSearch, setShowContactSearch] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // WebSocket for real-time messages
    const { message: wsMessage } = useWebSocket('/messages/');

    // Robust ID detection
    const getMyId = () => {
        if (userData?.id) return userData.id;
        if (userData?.user_id) return userData.user_id;
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            return storedUser?.id || storedUser?.user_id;
        } catch (e) { return null; }
    };
    const myId = getMyId();

    const groupIntoConversations = (msgs, currentUserId) => {
        const convMap = {};
        msgs.forEach(msg => {
            const otherId = msg.sender === currentUserId ? msg.receiver : msg.sender;
            const otherName = msg.sender === currentUserId ? msg.receiver_name : msg.sender_name;
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
            const [msgData, contactData] = await Promise.all([
                messageService.getAll(),
                messageService.getContacts()
            ]);
            
            const msgs = Array.isArray(msgData) ? msgData : msgData?.results || msgData?.messages || [];
            const contacts = Array.isArray(contactData) ? contactData : contactData?.results || [];
            
            setAllContacts(contacts.filter(c => c.id !== myId));
            const convs = groupIntoConversations(msgs, myId);
            setConversations(convs);
            if (convs.length > 0 && !activeConvId) setActiveConvId(convs[0].id);
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

            // If this message is for the active conversation, mark it as read instantly
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
        
        const content = messageInput.trim();
        setMessageInput('');

        try {
            await messageService.create({
                content: content,
                receiver: activeConvId,
                message_type: 'text'
            });
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleFileSelect = () => fileInputRef.current?.click();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConvId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('receiver', activeConvId);
        formData.append('attachment', file);
        formData.append('message_type', file.type.startsWith('image/') ? 'image' : 'file');
        formData.append('content', `Shared a ${file.type.startsWith('image/') ? 'photo' : 'file'}`);

        try {
            // Note: messageService.create must support FormData
            await messageService.create(formData);
        } catch (err) {
            console.error("Failed to upload file:", err);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const startNewChat = (contact) => {
        const existingConv = conversations.find(c => c.id === contact.id);
        if (existingConv) {
            setActiveConvId(contact.id);
        } else {
            const newConv = {
                id: contact.id,
                name: `${contact.first_name} ${contact.last_name}`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.first_name || 'U')}&background=9e59ff&color=fff`,
                messages: [],
                lastMessage: 'Start a new conversation',
                lastTime: 'Now'
            };
            setConversations([newConv, ...conversations]);
            setActiveConvId(contact.id);
        }
        setShowContactSearch(false);
    };

    const activeConv = conversations.find(c => c.id === activeConvId);
    
    // Determine what to display in the sidebar
    const filteredConversations = conversations.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredContacts = allContacts.filter(c => {
        const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || '';
        return fullName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) return (
        <div className="admin-messages-loading">
            <div className="spinner"></div>
            <span>Syncing Messages...</span>
        </div>
    );

    return (
        <div className="admin-messages-container glass-effect">
            <div className="admin-messages-sidebar">
                <div className="messages-sidebar-header">
                    <div className="sidebar-title-row">
                        <h2>Inbox</h2>
                        <button 
                            className={`new-chat-btn ${showContactSearch ? 'active' : ''}`} 
                            onClick={() => {
                                setShowContactSearch(!showContactSearch);
                                setSearchQuery('');
                            }}
                            title="Start New Conversation"
                        >
                            {showContactSearch ? <X size={18} /> : <UserPlus size={18} />}
                        </button>
                    </div>
                    <div className={`messages-search-wrapper ${searchQuery ? 'has-text' : ''}`}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={showContactSearch ? "Search people..." : "Search messages..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="conversations-list custom-scrollbar">
                    {searchQuery ? (
                        <div className="unified-search-results animate-in">
                            {/* MATCHING CONVERSATIONS */}
                            {filteredConversations.length > 0 && (
                                <div className="search-section">
                                    <div className="section-header">
                                        <span>Conversations</span>
                                        <span className="count">{filteredConversations.length}</span>
                                    </div>
                                    {filteredConversations.map(conv => (
                                        <div 
                                            key={conv.id} 
                                            className={`conversation-item ${activeConvId === conv.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveConvId(conv.id);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div className="avatar-wrapper">
                                                <img src={conv.avatar} alt={conv.name} className="conv-avatar" />
                                                {conv.isOnline && <div className="online-indicator"></div>}
                                            </div>
                                            <div className="conv-info">
                                                <div className="conv-header">
                                                    <h4>{conv.name}</h4>
                                                    <span className="time">{conv.lastTime}</span>
                                                </div>
                                                <p>{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* MATCHING CONTACTS (who aren't already in convs) */}
                            {filteredContacts.length > 0 && (
                                <div className="search-section">
                                    <div className="section-header">
                                        <span>New People</span>
                                        <span className="count">{filteredContacts.length}</span>
                                    </div>
                                    {filteredContacts.map(contact => {
                                        const isInConvs = conversations.some(c => c.id === contact.id);
                                        if (isInConvs) return null; // Don't show duplicates
                                        
                                        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || 'Unknown';
                                        return (
                                            <div 
                                                key={contact.id} 
                                                className="conversation-item contact-item"
                                                onClick={() => {
                                                    startNewChat(contact);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <div className="avatar-wrapper">
                                                    <div className="profile-avatar mini" style={{ backgroundColor: '#9e59ff' }}>
                                                        {fullName.charAt(0)}
                                                    </div>
                                                    <div className="role-badge" data-role={contact.role}></div>
                                                </div>
                                                <div className="conv-info">
                                                    <div className="conv-header">
                                                        <h4>{fullName}</h4>
                                                    </div>
                                                    <p className="contact-role">{contact.role}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {filteredConversations.length === 0 && filteredContacts.length === 0 && (
                                <div className="no-results">
                                    <Search size={32} opacity={0.2} />
                                    <p>No results for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="conversations-view animate-in">
                            {conversations.length === 0 ? (
                                <div className="no-results">
                                    <MessageSquare size={32} opacity={0.2} />
                                    <p>Your inbox is empty</p>
                                    <button className="start-btn" onClick={() => setShowContactSearch(true)}>
                                        Find someone to message
                                    </button>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div 
                                        key={conv.id} 
                                        className={`conversation-item ${activeConvId === conv.id ? 'active' : ''}`}
                                        onClick={() => setActiveConvId(conv.id)}
                                    >
                                            <div className="avatar-wrapper">
                                                <img src={conv.avatar} alt={conv.name} className="conv-avatar" />
                                                {conv.isOnline && <div className="online-indicator"></div>}
                                            </div>
                                        <div className="conv-info">
                                            <div className="conv-header">
                                                <h4>{conv.name}</h4>
                                                <span className="time">{conv.lastTime}</span>
                                            </div>
                                            <div className="conv-preview">
                                                <p>{conv.lastMessage}</p>
                                                {conv.unreadCount > 0 && <span className="unread-dot">{conv.unreadCount}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="admin-messages-main">
                {activeConv ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <div className="avatar-wrapper">
                                    <img src={activeConv.avatar} alt={activeConv.name} className="chat-avatar" />
                                    <div className="online-indicator"></div>
                                </div>
                                <div className="user-text">
                                    <h3>{activeConv.name}</h3>
                                    <div className="status-row">
                                        <span className="pulse-dot"></span>
                                        <span className="status-text">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button className="action-icon-btn"><Search size={18} /></button>
                                <button className="action-icon-btn"><MoreVertical size={18} /></button>
                            </div>
                        </div>
                        <div className="chat-messages custom-scrollbar">
                            {activeConv.messages.length === 0 ? (
                                <div className="empty-chat-welcome">
                                    <div className="welcome-icon">
                                        <MessageSquare size={40} />
                                    </div>
                                    <h3>Message {activeConv.name}</h3>
                                    <p>Start your conversation. Be professional and helpful.</p>
                                </div>
                            ) : (
                                activeConv.messages.map((msg, idx) => {
                                    const isMe = String(msg.sender) === String(myId);
                                    return (
                                        <div key={msg.id || idx} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                            <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                                {msg.message_type === 'image' && msg.attachment && (
                                                    <div className="message-attachment image">
                                                        <img 
                                                            src={msg.attachment.startsWith('http') ? msg.attachment : `http://localhost:8000${msg.attachment}`} 
                                                            alt="Attachment" 
                                                            onClick={() => window.open(msg.attachment.startsWith('http') ? msg.attachment : `http://localhost:8000${msg.attachment}`)} 
                                                        />
                                                    </div>
                                                )}
                                                {msg.message_type === 'file' && msg.attachment && (
                                                    <div 
                                                        className="message-attachment file"
                                                        onClick={() => {
                                                            const url = msg.attachment.startsWith('http') ? msg.attachment : `http://localhost:8000${msg.attachment}`;
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
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                hidden 
                                onChange={handleFileUpload}
                                accept="image/*,application/pdf,.doc,.docx,.txt"
                            />
                            <div className="input-container glass-input">
                                <div className="input-tools left">
                                    <button 
                                        type="button" 
                                        className={`tool-btn ${uploading ? 'uploading' : ''}`}
                                        onClick={handleFileSelect}
                                        disabled={uploading}
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={uploading ? "Uploading file..." : "Write a message..."} 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    disabled={uploading}
                                />
                                <div className="input-tools right">
                                    <button type="submit" className="send-btn-modern" disabled={!messageInput.trim() || uploading}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected-v2">
                        <div className="illustration-wrapper">
                            <MessageSquare size={80} strokeWidth={1} opacity={0.1} />
                            <div className="floating-icons">
                                <span className="icon-1">✉️</span>
                                <span className="icon-2">💬</span>
                                <span className="icon-3">👋</span>
                            </div>
                        </div>
                        <h3>Select a conversation</h3>
                        <p>Choose from your existing messages or start a new one to begin.</p>
                        <button className="primary-btn" onClick={() => setShowContactSearch(true)}>
                            New Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
