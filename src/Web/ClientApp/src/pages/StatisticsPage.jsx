import React, { useState, useEffect, useCallback } from "react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import reportService from "../services/reportService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? Number(n).toLocaleString("en-US") : 0);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" });

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
      return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Chart Components (pure SVG)
// ────────────────────────────────────────────────────────────────────────────
function BarChart({ data, valueKey = "amount", labelKey = "date", color = "#0064d2" }) {
  if (!data || data.length === 0)
    return <EmptyChart message="No revenue data available for this period." />;

  const vals = data.map((d) => d[valueKey] ?? 0);
  const max = Math.max(...vals) || 1;
  const H = 200, W = 600, padB = 30, padT = 10;
  const barW = Math.max(4, Math.floor((W / data.length) * 0.55));
  const gap = W / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H + padB + padT}`} className="w-100" style={{ maxHeight: 260 }}>
      {data.map((d, i) => {
        const val = d[valueKey] ?? 0;
        const barH = Math.max(4, (val / max) * H);
        const x = gap * i + gap / 2 - barW / 2;
        const y = padT + H - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx="4" ry="4" fill={color} opacity="0.85"
              style={{ transition: "height 0.5s ease" }}
            >
              <title>{fmtCurrency(val)}</title>
            </rect>
            {data.length <= 20 && (
              <text
                x={x + barW / 2} y={padT + H + 18}
                textAnchor="middle" fontSize="9" fill="#888"
              >
                {fmtDate(d[labelKey])}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, keys, colors, labels }) {
  if (!data || data.length === 0)
    return <EmptyChart message="No user data available for this period." />;

  const H = 180, W = 600, padB = 30, padT = 10;
  const allVals = data.flatMap((d) => keys.map((k) => d[k] ?? 0));
  const max = Math.max(...allVals) || 1;

  const pts = (key) =>
    data
      .map((d, i) => {
        const x = data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
        const y = padT + H - ((d[key] ?? 0) / max) * H;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + padB + padT}`} className="w-100" style={{ maxHeight: 240 }}>
      {keys.map((key, ki) => (
        <polyline
          key={key}
          points={pts(key)}
          fill="none"
          stroke={colors[ki]}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      ))}
      {/* Legend */}
      {keys.map((key, ki) => (
        <g key={key} transform={`translate(${12 + ki * 120}, ${H + padB - 4})`}>
          <rect width="12" height="4" rx="2" fill={colors[ki]} />
          <text x="16" y="4" fontSize="9" fill="#555">{labels[ki]}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ slices }) {
  // slices: [{label, value, color}]
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0)
    return <EmptyChart message="No order data available for this period." />;

  const R = 80, cx = 100, cy = 100, stroke = 42;
  let startAngle = -90;
  const paths = slices.map((sl) => {
    const pct = sl.value / total;
    const angle = pct * 360;
    const rad = (a) => (a * Math.PI) / 180;
    const x1 = cx + R * Math.cos(rad(startAngle));
    const y1 = cy + R * Math.sin(rad(startAngle));
    const endAngle = startAngle + angle;
    const x2 = cx + R * Math.cos(rad(endAngle));
    const y2 = cy + R * Math.sin(rad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`;
    startAngle = endAngle;
    return { ...sl, d, pct };
  });

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap justify-content-center">
      <svg viewBox="0 0 200 200" style={{ width: 180, flexShrink: 0 }}>
        {paths.map((p) => (
          <path
            key={p.label}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          >
            <title>{p.label}: {fmt(p.value)} ({(p.pct * 100).toFixed(1)}%)</title>
          </path>
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#333">
          {fmt(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#888">Total Orders</text>
      </svg>
      <div className="d-flex flex-column gap-2">
        {paths.map((p) => (
          <div key={p.label} className="d-flex align-items-center gap-2">
            <span style={{ width: 12, height: 12, borderRadius: 3, background: p.color, display: "inline-block" }} />
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {p.label}: <strong>{fmt(p.value)}</strong>
              <span className="ms-1 text-secondary" style={{ fontSize: "0.78rem" }}>
                ({(p.pct * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
      <i className="bi bi-bar-chart fs-1 mb-2" style={{ opacity: 0.3 }} />
      <p className="mb-0 small">{message}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// KPI Card
// ────────────────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, color = "#0064d2", currency = false }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44, background: color + "20", flexShrink: 0 }}
          >
            <i className={`${icon} fs-5`} style={{ color }} />
          </div>
          <div>
            <p className="mb-0 text-secondary small">{label}</p>
            <p className="mb-0 fw-bold fs-5">{currency ? fmtCurrency(value) : fmt(value)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Export helpers
// ────────────────────────────────────────────────────────────────────────────
function exportExcel(rows, filename) {
  if (!rows || rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}

// ────────────────────────────────────────────────────────────────────────────
// Tab Components
// ────────────────────────────────────────────────────────────────────────────
function RevenueTab({ data, loading, onExport }) {
  if (loading) return <TabLoading />;
  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <KpiCard icon="bi bi-cash-stack" label="Total Revenue" value={data?.totalRevenue} color="#0064d2" currency />
        </div>
        <div className="col-md-4">
          <KpiCard icon="bi bi-receipt" label="Total Transactions" value={data?.totalTransactions} color="#86b817" />
        </div>
        <div className="col-md-4">
          <KpiCard
            icon="bi bi-graph-up"
            label="Average Daily Revenue"
            value={data?.dailyRevenue?.length ? data.totalRevenue / data.dailyRevenue.length : 0}
            color="#e53238"
            currency
          />
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Daily Revenue</h6>
          <button className="btn btn-sm btn-outline-success" onClick={() => onExport("revenue")}>
            <i className="bi bi-file-earmark-excel me-1" />Export Excel
          </button>
        </div>
        <BarChart data={data?.dailyRevenue} valueKey="amount" labelKey="date" color="#0064d2" />
      </div>
    </div>
  );
}

function UsersTab({ data, loading, onExport }) {
  if (loading) return <TabLoading />;
  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <KpiCard icon="bi bi-person-plus" label="New Buyers" value={data?.totalNewBuyers} color="#0064d2" />
        </div>
        <div className="col-md-4">
          <KpiCard icon="bi bi-shop" label="New Sellers" value={data?.totalNewSellers} color="#86b817" />
        </div>
        <div className="col-md-4">
          <KpiCard
            icon="bi bi-people"
            label="Total New Users"
            value={(data?.totalNewBuyers ?? 0) + (data?.totalNewSellers ?? 0)}
            color="#e53238"
          />
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">New User Growth</h6>
          <button className="btn btn-sm btn-outline-success" onClick={() => onExport("users")}>
            <i className="bi bi-file-earmark-excel me-1" />Export Excel
          </button>
        </div>
        <LineChart
          data={data?.dailyGrowth}
          keys={["newBuyers", "newSellers"]}
          colors={["#0064d2", "#86b817"]}
          labels={["Buyers", "Sellers"]}
        />
      </div>
    </div>
  );
}

function OrdersTab({ data, loading, onExport }) {
  if (loading) return <TabLoading />;
  const slices = [
    { label: "Completed", value: data?.completed ?? 0, color: "#86b817" },
    { label: "Delivered", value: data?.delivered ?? 0, color: "#0064d2" },
    { label: "Returned", value: data?.returned ?? 0, color: "#e53238" },
  ];
  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <KpiCard icon="bi bi-check-circle" label="Completed" value={data?.completed} color="#86b817" />
        </div>
        <div className="col-md-3">
          <KpiCard icon="bi bi-truck" label="Delivered" value={data?.delivered} color="#0064d2" />
        </div>
        <div className="col-md-3">
          <KpiCard icon="bi bi-arrow-counterclockwise" label="Returned" value={data?.returned} color="#e53238" />
        </div>
        <div className="col-md-3">
          <KpiCard icon="bi bi-cart3" label="Total Orders" value={data?.total} color="#f5af02" />
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">Order Distribution Ratio</h6>
          <button className="btn btn-sm btn-outline-success" onClick={() => onExport("orders")}>
            <i className="bi bi-file-earmark-excel me-1" />Export Excel
          </button>
        </div>
        <DonutChart slices={slices} />
      </div>
    </div>
  );
}

function TabLoading() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" style={{ width: 32, height: 32 }} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────
const PRESETS = [
  { key: "today", label: "Today" },
  { key: "week",  label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "custom", label: "Custom" },
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState(toIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [customEnd, setCustomEnd] = useState(toIso(new Date()));
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [revenueData, setRevenueData]   = useState(null);
  const [usersData,   setUsersData]     = useState(null);
  const [ordersData,  setOrdersData]    = useState(null);
  const [loading, setLoading] = useState({ revenue: false, users: false, orders: false });

  const getDateRange = useCallback(() => {
    if (preset === "custom") {
      return { start: customStart, end: customEnd };
    }
    const r = getPresetRange(preset);
    return { start: toIso(r.start), end: toIso(r.end) };
  }, [preset, customStart, customEnd]);

  const fetchAll = useCallback(async () => {
    const { start, end } = getDateRange();
    setLoading({ revenue: true, users: true, orders: true });
    setRevenueData(null); setUsersData(null); setOrdersData(null);

    const [rev, usr, ord] = await Promise.allSettled([
      reportService.getRevenue(start, end),
      reportService.getUserGrowth(start, end),
      reportService.getOrderStats(start, end),
    ]);

    if (rev.status === "fulfilled") setRevenueData(rev.value);
    else setToast({ message: "Error loading revenue: " + rev.reason?.message, type: "error" });

    if (usr.status === "fulfilled") setUsersData(usr.value);
    else setToast({ message: "Error loading user growth: " + usr.reason?.message, type: "error" });

    if (ord.status === "fulfilled") setOrdersData(ord.value);
    else setToast({ message: "Error loading order stats: " + ord.reason?.message, type: "error" });

    setLoading({ revenue: false, users: false, orders: false });
  }, [getDateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = (type) => {
    const { start, end } = getDateRange();
    const filename = `report-${type}-${start}-${end}.xlsx`;
    if (type === "revenue") {
      exportExcel(
        (revenueData?.dailyRevenue ?? []).map((d) => ({ Date: d.date, "Revenue (USD)": d.amount })),
        filename
      );
    } else if (type === "users") {
      exportExcel(
        (usersData?.dailyGrowth ?? []).map((d) => ({ Date: d.date, "Buyers": d.newBuyers, "Sellers": d.newSellers })),
        filename
      );
    } else if (type === "orders") {
      exportExcel(
        [{ "Completed": ordersData?.completed, "Delivered": ordersData?.delivered, "Returned": ordersData?.returned, "Total": ordersData?.total }],
        filename
      );
    }
  };

  const handlePrintPdf = async () => {
    const element = document.getElementById("pdf-export-area");
    if (!element) return;
    try {
      setToast({ message: "Generating PDF, please wait...", type: "success" });
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Statistical_Report_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
      setToast({ message: "PDF generation error", type: "error" });
    }
  };

  const anyLoading = Object.values(loading).some(Boolean);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section id="statistics-page">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Statistical Reports</h1>
          <p className="text-secondary mb-0 small">Analyze revenue, users, and orders over time.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchAll} disabled={anyLoading}>
            <i className={`bi bi-arrow-clockwise me-1 ${anyLoading ? "spin" : ""}`} />Refresh
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={handlePrintPdf}>
            <i className="bi bi-printer me-1" />Print PDF
          </button>
        </div>
      </div>

      {/* ── Export Wrapper ────────────────────────────────────────────────────── */}
      <div id="pdf-export-area" className="bg-white" style={{ padding: "2px" }}>
        
      {/* ── Date Filter ─────────────────────────────────────────────────────── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="text-secondary small fw-medium me-1">
            <i className="bi bi-calendar3 me-1" />Date Range:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`btn btn-sm rounded-pill ${preset === p.key ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ fontSize: "0.8rem" }}
            >
              {p.label}
            </button>
          ))}
          {preset === "custom" && (
            <div className="d-flex align-items-center gap-2 ms-2">
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ maxWidth: 145 }}
                value={customStart}
                max={customEnd}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-secondary">–</span>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ maxWidth: 145 }}
                value={customEnd}
                min={customStart}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button className="btn btn-sm btn-primary" onClick={fetchAll}>
                <i className="bi bi-search" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom px-4 pt-3 pb-0 d-flex gap-1">
          {[
            { key: "revenue", icon: "bi bi-cash-stack",   label: "Revenue" },
            { key: "users",   icon: "bi bi-people",        label: "Users" },
            { key: "orders",  icon: "bi bi-cart3",         label: "Orders" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn btn-sm rounded-0 border-0 border-bottom pb-3 px-4 fw-medium ${
                activeTab === tab.key
                  ? "border-bottom border-2 border-primary text-primary"
                  : "text-secondary"
              }`}
              style={{
                borderBottom: activeTab === tab.key ? "2px solid #0064d2" : "2px solid transparent",
                borderRadius: 0,
                fontSize: "0.9rem",
              }}
            >
              <i className={`${tab.icon} me-2`} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card-body p-4">
          {activeTab === "revenue" && (
            <RevenueTab data={revenueData} loading={loading.revenue} onExport={handleExport} />
          )}
          {activeTab === "users" && (
            <UsersTab data={usersData} loading={loading.users} onExport={handleExport} />
          )}
          {activeTab === "orders" && (
            <OrdersTab data={ordersData} loading={loading.orders} onExport={handleExport} />
          )}
        </div>
      </div>
      </div>

      {/* ── Print styles ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        @media print {
          .btn, nav, .sidebar { display: none !important; }
          #statistics-page { padding: 0; }
        }
      `}</style>
    </section>
  );
}
