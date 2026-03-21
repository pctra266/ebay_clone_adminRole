import React from 'react';
import { GlassCard } from './GlassCard';

const fmt = (n) => (n != null ? Number(n).toLocaleString("en-US") : 0);
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

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

export const MetricTiles = ({ metrics }) => (
  <div className="row g-4 mb-5">
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
        label="Orders"
        value={metrics?.totalOrdersToday}
        icon="bi bi-cart-check"
        gradient="bg-gradient-red"
        stagger="stagger-4"
      />
    </div>
  </div>
);
