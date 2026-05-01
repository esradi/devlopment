import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    TrendingUp,
    Users,
    UserSearch,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    ClipboardList,
    Loader2
} from 'lucide-react';
import { adminService } from '../../services/api';
import './AdminStudents.css';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');

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

    const getStatusStyle = (isActive) => {
        return isActive ? 'status-internship' : 'status-completed';
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' && student.is_active) || (statusFilter === 'Inactive' && !student.is_active);
        return matchesSearch && matchesStatus;
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

                <div className="segmented-control status-filters">
                    {['All', 'Active', 'Inactive'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <button className="export-btn">
                    <Download size={16} />
                    <span>Export list</span>
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
                                        <div className="logo-placeholder" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
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
                                        <span>{student.speciality || 'N/A'}</span>
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
                                    <button className="action-view-btn">
                                        View profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStudents;
