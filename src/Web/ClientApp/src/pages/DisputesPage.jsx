import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getCurrentAdminId } from "../services/adminSession";
import { disputeService } from "../services/disputeService";
import { useDisputeHub } from "../hooks/useDisputeHub";

const statusTabs = [
  { label: "All", value: "" },
  { label: "Open", value: "Open" },
  { label: "Escalated", value: "Escalated" },
  { label: "Under Review", value: "UnderReview" },
  { label: "Assigned to Admin", value: "AssignedToAdmin" },
  { label: "Resolved", value: "Resolved" },
];

const priorityOptions = [
  { label: "All Priorities", value: "" },
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Item Not Received (INR)", value: "INR" },
  { label: "Item Not As Described (INAD)", value: "INAD" },
  { label: "Damaged", value: "Damaged" },
  { label: "Counterfeit", value: "Counterfeit" },
  { label: "Other", value: "Other" },
];

const sortOptions = [
  { label: "Deadline", value: "Deadline" },
  { label: "Amount", value: "Amount" },
  { label: "Priority", value: "Priority" },
  { label: "Created Date", value: "CreatedAt" },
];

export function DisputesPage() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [onlyMyDisputes, setOnlyMyDisputes] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Deadline");
  const [descending, setDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [disputesData, setDisputesData] = useState({
    items: [],
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const adminId = useMemo(() => getCurrentAdminId(), []);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        sortBy,
        descending
      };

      // Add filters only if they have values
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (type) params.type = type;
      if (onlyMyDisputes) params.onlyMyDisputes = true;
      if (onlyUrgent) params.onlyUrgent = true;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const result = await disputeService.getDisputes(params);
      setDisputesData(result);
    } catch (error) {
      setToast({ message: error.message || "Failed to load disputes", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, status, priority, type, onlyMyDisputes, onlyUrgent, searchTerm, sortBy, descending]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  // ── Real-time: nhận event khi bất kỳ admin nào resolve dispute ──
  // Redis backplane đảm bảo nhận được ngay cả khi admin đó kết nối vào pod khác
  const handleDisputeResolved = useCallback((data) => {
    setToast({
      message: `⚖️ Dispute ${data.caseId} resolved! Winner: ${data.winner}`,
      type: "success"
    });
    // Tự động refresh danh sách để phản ánh trạng thái mới nhất
    loadDisputes();
  }, [loadDisputes]);

  useDisputeHub(handleDisputeResolved);

  const handleAssignDispute = async (disputeId) => {
    try {
      await disputeService.assignDispute(disputeId);
      setToast({ message: "Dispute assigned successfully!", type: "success" });
      await loadDisputes(); // Refresh list
    } catch (error) {
      setToast({ message: error.response?.data || "Failed to assign dispute", type: "error" });
    }
  };

  const resetFilters = () => {
    setStatus("");
    setPriority("");
    setType("");
    setOnlyMyDisputes(false);
    setOnlyUrgent(false);
    setSearchTerm("");
    setSortBy("Deadline");
    setDescending(false);
    setPageNumber(1);
  };

  const applyFilters = () => {
    setPageNumber(1); // Reset to first page when filtering
  };

  const getPriorityBadge = (priority) => {
    const badgeClasses = {
      Critical: "badge bg-danger",
      High: "badge bg-warning text-dark",
      Medium: "badge bg-info text-dark",
      Low: "badge bg-secondary"
    };
    return <span className={badgeClasses[priority] || "badge bg-light text-dark"}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Open: "badge bg-primary",
      AwaitingSellerResponse: "badge bg-warning text-dark",
      Escalated: "badge bg-danger",
      UnderReview: "badge bg-info text-dark",
      AssignedToAdmin: "badge bg-success",
      Resolved: "badge bg-success",
      Closed: "badge bg-secondary"
    };
    return <span className={badgeClasses[status] || "badge bg-light text-dark"}>{status}</span>;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "-";

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 3600));

    if (hoursLeft < 0) {
      return <span className="text-danger">Overdue</span>;
    } else if (hoursLeft < 24) {
      return <span className="text-warning">{hoursLeft}h left</span>;
    } else {
      const daysLeft = Math.floor(hoursLeft / 24);
      return <span>{daysLeft}d left</span>;
    }
  };

  return (
    <section className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Disputes Management</h1>
        <Link to="/disputes/dashboard" className="btn btn-outline-primary">
          <i className="fas fa-chart-line me-2"></i>
          Dashboard
        </Link>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* Status Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`btn ${status === tab.value ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setStatus(tab.value);
              setPageNumber(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Case ID, description, buyer username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Sort By</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyMyDisputes"
                  checked={onlyMyDisputes}
                  onChange={(e) => setOnlyMyDisputes(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="onlyMyDisputes">
                  Only My Assigned Disputes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyUrgent"
                  checked={onlyUrgent}
                  onChange={(e) => setOnlyUrgent(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="onlyUrgent">
                  Only Urgent Cases (&lt; 24h)
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="descending"
                  checked={descending}
                  onChange={(e) => setDescending(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="descending">
                  Sort Descending
                </label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="button" className="btn btn-primary" onClick={applyFilters}>
              <i className="fas fa-search me-2"></i>Apply Filters
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={resetFilters}>
              <i className="fas fa-times me-2"></i>Clear All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator text="Loading disputes..." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Case ID</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(disputesData.items || []).map((dispute) => (
                  <tr key={dispute.id}>
                    <td>
                      <Link
                        to={`/disputes/${dispute.id}`}
                        className="fw-bold text-decoration-none"
                      >
                        {dispute.caseId}
                      </Link>
                    </td>
                    <td>{getStatusBadge(dispute.status)}</td>
                    <td>{getPriorityBadge(dispute.priority)}</td>
                    <td>
                      <span className="badge bg-light text-dark">{dispute.type}</span>
                    </td>
                    <td>
                      {dispute.amount ? `$${dispute.amount.toFixed(2)}` : "-"}
                    </td>
                    <td>{formatDeadline(dispute.deadline)}</td>
                    <td>
                      <div>
                        <div className="fw-medium">{dispute.buyerUsername}</div>
                        <small className="text-muted">{dispute.buyerEmail}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium" style={{ maxWidth: '200px' }}>
                          {dispute.productTitle || "-"}
                        </div>
                        {dispute.productPrice && (
                          <small className="text-muted">${dispute.productPrice}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      {dispute.assignedTo ? (
                        <span className="badge bg-success">Admin #{dispute.assignedTo}</span>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {!dispute.assignedTo && dispute.status !== "Resolved" && dispute.status !== "Closed" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAssignDispute(dispute.id)}
                            title="Assign to me"
                          >
                            <i className="fas fa-hand-paper">Take</i>
                          </button>
                        )}
                        {dispute.assignedTo && dispute.status !== "Resolved" && dispute.status !== "Closed" && (
                          <Link
                            to={`/disputes/${dispute.id}`}
                            className="btn btn-sm btn-success"
                            title="Resolve Case"
                          >
                            <i className="fas fa-gavel">Resolve</i>
                          </Link>
                        )}
                        <Link
                          to={`/disputes/${dispute.id}`}
                          className="btn btn-sm btn-outline-secondary"
                          title="View details"
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {(disputesData.items || []).length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-4">
                      No disputes found with current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Showing {disputesData.items?.length || 0} of {disputesData.totalCount || 0} disputes
            </small>
            <div className="d-flex gap-2 align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={!disputesData.hasPreviousPage}
                onClick={() => setPageNumber(prev => prev - 1)}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span className="small">
                Page {pageNumber} of {disputesData.totalPages || 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={!disputesData.hasNextPage}
                onClick={() => setPageNumber(prev => prev + 1)}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="text-end mt-3">
        <small className="text-muted">Current Admin ID: <strong>{adminId}</strong></small>
      </div>
    </section>
  );
}