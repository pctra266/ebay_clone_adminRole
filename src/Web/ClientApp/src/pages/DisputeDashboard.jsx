import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { disputeService } from "../services/disputeService";

export function DisputeDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const stats = await disputeService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      setToast({ 
        message: error.message || "Failed to load statistics", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "primary", onClick = null }) => (
    <div 
      className={`card h-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h6 className="card-title text-muted mb-1">{title}</h6>
            <div className={`h3 mb-1 text-${color}`}>{value}</div>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`text-${color} fs-2 opacity-50`}>
            <i className={`fas ${icon}`}></i>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingIndicator text="Loading dispute statistics..." />;
  }

  return (
    <section className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Disputes Dashboard</h1>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={loadStatistics}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
          <Link to="/disputes" className="btn btn-primary">
            <i className="fas fa-list me-2"></i>
            View All Disputes
          </Link>
        </div>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {statistics && (
        <>
          {/* Status Overview */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Case Status Overview</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <StatCard
                    title="Open Cases"
                    value={statistics.totalOpen}
                    icon="fa-folder-open"
                    color="primary"
                    onClick={() => window.location.href = "/disputes?status=Open"}
                  />
                </div>
                <div className="col-md-3">
                  <StatCard
                    title="Escalated"
                    value={statistics.totalEscalated}
                    icon="fa-exclamation-triangle"
                    color="danger"
                    onClick={() => window.location.href = "/disputes?status=Escalated"}
                  />
                </div>
                <div className="col-md-3">
                  <StatCard
                    title="Under Review"
                    value={statistics.totalUnderReview}
                    icon="fa-search"
                    color="warning"
                    onClick={() => window.location.href = "/disputes?status=UnderReview"}
                  />
                </div>
                <div className="col-md-3">
                  <StatCard
                    title="Resolved (30d)"
                    value={statistics.totalResolved}
                    icon="fa-check-circle"
                    color="success"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Alerts */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-warning mb-1">
                        <i className="fas fa-clock me-2"></i>
                        Urgent Cases
                      </h6>
                      <div className="h4 text-warning mb-1">{statistics.urgentCases}</div>
                      <small className="text-muted">Deadline &lt; 24h</small>
                    </div>
                    <Link 
                      to="/disputes?onlyUrgent=true"
                      className="btn btn-outline-warning btn-sm"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-danger">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="text-danger mb-1">
                        <i className="fas fa-fire me-2"></i>
                        Critical Priority
                      </h6>
                      <div className="h4 text-danger mb-1">{statistics.criticalPriority}</div>
                      <small className="text-muted">Needs immediate attention</small>
                    </div>
                    <Link 
                      to="/disputes?priority=Critical"
                      className="btn btn-outline-danger btn-sm"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <StatCard
                title="High Priority"
                value={statistics.highPriority}
                subtitle="Review within 48h"
                icon="fa-flag"
                color="warning"
                onClick={() => window.location.href = "/disputes?priority=High"}
              />
            </div>
          </div>

          {/* Financial Impact */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Financial Impact</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h4 text-warning mb-1">
                          ${statistics.totalDisputedAmount?.toLocaleString()}
                        </div>
                        <small className="text-muted">Total Disputed Amount</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h4 text-success mb-1">
                          ${statistics.totalRefundedAmount?.toLocaleString()}
                        </div>
                        <small className="text-muted">Total Refunded (30d)</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Performance Metrics</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h4 text-info mb-1">
                          {statistics.averageResolutionTimeHours?.toFixed(1)}h
                        </div>
                        <small className="text-muted">Avg Resolution Time</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <div className="h4 text-info mb-1">
                          {statistics.averageResponseTimeHours?.toFixed(1)}h
                        </div>
                        <small className="text-muted">Avg Response Time</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Win Rates & Case Types */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Resolution Outcomes (Last 30 Days)</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3 text-center">
                    <div className="col-4">
                      <div className="h5 text-primary">{statistics.buyerWins}</div>
                      <small className="text-muted">Buyer Wins</small>
                    </div>
                    <div className="col-4">
                      <div className="h5 text-warning">{statistics.sellerWins}</div>
                      <small className="text-muted">Seller Wins</small>
                    </div>
                    <div className="col-4">
                      <div className="h5 text-info">{statistics.splitDecisions}</div>
                      <small className="text-muted">Split Decisions</small>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${statistics.buyerWinRate}%` }}
                        title={`Buyer Win Rate: ${statistics.buyerWinRate?.toFixed(1)}%`}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Buyer Win Rate: {statistics.buyerWinRate?.toFixed(1)}%
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Case Types (Active)</h5>
                </div>
                <div className="card-body">
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="d-flex justify-content-between">
                        <span>INR (Not Received)</span>
                        <span className="fw-bold">{statistics.inrCases}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between">
                        <span>INAD (As Described)</span>
                        <span className="fw-bold">{statistics.inadCases}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between">
                        <span>Damaged</span>
                        <span className="fw-bold">{statistics.damagedCases}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between">
                        <span>Counterfeit</span>
                        <span className="fw-bold">{statistics.counterfeitCases}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-3">
                  <Link to="/disputes?status=Open&priority=Critical" className="btn btn-outline-danger w-100">
                    <i className="fas fa-fire me-2"></i>
                    Critical Open Cases
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/disputes?onlyMyDisputes=true" className="btn btn-outline-primary w-100">
                    <i className="fas fa-user me-2"></i>
                    My Assigned Cases
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/disputes?onlyUrgent=true" className="btn btn-outline-warning w-100">
                    <i className="fas fa-clock me-2"></i>
                    Urgent Cases
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link to="/disputes?status=Escalated" className="btn btn-outline-danger w-100">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Escalated Cases
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}