import React, { Component } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { Link, useLocation } from 'react-router-dom';
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

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  render() {
    return (
      <nav className="sidebar shadow-sm">
        <div className="sidebar-header">
          <Link to="/" className="text-decoration-none d-flex align-items-center justify-content-center">
            <span style={{ color: '#e53238' }}>e</span>
            <span style={{ color: '#0064d2' }}>b</span>
            <span style={{ color: '#f5af02' }}>a</span>
            <span style={{ color: '#86b817' }}>y</span>
            <span className="ms-2 text-dark" style={{fontSize: '1rem', letterSpacing: 'normal'}}>Admin</span>
          </Link>
        </div>
        <div className="sidebar-menu">
          <ul className="navbar-nav w-100">
            <SidebarLink to="/dashboard" icon="bi bi-speedometer2">Dashboard</SidebarLink>
            <SidebarLink to="/users" icon="bi bi-people">Người dùng</SidebarLink>
            <SidebarLink to="/products" icon="bi bi-box-seam">Sản phẩm</SidebarLink>
            <SidebarLink to="/settlements" icon="bi bi-cart-check">Đơn hàng</SidebarLink>
            <SidebarLink to="/disputes" icon="bi bi-shield-exclamation">Tranh chấp</SidebarLink>
            <SidebarLink to="/audit-logs" icon="bi bi-graph-up-arrow">Báo cáo</SidebarLink>
            <SidebarLink to="/broadcasts" icon="bi bi-megaphone">Thông báo</SidebarLink>
            <SidebarLink to="/admin-roles" icon="bi bi-gear">Cài đặt</SidebarLink>
          </ul>
        </div>
        <div className="sidebar-footer p-3 border-top bg-white">
           <a className="sidebar-link border-0" href="/Identity/Account/Manage">
             <i className="bi bi-person-circle"></i>
             <span>Tài khoản</span>
           </a>
        </div>
      </nav>
    );
  }
}
