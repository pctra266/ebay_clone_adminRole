import { DashboardPage }  from "./pages/DashboardPage";
import { UsersPage }      from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { BroadcastPage }  from "./pages/BroadcastPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AuditLogsPage }  from "./pages/AuditLogsPage";
import { FetchData }      from "./components/FetchData";
import { ProductList }    from "./pages/Products";
import LoginPage          from "./pages/LoginPage";
import Enable2FAPage      from "./pages/Enable2fapage";
import ProtectedRoute     from "./components/ProtectedRoute";

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
    index: true,                              // ✅ chỉ khai báo 1 lần
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
    path: "/products",
    element: protect(<ProductList />)
  },
];

export default AppRoutes;