import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import reportService from "../services/reportService";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? Number(n).toLocaleString("en-US") : 0);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

function toIso(date) {
  return date.toISOString().split("T")[0];
}

function getPresetRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "week": {
      const mon = new Date(today);
      mon.setDate(today.getDate() - today.getDay() + 1);
      return { start: mon, end: today };
    }
    case "month":
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
    case "quarter": {
      const q = Math.floor(today.getMonth() / 3);
      return { start: new Date(today.getFullYear(), q * 3, 1), end: today };
    }
    default:
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "", stagger = "" }) => (
  <div className={`glass-panel rounded-4 ${className} animate-fade-in-up ${stagger}`}>
    {children}
  </div>
);

const MetricTile = ({ label, value, icon, gradient, stagger, currency = false }) => (
  <GlassCard className="h-100" stagger={stagger}>
    <div className="metric-card-modern">
      <div className={`icon-box ${gradient} shadow-sm mb-3`}>
        <i className={icon}></i>
      </div>
      <div className="metric-label mb-1">{label}</div>
      <div className="metric-value">{currency ? fmtCurrency(value) : fmt(value)}</div>
    </div>
  </GlassCard>
);

const ActionItem = ({ title, count, icon, link, colorClass }) => (
  <Link to={link || "#"} className="action-center-item shadow-sm border-0">
    <div className={`icon-box rounded-circle mb-0 me-3 d-flex align-items-center justify-content-center bg-soft-${colorClass}`} style={{ width: 42, height: 42, flexShrink: 0 }}>
      <i className={`${icon} fs-5 text-${colorClass}`}></i>
    </div>
    <div className="flex-grow-1">
      <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{title}</div>
      <div className="text-secondary small">Requires your attention</div>
    </div>
    <div className={`badge rounded-pill bg-soft-${colorClass} text-${colorClass} px-3 py-2 fw-bold`}>
      {count || 0}
    </div>
  </Link>
);

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [stats, setStats] = useState({ revenue: null, users: null, orders: null });
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("month");
  const [toast, setToast] = useState({ message: "", type: "success" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const currentMetrics = await dashboardService.getMetrics();
      setMetrics(currentMetrics);

      const range = getPresetRange(preset);
      const start = toIso(range.start);
      const end = toIso(range.end);

      const [rev, usr, ord] = await Promise.allSettled([
        reportService.getRevenue(start, end),
        reportService.getUserGrowth(start, end),
        reportService.getOrderStats(start, end),
      ]);

      setStats({
        revenue: rev.status === "fulfilled" ? rev.value : null,
        users: usr.status === "fulfilled" ? usr.value : null,
        orders: ord.status === "fulfilled" ? ord.value : null,
      });

    } catch (error) {
      setToast({ message: "Failed to load dashboard data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !metrics) return <LoadingIndicator text="Assembling your workspace..." />;

  // ── Chart.js Configurations ───────────────────────────────────────────────
  
  // 1. Revenue Line Chart
  const revenueChartData = {
    labels: stats.revenue?.dailyRevenue?.map(d => new Date(d.date).toLocaleDateString("en-US", { day: '2-digit', month: 'short' })) || [],
    datasets: [{
      label: 'Revenue',
      data: stats.revenue?.dailyRevenue?.map(d => d.amount ?? d.revenue ?? 0) || [],
      borderColor: '#0064d2',
      backgroundColor: 'rgba(0, 100, 210, 0.1)',
      fill: true,
      tension: 0.4, // Smoothing factor
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    }]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        padding: 10,
        titleFont: { size: 12 },
        bodyFont: { size: 14, weight: 'bold' },
        displayColors: false,
        callbacks: {
          label: (context) => fmtCurrency(context.parsed.y)
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888' } },
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false }, 
        ticks: { font: { size: 10 }, color: '#888', callback: (v) => '$' + fmt(v) } 
      }
    }
  };

  // 2. Order Distribution Doughnut
  const orderDoughnutData = {
    labels: ['Completed', 'Delivered', 'Returned'],
    datasets: [{
      data: stats.orders ? [stats.orders.completed, stats.orders.delivered, stats.orders.returned] : [],
      backgroundColor: ['#15833b', '#0064d2', '#e0103a'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  };

  const orderDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Modern donut style
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111',
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${fmt(ctx.parsed)}`
        }
      }
    }
  };

  return (
    <section className="py-2">
      <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Unified Command Center</h1>
          <p className="text-secondary small mb-0">Overview of operational health & performance.</p>
        </div>
        
        <div className="date-presets-container bg-light p-1 rounded-pill shadow-sm">
          {["today", "week", "month", "quarter"].map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`date-preset-btn ${preset === p ? "active" : ""}`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Quarterly'}
            </button>
          ))}
          <button className="btn btn-sm btn-light rounded-pill ms-2" onClick={fetchData}>
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <MetricTile 
            label="Total Revenue" 
            value={stats.revenue?.totalRevenue || 0} 
            icon="bi bi-bank" 
            gradient="bg-gradient-blue" 
            stagger="stagger-1"
            currency 
          />
        </div>
        <div className="col-md-3">
          <MetricTile 
            label="Active Users" 
            value={metrics?.totalUsers} 
            icon="bi bi-people" 
            gradient="bg-gradient-green" 
            stagger="stagger-2"
          />
        </div>
        <div className="col-md-3">
          <MetricTile 
            label="Total Products" 
            value={metrics?.totalProducts} 
            icon="bi bi-bag-check" 
            gradient="bg-gradient-yellow" 
            stagger="stagger-3"
          />
        </div>
        <div className="col-md-3">
          <MetricTile 
            label="Orders (Today)" 
            value={metrics?.totalOrdersToday} 
            icon="bi bi-cart-check" 
            gradient="bg-gradient-red" 
            stagger="stagger-4"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Main Chart */}
        <div className="col-lg-8">
          <GlassCard className="p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">Revenue Trend</h5>
                <small className="text-secondary">Historical analysis for the selected period</small>
              </div>
              <div className="text-end">
                <div className="h4 fw-bold mb-0 text-primary">{fmtCurrency(stats.revenue?.totalRevenue)}</div>
                <small className="text-secondary">Total for current range</small>
              </div>
            </div>
            <div className="py-2" style={{ height: 260 }}>
               <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </GlassCard>
        </div>

        {/* Side widgets */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4 h-100">
             {/* Action Center */}
             <GlassCard className="p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                  Action Center
                </h6>
                <div className="d-flex flex-column">
                  <ActionItem 
                    title="User Approvals" 
                    count={metrics?.pendingAccountsCount} 
                    icon="bi bi-person-check" 
                    link="/users?tab=Pending"
                    colorClass="blue"
                  />
                  <ActionItem 
                    title="Active Disputes" 
                    count={metrics?.openDisputesCount} 
                    icon="bi bi-shield-lock" 
                    link="/disputes?status=Open"
                    colorClass="red"
                  />
                  <ActionItem 
                    title="Return Requests" 
                    count={metrics?.newReturnRequestsCount} 
                    icon="bi bi-arrow-left-right" 
                    link="/return-requests"
                    colorClass="yellow"
                  />
                </div>
             </GlassCard>

             {/* Distribution */}
             <GlassCard className="p-4 flex-grow-1">
                <h6 className="fw-bold mb-4 text-center">Order Distribution</h6>
                <div style={{ height: 180, position: 'relative' }}>
                  <Doughnut data={orderDoughnutData} options={orderDoughnutOptions} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div className="h4 fw-bold mb-0">{fmt(stats.orders?.total)}</div>
                    <div className="text-secondary" style={{ fontSize: 9 }}>TOTAL</div>
                  </div>
                </div>
                <div className="mt-4 d-flex flex-wrap gap-2 justify-content-center">
                  {orderDoughnutData.labels.map((l, i) => (
                    <div key={i} className="d-flex align-items-center small bg-light px-2 py-1 rounded-pill">
                      <span className="rounded-circle me-1" style={{ width: 8, height: 8, background: orderDoughnutData.datasets[0].backgroundColor[i] }}></span>
                      <span className="text-secondary" style={{ fontSize: 10 }}>{l}: <strong>{fmt(orderDoughnutData.datasets[0].data[i])}</strong></span>
                    </div>
                  ))}
                </div>
             </GlassCard>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        .bg-soft-blue { background: rgba(0, 100, 210, 0.1); }
        .bg-soft-red { background: rgba(224, 16, 58, 0.1); }
        .bg-soft-yellow { background: rgba(246, 175, 2, 0.1); }
        .text-blue { color: #0064d2; }
        .text-red { color: #e0103a; }
        .text-yellow { color: #f6af02; }
      `}</style>
    </section>
  );
}
