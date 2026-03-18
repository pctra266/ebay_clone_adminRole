import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveBroadcasts } from '../services/broadcastService';

export const AdminNotifications = () => {
    const { user } = useAuth();
    const [broadcasts, setBroadcasts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            const data = await getActiveBroadcasts();
            setBroadcasts(data || []);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'fixed', top: '15px', right: '25px', zIndex: 1050 }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-light rounded-circle shadow-sm position-relative d-flex align-items-center justify-content-center"
                style={{ width: '45px', height: '45px', border: '1px solid #dee2e6' }}
            >
                <i className="bi bi-bell-fill text-primary" style={{ fontSize: '1.2rem' }}></i>
                {broadcasts.length > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.75rem' }}
                    >
                        {broadcasts.length > 9 ? '9+' : broadcasts.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    className="dropdown-menu dropdown-menu-end shadow-lg show" 
                    style={{ position: 'absolute', top: '100%', right: '0', width: '350px', marginTop: '10px', maxHeight: '400px', overflowY: 'auto', padding: 0, borderRadius: '8px' }}
                >
                    <div className="p-3 bg-light border-bottom fw-bold d-flex justify-content-between align-items-center" style={{ borderRadius: '8px 8px 0 0' }}>
                        <span>Notifications</span>
                        <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={loadNotifications}>
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                    <div className="list-group list-group-flush">
                        {broadcasts.length > 0 ? (
                            broadcasts.map((br) => (
                                <div key={br.id} className="list-group-item list-group-item-action py-3">
                                    <div className="d-flex w-100 justify-content-between mb-1">
                                        <h6 className="mb-1 fw-bold text-dark">{br.title}</h6>
                                        <small className="text-muted">{new Date(br.sentAt || br.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <p className="mb-1 text-secondary" style={{ fontSize: '0.9rem' }}>{br.content}</p>
                                    <small className="badge bg-secondary">{br.type || 'In-App'}</small>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted">
                                <i className="bi bi-bell-slash mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                                No new notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
