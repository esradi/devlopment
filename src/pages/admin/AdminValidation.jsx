import React, { useState, useEffect } from 'react';
import { 
    Eye, 
    Check, 
    X, 
    RotateCcw,
    Info,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ChevronDown,
    Plus,
    Activity,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/api';
import './AdminValidation.css';

const AdminValidation = () => {
    const [validations, setValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchValidations = async () => {
            try {
                const res = await adminService.getValidations();
                setValidations(res || []);
            } catch (err) {
                console.error("Failed to fetch validations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchValidations();
    }, []);

    const handleApprove = async (id) => {
        try {
            await adminService.approveValidation(id, { feedback: 'Approved by University Admin' });
            // Refresh list
            const res = await adminService.getValidations();
            setValidations(res || []);
        } catch (err) {
            console.error("Failed to approve validation:", err);
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Enter rejection reason (min 10 chars):");
        if (!reason || reason.length < 10) {
            alert("Invalid reason. Must be at least 10 characters.");
            return;
        }
        try {
            await adminService.rejectValidation(id, { feedback: reason });
            // Refresh list
            const res = await adminService.getValidations();
            setValidations(res || []);
        } catch (err) {
            console.error("Failed to reject validation:", err);
        }
    };

    const getStatusElement = (status) => {
        let colorClass = '';
        const s = status.toLowerCase();
        if (s === 'pending') colorClass = 'status-dot-yellow';
        if (s === 'approved') colorClass = 'status-dot-green';
        if (s === 'rejected') colorClass = 'status-dot-red';

        return (
            <div className="validation-status-view">
                <span className={`status-dot ${colorClass}`}></span>
                <span className={`status-text ${colorClass.replace('-dot-', '-text-')}`}>{status.toUpperCase()}</span>
            </div>
        );
    };

    const filteredValidations = validations.filter(v => {
        if (statusFilter === 'All') return true;
        return v.status.toLowerCase() === statusFilter.toLowerCase();
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    return (
        <div className="admin-validation-page">
            <div className="validation-header">
                <div className="header-titles">
                    <h1>Validation <span className="highlight-text">Center</span></h1>
                    <p>Review and approve internship applications before they are finalized.</p>
                </div>
            </div>

            <div className="validation-metrics">
                <motion.div className="val-metric-card" whileHover={{ y: -4 }}>
                    <div className="val-metric-header">
                        <span>PENDING VALIDATIONS</span>
                    </div>
                    <div className="val-metric-body">
                        <h2>{validations.filter(v => v.status === 'pending').length}</h2>
                        <span className="val-pill urgent"><AlertCircle size={12}/> Needs Action</span>
                    </div>
                </motion.div>
            </div>

            <div className="validation-main-layout">
                <div className="validation-table-section">
                    <div className="validation-toolbar">
                        <div className="val-segmented-controls">
                            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                                <button 
                                    key={status} 
                                    className={`val-segment ${statusFilter === status ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="val-table-wrapper">
                        <table className="val-table">
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>OFFER</th>
                                    <th>COMPANY</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredValidations.map((row) => (
                                        <motion.tr 
                                            key={row.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <td>
                                                <div className="offer-detail-cell">
                                                    <strong>{row.application?.student?.first_name} {row.application?.student?.last_name}</strong>
                                                    <span>{row.application?.student?.university}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="offer-detail-cell">
                                                    <strong>{row.application?.offer?.title}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{row.application?.offer?.company_name}</strong>
                                            </td>
                                            <td>
                                                {getStatusElement(row.status)}
                                            </td>
                                            <td>
                                                {row.status === 'pending' ? (
                                                    <div className="validation-actions">
                                                        <button className="val-icon-btn approve-btn" onClick={() => handleApprove(row.id)} title="Approve"><Check size={16} /></button>
                                                        <button className="val-icon-btn reject-btn" onClick={() => handleReject(row.id)} title="Reject"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#8892b0' }}>Processed</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="validation-sidebar">
                    <div className="val-widget-card guidelines-card">
                        <div className="val-widget-header pb-4">
                            <div className="guidelines-icon-wrapper">
                                <CheckCircle2 size={18} color="#c4b5fd" />
                            </div>
                            <div>
                                <h3>Portal<br/>Summary</h3>
                                <span>SYSTEM STATUS</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '14px', color: '#8892b0', marginTop: '10px' }}>
                            All validated applications will automatically trigger the generation of a professional internship convention PDF.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminValidation;
