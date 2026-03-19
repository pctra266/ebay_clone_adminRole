import React, { useState, useEffect } from "react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getAuthHeaders } from '../services/config';

export function AdminSellerPerformancePage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadSellers = async () => {
    setLoading(true);
    try {
      // In a real app we'd fetch Seller metrics explicitly.
      // Here we fetch all users and filter by Role == 'Seller' (or just show their level).
      const response = await fetch('/api/Users', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch sellers.");
      
      const data = await response.json();
      // Assume the API returns items in data.items
      let users = data.items || data;
      // Filter out non-sellers? Or just show all? The backend EvaluateSellers command evaluates users with Role=="Seller" or who have Stores.
      // Since GetUsers might returns sellerLevel, we can map it.
      setSellers(users.filter(u => u.role === 'Seller'));
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleBatchEvaluate = async () => {
    if (!window.confirm("Are you sure you want to trigger evaluation for all sellers?")) return;
    setEvaluating(true);
    try {
      const response = await fetch('/api/Users/evaluate-sellers', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error("Evaluation request failed.");
      }
      const updatedCount = await response.json();
      setToast({ message: `Evaluation complete. ${updatedCount} sellers updated.`, type: "success" });
      loadSellers();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <section className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Seller Performance Management</h1>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleBatchEvaluate}
          disabled={evaluating}
        >
          {evaluating ? "Evaluating..." : "Force Batch Evaluate"}
        </button>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Top Rated</h5>
              <p className="card-text mb-0">0 Days Hold (Instant)</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title text-dark">Above Standard</h5>
              <p className="card-text text-dark mb-0">3 Days Hold</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger">
            <div className="card-body">
              <h5 className="card-title">Below Standard</h5>
              <p className="card-text mb-0">21 Days Hold</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingIndicator text="Loading sellers..." />
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Seller Name</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.username || s.email}</td>
                      <td>
                        {s.sellerLevel === 'TopRated' && <span className="badge bg-success">Top Rated</span>}
                        {s.sellerLevel === 'AboveStandard' && <span className="badge bg-warning text-dark">Above Standard</span>}
                        {(s.sellerLevel === 'BelowStandard' || !s.sellerLevel) && <span className="badge bg-danger">Below Standard</span>}
                      </td>
                      <td>{s.status}</td>
                      <td>
                        <a href={`/users/${s.id}`} className="btn btn-sm btn-outline-info">View History</a>
                      </td>
                    </tr>
                  ))}
                  {sellers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        No sellers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
