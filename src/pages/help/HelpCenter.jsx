import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Rocket, 
    Building2, 
    Users, 
    MonitorDot, 
    Calendar, 
    GitMerge, 
    KeyRound, 
    Bell, 
    ArrowUpCircle, 
    ChevronDown, 
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import './HelpCenter.css';

const HelpCenter = () => {
    const navigate = useNavigate();
    
    // Accordion state management
    const [openFaq, setOpenFaq] = useState(0);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? -1 : index);
    };

    const faqs = [
        {
            question: "How to publish a new offer?",
            answer: "Navigate to the 'Dashboard' and click on the 'New Offer' button in the top right. Follow the multi-step form to define role responsibilities, requirements, and compensation."
        },
        {
            question: "How to contact a candidate?",
            answer: "Go to the 'Applications' or 'Messages' tab. Click on a candidate's profile and use the 'Send Message' button to initiate a direct conversation within the platform."
        },
        {
            question: "How to activate/deactivate notification emails?",
            answer: "Head over to your 'Settings' by clicking the gear icon in the sidebar. Under the 'Notifications' tab, you can toggle email and in-app alerts on or off."
        }
    ];

    return (
        <div className="help-center-page">
            {/* Hero Section */}
            <section className="help-hero">
                <h1>Help Center</h1>
                <p>Find answers and learn how to get the most out of Stag.io.</p>
                
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input type="text" placeholder="Search help articles (e.g. 'create an offer')" />
                </div>
            </section>

            {/* Getting Started Section */}
            <section className="help-section">
                <h2 className="section-title">GETTING STARTED</h2>
                <div className="help-grid">
                    <div className="help-card">
                        <div className="icon-wrapper"><Rocket size={18} /></div>
                        <h3>Create my first internship offer</h3>
                        <p>Step-by-step guide to publishing your first opening to attract top talent.</p>
                        <a href="#learn" className="learn-more">Learn more <ArrowRight size={14} /></a>
                    </div>
                    <div className="help-card">
                        <div className="icon-wrapper"><Building2 size={18} /></div>
                        <h3>Complete my company profile</h3>
                        <p>Make your brand stand out with a fully detailed company showcase.</p>
                        <a href="#learn" className="learn-more">Learn more <ArrowRight size={14} /></a>
                    </div>
                    <div className="help-card">
                        <div className="icon-wrapper"><Users size={18} /></div>
                        <h3>Invite a recruiter to the team</h3>
                        <p>Collaborate with your team by managing seats and access levels.</p>
                        <a href="#learn" className="learn-more">Learn more <ArrowRight size={14} /></a>
                    </div>
                </div>
            </section>

            {/* Managing Interns Section */}
            <section className="help-section">
                <h2 className="section-title">MANAGING INTERNS & APPLICATIONS</h2>
                <div className="help-grid">
                    <div className="help-card">
                        <div className="icon-wrapper pink-icon"><MonitorDot size={18} /></div>
                        <h3>Manage applications</h3>
                        <p>Learn how to filter, tag, and organize incoming candidate profiles.</p>
                        <a href="#learn" className="learn-more pink-text">Learn more <ArrowRight size={14} /></a>
                    </div>
                    <div className="help-card">
                        <div className="icon-wrapper pink-icon"><Calendar size={18} /></div>
                        <h3>Schedule and manage interviews</h3>
                        <p>Optimize your hiring flow with our integrated scheduling tools.</p>
                        <a href="#learn" className="learn-more pink-text">Learn more <ArrowRight size={14} /></a>
                    </div>
                    <div className="help-card">
                        <div className="icon-wrapper pink-icon"><GitMerge size={18} /></div>
                        <h3>Understanding the pipeline</h3>
                        <p>A deep dive into recruitment stages and automated workflows.</p>
                        <a href="#learn" className="learn-more pink-text">Learn more <ArrowRight size={14} /></a>
                    </div>
                </div>
            </section>

            {/* Account & Billing Section */}
            <section className="help-section account-billing-section">
                <div className="billing-left">
                    <h2>Account & Billing</h2>
                    <p>Manage your secure credentials, communication preferences, and subscription plans.</p>
                    
                    <div className="premium-tip">
                        <div className="tip-header">
                            <CheckCircle2 size={16} className="tip-icon" />
                            <span>PREMIUM TIP</span>
                        </div>
                        <p>Enterprise accounts get a dedicated success manager and custom billing cycles.</p>
                    </div>
                </div>
                
                <div className="billing-right">
                    <div className="action-row">
                        <button className="action-btn">
                            <div className="action-name"><KeyRound size={16} /> <span>Change my password</span></div>
                            <ChevronDown className="right-chevron" size={16} />
                        </button>
                        <button className="action-btn">
                            <div className="action-name"><Bell size={16} /> <span>Configure notifications</span></div>
                            <ChevronDown className="right-chevron" size={16} />
                        </button>
                    </div>
                    <button className="action-btn upgrade-btn glow-border">
                        <div className="action-name"><ArrowUpCircle size={16} /> <span>Upgrade to Premium</span></div>
                        <Rocket size={16} className="flash-icon" />
                    </button>
                </div>
            </section>

            {/* Common Questions Section */}
            <section className="faq-section">
                <h2 className="faq-title">Common Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${openFaq === index ? 'open' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-question">
                                <h3>{faq.question}</h3>
                                <ChevronDown size={20} className="faq-chevron" />
                            </div>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="help-cta">
                <div className="cta-content">
                    <h2>Still need help?</h2>
                    <p>Our support team is available 24/7 to assist you with any questions or technical issues you might encounter.</p>
                    <button className="btn-contact-support">Contact support</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="help-footer">
                <div className="footer-left">
                    <div className="footer-logo">Stag<span>.io</span></div>
                    <p>© 2024 STAG.IO. BUILT WITH NEON ENERGY.</p>
                </div>
                <div className="footer-right">
                    <a href="#privacy">PRIVACY POLICY</a>
                    <a href="#terms">TERMS OF SERVICE</a>
                    <a href="#status">STATUS</a>
                    <a href="#support">SUPPORT</a>
                    <a href="#twitter">TWITTER</a>
                </div>
            </footer>
        </div>
    );
};

export default HelpCenter;
