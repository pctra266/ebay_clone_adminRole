import React, { useCallback, useEffect, useState } from "react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getAuditLogs } from "../services/auditLogService";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatJsonText(text) {
  if (!text) {
    return "-";
  }

  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState({
    adminUsername: "",
    targetType: "",
    action: "",
    fromDate: "",
    toDate: "",
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [logsData, setLogsData] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs({
        pageNumber,
        pageSize: 20,
        adminUsername: filters.adminUsername,
        targetType: filters.targetType,
        action: filters.action,
        fromDate: filters.fromDate ? new Date(filters.fromDate).toISOString() : undefined,
        toDate: filters.toDate ? new Date(filters.toDate).toISOString() : undefined,
      });
      setLogsData(result);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters.action, filters.adminUsername, filters.fromDate, filters.targetType, filters.toDate, pageNumber]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <section className="py-3">
      <h1 className="h3 mb-3">Audit Logs</h1>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h5">Filters</h2>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label htmlFor="f-admin-user" className="form-label">User</label>
              <input
                id="f-admin-user"
                className="form-control"
                value={filters.adminUsername}
                onChange={(event) => setFilters((prev) => ({ ...prev, adminUsername: event.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="f-target-type" className="form-label">Entity</label>
              <input
                id="f-target-type"
                className="form-control"
                value={filters.targetType}
                onChange={(event) => setFilters((prev) => ({ ...prev, targetType: event.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="f-action" className="form-label">Action</label>
              <input
                id="f-action"
                className="form-control"
                value={filters.action}
                onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="f-from-date" className="form-label">From</label>
              <input
                id="f-from-date"
                className="form-control"
                type="date"
                value={filters.fromDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="f-to-date" className="form-label">To</label>
              <input
                id="f-to-date"
                className="form-control"
                type="date"
                value={filters.toDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))}
              />
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setPageNumber(1);
                  loadLogs();
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator text="Loading audit logs..." />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Timestamp</th>
                <th>Before</th>
                <th>After</th>
              </tr>
            </thead>
            <tbody>
              {(logsData.items || []).map((log) => (
                <tr key={log.id}>
                  <td>{log.user || log.adminUsername || log.adminId}</td>
                  <td>{log.action}</td>
                  <td>{log.targetType} {log.targetId ? `#${log.targetId}` : ""}</td>
                  <td>{formatDate(log.createdAt)}</td>
                  <td style={{ minWidth: 220 }}>
                    <details>
                      <summary className="small">View JSON</summary>
                      <pre className="bg-light p-2 small mb-0">{formatJsonText(log.beforeData)}</pre>
                    </details>
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <details>
                      <summary className="small">View JSON</summary>
                      <pre className="bg-light p-2 small mb-0">{formatJsonText(log.afterData)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
              {(logsData.items || []).length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">Total: {logsData.totalCount || 0}</small>
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
            Page {pageNumber} / {logsData.totalPages || 1}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={pageNumber >= (logsData.totalPages || 1)}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

