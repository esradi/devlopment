import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, MessageSquare, Search, Bell, HelpCircle, Paperclip, 
    FileText, X, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { messageService } from '../../services/api';
import './CompanyMessages.css';

const CompanyMessages = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [showCVModal, setShowCVModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await messageService.getAll();
                const grouped = data.reduce((acc, msg) => {
                    const contactId = msg.sender === 1 ? msg.receiver : msg.sender;
                    const contactName = msg.sender_name === 'You' ? msg.receiver_name : msg.sender_name;
                    if (!acc[contactId]) acc[contactId] = { 
                        id: contactId, 
                        name: contactName, 
                        messages: [],
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random`,
                        lastMsg: msg.content,
                        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    acc[contactId].messages.push(msg);
                    return acc;
                }, {});
                setChats(Object.values(grouped));
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !selectedChat) return;
        try {
            const res = await messageService.create({ receiver: selectedChat.id, content: messageInput });
            const updatedChats = chats.map(chat => {
                if (chat.id === selectedChat.id) {
                    return { ...chat, messages: [...chat.messages, res], lastMsg: res.content, time: 'Just now' };
                }
                return chat;
            });
            setChats(updatedChats);
            setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, res] }));
            setMessageInput('');
        } catch (err) {
            alert("Failed to send message");
        }
    };

    const handleDownloadCV = () => {
        const blob = new Blob(["Mock CV Content"], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Resume.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="company-messages-dashboard">
            <CompanySidebar activePath="messages" />
            <div className="messaging-container">
                <header className="messaging-header">
                    <h1>Messaging</h1>
                    <div className="m-header-actions">
                        <div className="m-search-bar">
                            <Search size={18} color="#565d6d" />
                            <input type="text" placeholder="Search across messages..." />
                        </div>
                        <button className="m-icon-btn"><Bell size={20} /></button>
                        <button className="m-icon-btn"><HelpCircle size={20} /></button>
                    </div>
                </header>

                <div className="messaging-main-split">
                    <aside className="m-inbox-col">
                        <div className="m-inbox-tabs">
                            {['ALL', 'UNREAD'].map(tab => (
                                <button 
                                    key={tab} 
                                    className={`m-inbox-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="m-chat-list">
                            {loading ? <div className="m-loading">Loading...</div> : chats.length === 0 ? <div className="m-empty">No messages found.</div> : chats.map(chat => (
                                <div 
                                    key={chat.id} 
                                    className={`m-chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedChat(chat)}
                                >
                                    <div className="m-avatar-container">
                                        <img src={chat.avatar} alt={chat.name} className="m-avatar" />
                                    </div>
                                    <div className="m-chat-preview">
                                        <div className="m-chat-info-top">
                                            <h4>{chat.name}</h4>
                                            <span className="m-chat-time">{chat.time}</span>
                                        </div>
                                        <p className="m-chat-snippet">{chat.lastMsg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main className="m-chat-col">
                        {selectedChat ? (
                            <>
                                <header className="m-chat-header">
                                    <div className="m-chat-user-main">
                                        <img src={selectedChat.avatar} alt="Avatar" className="m-chat-header-avatar" />
                                        <div className="m-chat-header-info">
                                            <h3>{selectedChat.name}</h3>
                                            <p>Candidate Conversation</p>
                                        </div>
                                    </div>
                                </header>
                                <div className="m-messages-list">
                                    {selectedChat.messages.map(msg => (
                                        <div key={msg.id} className={`m-message-row ${msg.sender === 1 ? 'me' : 'them'}`}>
                                            <div className="m-message-bubble">
                                                {msg.content}
                                                <span className="m-msg-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="m-input-container">
                                    <form className="m-input-wrapper" onSubmit={handleSendMessage}>
                                        <button type="button" className="m-icon-btn"><Paperclip size={20} /></button>
                                        <input 
                                            type="text" 
                                            placeholder="Type a message..." 
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                        />
                                        <button type="submit" className="m-btn-send">Send &gt;</button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="m-no-chat">Select a conversation to start messaging</div>
                        )}
                    </main>

                    {selectedChat && (
                        <aside className="m-profile-col">
                            <div className="m-profile-top">
                                <img src={selectedChat.avatar} alt="Avatar" className="m-profile-avatar" />
                                <h2>{selectedChat.name}</h2>
                                <button className="m-btn-block" onClick={() => setShowCVModal(true)}>
                                    <FileText size={18} /> View CV
                                </button>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showCVModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="cv-modal-overlay" onClick={() => setShowCVModal(false)}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
                            <header className="cv-modal-header">
                                <h3>CV Viewer</h3>
                                <div className="cv-header-actions">
                                    <button className="btn-cv-action" onClick={handleDownloadCV}><Download size={18} /> Download</button>
                                    <button className="btn-cv-close" onClick={() => setShowCVModal(false)}><X size={20} /></button>
                                </div>
                            </header>
                            <div className="cv-pdf-viewer">
                                <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Candidate Resume Preview</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyMessages;
