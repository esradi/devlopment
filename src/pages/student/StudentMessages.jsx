import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { messageService, notificationService } from '../../services/api';
import './StudentMessages.css';

const StudentMessages = ({ userData }) => {
    const [allMessages, setAllMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('messages');
    const messagesEndRef = useRef(null);

    const myId = userData?.user_id || userData?.id;

    const groupIntoConversations = (msgs, myId) => {
        const convMap = {};
        msgs.forEach(msg => {
            const otherId = msg.sender === myId ? msg.receiver : msg.sender;
            const otherName = msg.sender === myId ? msg.receiver_name : msg.sender_name;
            if (!convMap[otherId]) {
                convMap[otherId] = {
                    id: otherId,
                    name: otherName || `User ${otherId}`,
                    messages: []
                };
            }
            convMap[otherId].messages.push(msg);
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
            setAllMessages(msgs);
            const convs = groupIntoConversations(msgs, myId);
            setConversations(convs);
            if (convs.length > 0 && !activeConvId) setActiveConvId(convs[0].id);

            const alertsList = Array.isArray(notifData) ? notifData : notifData?.results || notifData?.notifications || [];
            setAlerts(alertsList);
        } catch (err) {
            console.error("Failed to load:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, conversations]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConvId) return;
        try {
            await messageService.create({
                content: messageInput.trim(),
                receiver: activeConvId
            });
            setMessageInput('');
            await fetchData();
        } catch (err) {
            console.error("Failed to send:", err);
        }
    };

    const activeConv = conversations.find(c => c.id === activeConvId);

    if (loading) return (
        <div className="messages-layout" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div className="custom-loader"/>
        </div>
    );

    return (
        <div className="messages-layout">
            {/* Sidebar */}
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
                            Alerts {alerts.length > 0 && <span style={{background:'#ff1b90',borderRadius:'50%',padding:'2px 6px',fontSize:'10px',marginLeft:'4px'}}>{alerts.length}</span>}
                        </button>
                    </div>
                </div>

                <div className="chat-list">
                    {activeTab === 'alerts' ? (
                        alerts.length === 0 ? (
                            <div style={{padding:'20px',color:'#8892b0',textAlign:'center'}}>No alerts</div>
                        ) : alerts.map(alert => (
                            <div key={alert.id} className="chat-list-item">
                                <div className="chat-avatar-container">
                                    <div className="chat-avatar" style={{backgroundColor:'#ff1b90',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>!</div>
                                </div>
                                <div className="chat-preview-info">
                                    <div className="chat-preview-header">
                                        <h4>{alert.title || 'Notification'}</h4>
                                        <span className="time">{new Date(alert.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                    </div>
                                    <p>{alert.message?.substring(0,40) || alert.content?.substring(0,40)}...</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        conversations.length === 0 ? (
                            <div style={{padding:'20px',color:'#8892b0',textAlign:'center'}}>No messages yet</div>
                        ) : conversations.map(conv => {
                            const lastMsg = conv.messages[conv.messages.length - 1];
                            return (
                                <div
                                    key={conv.id}
                                    className={`chat-list-item ${activeConvId === conv.id ? 'active' : ''}`}
                                    onClick={() => setActiveConvId(conv.id)}
                                >
                                    <div className="chat-avatar-container">
                                        <div className="chat-avatar" style={{backgroundColor:'#059669'}}>
                                            {conv.name.substring(0,2).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="chat-preview-info">
                                        <div className="chat-preview-header">
                                            <h4>{conv.name}</h4>
                                            <span className="time">{new Date(lastMsg?.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        <p>{lastMsg?.content?.substring(0,35)}...</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {activeTab === 'alerts' ? (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',flexDirection:'column',gap:'16px'}}>
                        <div style={{fontSize:'48px'}}>🔔</div>
                        <p style={{color:'#8892b0'}}>
                            {alerts.length === 0 ? 'No alerts yet' : `You have ${alerts.length} notification(s)`}
                        </p>
                        {alerts.length > 0 && alerts.map(alert => (
                            <div key={alert.id} style={{background:'rgba(255,27,144,0.1)',border:'1px solid rgba(255,27,144,0.2)',borderRadius:'12px',padding:'16px',width:'80%',maxWidth:'500px'}}>
                                <h4 style={{color:'#ff1b90',marginBottom:'8px'}}>{alert.title || 'Notification'}</h4>
                                <p style={{color:'#ccd6f6',fontSize:'14px'}}>{alert.message || alert.content}</p>
                                <span style={{color:'#8892b0',fontSize:'12px'}}>{new Date(alert.created_at).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                ) : !activeConv ? (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
                        <p style={{color:'#8892b0'}}>No messages yet. Companies will contact you here.</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-window-header">
                            <div className="chat-header-info">
                                <div className="chat-avatar" style={{backgroundColor:'#059669'}}>
                                    {activeConv.name.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{activeConv.name}</h3>
                                    <p className="status-text"><span className="dot online"></span> Active now</p>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages-area">
                            {activeConv.messages.map(msg => {
                                const isMine = msg.sender === myId;
                                return (
                                    <div key={msg.id} className={`message-bubble-wrapper ${isMine ? 'sent' : 'received'}`}>
                                        {!isMine && (
                                            <div className="chat-avatar small" style={{backgroundColor:'#059669'}}>
                                                {activeConv.name.substring(0,2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>
                                            <p>{msg.content}</p>
                                            <span className="msg-time">{new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                        </div>
                                        {isMine && (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${userData?.first_name}+${userData?.last_name}&background=9e59ff&color=fff`}
                                                alt="Me"
                                                className="chat-avatar small"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                />
                            </div>
                            <button className="btn-send-float" onClick={handleSendMessage}>
                                <Send size={18} color="#fff" />
                            </button>
                            <p className="input-hint">Press Enter to send. Your response will be sent directly to {activeConv.name}.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentMessages;