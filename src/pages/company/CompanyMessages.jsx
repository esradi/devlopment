import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, MoreVertical, Paperclip, Smile, FileText, X, Download, Menu } from 'lucide-react';
import { messageService } from '../../services/api';
import './CompanyMessages.css';
import CompanySidebar from '../../components/CompanySidebar';
import '../company/CompanyDashboard.css';

const CompanyMessages = ({ userData }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCVModal, setShowCVModal] = useState(false);
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
            const msgData = await messageService.getAll();
            const msgs = Array.isArray(msgData) ? msgData : msgData?.results || msgData?.messages || [];
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

    const activeConv = conversations.find(c => c.id === activeConvId);
    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="messages-loading">Loading...</div>;

    return (
        <div className="messages-container">
            {/* Toggle Button */}
            <button
                className="sidebar-toggle-trigger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Close Sidebar" : "Open Menu"}
            >
                <Menu size={24} />
                {!sidebarOpen && <span className="menu-label">Menu</span>}
            </button>

            {/* Overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            {/* Sidebar Drawer */}
            <aside className={`dashboard-sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-close-trigger" onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                </div>
                <CompanySidebar activePath="messages" onClose={() => setSidebarOpen(false)} />
            </aside>
            <div className="messages-sidebar">
                <div className="messages-sidebar-header">
                    <h2>Messaging</h2>
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

            <div className="messages-main">
                {activeConv ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <img src={activeConv.avatar} alt={activeConv.name} className="chat-avatar" />
                                <div>
                                    <h3>{activeConv.name}</h3>
                                    <span className="online-status">Candidate</span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button className="chat-btn-secondary" onClick={() => setShowCVModal(true)}>
                                    <FileText size={18} /> View CV
                                </button>
                                <button className="chat-options-btn"><MoreVertical size={20} /></button>
                            </div>
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
                        <h3>Select a candidate to start chatting</h3>
                    </div>
                )}
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
