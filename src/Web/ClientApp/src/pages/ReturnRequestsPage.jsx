import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import returnRequestService from '../services/returnRequestService';

const STATUS_TABS = [
  { key: 'Pending',   label: 'Pending Review', color: '#f59e0b' },
  { key: 'Escalated', label: 'Escalated',      color: '#6366f1' },
  { key: 'Approved',  label: 'Refunded',       color: '#10b981' },
  { key: 'Rejected',  label: 'Rejected',       color: '#ef4444' },
];

const statusBadge = {
  Pending:               { bg: '#fef3c7', color: '#92400e', text: 'Pending Analysis' },
  Approved:              { bg: '#d1fae5', color: '#065f46', text: 'Refunded'         },
  Rejected:              { bg: '#fee2e2', color: '#991b1b', text: 'Rejected'         },
  WaitingForReturnLabel: { bg: '#e0e7ff', color: '#3730a3', text: 'Waiting for Label' },
  ReturnLabelProvided:   { bg: '#dcfce7', color: '#166534', text: 'Label Provided'  },
  Returned:              { bg: '#fef9c3', color: '#854d0e', text: 'Item Returned'   },
  Escalated:             { bg: '#ffedd5', color: '#9a3412', text: 'Escalated'        },
};

export default function ReturnRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await returnRequestService.getReturnRequests(''); // Fetch all requests
      setRequests(data);
    } catch {
      setError('Could not load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Sẽ chỉ fetch 1 lần khi load (bỏ activeTab ra khỏi dependency)
  }, [fetchData]);

  // Derived Statistics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const escalatedCount = requests.filter(r => r.status === 'Escalated').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;

  const requestsForTab = requests.filter((r) => r.status === activeTab);
  const filtered = requestsForTab.filter((r) =>
    searchId ? String(r.orderId).includes(searchId.trim()) : true
  );

  const badge = (status) => {
    const b = statusBadge[status] || { color: '#64748b', text: status };
    return (
      <span className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px', background: 'rgba(0,0,0,0.03)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }}></span>
        <span style={{ color: '#1e293b' }}>{b.text?.toUpperCase()}</span>
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif", padding: '28px 20px' }}>
      <div className="container-fluid" style={{ maxWidth: 1200 }}>
        {/* ── Page Header (Standardized) ── */}
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold text-dark mb-2" style={{ letterSpacing: '-0.5px' }}>Return & Refund Management</h1>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Review, adjudicate, and process customer return requests to ensure fair outcomes and marketplace trust.
          </p>
        </div>

        {/* ── Quick Stats Grid ── */}
        <div className="row g-3 mb-5 justify-content-center">
          {[
            { label: 'Total Requests', value: totalCount, icon: 'bi-box-seam', color: 'primary' },
            { label: 'Pending Review', value: pendingCount, icon: 'bi-clock-history', color: 'warning' },
            { label: 'Escalated Cases', value: escalatedCount, icon: 'bi-exclamation-triangle', color: 'danger' },
            { label: 'Refunded (Success)', value: approvedCount, icon: 'bi-check-circle-fill', color: 'success' },
          ].map((stat, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div className="bg-white border rounded-4 p-3 shadow-sm d-flex align-items-center gap-3 h-100 transition-all">
                <div className={`p-3 bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-3`}>
                  <i className={`bi ${stat.icon} h4 mb-0`}></i>
                </div>
                <div>
                  <h6 className="text-secondary mb-1 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>{stat.label}</h6>
                  <h5 className="mb-0 fw-bold text-dark">{stat.value}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="card-body p-0">
            {/* ── Table Toolbar ── */}
            <div className="px-4 py-3 bg-light border-bottom">
              <div className="row align-items-center g-3">
                <div className="col-md-7">
                  <div className="d-flex flex-wrap gap-1 p-1 bg-white border rounded-pill shadow-sm" style={{ width: 'fit-content' }}>
                    {STATUS_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSearchId(''); }}
                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all ${activeTab === tab.key ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {tab.label}
                        {activeTab === tab.key && requestsForTab.length > 0 && (
                          <span className="badge bg-white text-primary ms-2 rounded-pill px-2">{requestsForTab.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ fontSize: '0.85rem' }}></i>
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-white rounded-pill ps-5 py-2 shadow-sm"
                      placeholder="Search Order ID..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table pe-table mb-0 align-middle">
                <thead className="bg-primary bg-opacity-10 text-primary fw-bold small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3 border-0" style={{ width: '80px' }}>ID</th>
                    <th className="py-3 border-0" style={{ width: '120px' }}>Order #</th>
                    <th className="py-3 border-0">Customer</th>
                    <th className="py-3 border-0" style={{ width: '250px' }}>Return Reason</th>
                    <th className="py-3 border-0">Price</th>
                    <th className="py-3 border-0">Requested</th>
                    <th className="pe-4 py-3 border-0 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox h1 d-block mb-3 opacity-25"></i>
                        {searchId ? `No orders found for #${searchId}` : 'No return requests found.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(r => (
                      <tr key={r.id} onClick={() => navigate(`/return-requests/${r.id}`)} style={{ cursor: 'pointer' }} className="transition-all">
                        <td className="ps-4 py-3 text-secondary fw-medium">#{r.id}</td>
                        <td>
                          <span className="fw-bold text-primary">#{r.orderId}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                              {r.buyerUsername?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="fw-bold text-dark small">{r.buyerUsername || 'Anonymous'}</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{r.buyerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-dark small text-truncate" style={{ maxWidth: 200 }} title={r.reason}>
                            {r.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-dark">{r.totalPrice ? `$${Number(r.totalPrice).toLocaleString('en-US')}` : '—'}</span>
                        </td>
                        <td className="text-secondary small">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="pe-4 text-end">
                          {badge(r.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}