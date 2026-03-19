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
          
          {(user?.role === 'SuperAdmin' || user?.role === 'Support' || user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Support')) && (
            <>
              <SidebarLink to="/products" icon="bi bi-box-seam">Products</SidebarLink>
              <SidebarLink to="/review-monitoring" icon="bi bi-chat-left-text">Reviews</SidebarLink>
              <SidebarLink to="/disputes" icon="bi bi-shield-exclamation">Disputes</SidebarLink>
              <SidebarLink to="/return-requests" icon="bi bi-cart">Return Requests</SidebarLink>
            </>
          )}

          {(user?.role === 'SuperAdmin' || user?.roles?.includes('SuperAdmin')) && (
            <>
              <SidebarLink to="/users" icon="bi bi-people">Users</SidebarLink>
              <SidebarLink to="/wallets" icon="bi bi-wallet2">Wallets</SidebarLink>
              <SidebarLink to="/withdrawals" icon="bi bi-cash-stack">Withdrawals</SidebarLink>
              <SidebarLink to="/audit-logs" icon="bi bi-bar-chart-line">Audit Logs</SidebarLink>
              <SidebarLink to="/broadcasts" icon="bi bi-megaphone">Broadcasts</SidebarLink>
              <SidebarLink to="/admin-roles" icon="bi bi-gear">Admin Roles</SidebarLink>
              <SidebarLink to="/seller-performance" icon="bi bi-speedometer">Seller Performance</SidebarLink>
            </>
          )}
        </ul>
      </div>
      <div className="sidebar-footer mt-auto border-top pt-2">
        <ul className="navbar-nav w-100">
          {user && (
            <li className="nav-item px-3 py-2 d-flex align-items-center mb-1">
              <div 
                className="rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm"
                style={{ width: '36px', height: '36px', fontSize: '1rem', backgroundColor: '#0064d2', flexShrink: 0 }}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
              </div>
              <div className="ms-3 overflow-hidden w-100">
                <div className="fw-semibold text-truncate text-dark" title={user.fullName || user.userName || user.email || 'Admin'} style={{ fontSize: '0.9rem' }}>
                  {user.fullName || user.userName || 'Admin'}
                </div>
                <div className="text-secondary text-truncate" title={user.email} style={{ fontSize: '0.8rem' }}>
                  {user.email}
                </div>
              </div>
            </li>
          )}
          
          <NavItem>
            <button 
              className="sidebar-link border-0 w-100 text-start bg-transparent text-danger fw-medium" 
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-box-arrow-left"></i>
              <span>Logout</span>
            </button>
          </NavItem>
        </ul>
      </div>
    </nav>
  );
};
