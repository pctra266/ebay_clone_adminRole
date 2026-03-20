import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import financeService from '../services/financeService';
import './PayoutEnginePage.css';

// ─── Helper ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        Success: 'badge-success',
        Failed: 'badge-failed',
        Hold: 'badge-hold',
        Processing: 'badge-processing',
        Released: 'badge-released',
    };
    return <span className={`pe-badge ${map[status] || 'badge-default'}`}>{status}</span>;
};

const formatUSD = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const formatDate = (d) => new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

// ─── Component ───────────────────────────────────────────────────────────────
export default function PayoutEnginePage() {
    const [history, setHistory] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [config, setConfig] = useState({ frequency: 'Daily', minimumThreshold: 10, scheduledHourUtc: 2, isEnabled: true });
    const [groupBy, setGroupBy] = useState('day');
    const [runResult, setRunResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [releasingId, setReleasingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4500);
    };

    const loadData = useCallback(async () => {
        try {
            const [hist, exc, cfg] = await Promise.all([
                financeService.getPayoutHistory(groupBy),
                financeService.getPayoutExceptions(),
                financeService.getPayoutConfig(),
            ]);
            setHistory(hist || []);
            setExceptions(exc || []);
            if (cfg) setConfig(cfg);
        } catch {
            showToast('Failed to load payout data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [groupBy]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Stats from history ────────────────────────────────────────────────────
    const totalDisbursed = history.reduce((s, r) => s + (r.totalAmount || 0), 0);
    const totalTx = history.reduce((s, r) => s + (r.count || 0), 0);
    const exFailed = exceptions.filter(e => e.status === 'Failed').length;
    const exHold = exceptions.filter(e => e.status === 'Hold').length;

    // ── Force Run ─────────────────────────────────────────────────────────────
    const handleForceRun = async () => {
        setIsRunning(true);
        setRunResult(null);
        try {
            const res = await financeService.runPayoutEngine();
            setRunResult(res);
            showToast(
                `Run complete → ${res.success} Success | ${res.failed} Failed | ${res.onHold} Hold`,
                'success'
            );
            await loadData();
        } catch {
            showToast('Payout engine run failed. Check server logs.', 'error');
        } finally {
            setIsRunning(false);
        }
    };

    // ── Release Hold ──────────────────────────────────────────────────────────
    const handleRelease = async (id) => {
        setReleasingId(id);
        try {
            await financeService.releaseHold(id);
            showToast(`Payout #${id} released. It will be retried on next run.`, 'success');
            await loadData();
        } catch {
            showToast('Release failed. Transaction may no longer be in Hold state.', 'error');
        } finally {
            setReleasingId(null);
        }
    };

    // ── Save Config ───────────────────────────────────────────────────────────
    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await financeService.updatePayoutConfig(config);
            showToast('Configuration saved successfully.', 'success');
        } catch {
            showToast('Failed to save configuration.', 'error');
        } finally {
            setIsSavingConfig(false);
        }
    };

    return (
        <div className="pe-container">
            {/* ── Toast ────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`pe-toast pe-toast--${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                </div>
            )}

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="pe-header">
                <div className="pe-header-left">
                    <div className="pe-header-icon">⚡</div>
                    <div>
                        <h1 className="pe-title">Automated Payout Engine</h1>
                        <p className="pe-subtitle">Monitor and control automated seller payouts</p>
                    </div>
                </div>
                <button
                    id="force-run-btn"
                    className="pe-btn pe-btn--primary"
                    onClick={handleForceRun}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <><span className="pe-spinner" /> Running…</>
                    ) : (
                        <><span>▶</span> Force Run</>
                    )}
                </button>
            </div>

            {/* ── Last Run Result Banner ────────────────────────────────────── */}
            {runResult && (
                <div className="pe-run-result">
                    <div className="pe-run-result__grid">
                        <div className="pe-run-stat pe-run-stat--success">
                            <span className="pe-run-num">{runResult.success}</span>
                            <span className="pe-run-label">Success</span>
                        </div>
                        <div className="pe-run-stat pe-run-stat--failed">
                            <span className="pe-run-num">{runResult.failed}</span>
                            <span className="pe-run-label">Failed</span>
                        </div>
                        <div className="pe-run-stat pe-run-stat--hold">
                            <span className="pe-run-num">{runResult.onHold}</span>
                            <span className="pe-run-label">On Hold</span>
                        </div>
                        <div className="pe-run-stat pe-run-stat--skip">
                            <span className="pe-run-num">{runResult.skipped}</span>
                            <span className="pe-run-label">Skipped</span>
                        </div>
                        <div className="pe-run-stat pe-run-stat--disburse">
                            <span className="pe-run-num">{formatUSD(runResult.totalDisbursed)}</span>
                            <span className="pe-run-label">Disbursed</span>
                        </div>
                    </div>
                    <div className="pe-run-session">Session: {runResult.sessionId}</div>
                </div>
            )}

            {/* ── Stats Cards ───────────────────────────────────────────────── */}
            <div className="pe-stats">
                <div className="pe-stat-card pe-stat-card--green">
                    <div className="pe-stat-icon">💰</div>
                    <div>
                        <div className="pe-stat-value">{formatUSD(totalDisbursed)}</div>
                        <div className="pe-stat-label">Total Disbursed (All Time)</div>
                    </div>
                </div>
                <div className="pe-stat-card pe-stat-card--blue">
                    <div className="pe-stat-icon">📋</div>
                    <div>
                        <div className="pe-stat-value">{totalTx}</div>
                        <div className="pe-stat-label">Successful Payouts</div>
                    </div>
                </div>
                <div className="pe-stat-card pe-stat-card--red">
                    <div className="pe-stat-icon">❌</div>
                    <div>
                        <div className="pe-stat-value">{exFailed}</div>
                        <div className="pe-stat-label">Failed (Unresolved)</div>
                    </div>
                </div>
                <div className="pe-stat-card pe-stat-card--amber">
                    <div className="pe-stat-icon">⏸</div>
                    <div>
                        <div className="pe-stat-value">{exHold}</div>
                        <div className="pe-stat-label">On Hold (Dispute)</div>
                    </div>
                </div>
            </div>

            <div className="pe-main-grid">
                {/* ── Payout History Chart ──────────────────────────────────── */}
                <div className="pe-card pe-card--chart">
                    <div className="pe-card-header">
                        <h2 className="pe-card-title">📈 Payout History</h2>
                        <div className="pe-toggle-group">
                            <button
                                id="group-by-day"
                                className={`pe-toggle ${groupBy === 'day' ? 'active' : ''}`}
                                onClick={() => setGroupBy('day')}
                            >Day</button>
                            <button
                                id="group-by-month"
                                className={`pe-toggle ${groupBy === 'month' ? 'active' : ''}`}
                                onClick={() => setGroupBy('month')}
                            >Month</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="pe-loading">Loading chart…</div>
                    ) : history.length === 0 ? (
                        <div className="pe-empty">No successful payouts recorded yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={history} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                                <XAxis dataKey="label" tick={{ fill: '#8b8fa8', fontSize: 12 }} />
                                <YAxis
                                    tick={{ fill: '#8b8fa8', fontSize: 12 }}
                                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid #7c3aed', borderRadius: 8 }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                    formatter={(v) => [formatUSD(v), 'Disbursed']}
                                />
                                <Legend wrapperStyle={{ color: '#8b8fa8' }} />
                                <Bar
                                    dataKey="totalAmount"
                                    name="Disbursed (USD)"
                                    fill="#7c3aed"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Config Panel ──────────────────────────────────────────── */}
                <div className="pe-card pe-card--config">
                    <h2 className="pe-card-title">⚙️ Engine Configuration</h2>
                    <div className="pe-config-form">
                        <label className="pe-label">
                            Status
                            <div className="pe-toggle-switch-wrapper">
                                <input
                                    id="config-enabled"
                                    type="checkbox"
                                    className="pe-toggle-switch"
                                    checked={config.isEnabled}
                                    onChange={e => setConfig(c => ({ ...c, isEnabled: e.target.checked }))}
                                />
                                <span className={`pe-engine-status ${config.isEnabled ? 'enabled' : 'disabled'}`}>
                                    {config.isEnabled ? '● Active' : '● Paused'}
                                </span>
                            </div>
                        </label>

                        <label className="pe-label">
                            Frequency
                            <select
                                id="config-frequency"
                                className="pe-select"
                                value={config.frequency}
                                onChange={e => setConfig(c => ({ ...c, frequency: e.target.value }))}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                            </select>
                        </label>

                        <label className="pe-label">
                            Minimum Threshold (USD)
                            <input
                                id="config-threshold"
                                type="number"
                                className="pe-input"
                                min={0}
                                step={1}
                                value={config.minimumThreshold}
                                onChange={e => setConfig(c => ({ ...c, minimumThreshold: parseFloat(e.target.value) }))}
                            />
                        </label>

                        <label className="pe-label">
                            Scheduled Hour (UTC)
                            <input
                                id="config-hour"
                                type="number"
                                className="pe-input"
                                min={0}
                                max={23}
                                value={config.scheduledHourUtc}
                                onChange={e => setConfig(c => ({ ...c, scheduledHourUtc: parseInt(e.target.value) }))}
                            />
                        </label>

                        <button
                            id="save-config-btn"
                            className="pe-btn pe-btn--secondary"
                            onClick={handleSaveConfig}
                            disabled={isSavingConfig}
                        >
                            {isSavingConfig ? 'Saving…' : '💾 Save Config'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Exceptions Table ──────────────────────────────────────────── */}
            <div className="pe-card">
                <div className="pe-card-header">
                    <h2 className="pe-card-title">🚨 Exceptions — Failed & Hold</h2>
                    <span className="pe-badge badge-failed">{exceptions.length} items</span>
                </div>

                {loading ? (
                    <div className="pe-loading">Loading exceptions…</div>
                ) : exceptions.length === 0 ? (
                    <div className="pe-empty">🎉 No exceptions. All payouts processed successfully.</div>
                ) : (
                    <div className="pe-table-wrapper">
                        <table className="pe-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Seller</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Error / Reason</th>
                                <th>Session</th>
                                <th>Created At</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {exceptions.map(ex => (
                                <tr key={ex.id}>
                                    <td className="pe-td-mono">#{ex.id}</td>
                                    <td>
                                        <span className="pe-seller-name">{ex.sellerUsername || '—'}</span>
                                        <span className="pe-seller-id"> #{ex.sellerId}</span>
                                    </td>
                                    <td className="pe-td-amount">{formatUSD(ex.amount)}</td>
                                    <td><StatusBadge status={ex.status} /></td>
                                    <td className="pe-td-error">{ex.errorLog || '—'}</td>
                                    <td className="pe-td-mono">{ex.sessionId ? ex.sessionId.substring(0, 10) : '—'}</td>
                                    <td>{formatDate(ex.createdAt)}</td>
                                    <td>
                                        {(ex.status === 'Hold' || ex.status === 'Failed') && (
                                            <button
                                                id={`release-hold-${ex.id}`}
                                                className="pe-btn pe-btn--release"
                                                onClick={() => handleRelease(ex.id)}
                                                disabled={releasingId === ex.id}
                                            >
                                                {releasingId === ex.id ? '…' : '🔓 Release'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
