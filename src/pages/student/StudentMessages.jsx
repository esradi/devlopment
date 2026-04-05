import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MoreVertical,
    Video,
    Plus,
    Smile,
    Send,
    ShieldCheck
} from 'lucide-react';
import './StudentMessages.css';

const MOCK_CHATS = [
    {
        id: 1,
        name: "Sonatrach HR",
        subtitle: "Cloud Engineering Internship",
        avatar: null,
        initials: "SO",
        color: "#059669",
        lastMessage: "Typing...",
        time: "2 min",
        unread: true,
        online: true,
        status: "ACCEPTED",
        isTyping: true,
        messages: [
            {
                id: 1,
                sender: 'them',
                text: "Hello! We've reviewed your internship application for the Cloud Engineering role. Your project portfolio with Kubernetes was particularly impressive.",
                time: "11:42 AM",
                date: "YESTERDAY"
            },
            {
                id: 2,
                sender: 'me',
                text: "Thank you! I'm very excited about the opportunity. I've been working on those cloud architectures for the past year during my semester break.",
                time: "11:45 AM - Read",
                date: "YESTERDAY"
            },
            {
                id: 3,
                sender: 'them',
                text: "Excellent. Are you available for a quick technical screening next Tuesday at 10:00 AM? We'd like to dive deeper into your work on the Algerian Grid Monitoring project.",
                time: "Just now",
                date: "TODAY"
            }
        ]
    },
    {
        id: 2,
        name: "Ooredoo",
        subtitle: "Frontend Developer",
        avatar: null,
        initials: "OO",
        color: "#ef4444",
        lastMessage: "\"We have reviewed your profile and...\"",
        time: "1 hour",
        unread: false,
        online: false,
        status: "PENDING",
        isTyping: false,
        messages: []
    },
    {
        id: 3,
        name: "Djezzy",
        subtitle: "Network Engineer",
        avatar: null,
        initials: "DJ",
        color: "#3b82f6",
        lastMessage: "Application closed for this cycle.",
        time: "Yesterday",
        unread: false,
        online: false,
        status: "REJECTED",
        isTyping: false,
        messages: []
    },
    {
        id: 4,
        name: "System Security",
        subtitle: "Alert",
        isSystem: true,
        avatar: null,
        initials: "SYS",
        color: "#ff1b90",
        lastMessage: "Your password was recently updated...",
        time: "Oct 24",
        unread: false,
        online: false,
        status: null,
        isTyping: false,
        messages: []
    }
];

const StudentMessages = ({ userData }) => {
    const [chats, setChats] = useState(MOCK_CHATS);
    const [activeTab, setActiveTab] = useState('messages');
    const [activeChatId, setActiveChatId] = useState(1);
    const [messageInput, setMessageInput] = useState('');

    const activeChat = chats.find(c => c.id === activeChatId);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: [...c.messages, {
                        id: Date.now(),
                        sender: 'me',
                        text: messageInput.trim(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: 'TODAY'
                    }],
                    lastMessage: messageInput.trim(),
                    isTyping: false
                };
            }
            return c;
        }));
        setMessageInput('');
    };

    return (
        <div className="messages-layout">

            {/* Left Sidebar - Inbox List */}
            <div className="inbox-sidebar">
                <div className="inbox-header">
                    <h2>Inbox</h2>
                    <div className="inbox-tabs">
                        <button
                            className={`inbox-tab ${activeTab === 'messages' ? 'active' : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            Messages
                        </button>
                        <button
                            className={`inbox-tab ${activeTab === 'alerts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alerts')}
                        >
                            Alerts
                        </button>
                    </div>
                </div>

                <div className="chat-list">
                    {chats.filter(c => activeTab === 'messages' ? !c.isSystem : c.isSystem).map(chat => (
                        <div
                            key={chat.id}
                            className={`chat-list-item ${activeChatId === chat.id ? 'active' : ''} ${chat.unread ? 'unread' : ''}`}
                            onClick={() => setActiveChatId(chat.id)}
                        >
                            <div className="chat-avatar-container">
                                {chat.isSystem ? (
                                    <div className="chat-avatar system-alert">
                                        <ShieldCheck size={20} color="#fff" />
                                    </div>
                                ) : (
                                    <div className="chat-avatar" style={{ backgroundColor: chat.color }}>
                                        {chat.initials}
                                    </div>
                                )}
                                {chat.online && <span className="online-indicator"></span>}
                            </div>

                            <div className="chat-preview-info">
                                <div className="chat-preview-header">
                                    <h4>{chat.name}</h4>
                                    <span className="time">{chat.time}</span>
                                </div>
                                <div className="chat-preview-body">
                                    <p className={chat.isTyping ? 'typing-text' : ''}>{chat.lastMessage}</p>
                                </div>
                                {chat.status && (
                                    <span className={`chat-status-badge ${chat.status.toLowerCase()}`}>
                                        {chat.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side - Active Chat */}
            {activeChat ? (
                <div className="chat-window">
                    <div className="chat-window-header">
                        <div className="chat-header-info">
                            {activeChat.isSystem ? (
                                <div className="chat-avatar system-alert">
                                    <ShieldCheck size={20} color="#fff" />
                                </div>
                            ) : (
                                <div className="chat-avatar" style={{ backgroundColor: activeChat.color }}>
                                    {activeChat.initials}
                                </div>
                            )}
                            <div>
                                <h3>{activeChat.name}</h3>
                                <p className="status-text">
                                    {activeChat.online && <span className="dot online"></span>}
                                    {activeChat.online ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            {!activeChat.isSystem && (
                                <button className="btn-video">
                                    <Video size={16} /> Schedule Interview
                                </button>
                            )}
                            <button className="btn-icon">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages-area">
                        {activeChat.messages.length > 0 ? (
                            <>
                                <div className="date-divider"><span>YESTERDAY</span></div>

                                {activeChat.messages.filter(m => m.date === 'YESTERDAY').map(msg => (
                                    <div key={msg.id} className={`message-bubble-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                        {msg.sender === 'them' && (
                                            <div className="chat-avatar small" style={{ backgroundColor: activeChat.color }}>{activeChat.initials}</div>
                                        )}
                                        <div className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                            <p>{msg.text}</p>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                        {msg.sender === 'me' && (
                                            <img
                                                src={userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`}
                                                alt="Me"
                                                className="chat-avatar small"
                                            />
                                        )}
                                    </div>
                                ))}

                                <div className="date-divider"><span>TODAY</span></div>

                                {activeChat.messages.filter(m => m.date === 'TODAY').map(msg => (
                                    <div key={msg.id} className={`message-bubble-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                        {msg.sender === 'them' && (
                                            <div className="chat-avatar small" style={{ backgroundColor: activeChat.color }}>{activeChat.initials}</div>
                                        )}
                                        <div className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                            <p>{msg.text}</p>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                        {msg.sender === 'me' && (
                                            <img
                                                src={userData?.profile?.profile_picture || `https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`}
                                                alt="Me"
                                                className="chat-avatar small"
                                            />
                                        )}
                                    </div>
                                ))}

                                {activeChat.isTyping && (
                                    <div className="message-bubble-wrapper received typing-indicator-wrapper">
                                        <div className="chat-avatar small" style={{ backgroundColor: activeChat.color }}>{activeChat.initials}</div>
                                        <div className="message-bubble received typing">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-chat">
                                <p>No messages yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area">
                        <div className="chat-input-wrapper">
                            <button className="btn-icon"><Plus size={20} /></button>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                            />
                            <button className="btn-icon"><Smile size={20} /></button>
                        </div>
                        <button className="btn-send-float" onClick={handleSendMessage}>
                            <Send size={18} color="#fff" style={{ marginLeft: '-2px' }} />
                        </button>
                        <p className="input-hint">
                            Press Enter to send. Your response will be sent directly to {activeChat.name}.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="chat-window empty">
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
};

export default StudentMessages;
