import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ToastMessage } from "../components/ToastMessage";
import { getCurrentAdminId } from "../services/adminSession";
import { getBroadcasts, scheduleBroadcast, sendBroadcast } from "../services/broadcastService";

const channelOptions = ["Email", "InApp", "SMS"];
const audienceOptions = ["All", "Seller", "Buyer", "Group"];

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function BroadcastPage() {
  const adminId = useMemo(() => getCurrentAdminId(), []);
  const [form, setForm] = useState({
    title: "",
    content: "",
    targetAudience: "All",
    targetGroup: "",
    channels: ["InApp"],
    scheduleAt: "",
  });
  const [filters, setFilters] = useState({ status: "", type: "" });
  const [listData, setListData] = useState({ items: [], totalCount: 0, totalPages: 0 });
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBroadcasts({
        pageNumber,
        pageSize: 10,
        status: filters.status,
        type: filters.type,
      });
      setListData(result);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.type, pageNumber]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleChannel = (channel) => {
    setForm((prev) => {
      const hasChannel = prev.channels.includes(channel);
      const channels = hasChannel
        ? prev.channels.filter((item) => item !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  };

  const buildPayload = () => ({
    title: form.title,
    content: form.content,
    targetAudience: form.targetAudience,
    targetGroup: form.targetAudience === "Group" ? form.targetGroup : null,
    channels: form.channels,
    createdBy: adminId,
  });

  const submitNow = async () => {
    setSubmitting(true);
    try {
      await sendBroadcast(buildPayload());
      setToast({ message: "Broadcast sent successfully.", type: "success" });
      await loadBroadcasts();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitSchedule = async () => {
    if (!form.scheduleAt) {
      setToast({ message: "Please choose a schedule time.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await scheduleBroadcast({
        ...buildPayload(),
        scheduleAt: new Date(form.scheduleAt).toISOString(),
      });
      setToast({ message: "Broadcast scheduled successfully.", type: "success" });
      await loadBroadcasts();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const scheduledCount = (listData.items || []).filter(item => item.status === "Scheduled").length;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif", padding: '28px 20px' }}>
      <div className="container-fluid" style={{ maxWidth: 1200 }}>
        {/* ── Page Header (Standardized) ── */}
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold text-dark mb-2" style={{ letterSpacing: '-1px' }}>Broadcast Center</h1>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Multi-channel communication engine for platform notices and announcements.
          </p>
        </div>

        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />



        {/* ── Create Broadcast Section (Refined 2-Widget Layout) ── */}
        <div className="row g-4 mb-5">
          {/* Widget 1: Message Content */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-pencil-square me-2 text-primary"></i>Message Details</h5>
                <span className="badge bg-light text-secondary border fw-bold px-3 py-1 rounded-pill" style={{ fontSize: '0.65rem' }}>
                  Admin Session: #{adminId}
                </span>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Announcement Title</label>
                  <input
                    className="form-control border-0 bg-light rounded-pill px-4 shadow-inner"
                    placeholder="Enter short subject..."
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    style={{ height: '45px', fontSize: '0.95rem', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Content Body</label>
                  <textarea
                    className="form-control border-0 bg-light rounded-4 px-4 py-3 shadow-inner"
                    rows="8"
                    placeholder="Type your message here..."
                    value={form.content}
                    onChange={(e) => updateForm("content", e.target.value)}
                    style={{ fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Configuration & Dispatch */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-gear-fill me-2 text-primary"></i>Dispatch Settings</h5>
              </div>
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Target Audience</label>
                    <select
                      className="form-select border-0 bg-light rounded-pill px-4 shadow-inner"
                      value={form.targetAudience}
                      onChange={(e) => updateForm("targetAudience", e.target.value)}
                      style={{ height: '45px', fontWeight: 500, fontSize: '0.9rem' }}
                    >
                      {audienceOptions.map(opt => <option key={opt} value={opt}>{opt} Users</option>)}
                    </select>
                  </div>

                  {form.targetAudience === "Group" && (
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Segment Group</label>
                      <input
                        className="form-control border-0 bg-light rounded-pill px-4 shadow-inner"
                        placeholder="Group ID or Label"
                        value={form.targetGroup}
                        onChange={(e) => updateForm("targetGroup", e.target.value)}
                        style={{ height: '45px' }}
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>Channels</label>
                    <div className="d-flex flex-wrap gap-2">
                      {channelOptions.map(channel => (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => toggleChannel(channel)}
                          className={`btn rounded-pill px-3 py-1 fw-bold transition-all shadow-sm ${form.channels.includes(channel) ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className={`bi bi-${channel === 'Email' ? 'envelope' : channel === 'InApp' ? 'app-indicator' : 'chat-dots'} me-2`}></i>
                          {channel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>Scheduled Delivery</label>
                    <input
                      className="form-control border-0 bg-light rounded-pill px-4 shadow-inner"
                      type="datetime-local"
                      value={form.scheduleAt}
                      onChange={(e) => updateForm("scheduleAt", e.target.value)}
                      style={{ height: '45px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div className="d-grid gap-2 pt-3">
                  <button className="btn btn-primary rounded-pill fw-bold shadow-sm py-2" disabled={submitting} onClick={submitNow}>
                    {submitting ? 'Transmitting...' : <><i className="bi bi-send-fill me-2"></i>Execute Now</>}
                  </button>
                  <button className="btn btn-outline-primary rounded-pill fw-bold py-2" disabled={submitting} onClick={submitSchedule}>
                    <i className="bi bi-clock-fill me-2"></i>Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Broadcast History Section ── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4 d-sm-flex align-items-center justify-content-between gap-3">
            <h5 className="mb-0 fw-bold text-dark mb-3 mb-sm-0">Transmission History</h5>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select border-0 bg-light rounded-pill px-4 shadow-sm"
                style={{ width: '160px', height: '40px', fontSize: '0.85rem', fontWeight: 600 }}
                value={filters.status}
                onChange={(e) => { setFilters(p => ({ ...p, status: e.target.value })); setPageNumber(1); }}
              >
                <option value="">All Status</option>
                <option value="Sent">Sent</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                className="form-select border-0 bg-light rounded-pill px-4 shadow-sm"
                style={{ width: '160px', height: '40px', fontSize: '0.85rem', fontWeight: 600 }}
                value={filters.type}
                onChange={(e) => { setFilters(p => ({ ...p, type: e.target.value })); setPageNumber(1); }}
              >
                <option value="">All Channels</option>
                {channelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="py-5 text-center">
                <LoadingIndicator text="Syncing history..." />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table pe-table mb-0 align-middle">
                  <thead className="bg-primary bg-opacity-10 text-primary fw-bold small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3 border-0">Announcement</th>
                      <th className="py-3 border-0">Target Audience</th>
                      <th className="py-3 border-0 text-center">Channels</th>
                      <th className="py-3 border-0 text-center">Status</th>
                      <th className="py-3 border-0 text-end pe-4">Timestamps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listData.items || []).length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-5 text-muted">No transmission logs found.</td></tr>
                    ) : (
                      (listData.items || []).map((item) => (
                        <tr key={item.id} className="transition-all border-bottom">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-dark" style={{ letterSpacing: '-0.2px' }}>{item.title}</div>
                            <div className="text-muted small truncate-1" style={{ maxWidth: '300px' }}>{item.content}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-3 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                              <i className="bi bi-people me-1"></i>{item.userRole || "All Users"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="text-primary fw-bold small"><i className="bi bi-broadcast me-1"></i>{item.type}</span>
                          </td>
                          <td className="text-center">
                            <span className={`badge rounded-pill px-3 py-1 ${
                              item.status === 'Sent' ? 'bg-success-subtle text-success border border-success-subtle' :
                              item.status === 'Scheduled' ? 'bg-info-subtle text-info border border-info-subtle' :
                              'bg-warning-subtle text-warning border border-warning-subtle'
                            }`} style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                              {item.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="text-dark small fw-medium">{item.status === 'Scheduled' ? formatDate(item.scheduledAt) : formatDate(item.sentAt)}</div>
                            <div className="text-muted x-small">Created: {formatDate(item.createdAt).split(',')[0]}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* ── Pagination ── */}
            <div className="px-4 py-3 bg-light border-top d-flex justify-content-between align-items-center">
              <span className="text-muted small">Record Count: <strong className="text-dark">{listData.totalCount || 0}</strong></span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(p => p - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="align-self-center small fw-bold mx-2">
                  {pageNumber} / {listData.totalPages || 1}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                  disabled={pageNumber >= (listData.totalPages || 1)}
                  onClick={() => setPageNumber(p => p + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .x-small { font-size: 0.7rem; }
        .fw-extrabold { font-weight: 800; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
      `}</style>
    </div>
  );
}

