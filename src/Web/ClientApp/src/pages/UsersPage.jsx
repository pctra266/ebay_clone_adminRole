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

  return (
    <section className="py-3">
      <h1 className="h3 mb-3">User Management</h1>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="d-flex flex-wrap gap-2 mb-3">
        {tabDefinitions.map((tabItem) => (
          <button
            key={tabItem.value}
            type="button"
            className={`btn ${tab === tabItem.value ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setTab(tabItem.value);
              setPageNumber(1);
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="row g-2 align-items-end mb-3">
        <div className="col-md-6">
          <label htmlFor="user-search" className="form-label">
            Search by username or email
          </label>
          <input
            id="user-search"
            className="form-control"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="col-md-3">
          <button type="button" className="btn btn-primary w-100" onClick={() => setPageNumber(1)}>
            Search
          </button>
        </div>
        <div className="col-md-3 text-md-end text-muted">
          Current Admin ID: <strong>{adminId}</strong>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator text="Loading users..." />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {(usersData.items || []).map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <Link to={`/users/${user.id}`}>{user.username || "(No username)"}</Link>
                  </td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role || "-"}</td>
                  <td>{user.status}</td>
                  <td>{user.approvalStatus}</td>
                  <td className="d-flex gap-2 flex-wrap">
                    {user.approvalStatus !== "Approved" && (
                      <>
                        <button type="button" className="btn btn-sm btn-success" onClick={() => handleApprove(user.id)}>
                          Approve
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleReject(user.id)}>
                          Reject
                        </button>
                      </>
                    )}
                    {user.status === "Banned" ? (
                      <button type="button" className="btn btn-sm btn-warning" onClick={() => handleUnban(user.id)}>
                        Unban
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleBan(user.id)}>
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(usersData.items || []).length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Total: {usersData.totalCount || 0}</small>
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
            Page {pageNumber} / {usersData.totalPages || 1}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={pageNumber >= (usersData.totalPages || 1)}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

