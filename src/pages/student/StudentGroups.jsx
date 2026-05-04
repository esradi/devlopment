import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Hash,
    ChevronRight,
    MessageSquare,
    BookOpen,
    Shield,
    TrendingUp
} from 'lucide-react';
import StudyGroupChat from '../../components/StudyGroupChat';
import { groupService } from '../../services/api';

const StudentGroups = ({ userData }) => {
    const [myGroups, setMyGroups] = useState([]);
    const [suggestedGroups, setSuggestedGroups] = useState([]);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await groupService.getAll();
                const myGroupsData = Array.isArray(data) ? data : data?.results || [];
                setMyGroups(myGroupsData);
                setSuggestedGroups(data.suggested_groups || []);
                if (myGroupsData.length > 0 && !isMobile) {
                    setActiveGroupId(myGroupsData[0].id);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const activeGroup = myGroups.find(g => g.id === activeGroupId);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading groups...</div>;
    }

    return (
        <div className="groups-layout" style={{ display: 'flex', height: 'calc(100vh - 110px)', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Sidebar List */}
            <div className="groups-sidebar" style={{ width: isMobile ? '100%' : '320px', display: activeGroupId && isMobile ? 'none' : 'flex', borderRight: '1px solid rgba(255,255,255,0.05)', flexDirection: 'column', background: '#050505' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Study Groups</h2>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(158, 89, 255, 0.1)', border: 'none', color: '#9e59ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={18} />
                        </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                        <input
                            type="text"
                            placeholder="Find a group..."
                            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginBottom: '12px', marginLeft: '8px' }}>My Channels</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {myGroups.map(group => (
                            <div
                                key={group.id}
                                onClick={() => setActiveGroupId(group.id)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: activeGroupId === group.id ? 'rgba(158, 89, 255, 0.1)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: activeGroupId === group.id ? '#9e59ff' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Hash size={18} color={activeGroupId === group.id ? '#fff' : '#444'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: activeGroupId === group.id ? '#fff' : '#8892b0' }}>{group.name}</h5>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#444' }}>{group.member_count} members</p>
                                </div>
                                {group.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff1b90' }}></div>}
                            </div>
                        ))}
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#444', marginTop: '32px', marginBottom: '12px', marginLeft: '8px' }}>Suggestions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {suggestedGroups.map(group => (
                            <div
                                key={group.id}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{group.name}</h5>
                                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(158, 89, 255, 0.1)', color: '#9e59ff' }}>{group.speciality}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#8892b0', marginBottom: '12px' }}>{group.description?.substring(0, 60)}...</p>
                                <button style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    Join Group
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1 }}>
                {activeGroup ? (
                    <>
                        {isMobile && (
                            <button onClick={() => setActiveGroupId(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', padding: '12px 16px', cursor: 'pointer' }}>← Back</button>
                        )}
                        <StudyGroupChat group={activeGroup} currentUser={userData} />
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                        <Users size={64} style={{ marginBottom: '24px' }} />
                        <h3>Select a group to start collaborating</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentGroups;
