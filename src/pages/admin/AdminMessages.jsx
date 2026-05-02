import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { messageService } from '../../services/api';
import './AdminMessages.css';

const AdminMessages = ({ userData }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

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
            const msgData = await messageService.getAll();
            let msgs = Array.isArray(msgData) ? msgData : msgData?.results || msgData?.messages || [];
            
            // Add a fake conversation for demonstration
            if (msgs.length === 0) {
                const now = new Date().toISOString();
                msgs = [
                    {
                        id: 'mock-1',
                        sender: 999,
                        sender_name: 'Sarah Connor',
                        receiver: myId,
                        receiver_name: 'Admin',
                        content: 'Hello! I need some help with my internship validation.',
                        created_at: now
                    },
                    {
                        id: 'mock-2',
                        sender: myId,
                        sender_name: 'Admin',
                        receiver: 999,
                        receiver_name: 'Sarah Connor',
                        content: 'Sure Sarah, I can help with that. What seems to be the issue?',
                        created_at: now
                    },
                    {
                        id: 'mock-3',
                        sender: 999,
                        sender_name: 'Sarah Connor',
                        receiver: myId,
                        receiver_name: 'Admin',
                        content: 'My company supervisor hasn\'t received the evaluation link yet.',
                        created_at: now
                    }
                ];
            }

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

    if (loading) return <div className="admin-messages-loading">Loading...</div>;

    return (
        <div className="admin-messages-container">
            <div className="admin-messages-sidebar">
                <div className="messages-sidebar-header">
                    <h2>Messages</h2>
                    <div className="messages-search">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search contacts..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="conversations-list">
                    {filteredConversations.length === 0 ? (
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

            <div className="admin-messages-main">
                {activeConv ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <img src={activeConv.avatar} alt={activeConv.name} className="chat-avatar" />
                                <div>
                                    <h3>{activeConv.name}</h3>
                                    <span className="online-status">Online</span>
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

export default AdminMessages;
