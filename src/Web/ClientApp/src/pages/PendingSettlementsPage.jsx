import React, { useState, useEffect } from 'react';
import financeService from '../services/financeService';
import { ToastMessage } from '../components/ToastMessage';

export const PendingSettlementsPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await financeService.getPendingSettlementOrders();
            setOrders(data);
        } catch (error) {
            setToast({ message: 'Failed to load pending settlements', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSettleOrder = async (orderId) => {
        try {
            setProcessingId(orderId);
            await financeService.settleOrder(orderId);
            setToast({ message: `Order #${orderId} settled successfully`, type: 'success' });
            loadOrders();
        } catch (error) {
            setToast({ message: `Failed to settle order #${orderId}`, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="container-fluid py-4">
            <ToastMessage 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3">Pending Settlements</h1>
                <button className="btn btn-outline-secondary" onClick={loadOrders}>
                    <i className="fas fa-sync-alt me-2"></i> Refresh
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Buyer</th>
                                <th>Seller</th>
                                <th className="text-end">Total Price</th>
                                <th className="text-end">Seller Earnings</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-4">Loading pending settlements...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-4">No orders awaiting settlement</td></tr>
                            ) : orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{order.buyerName}</td>
                                    <td>{order.sellerName}</td>
                                    <td className="text-end">{formatCurrency(order.totalPrice)}</td>
                                    <td className="text-end fw-bold text-success">{formatCurrency(order.sellerEarnings)}</td>
                                    <td>
                                        <span className="badge bg-info">Delivered</span>
                                    </td>
                                    <td className="text-center">
                                        <button 
                                            className="btn btn-sm btn-primary" 
                                            onClick={() => handleSettleOrder(order.id)}
                                            disabled={processingId === order.id}
                                        >
                                            {processingId === order.id ? (
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                            ) : (
                                                <i className="fas fa-check-circle me-1"></i>
                                            )}
                                            Settle Now
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 alert alert-info shadow-sm border-0">
                <div className="d-flex">
                    <div className="me-3">
                        <i className="fas fa-info-circle fa-2x"></i>
                    </div>
                    <div>
                        <h5 className="alert-heading">About Settlements</h5>
                        <p className="mb-0">
                            Orders appear here once they are marked as <strong>Delivered</strong> and the dispute window has <strong>passed</strong>. 
                            Settling an order moves the funds from the seller's <em>Pending Balance</em> to <em>Available Balance</em>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
