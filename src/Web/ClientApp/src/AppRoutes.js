import { DashboardPage }  from "./pages/DashboardPage";
import { UsersPage }      from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { BroadcastPage }  from "./pages/BroadcastPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AuditLogsPage }  from "./pages/AuditLogsPage";
import { FetchData }      from "./components/FetchData";
import { DisputesPage }   from "./pages/DisputesPage";
import { DisputeDashboard } from "./pages/DisputeDashboard";
import { DisputeDetailPage } from "./pages/DisputeDetailPage";
import LoginPage          from "./pages/LoginPage";
import Enable2FAPage      from "./pages/Enable2fapage";
import ProtectedRoute     from "./components/ProtectedRoute";
import EbayHomepage from "./pages/EbayHomepage";
import { ReviewMonitoringPage } from "./pages/ReviewMonitoringPage";
import ProductModerationPage from "./pages/ProductModerationPage";
import { Home } from "./components/Home";

// Helper cho gọn
const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;


const AppRoutes = [
  // ── Public ───────────────────────────────────────────────────────
  {
    path: "/login",
    element: <LoginPage />
  },

  // ── Cần login nhưng chưa cần 2FA ─────────────────────────────────
  {
    path: "/enable2FA",
    element: (
      <ProtectedRoute skip2FACheck>
        <Enable2FAPage />
      </ProtectedRoute>
    )
  },

  // ── Cần login + bắt buộc có 2FA ──────────────────────────────────
  {
    index: true,
    element: protect(<DashboardPage />)
  },
  {
    path: "/home",
    element: <EbayHomepage />,
    noLayout: true
  },
  {
    path: "/dashboard",
    element: protect(<DashboardPage />)
  },
  {
    path: "/users",
    element: protect(<UsersPage />)
  },
  {
    path: "/users/:userId",
    element: protect(<UserDetailPage />)
  },
  {
    path: "/broadcasts",
    element: protect(<BroadcastPage />)
  },
  {
    path: "/admin-roles",
    element: protect(<AdminRolesPage />)
  },
  {
    path: "/audit-logs",
    element: protect(<AuditLogsPage />)
  },
  {
    path: "/fetch-data",
    element: protect(<FetchData />)
  },
  {
    path: "/disputes",
    element: protect(<DisputesPage />)
  },
  {
    path: "/disputes/dashboard",
    element: protect(<DisputeDashboard />)
  },
  {
    path: "/disputes/:id",
    element: protect(<DisputeDetailPage />)
  },
  {
    path: '/products',
    element: protect(<ProductModerationPage/>)
  },
  {
    path: '/review-monitoring',
    element: protect(<ReviewMonitoringPage />)
  },
  {
    path: "/",
    element: protect(<Home />)
  }
];

export default AppRoutes;