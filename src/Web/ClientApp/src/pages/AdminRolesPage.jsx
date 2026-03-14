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
    <section className="py-3">
      <h1 className="h3 mb-3">Admin Roles & Permissions</h1>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5">Create New Role</h2>
              <form className="row g-2" onSubmit={submitCreateRole}>
                <div className="col-12">
                  <label htmlFor="role-name" className="form-label">Role Name</label>
                  <input
                    id="role-name"
                    className="form-control"
                    value={roleForm.roleName}
                    onChange={(event) => setRoleForm((prev) => ({ ...prev, roleName: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="role-description" className="form-label">Description</label>
                  <input
                    id="role-description"
                    className="form-control"
                    value={roleForm.description}
                    onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="role-permissions" className="form-label">Permissions (comma-separated)</label>
                  <textarea
                    id="role-permissions"
                    className="form-control"
                    rows="3"
                    value={roleForm.permissions}
                    onChange={(event) => setRoleForm((prev) => ({ ...prev, permissions: event.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Create Role</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5">Create Admin User</h2>
              <form className="row g-2" onSubmit={submitCreateAdmin}>
                <div className="col-md-6">
                  <label htmlFor="admin-username" className="form-label">Username</label>
                  <input
                    id="admin-username"
                    className="form-control"
                    value={adminForm.username}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, username: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="admin-email" className="form-label">Email</label>
                  <input
                    id="admin-email"
                    className="form-control"
                    type="email"
                    value={adminForm.email}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="admin-password" className="form-label">Password</label>
                  <input
                    id="admin-password"
                    className="form-control"
                    type="password"
                    value={adminForm.password}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="admin-role" className="form-label">Role</label>
                  <select
                    id="admin-role"
                    className="form-select"
                    value={adminForm.roleId}
                    onChange={(event) => setAdminForm((prev) => ({ ...prev, roleId: event.target.value }))}
                    required
                  >
                    <option value="">Select role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.roleName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Create Admin</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5">Role List</h2>
          {loadingRoles ? (
            <LoadingIndicator text="Loading roles..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Description</th>
                    <th>User Count</th>
                    <th>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>{role.roleName}</td>
                      <td>{role.description || "-"}</td>
                      <td>{role.userCount}</td>
                      <td>
                        <small>{(role.permissions || []).join(", ") || "-"}</small>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No roles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h5">Admin Users</h2>

          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-5">
              <label htmlFor="admin-search" className="form-label">Search</label>
              <input
                id="admin-search"
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="role-filter" className="form-label">Role Filter</label>
              <select
                id="role-filter"
                className="form-select"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setPageNumber(1);
                }}
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.roleName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={() => {
                  setPageNumber(1);
                  loadAdminUsers();
                }}
              >
                Search
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <LoadingIndicator text="Loading admin users..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Assigned By</th>
                    <th>Assigned At</th>
                    <th>Assign New Role</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminUsers.items || []).map((item) => (
                    <tr key={item.id}>
                      <td>{item.username || item.userId}</td>
                      <td>{item.email || "-"}</td>
                      <td>{item.roleName}</td>
                      <td>{item.assignedByUsername || item.assignedBy || "-"}</td>
                      <td>{new Date(item.assignedAt).toLocaleString()}</td>
                      <td className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          value={selectedRoleByUser[item.userId] || item.roleId}
                          onChange={(event) =>
                            setSelectedRoleByUser((prev) => ({ ...prev, [item.userId]: event.target.value }))
                          }
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>{role.roleName}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => submitAssignRole(item.userId)}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(adminUsers.items || []).length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">No admin users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">Total: {adminUsers.totalCount || 0}</small>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((prev) => prev - 1)}
              >
                Previous
              </button>
              <span className="align-self-center small">
                Page {pageNumber} / {adminUsers.totalPages || 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pageNumber >= (adminUsers.totalPages || 1)}
                onClick={() => setPageNumber((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

