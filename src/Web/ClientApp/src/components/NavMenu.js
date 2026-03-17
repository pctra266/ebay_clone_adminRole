import React, { useState, useEffect, useRef } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getActiveBroadcasts } from '../services/broadcastService';
import './NavMenu.css';

const SidebarLink = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <NavItem>
      <NavLink 
        tag={Link} 
        className={`sidebar-link ${isActive ? 'active' : ''}`} 
        to={to}
      >
        <i className={icon}></i>
        <span>{children}</span>
      </NavLink>
    </NavItem>
  );
};

export function NavMenu() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user && ["Administrator", "SuperAdmin", "Monitor", "Support"].includes(user.role)) {
      getActiveBroadcasts()
        .then(data => setBroadcasts(data || []))
        .catch(err => console.error("Failed to fetch admin broadcasts:", err));
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const role = user?.role || "Guest";

  return (
    <nav className="sidebar shadow-sm" style={{ position: 'relative' }}>
      <style>
        {`
        .admin-notification-dropdown {
          position: absolute;
          bottom: 100%;
          left: 10px;
          margin-bottom: 10px;
          width: 320px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
          z-index: 1050;
          max-height: 400px;
          overflow-y: auto;
        }
        .admin-notification-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e5e5;
          font-weight: bold;
          font-size: 15px;
          background: #f8f8f8;
          border-radius: 8px 8px 0 0;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .admin-notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          transition: background 0.2s;
        }
        .admin-notification-item:hover {
          background: #f5f8fa;
        }
        .admin-notification-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: #111;
          font-size: 13px;
        }
        .admin-notification-content {
          color: #555;
          font-size: 12px;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        .admin-notification-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
        }
        .admin-notification-badge {
          position: absolute;
          top: 8px;
          right: 32px;
          background: #e53238;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        `}
      </style>
      <div className="sidebar-header">
        <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center">
          <span style={{ color: '#e53238' }}>e</span>
          <span style={{ color: '#0064d2' }}>b</span>
          <span style={{ color: '#f5af02' }}>a</span>
          <span style={{ color: '#86b817' }}>y</span>
          <span className="ms-2 text-dark" style={{fontSize: '1rem', letterSpacing: 'normal'}}>Admin</span>
        </Link>
      </div>
      <div className="sidebar-menu flex-grow-1" style={{ overflowY: 'auto' }}>
        <ul className="navbar-nav w-100">
          {["SuperAdmin", "Administrator", "Monitor", "Support"].includes(role) && (
            <SidebarLink to="/dashboard" icon="bi bi-speedometer2">Dashboard</SidebarLink>
          )}
          {["SuperAdmin", "Administrator", "Support"].includes(role) && (
            <SidebarLink to="/users" icon="bi bi-people">Người dùng</SidebarLink>
          )}
          {["SuperAdmin", "Support"].includes(role) && (
            <SidebarLink to="/products" icon="bi bi-box-seam">Sản phẩm</SidebarLink>

          )}
          {["SuperAdmin", "Support"].includes(role) && (
            <>
              <SidebarLink to="/review-monitoring" icon="bi bi-chat-left-text">Đánh giá</SidebarLink>
              <SidebarLink to="/settlements" icon="bi bi-cart-check">Đơn hàng</SidebarLink>
            </>
          )}
          {["SuperAdmin", "Administrator"].includes(role) && (
            <>
              <SidebarLink to="/wallets" icon="bi bi-wallet2">Ví tiền</SidebarLink>
              <SidebarLink to="/withdrawals" icon="bi bi-cash-stack">Rút tiền</SidebarLink>
            </>
          )}
          {["SuperAdmin", "Support"].includes(role) && (
            <SidebarLink to="/disputes" icon="bi bi-shield-exclamation">Tranh chấp</SidebarLink>
          )}
          {["SuperAdmin"].includes(role) && (
            <SidebarLink to="/audit-logs" icon="bi bi-bar-chart-line">Báo cáo</SidebarLink>
          )}
          {["SuperAdmin", "Monitor"].includes(role) && (
            <SidebarLink to="/statistics" icon="bi bi-graph-up-arrow">Thống kê</SidebarLink>
          )}
          {["SuperAdmin", "Support"].includes(role) && (
            <SidebarLink to="/broadcasts" icon="bi bi-megaphone">Thông báo</SidebarLink>
          )}
          {["SuperAdmin"].includes(role) && (
            <SidebarLink to="/admin-roles" icon="bi bi-gear">Cài đặt</SidebarLink>
          )}
        </ul>
      </div>
      
      <div className="sidebar-footer p-3 border-top bg-white d-flex align-items-center justify-content-between" style={{ position: 'relative' }} ref={notificationRef}>
        <a className="sidebar-link border-0 text-decoration-none flex-grow-1" href="/Identity/Account/Manage">
          <i className="bi bi-person-circle me-2"></i>
          <span>Tài khoản ({role})</span>
        </a>
        
        <button 
          onClick={toggleNotifications}
          className="btn btn-link text-dark p-0 position-relative" 
          style={{ textDecoration: 'none' }}
        >
          <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
          {broadcasts.length > 0 && (
            <span className="admin-notification-badge" style={{ right: '-4px', top: '-4px' }}>
              {broadcasts.length > 9 ? '9+' : broadcasts.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="admin-notification-dropdown shadow-lg">
            <div className="admin-notification-header">
              Thông báo quản trị
            </div>
            {broadcasts.length > 0 ? (
              broadcasts.map((br) => (
                <div key={br.id} className="admin-notification-item">
                  <div className="admin-notification-title">{br.title}</div>
                  <div className="admin-notification-content">{br.content}</div>
                  <div className="admin-notification-meta">
                    <span>{br.type || 'In-App'}</span>
                    <span>{new Date(br.sentAt || br.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#777' }}>
                <i className="bi bi-bell-slash" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                Không có thông báo mới.
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Ensure compatibility if it was imported differently
NavMenu.displayName = "NavMenu";
