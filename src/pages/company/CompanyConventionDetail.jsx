import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, FileText, Download, CheckCircle2,
    AlertCircle, Fingerprint, Loader2, PenTool,
    RotateCcw, ShieldCheck, User, Building2, Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { conventionService, companyService, authService } from '../../services/api';
import './CompanyConventionDetail.css';

const CompanyConventionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [convention, setConvention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modernAlert, setModernAlert] = useState(null);
    const [showScanningModal, setShowScanningModal] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const canvasRef = useRef(null);
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

    useEffect(() => {
        const fetchConvention = async () => {
            try {
                setLoading(true);
                const data = await conventionService.getDetails(id);
                setConvention(data);
            } catch (err) {
                console.error("Failed to fetch convention details:", err);
                showModal('error', 'Error', 'Failed to load convention details.');
            } finally {
                setLoading(false);
            }
        };
        fetchConvention();
    }, [id]);

    const handleSign = async () => {
        try {
            const isBiometricAvailable = window.PublicKeyCredential &&
                await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

            if (!isBiometricAvailable) {
                setShowSignatureModal(true);
                return;
            }

            setShowScanningModal(true);
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
            if (!credential) throw new Error("No response received.");

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

            await conventionService.signCompany(id, webauthnResponse);
            const updated = await conventionService.getDetails(id);
            setConvention(updated);
            showModal('success', 'Validated', 'Convention signed successfully!');
        } catch (err) {
            console.error("Sign error:", err);
            setShowSignatureModal(true);
        } finally {
            setShowScanningModal(false);
        }
    };

    const submitManualSignature = async () => {
        let signatureImage = null;
        if (canvasRef.current) {
            signatureImage = canvasRef.current.toDataURL('image/png');
        }
        setShowSignatureModal(false);
        try {
            setLoading(true);
            await conventionService.signCompany(id, {
                manual: true,
                signature_image: signatureImage
            });
            const updated = await conventionService.getDetails(id);
            setConvention(updated);
            showModal('success', 'Signed', 'Convention signed successfully!');
        } catch (err) {
            showModal('error', 'Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
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
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);
    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    };

    if (loading && !convention) {
        return <div className="loading-container"><Loader2 className="animate-spin" /></div>;
    }

    if (!convention) return <div className="error-container">Convention not found.</div>;

    return (
        <div className="company-documents-dashboard detail-view">
            <header className="doc-header-flex">
                <div className="doc-header-left">
                    <button className="btn-back" onClick={() => navigate('/dashboard/company/documents')}>
                        <ChevronLeft size={20} /> Back to Documents
                    </button>
                    <h1>Convention Details</h1>
                    <p>Reference: <strong>#{convention.id}</strong> • Created on {new Date(convention.created_at).toLocaleDateString()}</p>
                </div>
                <div className="doc-header-right">
                    {convention.company_signed ? (
                        <div className="signed-badge">
                            <CheckCircle2 size={20} /> SIGNED BY COMPANY
                        </div>
                    ) : convention.student_signed ? (
                        <button className="btn-generate-main" onClick={handleSign}>
                            <Fingerprint size={20} /> Sign Now
                        </button>
                    ) : (
                        <div className="pending-badge">
                            <AlertCircle size={20} /> WAITING FOR STUDENT
                        </div>
                    )}
                    <button className="btn-widget-gen btn-download-pdf" onClick={() => window.open(conventionService.download(convention.id, convention.verification_code))}>
                        <Download size={20} /> Download PDF
                    </button>
                </div>
            </header>

            <main className="documents-main">
                <div className="detail-card">
                    <div className="preview-container">
                        {/* Placeholder for real PDF preview or stylized content */}
                        <div className="preview-content">
                            <FileText size={80} className="preview-icon" />
                            <h2>CONVENTION DE STAGE</h2>
                            <div className="preview-body">
                                <p><strong>ENTRE:</strong> {convention.company_name}</p>
                                <p><strong>ET:</strong> {convention.student_name}</p>
                                <hr />
                                <p>This document formalizes the internship agreement between the parties mentioned above. It outlines the responsibilities, duration, and legal frameworks governing the professional immersion.</p>
                                <div className="preview-signatures">
                                    <div className="signature-block">
                                        <p className="signature-label">Student Signature</p>
                                        {convention.student_signed ? (
                                            <div className="signature-status signed">[DIGITALLY SIGNED]</div>
                                        ) : <div className="signature-placeholder"></div>}
                                    </div>
                                    <div className="signature-block">
                                        <p className="signature-label">Company Signature</p>
                                        {convention.company_signed ? (
                                            <div className="signature-status signed">[DIGITALLY SIGNED]</div>
                                        ) : <div className="signature-placeholder"></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="widget-status-sum">
                        <h3>Internship Details</h3>
                        <div className="info-item">
                            <label className="widget-label">Student</label>
                            <div className="info-flex" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <User size={16} color="#9e59ff" />
                                <span>{convention.student_name}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <label className="widget-label">Offer</label>
                            <div className="info-flex" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Building2 size={16} color="#db2777" />
                                <span>{convention.offer_title}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <label className="widget-label">Duration</label>
                            <div className="info-flex" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Calendar size={16} color="#10b981" />
                                <span>{convention.duration || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="widget-quick-gen">
                        <h3>Legal Status</h3>
                        <div className="pipeline-steps">
                            <div className={`step-row ${convention.student_signed ? 'done' : ''}`}>
                                <div className="step-dot"></div>
                                <span style={{ color: convention.student_signed ? '#fff' : '#8892b0' }}>Student Signed</span>
                            </div>
                            <div className={`step-row ${convention.company_signed ? 'done' : ''}`}>
                                <div className="step-dot" style={{ background: convention.company_signed ? '#10b981' : '#ef4444' }}></div>
                                <span style={{ color: convention.company_signed ? '#fff' : '#8892b0' }}>Company Signed</span>
                            </div>
                            <div className={`step-row ${convention.admin_signed ? 'done' : ''}`}>
                                <div className="step-dot" style={{ background: convention.admin_signed ? '#10b981' : '#ef4444' }}></div>
                                <span style={{ color: convention.admin_signed ? '#fff' : '#8892b0' }}>Admin Validated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals copied from CompanyDocuments */}
            <AnimatePresence>
                {modernAlert && (
                    <div className="modern-alert-overlay" style={{ zIndex: 11000 }}>
                        <div className="modern-alert-box">
                            <div className="modern-alert-header" style={{ '--icon-bg': modernAlert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                <div className="modern-alert-icon" style={{ color: modernAlert.type === 'success' ? '#10b981' : '#ef4444' }}>
                                    {modernAlert.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                                </div>
                                <h3>{modernAlert.title}</h3>
                            </div>
                            <p className="modern-alert-body">{modernAlert.message}</p>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setModernAlert(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScanningModal && (
                    <div className="biometric-modal-overlay">
                        <div className="biometric-modal-content">
                            <div className="scanning-container">
                                <div className="scanning-circle">
                                    <Fingerprint size={80} style={{ color: '#a855f7', opacity: 0.3 }} />
                                    <motion.div className="scanning-line" animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                                </div>
                            </div>
                            <h2>Biometric Verification</h2>
                            <p>Touch your fingerprint sensor to sign</p>
                            <div className="scanning-status"><Loader2 className="animate-spin" size={16} /> Authenticating...</div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSignatureModal && (
                    <div className="modern-alert-overlay" style={{ zIndex: 11000 }}>
                        <div className="modern-alert-box signature-modal-box">
                            <div className="modern-alert-header" style={{ '--icon-bg': 'rgba(168, 85, 247, 0.1)' }}>
                                <div className="modern-alert-icon" style={{ color: '#a855f7' }}><PenTool size={28} /></div>
                                <h3>Manual Signature</h3>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div className="signature-canvas-container">
                                    <canvas ref={canvasRef} width={400} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                                    <button className="clear-sig-btn" onClick={clearSignature} style={{ position: 'absolute', bottom: '10px', right: '10px' }}><RotateCcw size={14} /> Clear</button>
                                </div>
                            </div>
                            <div className="modern-alert-actions">
                                <button className="modern-btn-cancel" onClick={() => setShowSignatureModal(false)}>Cancel</button>
                                <button className="modern-btn-confirm" onClick={submitManualSignature}>Sign Document</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyConventionDetail;
