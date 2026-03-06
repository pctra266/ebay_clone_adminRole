import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentAdminId, setCurrentAdminId } from "../services/adminSession";
import { ToastMessage } from "../components/ToastMessage";

export function DashboardPage() {
  const [adminIdInput, setAdminIdInput] = useState(String(getCurrentAdminId()));
  const [toast, setToast] = useState({ message: "", type: "success" });

  const saveAdminId = () => {
    try {
      setCurrentAdminId(adminIdInput);
      setToast({ message: "Saved current admin id.", type: "success" });
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  return (
    <section className="py-3">
      <h1 className="h3 mb-3">Admin Dashboard</h1>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6">Current Admin Context</h2>
          <p className="text-muted mb-2">
            Commands in user/broadcast/role pages require admin id. Set it once here.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control"
              style={{ maxWidth: 220 }}
              type="number"
              min="1"
              value={adminIdInput}
              onChange={(event) => setAdminIdInput(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={saveAdminId}>
              Save Admin ID
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6 col-lg-4">
          <Link className="card card-body text-decoration-none h-100" to="/users">
            <h3 className="h6 mb-1">User Management</h3>
            <p className="text-muted mb-0">Tabs, quick approve/ban and detail navigation.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link className="card card-body text-decoration-none h-100" to="/broadcasts">
            <h3 className="h6 mb-1">Broadcast Center</h3>
            <p className="text-muted mb-0">Send now or schedule notifications by audience and channel.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link className="card card-body text-decoration-none h-100" to="/admin-roles">
            <h3 className="h6 mb-1">Roles & Permissions</h3>
            <p className="text-muted mb-0">Create roles, create admin users, assign roles.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link className="card card-body text-decoration-none h-100" to="/audit-logs">
            <h3 className="h6 mb-1">Audit Logs</h3>
            <p className="text-muted mb-0">Filter by user/entity and inspect before/after data JSON.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

