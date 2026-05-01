import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Info, Plus, Smile, Hash } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const StudyGroupChat = ({ group, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef(null);
    const { message: wsMessage, sendMessage } = useWebSocket(`/groups/${group.id}/`);

    // Fetch initial history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://127.0.0.1:8000/api/groups/${group.id}/messages/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setMessages(data.results ? data.results.reverse() : []);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };
        fetchHistory();
    }, [group.id]);

    // Handle incoming messages
    useEffect(() => {
        if (wsMessage && wsMessage.type === 'chat_message') {
            setMessages(prev => [...prev, wsMessage.message]);
        }
    }, [wsMessage]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        
        // Backend Consumer expects { message: "..." }
        sendMessage({
            message: inputText.trim()
        });
        
        setInputText('');
    };

    return (
        <div className="study-group-chat" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="chat-header" style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #9e59ff, #ff1b90)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Hash size={20} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{group.name}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#8892b0' }}>{group.member_count || 0} members online</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: '#8892b0' }}>
                    <Users size={20} style={{ cursor: 'pointer' }} />
                    <Info size={20} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <div 
                className="chat-messages-scroll" 
                ref={scrollRef}
                style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
                {messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                        <Hash size={48} style={{ marginBottom: '16px' }} />
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser?.id || msg.sender === currentUser?.username;
                        return (
                            <div 
                                key={msg.id || idx} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                {!isMe && (
                                    <span style={{ fontSize: '11px', color: '#8892b0', marginBottom: '4px', marginLeft: '4px' }}>
                                        {msg.sender_name || msg.sender}
                                    </span>
                                )}
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                    background: isMe ? '#9e59ff' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    boxShadow: isMe ? '0 4px 15px rgba(158, 89, 255, 0.2)' : 'none'
                                }}>
                                    {msg.content || msg.text}
                                </div>
                                <span style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="chat-input-container" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <button style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8892b0' }}>
                            <Plus size={20} />
                        </button>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Message #${group.name}`}
                            style={{
                                width: '100%',
                                padding: '14px 48px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '14px'
                            }}
                        />
                        <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8892b0' }}>
                            <Smile size={20} />
                        </button>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: inputText.trim() ? '#9e59ff' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: inputText.trim() ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudyGroupChat;
