import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    Users,
    UserSearch,
    UserCheck,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    FileText,
    CreditCard,
    ExternalLink,
    UserX,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/api';
import './AdminStudents.css';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activating, setActivating] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [suspending, setSuspending] = useState(null);
    const [showSuspendForm, setShowSuspendForm] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const SUSPEND_REASONS = [
        'Violation of Platform Terms',
        'Fraudulent/Fake Profile',
        'Incomplete or Invalid Documents',
        'Inappropriate Behavior',
        'Other'
    ];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await adminService.getUsers();
                setStudents(res || []);
            } catch (err) {
                console.error("Failed to fetch students:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleActivate = async (studentId) => {
        setActivating(studentId);
        try {
            await adminService.activateUser(studentId);
            // Update local state instantly — no page reload needed
            setStudents(prev => prev.map(s => 
                s.id === studentId ? { ...s, is_active: true } : s
            ));
        } catch (err) {
            console.error("Failed to activate user:", err);
            showToast("Failed to activate account. Please try again.", "error");
        } finally {
            setActivating(null);
        }
    };

    const handleSuspend = async (id) => {
        if (!suspendReason) {
            showToast("Please select a reason for suspension.", "error");
            return;
        }
        setSuspending(id);
        try {
            await adminService.updateUserStatus(id, { is_suspended: true, reason: suspendReason });
            setStudents(students.map(s => 
                s.id === id ? { ...s, is_active: false, is_suspended: true } : s
            ));
            setSelectedStudent(prev => ({ ...prev, is_active: false, is_suspended: true }));
            showToast("Account suspended successfully.", "success");
            setShowSuspendForm(false);
            setSuspendReason('');
        } catch (err) {
            console.error("Failed to suspend user:", err);
            showToast("Failed to suspend account. Please try again.", "error");
        } finally {
            setSuspending(null);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await adminService.exportUsers('student');
        } catch (err) {
            console.error('Export failed:', err);
            showToast(`Export failed: ${err.message || 'Please try again.'}`, "error");
        } finally {
            setExporting(false);
        }
    };

    const getStatusStyle = (isActive) => {
        return isActive ? 'status-internship' : 'status-completed';
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' && student.is_active) || (statusFilter === 'Inactive' && !student.is_active);
        const matchesDate = !dateFilter || (student.created_at && new Date(student.created_at).toISOString().split('T')[0] === dateFilter);
        return matchesSearch && matchesStatus && matchesDate;
    });

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#9e59ff" />
            </div>
        );
    }

    return (
        <div className="admin-students-page">
            {/* Header Area */}
            <div className="students-header">
                <div className="students-title-area">
                    <h1>Students</h1>
                    <p>Manage your university's students and their account status.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="students-stats-grid">
                <div className="students-stat-card">
                    <div className="stat-icon circle-blue">
                        <Users size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Students</span>
                        <h2>{students.length}</h2>
                    </div>
                </div>

                <div className="students-stat-card">
                    <div className="stat-icon circle-pink">
                        <UserSearch size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active Accounts</span>
                        <h2>{students.filter(s => s.is_active).length}</h2>
                    </div>
                </div>

                <div className="students-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(255, 165, 0, 0.15)', color: '#f59e0b' }}>
                        <UserCheck size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Activation</span>
                        <h2>{students.filter(s => !s.is_active).length}</h2>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="students-filters-row">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="search-box" style={{ width: 'auto' }}>
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        title="Filter by join date"
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                    />
                </div>

                <div className="segmented-control status-filters">
                    {['All', 'Active', 'Inactive'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {status}
                            <span style={{
                                background: statusFilter === status ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                padding: '0 6px',
                                fontSize: '10px',
                                fontWeight: 700
                            }}>
                                {status === 'All' ? students.length
                                : status === 'Active' ? students.filter(s => s.is_active).length
                                : status === 'Inactive' ? students.filter(s => !s.is_active).length
                                : 0}
                            </span>
                        </button>
                    ))}
                </div>

                <button className="export-btn" onClick={handleExport} disabled={exporting}>
                    {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>{exporting ? 'Exporting...' : 'Export list'}</span>
                </button>
            </div>

            {/* Data Table */}
            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>STUDENT</th>
                            <th>DOMAIN/SPECIALITY</th>
                            <th>EMAIL</th>
                            <th>STATUS</th>
                            <th>JOINED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>
                                    <div className="student-cell">
                                        <div className="logo-placeholder" style={{ width: '40px', height: '40px', background: student.is_active ? 'rgba(158,89,255,0.15)' : 'rgba(255,165,0,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: student.is_active ? '#9e59ff' : '#f59e0b' }}>
                                            {student.first_name?.[0]}{student.last_name?.[0]}
                                        </div>
                                        <div className="student-ident">
                                            <strong>{student.first_name} {student.last_name}</strong>
                                            <span>ID: #{student.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="program-cell">
                                        <strong>{student.domain || 'N/A'}</strong>
                                    </div>
                                </td>
                                <td className="email-cell">{student.email}</td>
                                <td>
                                    <span className={`status-pill ${getStatusStyle(student.is_active)}`}>
                                        <span className="status-dot"></span>
                                        {student.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="company-cell">{new Date(student.date_joined).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button className="action-view-btn" onClick={() => {
                                            setSelectedStudent(student);
                                            setShowSuspendForm(false);
                                        }}>
                                            View profile
                                        </button>
                                        {!student.is_active && (
                                            <button 
                                                className="action-view-btn btn-activate"
                                                onClick={() => handleActivate(student.id)}
                                                disabled={activating === student.id}
                                            >
                                                {activating === student.id ? (
                                                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <UserCheck size={13} />
                                                )}
                                                {activating === student.id ? 'Activating...' : 'Activate'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Profile Verification Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                        <motion.div 
                            className="profile-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="profile-modal-header">
                                <div>
                                    <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                    <p>{selectedStudent.email}</p>
                                </div>
                                <button className="modal-close-btn" onClick={() => setSelectedStudent(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="profile-modal-body">
                                <div className="profile-info-grid">
                                    <div className="info-group">
                                        <label>Domain</label>
                                        <p>{selectedStudent.domain || 'Not specified'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Speciality</label>
                                        <p>{selectedStudent.speciality || 'Not specified'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Status</label>
                                        <span className={`status-pill ${getStatusStyle(selectedStudent.is_active)}`}>
                                            <span className="status-dot"></span>
                                            {selectedStudent.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="documents-section">
                                    <h3>Verification Documents</h3>
                                    <div className="documents-grid">
                                        <div className="document-card">
                                            <div className="doc-icon"><FileText size={24} /></div>
                                            <div className="doc-details">
                                                <h4>CV / Resume</h4>
                                                {selectedStudent.cv ? (
                                                    <a href={selectedStudent.cv} target="_blank" rel="noreferrer" className="view-doc-link">
                                                        View Document <ExternalLink size={14} />
                                                    </a>
                                                ) : (
                                                    <span className="missing-doc">Not uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="document-card">
                                            <div className="doc-icon"><CreditCard size={24} /></div>
                                            <div className="doc-details">
                                                <h4>National ID Card</h4>
                                                {selectedStudent.national_id_card ? (
                                                    <a href={selectedStudent.national_id_card} target="_blank" rel="noreferrer" className="view-doc-link">
                                                        View Document <ExternalLink size={14} />
                                                    </a>
                                                ) : (
                                                    <span className="missing-doc">Not uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-modal-footer">
                                {showSuspendForm && selectedStudent.is_active ? (
                                    <motion.div 
                                        className="suspend-form-container"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="suspend-input-group">
                                            <select 
                                                value={suspendReason} 
                                                onChange={(e) => setSuspendReason(e.target.value)}
                                                className="suspend-select"
                                            >
                                                <option value="" disabled>Select a reason...</option>
                                                {SUSPEND_REASONS.map((reason, idx) => (
                                                    <option key={idx} value={reason}>{reason}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="select-icon" />
                                        </div>
                                        <div className="suspend-actions">
                                            <button className="modal-btn-cancel" onClick={() => setShowSuspendForm(false)}>
                                                Cancel
                                            </button>
                                            <button 
                                                className="modal-btn-suspend confirm"
                                                onClick={() => handleSuspend(selectedStudent.id)}
                                                disabled={suspending === selectedStudent.id || !suspendReason}
                                            >
                                                {suspending === selectedStudent.id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                                                Confirm Suspension
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <button className="modal-btn-cancel" onClick={() => setSelectedStudent(null)}>
                                            Close
                                        </button>
                                        {!selectedStudent.is_active ? (
                                            <button 
                                                className="modal-btn-activate"
                                                onClick={async () => {
                                                    await handleActivate(selectedStudent.id);
                                                    setSelectedStudent(prev => ({ ...prev, is_active: true, is_suspended: false }));
                                                }}
                                                disabled={activating === selectedStudent.id}
                                            >
                                                {activating === selectedStudent.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <UserCheck size={16} />
                                                )}
                                                {activating === selectedStudent.id ? 'Activating...' : 'Activate Account'}
                                            </button>
                                        ) : (
                                            <button 
                                                className="modal-btn-suspend"
                                                onClick={() => setShowSuspendForm(true)}
                                            >
                                                <UserX size={16} />
                                                Suspend Account
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Elegant Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        className={`admin-toast ${toast.type}`}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                        <div className="toast-icon">
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => setToast(null)}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminStudents;

