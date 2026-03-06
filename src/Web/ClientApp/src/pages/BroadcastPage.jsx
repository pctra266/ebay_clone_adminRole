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

  return (
    <section className="py-3">
      <h1 className="h3 mb-3">Broadcast Center</h1>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5">Create Broadcast</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="broadcast-title" className="form-label">Title</label>
              <input
                id="broadcast-title"
                className="form-control"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="broadcast-audience" className="form-label">Target Audience</label>
              <select
                id="broadcast-audience"
                className="form-select"
                value={form.targetAudience}
                onChange={(event) => updateForm("targetAudience", event.target.value)}
              >
                {audienceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {form.targetAudience === "Group" && (
              <div className="col-md-6">
                <label htmlFor="broadcast-group" className="form-label">Group Name</label>
                <input
                  id="broadcast-group"
                  className="form-control"
                  value={form.targetGroup}
                  onChange={(event) => updateForm("targetGroup", event.target.value)}
                />
              </div>
            )}
            <div className="col-12">
              <label htmlFor="broadcast-content" className="form-label">Content</label>
              <textarea
                id="broadcast-content"
                className="form-control"
                rows="4"
                value={form.content}
                onChange={(event) => updateForm("content", event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label d-block">Channels</label>
              {channelOptions.map((channel) => (
                <div className="form-check form-check-inline" key={channel}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`channel-${channel}`}
                    checked={form.channels.includes(channel)}
                    onChange={() => toggleChannel(channel)}
                  />
                  <label className="form-check-label" htmlFor={`channel-${channel}`}>
                    {channel}
                  </label>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              <label htmlFor="broadcast-schedule" className="form-label">Schedule At (optional)</label>
              <input
                id="broadcast-schedule"
                className="form-control"
                type="datetime-local"
                value={form.scheduleAt}
                onChange={(event) => updateForm("scheduleAt", event.target.value)}
              />
            </div>
            <div className="col-12 d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-primary" disabled={submitting} onClick={submitNow}>
                Send Now
              </button>
              <button type="button" className="btn btn-outline-primary" disabled={submitting} onClick={submitSchedule}>
                Schedule
              </button>
              <span className="align-self-center text-muted small">Created By Admin ID: {adminId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h5">Broadcast History</h2>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-4">
              <label htmlFor="filter-status" className="form-label">Status</label>
              <select
                id="filter-status"
                className="form-select"
                value={filters.status}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, status: event.target.value }));
                  setPageNumber(1);
                }}
              >
                <option value="">All</option>
                <option value="Sent">Sent</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="filter-type" className="form-label">Channel Type</label>
              <select
                id="filter-type"
                className="form-select"
                value={filters.type}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, type: event.target.value }));
                  setPageNumber(1);
                }}
              >
                <option value="">All</option>
                {channelOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingIndicator text="Loading broadcasts..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Audience</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Schedule</th>
                    <th>Sent</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {(listData.items || []).map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.userRole || "All"}</td>
                      <td>{item.type}</td>
                      <td>{item.status}</td>
                      <td>{formatDate(item.scheduledAt)}</td>
                      <td>{formatDate(item.sentAt)}</td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                  {(listData.items || []).length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No broadcast records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">Total: {listData.totalCount || 0}</small>
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
                Page {pageNumber} / {listData.totalPages || 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={pageNumber >= (listData.totalPages || 1)}
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

