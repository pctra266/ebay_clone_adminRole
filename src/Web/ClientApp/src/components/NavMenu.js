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
  const { logout } = useAuth();
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
          <SidebarLink to="/users" icon="bi bi-people">Người dùng</SidebarLink>
          <SidebarLink to="/products" icon="bi bi-box-seam">Sản phẩm</SidebarLink>
          <SidebarLink to="/review-monitoring" icon="bi bi-chat-left-text">Đánh giá</SidebarLink>
          <SidebarLink to="/settlements" icon="bi bi-cart-check">Đơn hàng</SidebarLink>
          <SidebarLink to="/wallets" icon="bi bi-wallet2">Ví tiền</SidebarLink>
          <SidebarLink to="/withdrawals" icon="bi bi-cash-stack">Rút tiền</SidebarLink>
          <SidebarLink to="/disputes" icon="bi bi-shield-exclamation">Tranh chấp</SidebarLink>
          <SidebarLink to="/audit-logs" icon="bi bi-bar-chart-line">Báo cáo</SidebarLink>
          <SidebarLink to="/statistics" icon="bi bi-graph-up-arrow">Thống kê</SidebarLink>
          <SidebarLink to="/broadcasts" icon="bi bi-megaphone">Thông báo</SidebarLink>
          <SidebarLink to="/admin-roles" icon="bi bi-gear">Cài đặt</SidebarLink>
        </ul>
      </div>
      <div className="sidebar-footer p-3 border-top bg-white d-flex flex-column gap-2">
         <a className="sidebar-link border-0 w-100" href="/Identity/Account/Manage">
           <i className="bi bi-person-circle"></i>
           <span>Tài khoản</span>
         </a>
         <button 
           className="sidebar-link border-0 w-100 text-start bg-transparent text-danger" 
           onClick={handleLogout}
           style={{ cursor: 'pointer' }}
         >
           <i className="bi bi-box-arrow-right"></i>
           <span>Đăng xuất</span>
         </button>
      </div>
    </nav>
  );
};
