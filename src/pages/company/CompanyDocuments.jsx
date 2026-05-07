import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, Send, MessageSquare, Settings, Calendar,
    Folder, Sparkles, Filter, ChevronDown, Download, Edit3, CloudDownload,
    LogOut, User, FileText, TrendingUp, Search, Bell, HelpCircle, Menu, X,
    Fingerprint, AlertCircle, CheckCircle2, ShieldCheck, RotateCcw, Loader2,
    ChevronRight, Eye
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { conventionService, referenceService, companyService, authService } from '../../services/api';
import './CompanyDocuments.css';
import '../company/CompanyDashboard.css';

const StatusPill = ({ status }) => {
    const s = status.toLowerCase().replace(/_/g, '-');
    const label = status.replace(/_/g, ' ');
    return (
        <div className={`doc-status-pill ${s}`}>
            <div className="dot"></div>
            {label}
        </div>
    );
};

const CompanyDocuments = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Conventions');
    const [conventions, setConventions] = useState([]);
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [interns, setInterns] = useState([]);
    const [genType, setGenType] = useState('Convention');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [offerFilter, setOfferFilter] = useState('All');
    const [modernAlert, setModernAlert] = useState(null);
    const [signingConventionId, setSigningConventionId] = useState(null);
    const [showScanningModal, setShowScanningModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureConventionId, setSignatureConventionId] = useState(null);
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);


    const showModal = (type, title, message, onConfirm = null) => {
        setModernAlert({ type, title, message, onConfirm });
    };

    const bufferToBase64 = (buffer) => {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    };

    const base64urlToUint8Array = (base64url) => {
        const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
        const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSignConvention = async (conventionId) => {
        try {
            setSigningConventionId(conventionId);
            
            // 1. Check if biometric hardware is available
            const isBiometricAvailable = window.PublicKeyCredential && 
                await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            
            if (!isBiometricAvailable) {
                console.warn("No biometric hardware detected, skipping directly to manual signature.");
                setSignatureConventionId(conventionId);
                setShowSignatureModal(true);
                return;
            }

            setShowScanningModal(true);
            console.log("Biometric hardware detected. Fetching options...");
            const options = await authService.getWebauthnOptions();
            
            const authenticationOptions = {
                publicKey: {
                    ...options,
                    challenge: base64urlToUint8Array(options.challenge),
                    allowCredentials: options.allowCredentials.map(cred => ({
                        ...cred,
                        id: base64urlToUint8Array(cred.id)
                    })),
                    userVerification: "preferred",
                    timeout: 60000
                }
            };

            const credential = await navigator.credentials.get(authenticationOptions);

            if (!credential) {
                throw new Error("No fingerprint response received from device.");
            }

            const webauthnResponse = {
                id: credential.id,
                rawId: bufferToBase64(credential.rawId),
                type: credential.type,
                response: {
                    authenticatorData: bufferToBase64(credential.response.authenticatorData),
                    clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
                    signature: bufferToBase64(credential.response.signature),
                    userHandle: credential.response.userHandle ? bufferToBase64(credential.response.userHandle) : null
                }
            };

            await conventionService.signCompany(conventionId, webauthnResponse);
            // Refresh data
            const [convData, statsData] = await Promise.all([
                conventionService.getConventions(),
                companyService.getConventionStats()
            ]);
            setConventions(convData);
            setStats(statsData);
            showModal('success', 'Validated', 'Convention signed successfully with company fingerprint!');
        } catch (err) {
            console.error("Biometric Flow Error:", err);
            const errorMsg = err.response?.data?.error || err.message || "";

            if (errorMsg.includes("credential not found") || errorMsg.includes("registered")) {
                setShowScanningModal(false);
                showModal('confirm', 'Fingerprint Not Linked', "Your fingerprint is not linked to your account yet.\n\nWould you like to link it now?", () => {
                    handleRegisterFingerprint(conventionId);
                });
            } else {
                console.warn("Biometric failed or rejected, offering manual sign fallback...");
                setSignatureConventionId(conventionId);
                setShowSignatureModal(true);
            }
        } finally {
            setSigningConventionId(null);
            setShowScanningModal(false);
        }
    };

    const handleRegisterFingerprint = async (passedConventionId = null) => {
        const conventionId = (passedConventionId && typeof passedConventionId !== 'object') ? passedConventionId : null;
        try {
            setLoading(true);
            setShowScanningModal(true);
            const options = await authService.getWebauthnRegistrationOptions();
            const creationOptions = {
                publicKey: {
                    ...options,
                    challenge: base64urlToUint8Array(options.challenge),
                    user: { ...options.user, id: base64urlToUint8Array(options.user.id) },
                    authenticatorSelection: {
                        authenticatorAttachment: "cross-platform",
                        userVerification: "preferred",
                        residentKey: "discouraged",
                    },
                    attestation: "none",
                    timeout: 60000
                }
            };

            const credential = await navigator.credentials.create(creationOptions);
            if (!credential) throw new Error("Registration was cancelled.");

            const webauthnResponse = {
                id: credential.id,
                rawId: bufferToBase64(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: bufferToBase64(credential.response.attestationObject),
                    clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
                }
            };

            await authService.verifyWebauthnRegistration(webauthnResponse);
            showModal('success', 'Setup Complete', 'Your fingerprint is now linked and ready for signing.');
            if (conventionId) {
                handleSignConvention(conventionId);
            }
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                if (conventionId) {
                    showModal('confirm', 'Sensor Blocked', "Your browser is blocking the hardware sensor.\n\nWould you like to use the SECURE MANUAL SIGNATURE instead?", () => {
                        setSignatureConventionId(conventionId);
                        setShowSignatureModal(true);
                    });
                } else {
                    showModal('error', 'Hardware Blocked', "Your browser is blocking the hardware sensor. Please use a supported device.");
                }
            } else {
                showModal('error', 'Setup Failed', err.message);
            }
        } finally {
            setLoading(false);
            setShowScanningModal(false);
        }
    };

    const handleDownloadPDF = (conventionId, verificationCode) => {
        const url = conventionService.download(conventionId, verificationCode);
        window.open(url, '_blank');
    };

    const submitManualSignature = async () => {
        let signatureImage = null;
        if (canvasRef.current) {
            signatureImage = canvasRef.current.toDataURL('image/png');
        }
        setShowSignatureModal(false);
        try {
            setLoading(true);
            await conventionService.signCompany(signatureConventionId, {
                manual: true,
                signature_image: signatureImage
            });
            showModal('success', 'Convention Signed', 'Convention signed successfully with digital fallback!');
            const [convData, statsData] = await Promise.all([
                conventionService.getConventions(),
                companyService.getConventionStats()
            ]);
            setConventions(convData);
            setStats(statsData);
        } catch (err) {
            showModal('error', 'Signature Failed', (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            setSignatureConventionId(null);
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d').closePath();
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [convData, refData, statsData, internData] = await Promise.all([
                    conventionService.getConventions(),
                    referenceService.getReferences(),
                    companyService.getConventionStats(),
                    companyService.getAcceptedInterns()
                ]);
                setConventions(convData);
                setReferences(refData);
                setStats(statsData);
                setInterns(Array.isArray(internData) ? internData : internData?.results || []);
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSendReminder = (conventionId, target) => {
        showModal(
            'confirm', 
            'Send Reminder', 
            `Are you sure you want to send a signature reminder to the ${target}?`,
            async () => {
                try {
                    await conventionService.notifyReminder(conventionId, target);
                    showModal('success', 'Reminder Sent', `A notification has been sent to the ${target} successfully.`);
                } catch (err) {
                    console.error("Failed to send reminder:", err);
                    showModal('error', 'Failed', 'Could not send reminder.');
                }
            }
        );
    };

    const filteredDocs = () => {
        let docs = [];
        if (activeTab === 'Conventions') docs = conventions;
        else if (activeTab === 'Reference letters') docs = references;
        else docs = [...conventions, ...references].sort((a, b) => new Date(b.created_at || b.issue_date) - new Date(a.created_at || a.issue_date));

        if (statusFilter !== 'All') {
            docs = docs.filter(doc => doc.status === statusFilter || (statusFilter === 'Generated' && !doc.status));
        }

        if (offerFilter !== 'All') {
            docs = docs.filter(doc => (doc.offer_details?.title || doc.offer_title) === offerFilter);
        }

        return docs;
    };

    const handleGenerate = async () => {
        if (!selectedStudent) {
            showModal('error', 'Selection Required', "Please select a student first.");
            return;
        }

        try {
            setLoading(true);
            if (genType === 'Convention') {
                const studentApp = interns.find(i => i.student === parseInt(selectedStudent));
                if (studentApp) {
                    await companyService.generateConvention(studentApp.id);
                    showModal('success', 'Generated', "Convention generated successfully!");
                }
            } else {
                await referenceService.create({
                    student: selectedStudent,
                    subject: "Attestation de stage",
                    content: "Félicitations pour votre stage."
                });
                showModal('success', 'Generated', "Reference letter generated successfully!");
            }
            // Refresh data
            const [convData, refData, statsData] = await Promise.all([
                conventionService.getConventions(),
                referenceService.getReferences(),
                companyService.getConventionStats()
            ]);
            setConventions(convData);
            setReferences(refData);
            setStats(statsData);
        } catch (err) {
            showModal('error', 'Generation Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && conventions.length === 0) return <div className="loading-container" style={{ height: '100vh', background: '#0A0C10' }}><div className="custom-loader" /></div>;

    return (
        <div className="company-documents-dashboard">
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
                <CompanySidebar activePath="documents" onClose={() => setSidebarOpen(false)} />
            </aside>

            <AnimatePresence>
                {modernAlert && (
                    <motion.div 
                        className="modern-alert-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ zIndex: 11000 }}
                    >
                        <motion.div 
                            className="modern-alert-box"
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        >
                            <div className="modern-alert-header" style={{ 
                                '--icon-bg': modernAlert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : (modernAlert.type === 'confirm' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)') 
                            }}>
                                <div className="modern-alert-icon" style={{ 
                                    color: modernAlert.type === 'success' ? '#10b981' : (modernAlert.type === 'confirm' ? '#8b5cf6' : '#ef4444') 
                                }}>
                                    {modernAlert.type === 'success' ? <CheckCircle2 size={28} /> : (modernAlert.type === 'confirm' ? <ShieldCheck size={28} /> : <AlertCircle size={28} />)}
                                </div>
                                <h3>{modernAlert.title}</h3>
                            </div>
                            <div className="modern-alert-body">
                                <p>{modernAlert.message}</p>
                            </div>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setModernAlert(null)}>
                                    {modernAlert.type === 'confirm' ? 'Cancel' : 'Close'}
                                </button>
                                {modernAlert.type === 'confirm' && (
                                    <button className="modern-btn-confirm" onClick={() => {
                                        const callback = modernAlert.onConfirm;
                                        setModernAlert(null);
                                        if (callback) callback();
                                    }}>
                                        Proceed Securely
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Signature Draw Modal */}
            <AnimatePresence>
                {showSignatureModal && (
                    <motion.div
                        className="modern-alert-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ zIndex: 11000 }}
                    >
                        <motion.div
                            className="modern-alert-box signature-modal-box"
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        >
                            <div className="modern-alert-header" style={{ '--icon-bg': 'rgba(168, 85, 247, 0.1)' }}>
                                <div className="modern-alert-icon" style={{ color: '#a855f7' }}>
                                    <FileText size={28} />
                                </div>
                                <h3>Company Digital Signature</h3>
                            </div>
                            <div className="signature-body" style={{ padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#8892b0', marginBottom: '20px' }}>Please draw your signature in the box below to legally validate this convention.</p>
                                <div className="signature-canvas-container" style={{ position: 'relative', background: '#050505', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                        style={{ cursor: 'crosshair', display: 'block', width: '100%' }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseOut={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    ></canvas>
                                    <button 
                                        className="clear-sig-btn" 
                                        onClick={clearSignature}
                                        style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                    >
                                        <RotateCcw size={14} /> Clear
                                    </button>
                                </div>
                            </div>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setShowSignatureModal(false)}>
                                    Cancel
                                </button>
                                <button className="modern-btn-confirm" onClick={submitManualSignature}>
                                    Validate & Sign
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fingerprint Scanning Modal */}
            <AnimatePresence>
                {showScanningModal && (
                    <motion.div
                        className="biometric-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            className="biometric-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{ background: 'rgba(30, 30, 45, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}
                        >
                            <div className="scanning-container" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 30px' }}>
                                <div className="scanning-circle" style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.2)', overflow: 'hidden' }}>
                                    <Fingerprint size={80} style={{ color: '#a855f7', opacity: 0.3 }} />
                                    <motion.div
                                        className="scanning-line"
                                        style={{ position: 'absolute', width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #a855f7, transparent)', boxShadow: '0 0 15px #a855f7', zIndex: 2 }}
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="glowing-orb" style={{ position: 'absolute', width: '60px', height: '60px', background: '#a855f7', filter: 'blur(40px)', opacity: 0.1, zIndex: 1 }} />
                                </div>
                            </div>
                            <h2 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.5rem' }}>Biometric Verification</h2>
                            <p style={{ color: '#8892b0', marginBottom: '20px' }}>Touch your fingerprint sensor to securely sign this convention</p>
                            <div className="scanning-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#a855f7' }}>
                                <Loader2 className="animate-spin" size={16} />
                                <span>Awaiting sensor response...</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <main className="documents-main">
                <div className="doc-header-flex">
                    <div className="doc-header-left">
                        <h1>Documents</h1>
                        <p>Manage internship agreements and reference letters for your interns.</p>
                    </div>
                    <button className="btn-generate-main" onClick={() => setActiveTab('Conventions')}>
                        <Sparkles size={18} /> Generate document
                    </button>
                </div>

                <div className="doc-tabs-container">
                    {['Conventions', 'Reference letters', 'All documents'].map(tab => (
                        <button
                            key={tab}
                            className={`doc-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="doc-filters-row">
                    <div className="doc-filter-group">
                        <div className="doc-filter-item">
                            <span className="lbl">Status:</span>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="pending_student_signature">Pending Student</option>
                                <option value="pending_company_signature">Pending Company</option>
                                <option value="pending_admin_validation">Pending Admin</option>
                                <option value="validated">Validated</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="doc-filter-divider"></div>
                        <div className="doc-filter-item">
                            <span className="lbl">Offer:</span>
                            <select
                                className="filter-select"
                                value={offerFilter}
                                onChange={(e) => setOfferFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                {[...new Set(conventions.map(c => c.offer_details?.title || c.offer_title))].filter(Boolean).map(title => (
                                    <option key={title} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button className="btn-clear-filters" onClick={() => {
                        setStatusFilter('All');
                        setOfferFilter('All');
                        setActiveTab('All documents');
                    }}>
                        <Filter size={14} /> Clear Filters
                    </button>
                </div>

                <div className="doc-table-container">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Offer</th>
                                <th>Signature Track</th>
                                <th>Generated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs().map(doc => {
                                const isConv = doc.offer_details || doc.offer;
                                const student = isConv ? doc.student_details : doc.student;
                                const studentName = isConv ? `${student?.first_name} ${student?.last_name}` : student?.full_name;
                                const title = isConv ? (doc.offer_details?.title || doc.offer_title) : doc.subject;

                                return (
                                    <tr key={doc.id + (isConv ? '-c' : '-r')}>
                                        <td>
                                            <div className="doc-student-cell">
                                                <img src={student?.profile_picture || "https://ui-avatars.com/api/?name=" + (studentName || 'Student')} alt="avatar" className="doc-s-avatar" />
                                                <div className="doc-s-info">
                                                    <h4>{studentName}</h4>
                                                    <p>{student?.university || student?.domain || 'Student'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-offer-cell">
                                                <h5>{title}</h5>
                                                <p>{isConv ? 'Internship Agreement' : 'Reference Letter'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            {isConv ? (
                                                <div className="company-sig-tracking">
                                                    <div className="sig-dots-row">
                                                        <div className={`sig-dot-s ${doc.student_signed ? 'done' : 'pending'}`} title="Student Signature"></div>
                                                        <div className={`sig-dot-s ${doc.company_signed ? 'done' : 'pending'}`} title="Company Signature"></div>
                                                        <div className={`sig-dot-s ${doc.admin_signed ? 'done' : 'pending'}`} title="Admin Validation"></div>
                                                    </div>
                                                    {!doc.student_signed && (
                                                        <button className="btn-remind-mini" onClick={() => handleSendReminder(doc.id, 'student')}>
                                                            Remind
                                                        </button>
                                                    )}
                                                    {doc.student_signed && !doc.company_signed && (
                                                        <button className="btn-sign-mini-company pulse-animation" onClick={() => handleSignConvention(doc.id)}>
                                                            <Fingerprint size={12} /> Sign Now
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <StatusPill status={doc.status || 'Generated'} />
                                            )}
                                        </td>
                                        <td>
                                            <div className="doc-gen-cell">
                                                <h6>{new Date(doc.created_at || doc.issue_date).toLocaleDateString()}</h6>
                                                <p>Updated {new Date(doc.updated_at || doc.issue_date).toLocaleDateString()}</p>
                                            </div>
                                        </td>                                         <td>
                                            <div className="doc-actions">
                                                {isConv ? (
                                                    <>
                                                        <button 
                                                            className={`action-btn-main sign ${doc.company_signed ? 'is-signed' : ''} ${(!doc.company_signed && doc.student_signed) ? 'pulse-animation' : ''}`}
                                                            onClick={() => {
                                                                if (!doc.student_signed) {
                                                                    showModal('error', 'Signature Pending', 'The student must sign the convention before you can proceed with the company signature.');
                                                                } else {
                                                                    handleSignConvention(doc.id);
                                                                }
                                                            }}
                                                            disabled={doc.company_signed}
                                                            title={!doc.student_signed ? "Waiting for Student Signature" : "Sign Convention"}
                                                        >
                                                            {doc.company_signed ? <Check size={16} /> : <Fingerprint size={16} />}
                                                            <span>{doc.company_signed ? 'Signed' : 'Sign'}</span>
                                                        </button>

                                                        <button 
                                                            className="action-btn-main download" 
                                                            onClick={() => handleDownloadPDF(doc.id, doc.verification_code)}
                                                            title="Download Convention PDF"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        
                                                        <button 
                                                            className="action-btn-main view" 
                                                            onClick={() => navigate(`/dashboard/company/conventions/${doc.id}`)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {doc.pdf_url && (
                                                            <a href={doc.pdf_url} className="action-btn-main download" download target="_blank" rel="noreferrer">
                                                                <Download size={16} />
                                                            </a>
                                                        )}
                                                        <button className="action-btn-main view" onClick={() => navigate(`/dashboard/company/references/${doc.id}`)}>
                                                            <Edit3 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>


                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            <aside className="doc-right-panel">
                <div className="widget-quick-gen">
                    <h3><Sparkles size={18} color="#9e59ff" /> Quick generate</h3>
                    <span className="widget-label">Select Student</span>
                    <select
                        className="widget-select-input"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="">Select an active intern...</option>
                        {interns.map(i => (
                            <option key={i.id} value={i.student}>{i.student_name}</option>
                        ))}
                    </select>
                    <span className="widget-label">Document Type</span>
                    <select
                        className="widget-select-input filled"
                        value={genType}
                        onChange={(e) => setGenType(e.target.value)}
                    >
                        <option value="Convention">Convention de stage</option>
                        <option value="Reference">Reference Letter</option>
                    </select>
                    <button className="btn-widget-gen" onClick={handleGenerate}>Generate</button>
                </div>

                <div className="widget-status-sum">
                    <h3>Status summary</h3>
                    <div className="status-list">
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#5d6785' }}></div> Pending Student</div>
                            <div className="s-item-right">{stats?.pending_student_signature || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#9e59ff' }}></div> Pending Company</div>
                            <div className="s-item-right">{stats?.pending_company_signature || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#db2777' }}></div> Pending Admin</div>
                            <div className="s-item-right">{stats?.pending_admin_validation || 0}</div>
                        </div>
                        <div className="status-list-item">
                            <div className="s-item-left"><div className="s-item-dot" style={{ background: '#10b981' }}></div> Validated</div>
                            <div className="s-item-right">{stats?.validated || 0}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default CompanyDocuments;
