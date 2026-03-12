import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { BroadcastPage } from "./pages/BroadcastPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { FetchData } from "./components/FetchData";
import { ProductList } from "./pages/Public/Home";
import ProductModerationPage from "./pages/ProductModerationPage";
import { ReviewMonitoringPage } from "./pages/ReviewMonitoringPage";


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
    element: <ProductModerationPage />
  },
  {
    path: '/home',
    element: <ProductList />
  },
  {
    path: '/review-monitoring',
    element: <ReviewMonitoringPage />
  }
];

export default AppRoutes;
