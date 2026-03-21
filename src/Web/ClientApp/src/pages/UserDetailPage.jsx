import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { banUser, getUserById, unbanUser } from "../services/userService";
import { getCurrentAdminId } from "../services/adminSession";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function UserDetailPage() {
  const { userId } = useParams();
  const adminId = useMemo(() => getCurrentAdminId(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleBan = async () => {
    const reason = window.prompt("Ban reason:");
    if (!reason) {
      return;
    }

    try {
      await banUser(user.id, reason, adminId);
      setToast({ message: "User has been banned.", type: "success" });
      await loadDetail();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser(user.id, adminId);
      setToast({ message: "User has been unbanned.", type: "success" });
      await loadDetail();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  return (
    <section className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">User Detail</h1>
        <Link className="btn btn-outline-secondary btn-sm" to="/users">
          Back to list
        </Link>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {loading && <LoadingIndicator text="Loading user detail..." />}

      {!loading && user && (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                <h2 className="h5 mb-0">Personal Information</h2>
                <div className="d-flex gap-2">
                  {user.status === "Banned" ? (
                    <button type="button" className="btn btn-warning btn-sm" onClick={handleUnban}>
                      Unban User
                    </button>
                  ) : (
                    <button type="button" className="btn btn-danger btn-sm" onClick={handleBan}>
                      Ban User
                    </button>
                  )}
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-4"><strong>ID:</strong> {user.id}</div>
                <div className="col-md-4"><strong>Username:</strong> {user.username || "-"}</div>
                <div className="col-md-4"><strong>Email:</strong> {user.email || "-"}</div>
                <div className="col-md-4"><strong>Status:</strong> {user.status}</div>
                <div className="col-md-4"><strong>Approval:</strong> {user.approvalStatus}</div>
                <div className="col-md-4"><strong>Role:</strong> {user.role || "-"}</div>
                <div className="col-md-4"><strong>Masked Phone:</strong> {user.maskedPhone || "-"}</div>
                <div className="col-md-4"><strong>Masked National ID:</strong> {user.maskedNationalId || "-"}</div>
                <div className="col-md-4"><strong>Violation Count:</strong> {user.violationCount}</div>
                {user.role === "Seller" && (
                  <>
                    <div className="col-md-4">
                      <strong>Seller Level:</strong> 
                      <span className={`badge ms-2 ${
                        user.sellerLevel === 'TopRated' ? 'bg-success' : 
                        user.sellerLevel === 'AboveStandard' ? 'bg-warning text-dark' : 
                        'bg-danger'
                      }`}>
                        {user.sellerLevel === 'TopRated' ? 'Top Rated' : 
                         user.sellerLevel === 'AboveStandard' ? 'Above Standard' : 
                         (user.sellerLevel || "Below Standard")}
                      </span>
                    </div>
                    <div className="col-md-4">
                      <button className="btn btn-sm btn-outline-primary" onClick={async () => {
                        try {
                           const res = await fetch('/api/Users/evaluate-sellers', {
                             method: 'POST',
                             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                           });
                           if(res.ok) alert("Evaluation completed.");
                           loadDetail();
                        } catch(e) { }
                      }}>Manually Evaluate</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h2 className="h5">Order History</h2>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.orderHistory || []).map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>{order.status || "-"}</td>
                        <td>{order.totalPrice ?? "-"}</td>
                      </tr>
                    ))}
                    {(user.orderHistory || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No order history.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="h5">Violation History</h2>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Admin</th>
                      <th>When</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.violationHistory || []).map((item) => (
                      <tr key={item.auditLogId}>
                        <td>{item.action}</td>
                        <td>{item.adminUsername || item.adminId}</td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td style={{ maxWidth: 420 }}>
                          <pre className="bg-light p-2 mb-0 small" style={{ whiteSpace: "pre-wrap" }}>
                            {item.details || "-"}
                          </pre>
                        </td>
                      </tr>
                    ))}
                    {(user.violationHistory || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No violation history.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
