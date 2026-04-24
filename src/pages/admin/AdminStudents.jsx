import React, { useState } from 'react';
import { 
    Search, 
    Download, 
    TrendingUp,
    Users,
    UserSearch,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    ClipboardList
} from 'lucide-react';
import './AdminStudents.css';

const AdminStudents = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('M1');

    // Mock data based on design
    const studentsData = [
        {
            id: '#250102',
            name: 'Julianne D. Morel',
            avatar: 'https://i.pravatar.cc/150?u=julianne',
            program: 'Computer Science',
            level: 'MASTER 1',
            email: 'j.morel@university.edu',
            status: 'SEARCHING',
            company: '—',
            apps: 12
        },
        {
            id: '#250103',
            name: 'Alex Kendrick',
            avatar: 'https://i.pravatar.cc/150?u=alex',
            program: 'UX/UI Design',
            level: 'LICENSE 3',
            email: 'a.kendrick@university.edu',
            status: 'IN INTERNSHIP',
            company: 'Stag.io Inc.',
            apps: 4
        },
        {
            id: '#250104',
            name: 'Riley Watson',
            avatar: 'https://i.pravatar.cc/150?u=riley',
            program: 'Data Science',
            level: 'MASTER 2',
            email: 'r.watson@university.edu',
            status: 'COMPLETED',
            company: 'CyberCore Solutions',
            apps: 1
        }
    ];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'SEARCHING':
                return 'status-searching';
            case 'IN INTERNSHIP':
                return 'status-internship';
            case 'COMPLETED':
                return 'status-completed';
            default:
                return '';
        }
    };

    return (
        <div className="admin-students-page">
            {/* Header Area */}
            <div className="students-header">
                <div className="students-title-area">
                    <h1>Students</h1>
                    <p>Manage your university's students and their internship status.</p>
                </div>
                <div className="students-header-controls">
                    <div className="control-group">
                        <label>ACADEMIC YEAR</label>
                        <select className="dark-select">
                            <option>2025 / 2026</option>
                            <option>2024 / 2025</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>DEPARTMENT</label>
                        <select className="dark-select">
                            <option>All Programs</option>
                            <option>Computer Science</option>
                        </select>
                    </div>
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
                        <h2>1,240</h2>
                    </div>
                </div>

                <div className="students-stat-card">
                    <div className="stat-icon circle-pink">
                        <UserSearch size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Searching</span>
                        <h2>520</h2>
                    </div>
                </div>

                <div className="students-stat-card pipeline-card">
                    <div className="pipeline-header">
                        <span className="stat-label">Internship Pipeline</span>
                        <TrendingUp size={16} color="#9e59ff" />
                    </div>
                    <div className="pipeline-numbers">
                        <div className="pipeline-stat">
                            <h3>430</h3>
                            <span>IN PROGRESS</span>
                        </div>
                        <div className="pipeline-divider"></div>
                        <div className="pipeline-stat completed">
                            <h3>290</h3>
                            <span>COMPLETED</span>
                        </div>
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
                    {['All', 'Searching', 'In Internship', 'Completed'].map(status => (
                        <button 
                            key={status}
                            className={`segment-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="segmented-control level-filters">
                    {['L3', 'M1', 'M2'].map(level => (
                        <button 
                            key={level}
                            className={`segment-btn ${levelFilter === level ? 'active' : ''}`}
                            onClick={() => setLevelFilter(level)}
                        >
                            {level}
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
                            <th>PROGRAM/LEVEL</th>
                            <th>EMAIL</th>
                            <th>STATUS</th>
                            <th>COMPANY</th>
                            <th>APPS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsData.map((student, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="student-cell">
                                        <img src={student.avatar} alt={student.name} className="student-avatar" />
                                        <div className="student-ident">
                                            <strong>{student.name}</strong>
                                            <span>ID: {student.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="program-cell">
                                        <strong>{student.program}</strong>
                                        <span>{student.level}</span>
                                    </div>
                                </td>
                                <td className="email-cell">{student.email}</td>
                                <td>
                                    <span className={`status-pill ${getStatusStyle(student.status)}`}>
                                        <span className="status-dot"></span>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="company-cell">{student.company}</td>
                                <td>
                                    <div className="apps-cell">
                                        {student.apps} <ClipboardList size={14} className="app-icon" />
                                    </div>
                                </td>
                                <td>
                                    <button className="action-view-btn">
                                        View profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="table-footer">
                    <span className="showing-text">Showing 1-10 of 1,240 students</span>
                    <div className="pagination">
                        <button className="page-btn"><ChevronLeft size={16} /></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-ellipsis">...</span>
                        <button className="page-btn">124</button>
                        <button className="page-btn"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fab-btn">
                <UserPlus size={24} />
            </button>
        </div>
    );
};

export default AdminStudents;
