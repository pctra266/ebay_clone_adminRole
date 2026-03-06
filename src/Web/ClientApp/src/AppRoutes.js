import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { BroadcastPage } from "./pages/BroadcastPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import { ProductList } from "./pages/Products";
import LoginPage from "./pages/LoginPage";

const AppRoutes = [
  {
    index: true,
    element: <DashboardPage />
  },
  {
    path: "/users",
    element: <UsersPage />
  },
  {
    path: "/users/:userId",
    element: <UserDetailPage />
  },
  {
    path: "/broadcasts",
    element: <BroadcastPage />
  },
  {
    path: "/admin-roles",
    element: <AdminRolesPage />
  },
  {
    path: "/audit-logs",
    element: <AuditLogsPage />
  },
  {
    path: '/fetch-data',
    element: <FetchData />
  },
  {
    path: '/products',
    element: <ProductList />
  },
  {
    path: '/login',
    element: <LoginPage />
  }
];

export default AppRoutes;
