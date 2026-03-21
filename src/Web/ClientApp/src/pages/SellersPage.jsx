import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import financeService from '../services/financeService';
import { apiRequest } from '../services/httpClient';
import { ToastMessage } from '../components/ToastMessage';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export const SellersPage = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [rtIndicator, setRtIndicator] = useState(false); // flashes when real-time update arrives
    
    // Frontend Pagination and Search State
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [modal, setModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);

    const toggleModal = (seller = null) => {
        setSelectedSeller(seller);
        setModal(!modal);
    };

    // ── Real-time: connect to SellerHub ──────────────────────────────────────
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('/hubs/sellers')
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        connection.start()
            .then(() => {
                console.log('[SellerHub] Connected ✓');

                connection.on('UpdateSellerWallet', (data) => {
                    console.log('[SellerHub] Wallet update:', data);
                    setWallets(prev => prev.map(w =>
                        w.sellerId === data.sellerId
                            ? { ...w, availableBalance: data.availableBalance, pendingBalance: data.pendingBalance, totalWithdrawn: data.totalWithdrawn }
                            : w
                    ));
                    // Flash the indicator briefly
                    setRtIndicator(true);
                    setTimeout(() => setRtIndicator(false), 1500);
                });
            })
            .catch(err => console.error('[SellerHub] Connection failed:', err));

        return () => { connection.stop(); };
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        try {
            setLoading(true);
            const [walletData, metricsData] = await Promise.all([
                financeService.getSellerWallets(),
                apiRequest('/api/Users/seller-metrics')
            ]);
            
            const metrics = metricsData.items || metricsData;
            
            // Merge data
            const merged = walletData.map(w => {
                const metric = metrics.find(m => m.id === w.sellerId);
                return {
                    ...w,
                    sellerLevel: metric?.sellerLevel || 'BelowStandard',
                    status: metric?.status || 'Unknown',
                    transactionCount: metric?.transactionCount || 0,
                    totalSales: metric?.totalSales || 0,
                    unresolvedCases: metric?.unresolvedCases || 0,
                    defectRate: metric?.defectRate || 0,
                    lateRate: metric?.lateRate || 0
                };
            });

            setWallets(merged);
        } catch (error) {
            setToast({ message: 'Failed to load seller data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Derived Data: Filtering
    const filteredWallets = useMemo(() => {
        if (!search.trim()) return wallets;
        const s = search.toLowerCase();
        return wallets.filter(w => 
            (w.sellerName && w.sellerName.toLowerCase().includes(s)) ||
            (w.sellerId.toString().includes(s))
        );
    }, [wallets, search]);

    // Derived Data: Pagination
    const paginatedWallets = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredWallets.slice(start, start + pageSize);
    }, [filteredWallets, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredWallets.length / pageSize);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const renderLevelBadge = (wallet) => {
        const level = wallet.sellerLevel;
        let badgeClass = "bg-danger";
        let label = "Below Standard";

        if (level === 'TopRated') {
            badgeClass = "bg-success";
            label = "Top Rated";
        } else if (level === 'AboveStandard') {
            badgeClass = "bg-warning text-dark";
            label = "Above Standard";
        }

        return (
            <span 
                className={`badge ${badgeClass} cursor-pointer`} 
                onClick={() => toggleModal(wallet)}
                style={{ cursor: 'pointer' }}
                title="Click to view performance statistics"
            >
                {label}
            </span>
        );
    };

    return (
        <div className="container-fluid py-4">
            <ToastMessage 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Sellers Overview & Performance</h5>
                    <div className="d-flex gap-2">
                        <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0 ps-0" 
                                placeholder="Search sellers..." 
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                            />
                        </div>
                        <Button color="primary" size="sm" onClick={() => loadWallets()} className="rounded-pill px-3">
                            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                        </Button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Seller</th>
                                <th>Level</th>
                                <th>Status</th>
                                <th>Detail</th>
                                <th className="text-end">Pending</th>
                                <th className="text-end">Available</th>
                                <th className="text-end pe-4">Total Withdrawn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><LoadingIndicator text="Loading sellers data..." /></td></tr>
                            ) : paginatedWallets.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No sellers found</td></tr>
                            ) : paginatedWallets.map(wallet => (
                                <tr key={wallet.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{wallet.sellerName}</div>
                                        <small className="text-muted">UID: {wallet.sellerId}</small>
                                    </td>
                                    <td>{renderLevelBadge(wallet)}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${wallet.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                            {wallet.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/users/${wallet.sellerId}`} className="btn btn-link btn-sm p-0 text-decoration-none">
                                            View History
                                        </Link>
                                    </td>
                                    <td className="text-end">
                                        <Link to={`/sellers/pending/${wallet.sellerId}`} className="text-warning text-decoration-none fw-medium">
                                            {formatCurrency(wallet.pendingBalance)}
                                        </Link>
                                    </td>
                                    <td className="text-end text-success fw-bold">{formatCurrency(wallet.availableBalance)}</td>
                                    <td className="text-end text-muted pe-4">{formatCurrency(wallet.totalWithdrawn)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Frontend Pagination Controls */}
                {!loading && filteredWallets.length > 0 && (
                    <div className="card-footer bg-white py-3 border-top-0 d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredWallets.length)} of {filteredWallets.length} sellers
                        </div>
                        <div className="d-flex gap-2">
                            <Button 
                                color="outline-secondary" 
                                size="sm" 
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="rounded-pill px-3"
                            >
                                <i className="bi bi-chevron-left me-1"></i> Previous
                            </Button>
                            <div className="align-self-center px-3 small border-start border-end">
                                Page <strong>{currentPage}</strong> of {totalPages || 1}
                            </div>
                            <Button 
                                color="outline-secondary" 
                                size="sm" 
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="rounded-pill px-3"
                            >
                                Next <i className="bi bi-chevron-right ms-1"></i>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Performance Statistics Modal */}
            <Modal isOpen={modal} toggle={() => toggleModal()} centered size="md">
                <ModalHeader toggle={() => toggleModal()} className="border-0 pb-0">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-graph-up-arrow me-3 text-primary h4 mb-0"></i>
                        <div>
                            <h5 className="mb-0 fw-bold">Performance Metrics</h5>
                            <small className="text-muted">{selectedSeller?.sellerName}</small>
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody className="py-4">
                    {selectedSeller && (
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-4 text-center h-100">
                                    <div className="text-secondary small mb-1">Transactions</div>
                                    <div className="h4 mb-0 fw-bold">{selectedSeller.transactionCount}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-4 text-center h-100">
                                    <div className="text-secondary small mb-1">Sales Vol.</div>
                                    <div className="h5 mb-0 fw-bold text-truncate">{formatCurrency(selectedSeller.totalSales)}</div>
                                </div>
                            </div>
                            <div className="col-12">
                                <hr className="my-2 opacity-25" />
                            </div>
                            <div className="col-4">
                                <div className="text-center">
                                    <div className="text-secondary x-small mb-1">Unresolved</div>
                                    <div className={`fw-bold ${selectedSeller.unresolvedCases > 0 ? 'text-danger' : 'text-success'}`}>
                                        {selectedSeller.unresolvedCases}
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="text-center border-start border-end">
                                    <div className="text-secondary x-small mb-1">Defect Rate</div>
                                    <div className={`fw-bold ${(selectedSeller.defectRate > 0.05) ? 'text-danger' : 'text-success'}`}>
                                        {(selectedSeller.defectRate * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="text-center">
                                    <div className="text-secondary x-small mb-1">Late Rate</div>
                                    <div className={`fw-bold ${(selectedSeller.lateRate > 0.1) ? 'text-danger' : 'text-success'}`}>
                                        {(selectedSeller.lateRate * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="border-0 pt-0">
                    <Button color="light" onClick={() => toggleModal()} className="rounded-pill px-4">Close</Button>
                </ModalFooter>
                <style>{`
                    .x-small { font-size: 0.75rem; }
                    .bg-success-subtle { background-color: #d1e7dd !important; }
                    .bg-secondary-subtle { background-color: #e2e3e5 !important; }
                `}</style>
            </Modal>
        </div>
    );
};
