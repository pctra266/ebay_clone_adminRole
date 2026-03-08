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
import ReturnRequestsPage from './pages/ReturnRequestsPage';
import ReturnRequestDetailPage from "./pages/ReturnRequestDetailPage";
import LoginPage from "./pages/LoginPage";
import EbayHomepage from "./pages/EbayHomepage";

const AppRoutes = [
  {
    index: true,
    element: <EbayHomepage />,
    noLayout: true
  },
  {
    path: "/home",
    element: <EbayHomepage />,
    noLayout: true
  },
  {
    path: "/dashboard",
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
    path: '/return-requests',
    element: <ReturnRequestsPage />
  },
  {
    path: '/return-requests/:id',
    element: <ReturnRequestDetailPage/>
  },
  {
    path: '/login',
    element: <LoginPage />
  }
];

export default AppRoutes;
