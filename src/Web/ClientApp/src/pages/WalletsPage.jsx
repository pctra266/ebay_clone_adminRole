import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import financeService from '../services/financeService';
import { ToastMessage } from '../components/ToastMessage';

export const WalletsPage = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await financeService.getSellerWallets();
            setWallets(data);
        } catch (error) {
            setToast({ message: 'Failed to load wallets', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async () => {
        try {
            const count = await financeService.settleFunds();
            setToast({ message: `Successfully settled ${count} orders`, type: 'success' });
            loadWallets();
        } catch (error) {
            setToast({ message: 'Settlement failed', type: 'error' });
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
                <h1 className="h3">Seller Wallets</h1>
                <button className="btn btn-warning" onClick={handleSettle}>
                    <i className="fas fa-sync-alt me-2"></i> Trigger Settlement
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Seller</th>
                                <th className="text-end">Pending</th>
                                <th className="text-end">Available</th>
                                <th className="text-end">Locked</th>
                                <th className="text-end">Total Earnings</th>
                                <th className="text-end">Total Withdrawn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading wallets...</td></tr>
                            ) : wallets.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No wallets found</td></tr>
                            ) : wallets.map(wallet => (
                                <tr key={wallet.id}>
                                    <td>
                                        <div className="fw-bold">{wallet.sellerName}</div>
                                        <small className="text-muted">ID: {wallet.sellerId}</small>
                                    </td>
                                    <td className="text-end">
                                        <Link to={`/wallets/pending/${wallet.sellerId}`} className="text-warning text-decoration-none">
                                            {formatCurrency(wallet.pendingBalance)}
                                            <i className="fas fa-external-link-alt ms-1 small"></i>
                                        </Link>
                                    </td>
                                    <td className="text-end text-success fw-bold">{formatCurrency(wallet.availableBalance)}</td>
                                    <td className="text-end text-danger">{formatCurrency(wallet.lockedBalance)}</td>
                                    <td className="text-end">{formatCurrency(wallet.totalEarnings)}</td>
                                    <td className="text-end text-muted">{formatCurrency(wallet.totalWithdrawn)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
