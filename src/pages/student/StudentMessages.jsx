import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, MoreVertical, Paperclip, Smile, Bell } from 'lucide-react';
import { messageService, notificationService } from '../../services/api';
import './StudentMessages.css';

const StudentMessages = ({ userData }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('messages');
    const [alerts, setAlerts] = useState([]);
    const messagesEndRef = useRef(null);

    const myId = userData?.user_id || userData?.id;

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
            const [msgData, notifData] = await Promise.all([
                messageService.getAll(),
                notificationService.getAll()
            ]);
            const msgs = Array.isArray(msgData) ? msgData : msgData?.results || msgData?.messages || [];
            const convs = groupIntoConversations(msgs, myId);
            setConversations(convs);
            if (convs.length > 0 && !activeConvId) setActiveConvId(convs[0].id);

            const alertsList = Array.isArray(notifData) ? notifData : notifData?.results || notifData?.notifications || [];
            setAlerts(alertsList);
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, conversations]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !activeConvId) return;
        try {
            await messageService.create({
                content: messageInput.trim(),
                receiver: activeConvId
            });
            setMessageInput('');
            await fetchData();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const activeConv = conversations.find(c => c.id === activeConvId);
    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="messages-loading">Loading...</div>;

    return (
        <div className="messages-container">
            <div className="messages-sidebar">
                <div className="messages-sidebar-header">
                    <h2>Messages</h2>
                    <div className="messages-tabs">
                        <button 
                            className={`m-tab ${activeTab === 'messages' ? 'active' : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            Chat
                        </button>
                        <button 
                            className={`m-tab ${activeTab === 'alerts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alerts')}
                        >
                            Alerts {alerts.length > 0 && <span className="tab-badge">{alerts.length}</span>}
                        </button>
                    </div>
                    <div className="messages-search">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="conversations-list">
                    {activeTab === 'alerts' ? (
                        alerts.length === 0 ? (
                            <div className="empty-convs">No alerts found</div>
                        ) : alerts.map(alert => (
                            <div key={alert.id} className="conversation-item alert-item">
                                <div className="alert-icon-circle"><Bell size={18} /></div>
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <h4>{alert.title || 'Notification'}</h4>
                                        <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p>{alert.message || alert.content}</p>
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length === 0 ? (
                        <div className="empty-convs">No conversations found</div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`conversation-item ${activeConvId === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveConvId(conv.id)}
                            >
                                <img src={conv.avatar} alt={conv.name} className="conv-avatar" />
                                <div className="conv-info">
                                    <div className="conv-header">
                                        <h4>{conv.name}</h4>
                                        <span>{conv.lastTime}</span>
                                    </div>
                                    <p>{conv.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="messages-main">
                {activeTab === 'alerts' ? (
                    <div className="no-chat-selected">
                        <Bell size={64} style={{ color: '#ff1b90' }} />
                        <h3>Your Notifications</h3>
                        <p>Stay updated with the latest internship alerts.</p>
                    </div>
                ) : activeConv ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <img src={activeConv.avatar} alt={activeConv.name} className="chat-avatar" />
                                <div>
                                    <h3>{activeConv.name}</h3>
                                    <span className="online-status">Active Now</span>
                                </div>
                            </div>
                            <button className="chat-options-btn"><MoreVertical size={20} /></button>
                        </div>
                        <div className="chat-messages">
                            {activeConv.messages.map((msg, idx) => {
                                const isMe = String(msg.sender) === String(myId);
                                return (
                                    <div key={msg.id || idx} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                        <div className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                            {msg.content}
                                            <span className="message-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-container" onSubmit={handleSendMessage}>
                            <div className="input-actions">
                                <button type="button"><Paperclip size={20} /></button>
                                <button type="button"><Smile size={20} /></button>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Type your message..." 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <MessageSquare size={64} />
                        <h3>Select a conversation to start chatting</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentMessages;