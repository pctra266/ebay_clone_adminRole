import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getCurrentAdminId } from "../services/adminSession";
import { approveUser, banUser, getUsers, rejectUser, unbanUser } from "../services/userService";

const tabDefinitions = [
  { label: "All Users", value: "All" },
  { label: "Pending Approval", value: "PendingApproval" },
  { label: "Banned", value: "Banned" },
];

export function UsersPage() {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [usersData, setUsersData] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const adminId = useMemo(() => getCurrentAdminId(), []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers({
        tab,
        search,
        pageNumber,
        pageSize,
        orderBy: "id",
        isDescending: true,
      });
      setUsersData(result);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, tab]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const runAction = async (action) => {
    try {
      await action();
      setToast({ message: "Action completed successfully.", type: "success" });
      await loadUsers();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  const handleApprove = (userId) =>
    runAction(() => approveUser(userId, adminId));

  const handleReject = (userId) => {
    const reason = window.prompt("Reject reason:");
    if (!reason) {
      return;
    }

    runAction(() => rejectUser(userId, reason, adminId));
  };

  const handleBan = (userId) => {
    const reason = window.prompt("Ban reason:");
    if (!reason) {
      return;
    }

    runAction(() => banUser(userId, reason, adminId));
  };

  const handleUnban = (userId) =>
    runAction(() => unbanUser(userId, adminId));

  const bannedCount = (usersData.items || []).filter(u => u.status === "Banned").length;
  const pendingCount = (usersData.items || []).filter(u => u.approvalStatus === "PendingApproval").length;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif", padding: '28px 20px' }}>
      <div className="container-fluid" style={{ maxWidth: 1300 }}>
        {/* ── Page Header (Standardized) ── */}
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="h2 fw-bold text-dark mb-2" style={{ letterSpacing: '-1px' }}>User Management</h1>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Govern platform access and ensure account integrity across the ecosystem.
          </p>
        </div>

        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />

        {/* ── Quick Stats Grid ── */}
        <div className="row g-3 mb-5 justify-content-center">
          {[
            { label: 'Total Registered', value: usersData.totalCount, icon: 'bi-people-fill', color: 'primary' },
            { label: 'Pending Approval', value: tab === "PendingApproval" ? usersData.items.length : pendingCount, icon: 'bi-person-badge-fill', color: 'warning' },
            { label: 'Recently Banned', value: tab === "Banned" ? usersData.items.length : bannedCount, icon: 'bi-person-x-fill', color: 'danger' },
            { label: 'Platform Admins', value: 'Active', icon: 'bi-shield-check', color: 'success' },
          ].map((stat, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div className="bg-white border rounded-4 p-3 shadow-sm d-flex align-items-center gap-3 h-100 transition-all hover-translate-y">
                <div className={`p-3 bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-circle`}>
                  <i className={`bi ${stat.icon} h4 mb-0`}></i>
                </div>
                <div>
                  <h6 className="text-secondary mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>{stat.label}</h6>
                  <h4 className="mb-0 fw-bold text-dark">{stat.value}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate-fade-in-up">
          <div className="card-body p-0">
            {/* ── Enhanced Toolbar ── */}
            <div className="px-4 py-3 bg-light border-bottom">
              <div className="d-sm-flex align-items-center justify-content-between gap-3">
                <div className="d-flex flex-wrap gap-1 p-1 bg-white border rounded-pill shadow-sm mb-3 mb-sm-0">
                  {tabDefinitions.map((tabItem) => (
                    <button
                      key={tabItem.value}
                      onClick={() => { setTab(tabItem.value); setPageNumber(1); }}
                      className={`btn btn-sm rounded-pill px-4 py-1 fw-bold transition-all ${tab === tabItem.value ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {tabItem.label}
                    </button>
                  ))}
                </div>

                <div className="d-flex gap-2 flex-grow-1" style={{ maxWidth: '450px' }}>
                  <div className="position-relative flex-grow-1">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '0.85rem' }}></i>
                    <input
                      type="text"
                      className="form-control border-0 bg-white rounded-pill ps-5 py-2 shadow-sm"
                      placeholder="Search accounts..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && setPageNumber(1)}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onClick={() => setPageNumber(1)}>Search</button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-secondary small italic">Fetching registry...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table pe-table mb-0 align-middle">
                  <thead className="bg-primary bg-opacity-10 text-primary fw-bold small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3 border-0">Identity</th>
                      <th className="py-3 border-0">Role & Access</th>
                      <th className="py-3 border-0">System Status</th>
                      <th className="py-3 border-0">Approval Status</th>
                      <th className="pe-4 py-3 border-0 text-end">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersData.items || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <i className="bi bi-person-dash h1 d-block mb-3 opacity-25"></i>
                          No accounts found in this registry.
                        </td>
                      </tr>
                    ) : (
                      (usersData.items || []).map((user) => (
                        <tr key={user.id} className="transition-all hover-translate-y border-bottom">
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 44, height: 44, fontSize: '1.2rem' }}>
                                {user.username?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <Link to={`/users/${user.id}`} className="fw-bold text-dark mb-0 text-decoration-none d-block">
                                  {user.username || "(No username)"}
                                </Link>
                                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{user.email || "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="badge bg-light text-dark fw-bold border" style={{ fontSize: '0.7rem' }}>{user.role || "USER"}</div>
                            <div className="text-muted mt-1 small" style={{ fontSize: '0.65rem' }}>ID: #{user.id}</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`status-dot status-dot--${user.status?.toLowerCase() === 'banned' ? 'suspended' : 'active'}`}></span>
                              <span className={`fw-bold small ${user.status === 'Banned' ? 'text-danger' : 'text-success'}`}>{user.status}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-1 ${user.approvalStatus === 'Approved' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'}`} style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                              {user.approvalStatus?.toUpperCase()}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <div className="d-flex justify-content-end gap-1">
                              {user.approvalStatus !== "Approved" && (
                                <>
                                  <button type="button" className="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleApprove(user.id)} style={{ fontSize: '0.7rem' }}>
                                    Approve
                                  </button>
                                  <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={() => handleReject(user.id)} style={{ fontSize: '0.7rem' }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              {user.status === "Banned" ? (
                                <button type="button" className="btn btn-sm btn-warning rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleUnban(user.id)} style={{ fontSize: '0.7rem' }}>
                                  Unban
                                </button>
                              ) : (
                                <button type="button" className="btn btn-sm btn-danger rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleBan(user.id)} style={{ fontSize: '0.7rem' }}>
                                  Ban
                                </button>
                              )}
                              <Link to={`/users/${user.id}`} className="btn btn-sm btn-light rounded-pill px-3 fw-bold ms-1" style={{ fontSize: '0.7rem' }}>
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Standard Pagination ── */}
            <div className="px-4 py-3 bg-light border-top d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Total Registry: <strong className="text-dark">{usersData.totalCount || 0}</strong> accounts
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0 gap-1">
                  <li className={`page-item ${pageNumber <= 1 ? 'disabled' : ''}`}>
                    <button className="page-link rounded-pill border-0 fw-bold px-3 py-2" onClick={() => setPageNumber(p => p - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li className="page-item disabled px-2">
                    <span className="page-link bg-transparent border-0 text-dark fw-bold py-2">
                      {pageNumber} / {usersData.totalPages || 1}
                    </span>
                  </li>
                  <li className={`page-item ${pageNumber >= (usersData.totalPages || 1) ? 'disabled' : ''}`}>
                    <button className="page-link rounded-pill border-0 fw-bold px-3 py-2" onClick={() => setPageNumber(p => p + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <small className="text-muted">Managed by Administrator Session ID: <strong className="text-primary">#{adminId}</strong></small>
        </div>
      </div>
    </div>
  );
}

