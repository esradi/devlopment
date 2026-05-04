import React, { useState, useEffect } from 'react';
import {
    Eye, Check, X, RotateCcw, Info, CheckCircle2, AlertCircle,
    TrendingUp, ChevronDown, Plus, Activity, Loader2, Download,
    Search, Building2, Fingerprint, FileText, ShieldCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminService, authService, conventionService } from '../../services/api';
import './AdminValidation.css';

const AdminValidation = () => {
    const navigate = useNavigate();
    const [validations, setValidations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [companyFilter, setCompanyFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [conventionStats, setConventionStats] = useState({ pending_admin: 0, in_progress: 0, validated: 0, total: 0 });
    const [exporting, setExporting] = useState(false);
    const [signingConventionId, setSigningConventionId] = useState(null);
    const [showScanningModal, setShowScanningModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureConventionId, setSignatureConventionId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [modernAlert, setModernAlert] = useState(null); // { type: 'success'|'error'|'confirm', title, message, onConfirm }
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
            
            // 1. Check if biometric hardware is even available
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

            await conventionService.validateAdmin(conventionId, webauthnResponse);
            fetchValidations();
            showModal('success', 'Validated', 'Convention validated successfully with fingerprint!');
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
                    showModal('error', 'Failed', 'Could not send reminder.');
                }
            }
        );
    };

    const handleDownloadPDF = async (conventionId, vCode) => {
        window.open(conventionService.download(conventionId, vCode), '_blank');
    };

    const handleRegisterFingerprint = async (passedConventionId = null) => {
        // Prevent passing React synthetic events as conventionId
        const conventionId = (passedConventionId && typeof passedConventionId !== 'object') ? passedConventionId : null;

        try {
            setLoading(true);
            setShowScanningModal(true);

            console.log("Fetching registration options...");
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

            // If we were trying to sign a convention, auto-trigger it now
            if (conventionId) {
                handleSignConvention(conventionId);
            }
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.message.includes("utilisé")) {
                if (conventionId) {
                    showModal('confirm', 'Sensor Blocked', "Your browser is blocking the hardware sensor on 'localhost'.\n\nWould you like to use the SECURE MANUAL SIGNATURE instead?", () => {
                        setSignatureConventionId(conventionId);
                        setShowSignatureModal(true);
                    });
                } else {
                    showModal('error', 'Hardware Blocked', "Your browser is blocking the hardware sensor on 'localhost'. Please use a mobile device or a supported environment.");
                }
            } else {
                showModal('error', 'Setup Failed', err.message);
            }
        } finally {
            setLoading(false);
            setShowScanningModal(false);
        }
    };

    const handleManualSign = async (conventionId) => {
        setSignatureConventionId(conventionId);
        setShowSignatureModal(true);
    };

    const handleInteractiveSign = async (applicationId) => {
        try {
            setLoading(true);
            // 1. Initialize convention (Accept application + Create draft convention)
            const res = await adminService.initConvention(applicationId);
            const conventionId = res.convention_id;
            
            // 2. Trigger the interactive signing flow (Fingerprint vs Manual)
            handleSignConvention(conventionId);
        } catch (err) {
            showModal('error', 'Initialization Failed', (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptApplication = async (applicationId) => {
        try {
            setLoading(true);
            // 1. Accept the application as University
            await adminService.acceptApplication(applicationId);
            
            // Sync dashboard immediately so the user sees the "Accepted" state
            await fetchValidations();

            // 2. Initialize the legal convention
            const res = await adminService.initConvention(applicationId);
            const conventionId = res.convention_id;
            
            // 3. Immediately trigger the interactive signing flow (Fingerprint vs Manual)
            // But first check if it's already signed (to avoid the error in screenshot)
            if (res.admin_signed) {
                showModal('success', 'Already Signed', 'This application is approved and already signed.');
            } else {
                showModal('success', 'Approved', 'Application approved. Opening signature window...');
                handleSignConvention(conventionId);
            }
        } catch (err) {
            showModal('error', 'Acceptance Failed', (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRejectApplication = async (applicationId) => {
        showModal('confirm', 'Reject Application', 'Are you sure you want to reject this application? This action is permanent and will notify the student.', async () => {
            try {
                setLoading(true);
                await adminService.rejectApplication(applicationId, "Rejected by University Administration");
                showModal('success', 'Rejected', 'Application has been rejected successfully.');
                fetchValidations();
            } catch (err) {
                showModal('error', 'Failed', err.message);
            } finally {
                setLoading(false);
            }
        });
    };

    const submitManualSignature = async () => {
        let signatureImage = null;
        if (canvasRef.current) {
            signatureImage = canvasRef.current.toDataURL('image/png');
        }
        setShowSignatureModal(false);
        try {
            setLoading(true);
            await conventionService.validateAdmin(signatureConventionId, {
                manual: true,
                signature_image: signatureImage
            });
            showModal('success', 'Convention Signed', 'Convention signed successfully with digital fallback!');
            fetchValidations();
        } catch (err) {
            showModal('error', 'Signature Failed', (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            setSignatureConventionId(null);
        }
    };

    const filterOptions = [
        { id: 'all', label: 'All Status' },
        { id: 'pending', label: 'Waiting for Company' },
        { id: 'accepted', label: 'Waiting for University' },
        { id: 'university_approved', label: 'Ready to Sign' },
        { id: 'validated', label: 'Fully Validated' },
    ];

    const fetchValidations = async () => {
        try {
            setLoading(true);
            const params = {
                status: statusFilter === 'All' ? '' : statusFilter.toLowerCase(),
                company: companyFilter || '',
                search: searchQuery,
                date: dateFilter
            };
            const res = await adminService.getValidations(params); // Fetch all, filter from backend
            setValidations(res?.results || res || []);

            // Also refresh stats when filtering or loading
            const stats = await adminService.getConventionStats();
            setConventionStats(stats);
        } catch (err) {
            console.error("Failed to fetch applications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initData = async () => {
            try {
                const compsRes = await adminService.getCompanies();
                setCompanies(compsRes?.results || compsRes || []);
                const stats = await adminService.getConventionStats();
                setConventionStats(stats);
            } catch (err) {
                console.error("Failed to fetch companies:", err);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchValidations();
        }, 300);
        return () => clearTimeout(timer);
    }, [statusFilter, companyFilter, searchQuery, dateFilter]); // Fetch when filters change

    // Use backend filtered data
    const filteredValidations = validations;

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = {};
            if (statusFilter !== 'All') params.status = statusFilter;
            if (companyFilter) params.company = companyFilter;

            const response = await adminService.exportApplications(params);

            // Create blob with correct MIME type for Excel
            const blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
            link.setAttribute('download', `applications_report_${timestamp}.xlsx`);

            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setExporting(false);
        }
    };

    const handleAutoSignAll = async () => {
        if (!window.confirm("Are you sure you want to simulate signatures for ALL pending conventions? This will mark them as validated by all 3 parties.")) return;
        try {
            setLoading(true);
            const res = await adminService.autoSignAllConventions();
            showModal('success', 'Auto-Sign Complete', res.data?.message || 'Conventions have been fully signed.');
            
            // Refresh both data and stats
            await fetchValidations();
        } catch (err) {
            showModal('error', 'Auto-Sign Failed', 'Could not complete auto-sign simulation.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        
        let confirmMsg = `Are you sure you want to perform bulk ${action} on ${selectedIds.length} items?`;
        if (action === 'delete') confirmMsg = `WARNING: Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} records? This cannot be undone.`;

        showModal('confirm', `Bulk ${action.toUpperCase()}`, confirmMsg, async () => {
            try {
                setLoading(true);
                let res;
                if (action === 'delete') res = await adminService.bulkDelete(selectedIds);
                if (action === 'accept') res = await adminService.bulkAccept(selectedIds);
                if (action === 'sign') res = await adminService.bulkSign(selectedIds);
                
                showModal('success', 'Bulk Action Complete', res.data?.message || `Successfully processed ${selectedIds.length} items.`);
                setSelectedIds([]);
                await fetchValidations();
            } catch (err) {
                showModal('error', 'Bulk Action Failed', (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === validations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(validations.map(v => v.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getStatusElement = (status) => {
        let colorClass = '';
        const s = status.toLowerCase();
        if (s === 'pending') colorClass = 'status-dot-yellow';
        if (s === 'accepted') colorClass = 'status-dot-green';
        if (s === 'rejected') colorClass = 'status-dot-red';
        if (s === 'withdrawn') colorClass = 'status-dot-grey';

        return (
            <div className="validation-status-view">
                <span className={`status-dot ${colorClass}`}></span>
                <span className={`status-text ${colorClass.replace('-dot-', '-text-')}`}>{status.toUpperCase()}</span>
            </div>
        );
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // Handle both touch and mouse events
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

    // Helper to determine modern alert styles
    const getModernAlertProps = () => {
        if (!modernAlert) return null;
        const isConfirm = modernAlert.type === 'confirm';
        const isSuccess = modernAlert.type === 'success';
        const Icon = isSuccess ? CheckCircle2 : (isConfirm ? ShieldCheck : AlertCircle);
        const iconColor = isSuccess ? '#10b981' : (isConfirm ? '#8b5cf6' : '#ef4444');
        const iconBg = isSuccess ? 'rgba(16, 185, 129, 0.1)' : (isConfirm ? 'rgba(139, 92, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)');
        return { isConfirm, Icon, iconColor, iconBg };
    };

    const alertProps = getModernAlertProps();

    return (
        <div className="admin-validation-page">
            {/* Modern Alert Modal */}
            <AnimatePresence>
                {modernAlert && alertProps && (
                    <motion.div
                        className="modern-alert-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modern-alert-box"
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        >
                            <div className="modern-alert-header" style={{ '--icon-bg': alertProps.iconBg }}>
                                <div className="modern-alert-icon" style={{ color: alertProps.iconColor }}>
                                    <alertProps.Icon size={28} />
                                </div>
                                <h3>{modernAlert.title}</h3>
                            </div>
                            <div className="modern-alert-body">
                                <p>{modernAlert.message}</p>
                            </div>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setModernAlert(null)}>
                                    {alertProps.isConfirm ? 'Cancel' : 'Close'}
                                </button>
                                {alertProps.isConfirm && (
                                    <button className="modern-btn-confirm" onClick={() => {
                                        setModernAlert(null);
                                        if (modernAlert.onConfirm) modernAlert.onConfirm();
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
                                <h3>Manual Digital Signature</h3>
                            </div>
                            <div className="signature-body">
                                <p>Please draw your signature in the box below to legally validate this convention.</p>
                                <div className="signature-canvas-container">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                        className="signature-canvas"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseOut={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    ></canvas>
                                    <button className="clear-sig-btn" onClick={clearSignature}>
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
                    >
                        <motion.div
                            className="biometric-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="scanning-container">
                                <div className="scanning-circle">
                                    <Fingerprint size={80} className="base-fingerprint" />
                                    <motion.div
                                        className="scanning-line"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="glowing-orb" />
                                </div>
                            </div>
                            <h2>Biometric Verification</h2>
                            <p>Touch your fingerprint sensor to securely sign this convention</p>
                            <div className="scanning-status">
                                <Loader2 className="animate-spin" size={16} />
                                <span>Awaiting sensor response...</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="validation-header">
                <div className="header-titles">
                    <h1>Application <span className="highlight-text">Monitor</span></h1>
                    <p>Observe the recruitment lifecycle and track application statuses across all partners.</p>
                </div>
                <div className="header-actions">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div 
                                className="bulk-actions-group"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')}>
                                    <X size={16} /> Bulk Delete
                                </button>
                                <button className="bulk-btn accept" onClick={() => handleBulkAction('accept')}>
                                    <Check size={16} /> Bulk Accept
                                </button>
                                <button className="bulk-btn sign" onClick={() => handleBulkAction('sign')}>
                                    <Fingerprint size={16} /> Bulk Sign
                                </button>
                                <div className="bulk-count-badge">{selectedIds.length} selected</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        className="setup-fingerprint-btn" 
                        onClick={handleRegisterFingerprint}
                    >
                        <ShieldCheck size={18} />
                        <span>SECURE FINGERPRINT</span>
                    </button>

                    <button
                        className={`export-report-btn ${exporting ? 'loading' : ''}`}
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        <span>Export Data</span>
                    </button>
                </div>
            </div>

            <div className="validation-metrics">
                <motion.div
                    className={`val-metric-card clickable ${statusFilter === 'All' ? 'active' : ''}`}
                    whileHover={{ y: -4 }}
                    onClick={() => setStatusFilter('All')}
                >
                    <div className="val-metric-header">
                        <span>TOTAL APPLICATIONS</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>{validations.length}</h2>
                        <span className="val-pill neutral"><Activity size={12} /> Global View</span>
                    </div>
                </motion.div>

                <motion.div
                    className={`val-metric-card clickable ${statusFilter === 'Pending' ? 'active' : ''}`}
                    whileHover={{ y: -4 }}
                    onClick={() => setStatusFilter('Pending')}
                >
                    <div className="val-metric-header">
                        <span>PENDING REVIEW</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>{validations.filter(v => v.status === 'pending').length}</h2>
                        <span className="val-pill urgent"><AlertCircle size={12} /> By Companies</span>
                    </div>
                </motion.div>

                <motion.div
                    className={`val-metric-card clickable ${statusFilter === 'Accepted' ? 'active' : ''}`}
                    whileHover={{ y: -4 }}
                    onClick={() => setStatusFilter('Accepted')}
                >
                    <div className="val-metric-header">
                        <span>SUCCESSFUL PLACEMENTS</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>{validations.filter(v => v.status === 'accepted').length}</h2>
                        <span className="val-pill success"><CheckCircle2 size={12} /> Accepted</span>
                    </div>
                </motion.div>
            </div>

            <div className="validation-main-layout">
                <div className="validation-table-section">
                    <div className="validation-toolbar">
                        <div className="val-toolbar-filters">
                            <div className="val-segmented-controls">
                                {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                                    <button
                                        key={status}
                                        className={`val-segment ${statusFilter === status ? 'active' : ''}`}
                                        onClick={() => setStatusFilter(status)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        {status}
                                        <span style={{
                                            background: statusFilter === status ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                                            borderRadius: '10px',
                                            padding: '0 6px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            lineHeight: '1.4'
                                        }}>
                                            {status === 'All' ? validations.length
                                                : status === 'Pending' ? validations.filter(v => v.status === 'pending').length
                                                    : status === 'Accepted' ? validations.filter(v => v.status === 'accepted').length
                                                        : status === 'Rejected' ? validations.filter(v => v.status === 'rejected').length
                                                            : 0}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="val-select-wrapper">
                                <Building2 size={16} className="select-icon" />
                                <select
                                    className="val-company-select"
                                    value={companyFilter}
                                    onChange={(e) => setCompanyFilter(e.target.value)}
                                >
                                    <option value="">All Companies</option>
                                    {companies.map(comp => (
                                        <option key={comp.id} value={comp.id}>{comp.company_name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="select-arrow" />
                            </div>

                            <div className="val-select-wrapper">
                                <Search size={16} className="select-icon" style={{ left: '12px' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="val-company-select"
                                    style={{ paddingLeft: '35px', width: '200px' }}
                                />
                            </div>

                            <div className="val-select-wrapper">
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="val-company-select"
                                    title="Filter by Application Date"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="val-table-wrapper">
                        {loading ? (
                            <div className="val-table-loading">
                                <Loader2 className="animate-spin" size={32} />
                                <span>Syncing Data...</span>
                            </div>
                        ) : (
                            <table className="val-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input 
                                                type="checkbox" 
                                                className="val-checkbox"
                                                checked={selectedIds.length === filteredValidations.length && filteredValidations.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>CANDIDATE</th>
                                        <th>PARTNER COMPANY</th>
                                        <th>SIGNATURE STATUS</th>
                                        <th>ACTIONS</th>
                                        <th>TIMELINE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filteredValidations.length > 0 ? filteredValidations.map((row) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                transition={{ duration: 0.2 }}
                                                className={selectedIds.includes(row.id) ? 'row-selected' : ''}
                                            >
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="val-checkbox"
                                                        checked={selectedIds.includes(row.id)}
                                                        onChange={() => toggleSelectRow(row.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="offer-detail-cell">
                                                        <strong>{row.student_name || '—'}</strong>
                                                        <span>{row.student_email || '—'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="company-info-cell">
                                                        <strong>{row.company_name || '—'}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="signature-tracking-cell">
                                                        <div className={`sig-status-item ${row.convention_student_signed ? 'signed' : 'pending'}`}>
                                                            <div className="sig-dot"></div>
                                                            <span>Student</span>
                                                            {!row.convention_student_signed && row.convention_id && (
                                                                <button className="remind-btn" onClick={() => handleSendReminder(row.convention_id, 'student')}>Remind</button>
                                                            )}
                                                        </div>
                                                        <div className={`sig-status-item ${row.convention_company_signed ? 'signed' : 'pending'}`}>
                                                            <div className="sig-dot"></div>
                                                            <span>Company</span>
                                                            {!row.convention_company_signed && row.convention_id && (
                                                                <button className="remind-btn" onClick={() => handleSendReminder(row.convention_id, 'company')}>Remind</button>
                                                            )}
                                                        </div>
                                                        <div className={`sig-status-item ${row.convention_admin_signed ? 'signed' : 'pending'}`}>
                                                            <div className="sig-dot"></div>
                                                            <span>Admin</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="admin-actions-cell">
                                                        {row.status.toLowerCase() === 'pending' ? (
                                                            <button
                                                                className="action-btn-main pending-company"
                                                                disabled
                                                                title="Waiting for Company decision"
                                                            >
                                                                <Clock size={16} />
                                                                <span>Company Pending</span>
                                                            </button>
                                                        ) : row.status.toLowerCase() === 'accepted' ? (
                                                            <button
                                                                className="action-btn-main accept"
                                                                onClick={() => handleAcceptApplication(row.id)}
                                                                title="Approve as University"
                                                            >
                                                                <Check size={16} />
                                                                <span>Univ. Accept</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className={`action-btn-main sign ${row.convention_admin_signed ? 'is-signed' : ''}`}
                                                                onClick={() => {
                                                                    if (row.convention_id) {
                                                                        handleSignConvention(row.convention_id);
                                                                    } else {
                                                                        handleInteractiveSign(row.id);
                                                                    }
                                                                }}
                                                                disabled={row.convention_admin_signed || row.convention_status === 'validated'}
                                                            >
                                                                {row.convention_admin_signed ? <Check size={16} /> : <Fingerprint size={16} />}
                                                                <span>{row.convention_admin_signed ? 'Signed' : 'Sign'}</span>
                                                            </button>
                                                        )}
                                                        
                                                        {row.convention_id && (
                                                            <button
                                                                className="action-btn-main download"
                                                                onClick={() => handleDownloadPDF(row.convention_id, row.convention_verification_code)}
                                                            >
                                                                <Download size={16} />
                                                            </button>
                                                        )}
                                                        
                                                        {row.status.toLowerCase() !== 'rejected' && row.status.toLowerCase() !== 'university_approved' && (
                                                            <button
                                                                className="action-btn-main reject"
                                                                onClick={() => handleRejectApplication(row.id)}
                                                                title="Reject Application"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '12px', color: '#8892b0' }}>
                                                        {new Date(row.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8892b0' }}>
                                                    No applications found for the selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="validation-sidebar">
                    <div className="val-widget-card convention-lifecycle-card">
                        <div className="val-widget-header">
                            <div className="guidelines-icon-wrapper">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h3>Legal Tracking</h3>
                                <span>CONVENTION PIPELINE</span>
                            </div>
                        </div>

                        <div className="lifecycle-visualization">
                            <div className="progress-circle-container">
                                <svg viewBox="0 0 100 100" className="progress-svg">
                                    <circle className="progress-bg" cx="50" cy="50" r="45" />
                                    <motion.circle
                                        className="progress-bar"
                                        cx="50" cy="50" r="45"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: (conventionStats.validated / (conventionStats.total || 1)) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="progress-info">
                                    <span className="percent">
                                        {Math.round((conventionStats.validated / (conventionStats.total || 1)) * 100)}%
                                    </span>
                                    <span className="label">Complete</span>
                                </div>
                            </div>
                        </div>

                        <div className="pipeline-steps">
                            <div className="step-row">
                                <div className="step-info">
                                    <div className="step-dot urgent"></div>
                                    <span className="step-name">Your Signature</span>
                                </div>
                                <span className="step-count">{conventionStats.pending_admin}</span>
                            </div>
                            <div className="step-row">
                                <div className="step-info">
                                    <div className="step-dot warning"></div>
                                    <span className="step-name">Partner Signing</span>
                                </div>
                                <span className="step-count">{conventionStats.in_progress}</span>
                            </div>
                            <div className="step-row">
                                <div className="step-info">
                                    <div className="step-dot success"></div>
                                    <span className="step-name">Legally Active</span>
                                </div>
                                <span className="step-count">{conventionStats.validated}</span>
                            </div>
                        </div>

                        <div className="sidebar-divider"></div>

                        <div className="val-widget-footer">
                            <button className="premium-sidebar-btn" onClick={() => navigate('/dashboard/admin/internships')}>
                                <span>ACCESS REPOSITORY</span>
                                <TrendingUp size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="val-widget-card observation-card">
                        <div className="val-widget-header">
                            <div className="guidelines-icon-wrapper info">
                                <Info size={18} />
                            </div>
                            <div>
                                <h3>Observation<br />Mode</h3>
                                <span>MONITORING ONLY</span>
                            </div>
                        </div>
                        <p className="widget-helper-text">
                            Recruitment decisions are led by Company HR. You monitor the flow and sign final legal agreements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminValidation;
