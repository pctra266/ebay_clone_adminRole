import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getCurrentAdminId } from "../services/adminSession";
import {
  assignRole,
  createAdminUser,
  createRole,
  getAdminRoles,
  getAdminUsers,
} from "../services/adminRoleService";

function splitPermissions(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function AdminRolesPage() {
  const adminId = useMemo(() => getCurrentAdminId(), []);
  const [roles, setRoles] = useState([]);
  const [adminUsers, setAdminUsers] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [roleForm, setRoleForm] = useState({
    roleName: "",
    description: "",
    permissions: "",
  });
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [selectedRoleByUser, setSelectedRoleByUser] = useState({});

  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const result = await getAdminRoles();
      setRoles(result || []);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const loadAdminUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const result = await getAdminUsers({
        pageNumber,
        pageSize: 10,
        roleId: roleFilter || undefined,
        search,
      });
      setAdminUsers(result);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoadingUsers(false);
    }
  }, [pageNumber, roleFilter, search]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadAdminUsers();
  }, [loadAdminUsers]);

  const showSuccess = (message) => setToast({ message, type: "success" });
  const showError = (message) => setToast({ message, type: "error" });

  const submitCreateRole = async (event) => {
    event.preventDefault();
    try {
      await createRole({
        roleName: roleForm.roleName,
        description: roleForm.description,
        permissions: splitPermissions(roleForm.permissions),
        createdBy: adminId,
      });
      setRoleForm({ roleName: "", description: "", permissions: "" });
      showSuccess("Role created.");
      await loadRoles();
    } catch (error) {
      showError(error.message);
    }
  };

  const submitCreateAdmin = async (event) => {
    event.preventDefault();
    try {
      await createAdminUser({
        username: adminForm.username,
        email: adminForm.email,
        password: adminForm.password,
        roleId: Number(adminForm.roleId),
        createdBy: adminId,
      });
      setAdminForm({ username: "", email: "", password: "", roleId: "" });
      showSuccess("Admin user created.");
      await loadAdminUsers();
    } catch (error) {
      showError(error.message);
    }
  };

  const submitAssignRole = async (userId) => {
    const roleId = Number(selectedRoleByUser[userId]);
    if (!roleId) {
      showError("Please select a role.");
      return;
    }

    try {
      await assignRole({
        userId,
        roleId,
        assignedBy: adminId,
      });
      showSuccess("Role assignment updated.");
      await loadAdminUsers();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif", padding: '28px 20px' }}>
      <div className="container-fluid" style={{ maxWidth: 1400 }}>
        {/* ── Page Header (Standardized) ── */}
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="h2 fw-bold text-dark mb-2" style={{ letterSpacing: '-1px' }}>Security & Governance</h1>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Manage administrative access, define granular roles, and enforce platform-wide security policies.
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
            { label: 'Active Administrators', value: adminUsers.totalCount, icon: 'bi-person-badge-fill', color: 'primary' },
            { label: 'Security Roles', value: roles.length, icon: 'bi-shield-lock-fill', color: 'dark' },
            { label: 'System Clearance', value: 'Authorized', icon: 'bi-check-circle-fill', color: 'success' },
            { label: 'Platform Health', value: 'Secure', icon: 'bi-activity', color: 'info' },
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

        {/* ── Creation Forms Section ── */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 animate-fade-in-up">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-plus-circle me-2 text-primary"></i>Define New Role</h5>
              </div>
              <div className="card-body p-4">
                <form className="row g-3" onSubmit={submitCreateRole}>
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted text-uppercase">Role Designation</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-sm"
                      placeholder="e.g. Sales Manager"
                      value={roleForm.roleName}
                      onChange={(e) => setRoleForm(p => ({ ...p, roleName: e.target.value }))}
                      required
                      style={{ height: '45px' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted text-uppercase">Responsibility Description</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-sm"
                      placeholder="Specify the scope of this role..."
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(p => ({ ...p, description: e.target.value }))}
                      style={{ height: '45px' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted text-uppercase">Permissions (Comma Seperated)</label>
                    <textarea
                      className="form-control border-0 bg-light rounded-4 px-4 py-3 shadow-sm"
                      rows="3"
                      placeholder="e.g. orders.read, products.write, users.ban"
                      value={roleForm.permissions}
                      onChange={(e) => setRoleForm(p => ({ ...p, permissions: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 pt-2">
                    <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" type="submit">
                      <i className="bi bi-shield-plus me-2"></i>Provision Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 animate-fade-in-up">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-person-plus-fill me-2 text-primary"></i>Register Admin Account</h5>
              </div>
              <div className="card-body p-4">
                <form className="row g-3" onSubmit={submitCreateAdmin}>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Admin Username</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-sm"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm(p => ({ ...p, username: e.target.value }))}
                      required
                      style={{ height: '45px' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Corporate Email</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-sm"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))}
                      required
                      style={{ height: '45px' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Secure Password</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-sm"
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm(p => ({ ...p, password: e.target.value }))}
                      required
                      style={{ height: '45px' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Initial Role Assignment</label>
                    <select
                      className="form-select border-0 bg-light rounded-pill px-4 shadow-sm"
                      value={adminForm.roleId}
                      onChange={(e) => setAdminForm(p => ({ ...p, roleId: e.target.value }))}
                      required
                      style={{ height: '45px', fontWeight: 500 }}
                    >
                      <option value="">Select authority...</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                    </select>
                  </div>
                  <div className="col-12 pt-2">
                    <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" type="submit">
                      <i className="bi bi-person-check-fill me-2"></i>Create Administrator
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ── Role List Management ── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5 animate-fade-in-up">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-list-check me-2 text-primary"></i>Defined Security Roles</h5>
          </div>
          <div className="card-body p-0">
            {loadingRoles ? (
              <div className="py-5 text-center"><LoadingIndicator text="Cataloging roles..." /></div>
            ) : (
              <div className="table-responsive">
                <table className="table pe-table mb-0 align-middle">
                  <thead className="bg-primary bg-opacity-10 text-primary fw-bold small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3 border-0">Identity</th>
                      <th className="py-3 border-0">Responsibility</th>
                      <th className="py-3 border-0 text-center">Active Admins</th>
                      <th className="py-3 border-0 pe-4">Permission Matrix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="transition-all hover-translate-y border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                              <i className="bi bi-shield-shaded"></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{role.roleName}</div>
                              <div className="text-muted x-small">UID: {role.id}</div>
                            </div>
                          </div>
                        </td>
                        <td><div className="text-dark small fw-medium" style={{ maxWidth: 300 }}>{role.description || "N/A"}</div></td>
                        <td className="text-center">
                          <span className="badge bg-light text-primary border rounded-pill px-3 py-1 fw-bold shadow-sm">
                            {role.userCount} Accounts
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex flex-wrap gap-1">
                            {(role.permissions || []).slice(0, 5).map(p => (
                              <span key={p} className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '0.65rem' }}>{p}</span>
                            ))}
                            {(role.permissions || []).length > 5 && <span className="text-muted x-small">+{role.permissions.length - 5} more</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Admin Users Management ── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate-fade-in-up">
          <div className="card-header bg-white border-bottom py-3 px-4 d-sm-flex align-items-center justify-content-between gap-3">
            <h5 className="mb-0 fw-bold text-dark">Administrative Accounts</h5>
            <div className="d-flex gap-2 flex-wrap flex-grow-1 justify-content-end" style={{ maxWidth: '600px' }}>
              <input
                className="form-control border-0 bg-light rounded-pill px-4 shadow-sm flex-grow-1"
                placeholder="Search administrators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem' }}
              />
              <select
                className="form-select border-0 bg-light rounded-pill px-4 shadow-sm"
                style={{ width: '160px', height: '40px', fontSize: '0.85rem', fontWeight: 600 }}
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPageNumber(1); }}
              >
                <option value="">All Roles</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
              </select>
              <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onClick={() => { setPageNumber(1); loadAdminUsers(); }}>
                Search
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            {loadingUsers ? (
              <div className="py-5 text-center"><LoadingIndicator text="Fetching administrators..." /></div>
            ) : (
              <div className="table-responsive">
                <table className="table pe-table mb-0 align-middle">
                  <thead className="bg-primary bg-opacity-10 text-primary fw-bold small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3 border-0">Executive</th>
                      <th className="py-3 border-0">Security Role</th>
                      <th className="py-3 border-0">Governance logs</th>
                      <th className="pe-4 py-3 border-0 text-end">Modify Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(adminUsers.items || []).map((item) => (
                      <tr key={item.id} className="transition-all hover-translate-y border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-light p-2 rounded-circle fw-bold text-primary" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {(item.username?.[0] || 'A').toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{item.username || `Admin #${item.userId}`}</div>
                              <div className="text-muted x-small">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.7rem' }}>
                            {item.roleName}
                          </span>
                        </td>
                        <td>
                          <div className="text-dark small fw-medium">By: {item.assignedByUsername || "System"}</div>
                          <div className="text-muted x-small">{new Date(item.assignedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <select
                              className="form-select border-0 bg-light rounded-pill px-3 shadow-sm"
                              style={{ height: '32px', fontSize: '0.75rem', maxWidth: '140px' }}
                              value={selectedRoleByUser[item.userId] || item.roleId}
                              onChange={(e) => setSelectedRoleByUser(p => ({ ...p, [item.userId]: e.target.value }))}
                            >
                              {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                            </select>
                            <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={() => submitAssignRole(item.userId)}>
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination ── */}
            <div className="px-4 py-3 bg-light border-top d-flex justify-content-between align-items-center">
              <span className="text-muted small">Active Personnel: <strong className="text-dark">{adminUsers.totalCount || 0}</strong></span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}>
                   <i className="bi bi-chevron-left"></i>
                </button>
                <span className="align-self-center small fw-bold mx-2">{pageNumber} / {adminUsers.totalPages || 1}</span>
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={pageNumber >= (adminUsers.totalPages || 1)} onClick={() => setPageNumber(p => p + 1)}>
                   <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .x-small { font-size: 0.70rem; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
      `}</style>
    </div>
  );
}

