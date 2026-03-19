import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentAdminId, setCurrentAdminId } from "../services/adminSession";
import { ToastMessage } from "../components/ToastMessage";
import { dashboardService } from "../services/dashboardService";
import { LoadingIndicator } from "../components/LoadingIndicator";

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminIdInput, setAdminIdInput] = useState(String(getCurrentAdminId()));
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (error) {
      setToast({ message: "Failed to fetch dashboard metrics", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const saveAdminId = () => {
    try {
      setCurrentAdminId(adminIdInput);
      setToast({ message: "Saved current admin id.", type: "success" });
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  if (loading) return <LoadingIndicator text="Loading overview data..." />;

  const MetricCard = ({ title, value, icon, bgClass, link }) => (
    <Link to={link || '#'} className="card metric-card text-decoration-none h-100 border-0 shadow-sm">
      <div className="card-body p-4 text-center">
        <div className={`metric-icon mx-auto ${bgClass}`}>
          <i className={icon}></i>
        </div>
        <h6 className="text-secondary fw-normal mb-1" style={{ fontSize: '0.9rem' }}>{title}</h6>
        <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>{value?.toLocaleString() || 0}</h2>
      </div>
    </Link>
  );

  const UrgentCard = ({ title, value, icon, link }) => (
    <Link to={link || '#'} className="card urgent-card text-decoration-none h-100 border-0 shadow-sm">
      <div className="card-body d-flex align-items-center p-3">
        <div className="bg-soft-red me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
          <i className={`${icon} text-danger fs-5`}></i>
        </div>
        <div>
          <h6 className="text-secondary mb-0 fw-normal" style={{ fontSize: '0.85rem' }}>{title}</h6>
          <h4 className="mb-0 fw-bold">{value || 0}</h4>
        </div>
        <i className="bi bi-chevron-right ms-auto text-light"></i>
      </div>
    </Link>
  );

  const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) return <div>No data available</div>;

    const maxRevenue = Math.max(...data.map(d => d.revenue)) || 100;
    const height = 180;

    return (
      <div className="chart-container shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Revenue last 7 days</h5>
          <span className="badge bg-soft-blue px-3 py-2 rounded-pill fw-bold">Total: ${(data.reduce((a, b) => a + b.revenue, 0)).toLocaleString()}</span>
        </div>
        <div className="d-flex justify-content-between align-items-end" style={{ height: `${height}px`, paddingBottom: '25px' }}>
          {data.map((day, index) => {
            const barHeight = (day.revenue / maxRevenue) * (height - 40);
            return (
              <div key={index} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                <div
                  className="rounded-pill"
                  style={{
                    height: `${Math.max(barHeight, 8)}px`,
                    width: '32px',
                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: 'var(--ebay-blue)',
                    opacity: index === data.length - 1 ? 1 : 0.7
                  }}
                  title={`$${day.revenue.toLocaleString()}`}
                ></div>
                <small className="text-secondary mt-3 fw-medium" style={{ fontSize: '11px' }}>
                  {day.date.split('-').slice(1).reverse().join('/')}
                </small>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h3 fw-bold mb-1">Dashboard Overview</h1>
          <p className="text-secondary mb-0">Welcome back, Admin.</p>
        </div>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <MetricCard
            title="Products"
            value={metrics?.totalProducts}
            icon="bi bi-box-seam"
            bgClass="bg-soft-blue"
            link="/products"
          />
        </div>
        <div className="col-md-4">
          <MetricCard
            title="Users"
            value={metrics?.totalUsers}
            icon="bi bi-people"
            bgClass="bg-soft-green"
            link="/users"
          />
        </div>
        <div className="col-md-4">
          <MetricCard
            title="Orders (Today)"
            value={metrics?.totalOrdersToday}
            icon="bi bi-cart3"
            bgClass="bg-soft-yellow"
            link="/settlements"
          />
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <RevenueChart data={metrics?.weeklyRevenue} />
        </div>
        <div className="col-lg-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-lightning-charge-fill text-danger me-2"></i>
            Urgent Tasks
          </h6>
          <div className="d-flex flex-column gap-3">
            <UrgentCard
              title="Pending Approval"
              value={metrics?.pendingAccountsCount}
              icon="bi bi-person-badge"
              link="/users?tab=Pending"
            />
            <UrgentCard
              title="Open Disputes"
              value={metrics?.openDisputesCount}
              icon="bi bi-exclamation-octagon"
              link="/disputes?status=Open"
            />
            <UrgentCard
              title="Return Requests"
              value={metrics?.newReturnRequestsCount}
              icon="bi bi-arrow-counterclockwise"
              link="/return-requests"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
