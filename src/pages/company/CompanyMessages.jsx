import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Search, Bell, HelpCircle, User, Paperclip, MoreVertical,
    Clock, MapPin, Video, FileText, ChevronDown, X, Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyMessages.css';

const CompanyMessages = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL');
    const [messageInput, setMessageInput] = useState('');
    const [showCVModal, setShowCVModal] = useState(false);

    const chats = [
        {
            id: 1,
            name: "Alex Rivera",
            role: "Data Scientist Intern",
            avatar: "https://i.pravatar.cc/150?u=alex",
            lastMsg: "I have attached the updated portfolio as r...",
            time: "12:45 PM",
            status: "online",
            active: true
        },
        {
            id: 2,
            name: "Sarah Chen",
            role: "UX Research Assistant",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            lastMsg: "Thank you for the opportunity!",
            time: "Yesterday",
            status: "away",
            unread: true
        },
        {
            id: 3,
            name: "Marcus Thorne",
            role: "Backend Engineer",
            avatar: "https://i.pravatar.cc/150?u=marcus",
            lastMsg: "Is the interview still scheduled for 3PM?",
            time: "Oct 12",
            status: "offline"
        }
    ];

    const [messageList, setMessageList] = useState([
        { 
            id: 1, 
            sender: 'them', 
            text: "Hi! I'm reaching out to check the status of my application for the Data Science internship. I've also completed the technical assessment.",
            time: "10:20 AM",
            type: 'candidate'
        },
        { 
            id: 2, 
            sender: 'me', 
            text: "Hello Alex! Great to hear from you. We've received your assessment. Our team is currently reviewing it and we should have an update for you by Friday.",
            time: "11:15 AM",
            type: 'recruiter'
        },
        { 
            id: 3, 
            sender: 'them', 
            text: "That sounds perfect. I have also attached a link to my latest project which involves a similar tech stack to what you use at Stag.io.",
            time: "12:45 PM",
            type: 'candidate'
        }
    ]);

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim()) return;

        const newMessage = {
            id: messageList.length + 1,
            sender: 'me',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'recruiter'
        };

        setMessageList([...messageList, newMessage]);
        setMessageInput('');
    };

    const handleDownloadCV = () => {
        // We create the CV content dynamically in the frontend
        const cvContent = `
ALEX RIVERA
Data Scientist & Machine Learning Engineer
------------------------------------------
Email: alex.rivera@university.edu
University: Algiers 1 University (GPA: 16.5/20)

EXPERIENCE:
- Junior Data Analyst @ TechCorp (2022-2023)
  Processed large datasets using Python and SQL.

EDUCATION:
- B.S. in Computer Science (Expected 2024)

SKILLS:
Python, TensorFlow, SQL, React, Node.js, Tableau
        `;

        // Create a Blob containing the text
        const blob = new Blob([cvContent], { type: 'text/plain' });
        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob);
        // Create a hidden anchor element and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Alex_Rivera_Resume.txt';
        document.body.appendChild(link);
        link.click();
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="company-messages-dashboard">
            {/* 1. SIDEBAR */}
            <CompanySidebar activePath="messages" />

            {/* 2. MESSAGING CONTAINER */}
            <div className="messaging-container">
                {/* Header */}
                <header className="messaging-header">
                    <h1>Messaging</h1>
                    <div className="m-header-actions">
                        <div className="m-search-bar">
                            <Search size={18} color="#565d6d" />
                            <input type="text" placeholder="Search across messages..." />
                        </div>
                        <button className="m-icon-btn">
                            <Bell size={20} />
                            <div className="m-notification-dot"></div>
                        </button>
                        <button className="m-icon-btn"><HelpCircle size={20} /></button>
                        <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=0d1117&color=ff1b90" alt="Admin" className="m-user-avatar-sm" />
                    </div>
                </header>

                <div className="messaging-main-split">
                    {/* INBOX */}
                    <aside className="m-inbox-col">
                        <div className="m-inbox-tabs">
                            {['ALL', 'UNREAD', 'STARRED'].map(tab => (
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
                            {chats.map(chat => (
                                <div key={chat.id} className={`m-chat-item ${chat.active ? 'active' : ''}`}>
                                    <div className="m-avatar-container">
                                        <img src={chat.avatar} alt={chat.name} className="m-avatar" />
                                        <div className={`m-status-indicator ${chat.status}`}></div>
                                    </div>
                                    <div className="m-chat-preview">
                                        <div className="m-chat-info-top">
                                            <h4>{chat.name}</h4>
                                            <span className="m-chat-time">{chat.time}</span>
                                        </div>
                                        <div className="m-chat-job">{chat.role}</div>
                                        <p className="m-chat-snippet">{chat.lastMsg}</p>
                                    </div>
                                    {chat.unread && <div style={{ width: '8px', height: '8px', background: '#ff1b90', borderRadius: '50%', alignSelf: 'center', marginLeft: '10px' }}></div>}
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* CHAT WINDOW */}
                    <main className="m-chat-col">
                        <header className="m-chat-header">
                            <div className="m-chat-user-main">
                                <img src="https://i.pravatar.cc/150?u=alex" alt="Alex" className="m-chat-header-avatar" />
                                <div className="m-chat-header-info">
                                    <h3>Alex Rivera</h3>
                                    <p>Applied to <span style={{ color: '#9e59ff' }}>Data Scientist Intern</span></p>
                                </div>
                            </div>
                            <div className="m-chat-header-actions">
                                <button 
                                    className="m-btn-outline"
                                    onClick={() => navigate('/dashboard/company/offer/1/application/2')}
                                >
                                    View Application
                                </button>
                                <button 
                                    className="m-btn-outline"
                                    onClick={() => navigate('/dashboard/company/offer/1/edit')}
                                >
                                    View Offer
                                </button>
                            </div>
                        </header>

                        <div className="m-messages-list">
                            <div className="m-date-divider">
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', flex: 1 }}></div>
                                <span>OCTOBER 14, 2023</span>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', flex: 1 }}></div>
                            </div>

                            {messageList.map(msg => (
                                <div key={msg.id} className={`m-message-row ${msg.sender === 'me' ? 'me' : 'them'}`}>
                                    <img 
                                        src={msg.sender === 'me' ? "https://ui-avatars.com/api/?name=Alex+Morgan&background=0d1117&color=ff1b90" : "https://i.pravatar.cc/150?u=alex"} 
                                        alt="avatar" 
                                        className="m-msg-avatar" 
                                    />
                                    <div className="m-message-bubble">
                                        {msg.text}
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
                    </main>

                    {/* PROFILE PANEL */}
                    <aside className="m-profile-col">
                        <div className="m-profile-top">
                            <img src="https://i.pravatar.cc/150?u=alex" alt="Alex" className="m-profile-avatar" />
                            <h2>Alex Rivera</h2>
                            <p>alex.rivera@university.edu</p>

                            <div className="m-profile-stats">
                                <div className="m-stat-box">
                                    <span className="m-stat-label">UNIVERSITY</span>
                                    <span className="m-stat-val">Stanford Univers...</span>
                                </div>
                                <div className="m-stat-box">
                                    <span className="m-stat-label">GPA</span>
                                    <span className="m-stat-val">3.92 / 4.0</span>
                                </div>
                            </div>

                            <button className="m-btn-block" onClick={() => setShowCVModal(true)}>
                                <FileText size={18} /> View CV
                            </button>
                        </div>

                        <div className="m-profile-section">
                            <h4>OFFER SUMMARY</h4>
                            <div className="m-offer-summary">
                                <h5>Data Scientist Intern</h5>
                                <span className="m-offer-ref">Ref: STG-2023-DS04</span>
                                
                                <div className="m-offer-tags">
                                    <span className="m-tag"><Clock size={12} /> Full-time</span>
                                    <span className="m-tag"><MapPin size={12} /> Hybrid</span>
                                </div>

                                <div className="m-status-pills">
                                    <span className="m-pill purple">Interviews</span>
                                    <span className="m-pill outline">Step 2</span>
                                </div>
                            </div>
                        </div>

                        <div className="m-profile-section">
                            <h4>UPCOMING INTERVIEW</h4>
                            <div className="m-interview-card">
                                <div className="m-int-header">
                                    <div className="m-int-date-box">
                                        <span className="m-int-m">OCT</span>
                                        <span className="m-int-d">18</span>
                                    </div>
                                    <div className="m-int-title">
                                        <h5>Technical Deep-Dive</h5>
                                        <p>03:00 PM - 04:00 PM</p>
                                    </div>
                                </div>
                                <div className="m-int-details">
                                    <div className="m-int-row">
                                        <Video size={14} /> Google Meet
                                    </div>
                                </div>
                                <button 
                                    className="m-btn-join"
                                    onClick={() => window.open('https://meet.google.com/xyz-abc-123', '_blank')}
                                >
                                    Join Meeting
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* CV VIEWER MODAL */}
            <AnimatePresence>
                {showCVModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="cv-modal-overlay"
                        onClick={() => setShowCVModal(false)}
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="cv-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <header className="cv-modal-header">
                                <div className="cv-user-info">
                                    <FileText size={20} color="#9e59ff" />
                                    <h3>Alex_Rivera_Resume_2024.pdf</h3>
                                </div>
                                <div className="cv-header-actions">
                                    <button className="btn-cv-action" onClick={handleDownloadCV}>
                                        <Download size={18} /> Download
                                    </button>
                                    <button className="btn-cv-close" onClick={() => setShowCVModal(false)}><X size={20} /></button>
                                </div>
                            </header>
                            <div className="cv-pdf-viewer">
                                <div className="mock-pdf-page">
                                    <div className="cv-page-header">
                                        <h1>ALEX RIVERA</h1>
                                        <p>Data Scientist & Machine Learning Engineer</p>
                                    </div>
                                    <div className="cv-section-mock">
                                        <h4>EXPERIENCE</h4>
                                        <div className="cv-item">
                                            <strong>Junior Data Analyst • TechCorp</strong>
                                            <span>2022 - 2023</span>
                                            <p>Processed large datasets using Python and SQL. Developed predictive models for customer churn.</p>
                                        </div>
                                    </div>
                                    <div className="cv-section-mock">
                                        <h4>EDUCATION</h4>
                                        <div className="cv-item">
                                            <strong>B.S. in Computer Science • Algiers 1 University</strong>
                                            <span>Expected 2024</span>
                                            <p>Relevant coursework: Machine Learning, Artificial Intelligence, Database Systems.</p>
                                        </div>
                                    </div>
                                    <div className="cv-section-mock">
                                        <h4>SKILLS</h4>
                                        <div className="cv-skills-grid">
                                            <span>Python</span><span>TensorFlow</span><span>SQL</span>
                                            <span>React</span><span>Node.js</span><span>Tableau</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyMessages;
