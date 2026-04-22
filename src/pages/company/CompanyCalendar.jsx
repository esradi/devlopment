import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    Plus, Video, MapPin, Search, Filter, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import './CompanyInterviews.css';

const CompanyCalendar = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState('April 2026');

    // Mock days for the calendar view
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    
    const events = [
        { day: 15, time: '14:30', title: 'Amira Benali', type: 'video' },
        { day: 15, time: '16:00', title: 'Sofiane B.', type: 'onsite' },
        { day: 16, time: '09:00', title: 'Ryad Mansouri', type: 'onsite' },
        { day: 18, time: '11:00', title: 'Testing Round', type: 'video' },
    ];

    return (
        <div className="company-interviews-dashboard">
            <CompanySidebar activePath="interviews" />

            <main className="interviews-main">
                <div className="calendar-page-modern">
                    
                    {/* Calendar Header */}
                    <div className="cal-header-modern">
                        <div className="cal-title-section">
                            <button className="back-link-sm" onClick={() => navigate(-1)}>
                                <ChevronLeft size={14} /> Back
                            </button>
                            <h1>Recruitment Calendar</h1>
                        </div>
                        
                        <div className="cal-controls-modern">
                            <div className="month-selector">
                                <button><ChevronLeft size={18} /></button>
                                <h2>{currentMonth}</h2>
                                <button><ChevronRight size={18} /></button>
                            </div>
                            <div className="cal-view-toggle">
                                <button className="active">Month</button>
                                <button>Week</button>
                                <button>Day</button>
                            </div>
                            <button className="i-btn-schedule" onClick={() => navigate('/dashboard/company/interviews/schedule')}>
                                <Plus size={16} /> Schedule
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="calendar-grid-container">
                        <div className="grid-days-header">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                <div key={day} className="day-name">{day}</div>
                            ))}
                        </div>
                        
                        <div className="grid-body-modern">
                            {/* Empty cells for padding if month starts on separate day */}
                            <div className="grid-cell empty"></div>
                            <div className="grid-cell empty"></div>
                            
                            {days.map(day => {
                                const dayEvents = events.filter(e => e.day === day);
                                return (
                                    <div key={day} className={`grid-cell ${day === 15 ? 'today' : ''}`}>
                                        <span className="day-number">{day}</span>
                                        <div className="cell-events">
                                            {dayEvents.map((event, idx) => (
                                                <div key={idx} className={`cal-event-pill ${event.type}`}>
                                                    <span className="time">{event.time}</span>
                                                    <span className="title">{event.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Filling rest of the grid */}
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={`empty-${i}`} className="grid-cell empty"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyCalendar;
