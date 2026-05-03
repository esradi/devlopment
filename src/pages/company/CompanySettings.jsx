import React, { useState, useEffect } from 'react';
import {
    User, Lock, Bell, Activity, Globe, Clock, Camera, Mail, Phone,
    AtSign, Shield, Smartphone, MailCheck, BellRing, MessageSquareMore, CheckCircle, Menu, X
} from 'lucide-react';
import CompanySidebar from '../../components/CompanySidebar';
import { authService, companyService } from '../../services/api';
import './CompanySettings.css';

const CompanySettings = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeInternalTab, setActiveInternalTab] = useState('Profile');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggles, setToggles] = useState({
        '2fa': true,
        'email-app-updates': true,
        'email-interviews': true,
        'email-reports': false,
        'app-updates': true,
        'app-interviews': true,
        'app-messages': true
    });

    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    const [company, setCompany] = useState({
        company_name: '',
        industry: '',
        location: '',
        website: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, companyData] = await Promise.all([
                    authService.getMe(),
                    companyService.getProfile()
                ]);
                setUser({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                });
                setCompany({
                    company_name: companyData.company_name || '',
                    industry: companyData.industry || '',
                    location: companyData.location || '',
                    website: companyData.website || ''
                });
            } catch (err) {
                console.error("Failed to fetch settings data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await authService.updateMe(user);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="loading" style={{ height: '100vh', background: '#0A0C10' }}></div>;


    const activityLog = [
        { id: 1, action: 'Password changed', date: 'Oct 14, 2023 12:45 PM', ip: '197.204.XX.XX', device: 'Chrome • Algiers, DZ' },
        { id: 2, action: 'New interview scheduled', date: 'Oct 12, 2023 09:30 AM', ip: '197.204.XX.XX', device: 'Chrome • Algiers, DZ' },
        { id: 3, action: 'Two-factor enabled', date: 'Oct 10, 2023 11:15 AM', ip: '197.204.XX.XX', device: 'iPhone • Algiers, DZ' },
        { id: 4, action: 'LoggedIn successfully', date: 'Oct 10, 2023 11:10 AM', ip: '197.204.XX.XX', device: 'Chrome • Algiers, DZ' }
    ];

    const handleToggle = (id) => {
        setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const Switch = ({ checked, onChange }) => (
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    );

    return (
        <div className="company-settings-container">
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
                <CompanySidebar activePath="settings" onClose={() => setSidebarOpen(false)} />
            </aside>

            <main className="settings-main-content">
                <header className="settings-header">
                    <div>
                        <h1>Settings</h1>
                        <p>Manage your account, security and notification preferences.</p>
                    </div>
                    {showSuccess && (
                        <div className="settings-success-toast">
                            <CheckCircle size={16} /> Settings saved successfully!
                        </div>
                    )}
                </header>

                <div className="settings-tabs">
                    {['Profile', 'Security', 'Notifications', 'Activity Log'].map(tab => (
                        <div
                            key={tab}
                            className={`settings-tab ${activeInternalTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveInternalTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className="settings-sections">
                    {/* PROFILE TAB */}
                    {activeInternalTab === 'Profile' && (
                        <div className="settings-card fade-in">
                            <h3>Profile Information</h3>
                            <div className="profile-info-block">
                                <div className="profile-photo-selection">
                                    <div className="avatar-wrapper">
                                        <img src="https://ui-avatars.com/api/?name=Alex+Mercer&background=0d1117&color=ff1b90" alt="Profile" />
                                        <div className="edit-photo-badge"><Camera size={16} /></div>
                                    </div>
                                    <div className="change-photo-link">Change photo</div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label>First Name</label>
                                        <input type="text" name="first_name" value={user.first_name} onChange={handleUserChange} />
                                    </div>
                                    <div className="form-field">
                                        <label>Last Name</label>
                                        <input type="text" name="last_name" value={user.last_name} onChange={handleUserChange} />
                                    </div>
                                    <div className="form-field">
                                        <label>Work Email</label>
                                        <input type="email" name="email" value={user.email} readOnly />
                                    </div>
                                    <div className="form-field">
                                        <label>Phone</label>
                                        <input type="text" name="phone" value={user.phone} onChange={handleUserChange} />
                                    </div>
                                    <div className="form-field">
                                        <label>Company</label>
                                        <input type="text" value={company.company_name} readOnly />
                                    </div>
                                    <div className="form-field">
                                        <label>Industry</label>
                                        <input type="text" value={company.industry} readOnly />
                                    </div>
                                </div>
                            </div>
                            <div className="save-changes-footer">
                                <button className="btn-save-changes" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeInternalTab === 'Security' && (
                        <div className="settings-section-grid fade-in">
                            <div className="settings-card">
                                <h3><Lock size={18} className="toggle-icon pink" /> Login & Password</h3>
                                <div className="password-section">
                                    <div className="email-display-box">
                                        <div>
                                            <span className="email-label">Active Email</span>
                                            <span className="email-value">{user.email}</span>
                                        </div>
                                        <div className="change-email-btn">Change</div>
                                    </div>
                                    <div className="form-field"><input type="password" placeholder="Current Password" /></div>
                                    <div className="form-field"><input type="password" placeholder="New Password" /></div>
                                    <div className="form-field"><input type="password" placeholder="Confirm New Password" /></div>
                                </div>
                                <div className="save-changes-footer" style={{ padding: '0', marginTop: '24px' }}>
                                    <button className="btn-save-changes" style={{ width: '100%' }} onClick={handleSave} disabled={isSaving}>Update Password</button>
                                </div>
                            </div>
                            <div className="settings-card">
                                <h3><Shield size={18} className="toggle-icon blue" /> Security Options</h3>
                                <div className="two-factor-header">
                                    <p>Add an extra layer of security to your account. We will send a code to your registered mobile device.</p>
                                </div>
                                <div className="two-factor-status">
                                    <div className="status-indicator">
                                        <div className="pulse-dot"></div>
                                        2FA ENABLED
                                    </div>
                                    <Switch checked={toggles['2fa']} onChange={() => handleToggle('2fa')} />
                                </div>
                                <div className="security-extra-list">
                                    <div className="notification-row">
                                        <span>Show IP on login</span>
                                        <Switch checked={true} onChange={() => { }} />
                                    </div>
                                    <div className="notification-row">
                                        <span>Email me on new login</span>
                                        <Switch checked={true} onChange={() => { }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeInternalTab === 'Notifications' && (
                        <div className="settings-card fade-in">
                            <h3>Notification Preferences</h3>
                            <div className="notifications-grid">
                                <div className="pref-column">
                                    <h4><Mail size={18} /> Email Notifications</h4>
                                    <div className="notification-row"><span>Application updates</span><Switch checked={toggles['email-app-updates']} onChange={() => handleToggle('email-app-updates')} /></div>
                                    <div className="notification-row"><span>Interview reminders</span><Switch checked={toggles['email-interviews']} onChange={() => handleToggle('email-interviews')} /></div>
                                    <div className="notification-row"><span>Weekly talent reports</span><Switch checked={toggles['email-reports']} onChange={() => handleToggle('email-reports')} /></div>
                                </div>
                                <div className="pref-column">
                                    <h4 className="in-app"><Bell size={18} /> In-App Notifications</h4>
                                    <div className="notification-row"><span>Application updates</span><Switch checked={toggles['app-updates']} onChange={() => handleToggle('app-updates')} /></div>
                                    <div className="notification-row"><span>Interview reminders</span><Switch checked={toggles['app-interviews']} onChange={() => handleToggle('app-interviews')} /></div>
                                    <div className="notification-row"><span>Direct messages</span><Switch checked={toggles['app-messages']} onChange={() => handleToggle('app-messages')} /></div>
                                </div>
                            </div>
                            <div className="save-changes-footer">
                                <button className="btn-save-changes" onClick={handleSave} disabled={isSaving}>Save Preferences</button>
                            </div>
                        </div>
                    )}

                    {/* ACTIVITY LOG TAB */}
                    {activeInternalTab === 'Activity Log' && (
                        <div className="settings-card fade-in">
                            <h3>Account Activity</h3>
                            <p style={{ color: '#8b92a5', marginBottom: '24px', fontSize: '14px' }}>This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.</p>
                            <div className="activity-table-wrapper">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>ACTION</th>
                                            <th>DATE & TIME</th>
                                            <th>IP ADDRESS</th>
                                            <th>DEVICE / LOCATION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLog.map(log => (
                                            <tr key={log.id}>
                                                <td><span className="log-action">{log.action}</span></td>
                                                <td>{log.date}</td>
                                                <td className="log-ip">{log.ip}</td>
                                                <td>{log.device}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CompanySettings;
