import React, { useState, useEffect } from 'react';
import financeService from '../services/financeService';
import { ToastMessage } from '../components/ToastMessage';

export const WithdrawalsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [confirming, setConfirming] = useState(null); // { id, type: 'approve' | 'reject' }
    const [transactionId, setTransactionId] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await financeService.getWithdrawalRequests(filter);
            setRequests(data);
        } catch (error) {
            setToast({ message: 'Failed to load requests', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!confirming) return;
        const { id, type } = confirming;

        try {
            if (type === 'approve') {
                await financeService.approveWithdrawal(id, transactionId);
                setToast({ message: 'Withdrawal approved successfully', type: 'success' });
            } else {
                await financeService.rejectWithdrawal(id, rejectionReason);
                setToast({ message: 'Withdrawal rejected', type: 'warning' });
            }
            setConfirming(null);
            setTransactionId('');
            setRejectionReason('');
            loadRequests();
        } catch (error) {
            setToast({ message: 'Action failed', type: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="badge bg-warning text-dark">Pending</span>;
            case 'Approved': return <span className="badge bg-success">Approved</span>;
            case 'Rejected': return <span className="badge bg-danger">Rejected</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">
            <ToastMessage 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3">Withdrawal Requests</h1>
                <div className="btn-group">
                    <button className={`btn btn-outline-primary ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
                    <button className={`btn btn-outline-primary ${filter === 'Approved' ? 'active' : ''}`} onClick={() => setFilter('Approved')}>Approved</button>
                    <button className={`btn btn-outline-primary ${filter === 'Rejected' ? 'active' : ''}`} onClick={() => setFilter('Rejected')}>Rejected</button>
                    <button className={`btn btn-outline-primary ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Seller</th>
                                <th>Amount</th>
                                <th>Bank Details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading requests...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No requests found</td></tr>
                            ) : requests.map(req => (
                                <tr key={req.id}>
                                    <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                                    <td>{req.sellerName}</td>
                                    <td className="fw-bold">{formatCurrency(req.amount)}</td>
                                    <td>
                                        <small>
                                            <strong>{req.bankName}</strong><br/>
                                            {req.bankAccountNumber} - {req.bankAccountName}
                                        </small>
                                    </td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                        {req.status === 'Pending' && (
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-success" onClick={() => setConfirming({ id: req.id, type: 'approve' })}>Approve</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirming({ id: req.id, type: 'reject' })}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal-like overlay for actions */}
            {confirming && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{confirming.type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}</h5>
                                <button type="button" className="btn-close" onClick={() => setConfirming(null)}></button>
                            </div>
                            <div className="modal-body">
                                {confirming.type === 'approve' ? (
                                    <div className="mb-3">
                                        <label className="form-label">Transaction ID (optional)</label>
                                        <input type="text" className="form-control" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter banking ref..." />
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label">Reason for Rejection</label>
                                        <textarea className="form-control" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Why is this being rejected?" />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setConfirming(null)}>Cancel</button>
                                <button className={`btn ${confirming.type === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction}>
                                    Confirm {confirming.type}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
