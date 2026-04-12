import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    Settings,
    Search,
    Bell,
    LogOut,
    Plus,
    Users,
    TrendingUp,
    FileText,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { companyService } from '../../services/api';
import CompanyOffers from './CompanyOffers';
import CompanyCandidates from './CompanyCandidates';
import CreateOffer from './CreateOffer';
import './CompanyDashboard.css';

const CompanyDashboard = ({ setUserRole }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getTabFromPath = (path) => {
        const parts = path.split('/');
        if (path.includes('/offer/create')) return 'create-offer';
        if (path.includes('/candidates')) return 'candidates';
        if (parts[parts.length - 1] === 'company' || parts[parts.length - 1] === 'dashboard') return 'dashboard';
        return parts[parts.length - 1]; // e.g., 'offers'
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        setActiveTab(getTabFromPath(location.pathname));
    }, [location.pathname]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Defensive check if dashboard method is configured
                let res = {};
                try {
                    res = await companyService.getDashboard();
                } catch(e) {
                    console.warn("Could not fetch detailed company dashboard, using mock data for layout");
                    res = {
                        first_name: 'Company',
                        last_name: 'Admin',
                        company_name: 'Stage-IO Partner'
                    };
                }
                setUserData(res || {});
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUserRole('public');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="company-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
                <div className="custom-loader"></div>
            </div>
        );
    }

    return (
        <div className="company-dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="company-logo-area">
                        <div className="logo-icon-wrap">
                            <span style={{color: '#fff', fontSize: '18px', fontWeight: '800'}}>S</span>
                        </div>
                        <div>
                            <h2>{userData?.company_name || 'Stage-IO Partner'}</h2>
                            <span>Espace Entreprise</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard/company" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Tableau de bord</span>
                    </Link>
                    <Link to="/dashboard/company/offers" className={`nav-item ${activeTab === 'offers' ? 'active' : ''}`}>
                        <Briefcase size={20} />
                        <span>Mes Offres</span>
                    </Link>
                    <Link to="/dashboard/company/offer/create" className={`nav-item ${activeTab === 'create-offer' ? 'active' : ''}`}>
                        <Plus size={20} />
                        <span>Publier une Offre</span>
                    </Link>
                    <Link to="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); showToast("Settings coming soon"); }}>
                        <Settings size={20} />
                        <span>Paramètres</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="premium-support">
                        <p>Besoin d'aide pour recruter ?</p>
                        <button className="btn-expert">Contacter un Expert</button>
                    </div>
                    <button onClick={handleLogout} className="nav-item logout" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginTop: '12px' }}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main" style={{display: 'flex', flexDirection: 'column'}}>
                {activeTab === 'dashboard' ? (
                    <>
                        <header className="dashboard-header">
                            <div>
                                <h1>Bonjour, {userData?.first_name || 'Admin'}</h1>
                                <p>Voici un aperçu de vos activités de recrutement.</p>
                            </div>
                            <div className="header-actions">
                                <div className="notification-btn icon-btn">
                                    <Bell size={18} />
                                    <span className="dot"></span>
                                </div>
                                <div className="user-dropdown">
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#9e59ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                        {userData?.first_name ? userData.first_name[0] : 'C'}
                                    </div>
                                    <span>{userData?.first_name || 'Compte'}</span>
                                </div>
                            </div>
                        </header>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-content">
                                    <h3>Candidatures en attente</h3>
                                    <div className="stat-numbers">
                                        <span className="value">12</span>
                                    </div>
                                </div>
                                <div className="stat-icon-bg"><Users /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-content">
                                    <h3>Offres Actives</h3>
                                    <div className="stat-numbers">
                                        <span className="value">3</span>
                                    </div>
                                </div>
                                <div className="stat-icon-bg"><Briefcase /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-content">
                                    <h3>Taux de Match</h3>
                                    <div className="stat-numbers">
                                        <span className="value">85%</span>
                                        <span className="change positive">+5%</span>
                                    </div>
                                </div>
                                <div className="stat-icon-bg"><TrendingUp /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-content">
                                    <h3>Conventions Générées</h3>
                                    <div className="stat-numbers">
                                        <span className="value">4</span>
                                    </div>
                                </div>
                                <div className="stat-icon-bg"><FileText /></div>
                            </div>
                        </div>

                        <div className="dashboard-layout">
                            <div className="left-column">
                                <div className="pipeline-section">
                                    <div className="section-title">
                                        <h2>Pipeline Récent</h2>
                                        <Link to="/dashboard/company/offers" className="view-all">Voir tout</Link>
                                    </div>
                                    <div className="table-container">
                                        <table className="candidates-table">
                                            <thead>
                                                <tr>
                                                    <th>Candidat</th>
                                                    <th>Offre</th>
                                                    <th>Match AI</th>
                                                    <th>Statut</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="candidate-info">
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#333' }}></div>
                                                        <div>
                                                            <h4>Mohamed A.</h4>
                                                            <p>Software Engineering</p>
                                                        </div>
                                                    </td>
                                                    <td className="role-text">Développeur React</td>
                                                    <td>
                                                        <div className="match-badge">
                                                            <span className="match-value">92%</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="status-indicator"><span className="dot" style={{ background: '#f59e0b'}}></span> En revue</span>
                                                    </td>
                                                    <td><button className="btn-action">Action</button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <aside className="right-column">
                                <div className="analytics-card">
                                    <h4 className="subtitle">PERFORMANCE DES OFFRES</h4>
                                    <div className="bar-chart-container">
                                        <div className="bars">
                                            <div className="bar-wrap"><div className="bar" style={{height: '30%'}}></div></div>
                                            <div className="bar-wrap"><div className="bar" style={{height: '50%'}}></div></div>
                                            <div className="bar-wrap"><div className="bar" style={{height: '80%'}}></div></div>
                                            <div className="bar-wrap"><div className="bar" style={{height: '40%'}}></div></div>
                                            <div className="bar-wrap"><div className="bar" style={{height: '90%'}}></div></div>
                                            <div className="bar-wrap"><div className="bar" style={{height: '60%'}}></div></div>
                                        </div>
                                    </div>
                                    <div className="analytics-metrics">
                                        <div className="metric-item">
                                            <div className="metric-header">
                                                <span>Vues de profil</span>
                                                <span>1,240</span>
                                            </div>
                                            <div className="progress-bg">
                                                <div className="progress-fill" style={{width: '75%'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : activeTab === 'offers' ? (
                    <CompanyOffers userData={userData} />
                ) : activeTab === 'candidates' ? (
                    <CompanyCandidates userData={userData} />
                ) : activeTab === 'create-offer' ? (
                    <CreateOffer userData={userData} onSuccess={() => navigate('/dashboard/company/offers')} />
                ) : (
                    <div className="placeholder-pane">
                        <h2>Section En Développement</h2>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            background: '#10b981',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                            fontWeight: '600',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <CheckCircle2 size={20} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyDashboard;
