import { useNavigate, Link, useLocation } from 'react-router-dom';
import { NavItem, NavLink } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
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

export const NavMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          <SidebarLink to="/users" icon="bi bi-people">Users</SidebarLink>
          <SidebarLink to="/products" icon="bi bi-box-seam">Products</SidebarLink>
          <SidebarLink to="/review-monitoring" icon="bi bi-chat-left-text">Reviews</SidebarLink>
          <SidebarLink to="/settlements" icon="bi bi-cart-check">Orders</SidebarLink>
          <SidebarLink to="/wallets" icon="bi bi-wallet2">Wallets</SidebarLink>
          <SidebarLink to="/withdrawals" icon="bi bi-cash-stack">Withdrawals</SidebarLink>
          <SidebarLink to="/disputes" icon="bi bi-shield-exclamation">Disputes</SidebarLink>
          <SidebarLink to="/audit-logs" icon="bi bi-bar-chart-line">Audit Logs</SidebarLink>
          <SidebarLink to="/statistics" icon="bi bi-graph-up-arrow">Statistics</SidebarLink>
          <SidebarLink to="/broadcasts" icon="bi bi-megaphone">Broadcasts</SidebarLink>
          <SidebarLink to="/admin-roles" icon="bi bi-gear">Admin Roles</SidebarLink>
          <SidebarLink to="/return-requests" icon="bi bi-cart">Return Requests</SidebarLink>
        </ul>
      </div>
      <div className="sidebar-footer p-3 border-top bg-white d-flex flex-column gap-2">
         {user && (
           <div className="d-flex align-items-center p-2 rounded mb-1" style={{ backgroundColor: '#f8f9fa' }}>
             <div 
               className="rounded-circle text-white d-flex justify-content-center align-items-center bg-primary"
               style={{ width: '40px', height: '40px', fontSize: '1.2rem', flexShrink: 0 }}
             >
               {user.email ? user.email.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
             </div>
             <div className="ms-2 overflow-hidden w-100">
               <div className="fw-bold text-truncate text-dark" title={user.fullName || user.userName || user.email || 'Admin'} style={{ fontSize: '0.9rem' }}>
                 {user.fullName || user.userName || 'Admin'}
               </div>
               <div className="text-muted text-truncate" title={user.email} style={{ fontSize: '0.8rem' }}>
                 {user.email}
               </div>
             </div>
           </div>
         )}
         <button 
           className="sidebar-link border-0 w-100 text-start bg-transparent text-danger" 
           onClick={handleLogout}
           style={{ cursor: 'pointer' }}
         >
           <i className="bi bi-box-arrow-right"></i>
           <span>Logout</span>
         </button>
      </div>
    </nav>
  );
};
