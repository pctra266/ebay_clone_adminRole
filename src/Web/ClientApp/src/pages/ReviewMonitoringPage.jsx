import React, { useState, useEffect } from 'react';
import './ReviewMonitoring.css';
import axios from 'axios';
import { reviewsService } from '../services/reviewsService';

export const ReviewMonitoringPage = () => {
    const [stats, setStats] = useState(null);
    const [flaggedReviews, setFlaggedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, hasNextPage: false, hasPreviousPage: false });
    const [actionLoading, setActionLoading] = useState({}); // { id: true/false }

    useEffect(() => {
        fetchData(pageNumber);
    }, [pageNumber]);

    const fetchData = async (page) => {
        setLoading(true);
        try {
            const statsRes = await axios.get('/api/stats/dashboard');
            setStats(statsRes.data);

            const response = await reviewsService.getFlaggedReviews(page);
            setFlaggedReviews(response.items);
            setPagination({
                totalPages: response.totalPages,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, action) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await reviewsService.updateReviewStatus(id, { status, action, adminId: 1 });
            fetchData(pageNumber);
        } catch (error) {
            console.error("Error updating review:", error);
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="review-monitoring-container">
            <header className="page-header">
                <h1>Giám sát đánh giá & Thống kê</h1>
                <p>Theo dõi các đánh giá bị gắn cờ và hiệu suất của sàn</p>
            </header>

            <section className="stats-grid">
                <div className="stat-card revenue">
                    <h3>Doanh thu</h3>
                    <div className="stat-values">
                        <div className="stat-item">
                            <span>Hôm nay</span>
                            <strong>${stats?.dailyRevenue.toLocaleString()}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Tháng này</span>
                            <strong>${stats?.monthlyRevenue.toLocaleString()}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Quý này</span>
                            <strong>${stats?.quarterlyRevenue.toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className="stat-icon">💰</div>
                </div>

                <div className="stat-card users">
                    <h3>Người dùng</h3>
                    <div className="stat-values">
                        <div className="stat-item">
                            <span>Tổng số</span>
                            <strong>{stats?.totalUsers}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Mới (tháng này)</span>
                            <strong>+{stats?.newUsersThisMonth}</strong>
                        </div>
                    </div>
                    <div className="stat-icon">👥</div>
                </div>
            </section>

            <section className="reviews-section">
                <h2>Đánh giá cần xử lý</h2>
                <div className="table-wrapper">
                    <table className="review-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Sản phẩm</th>
                                <th>Đánh giá</th>
                                <th>Lý do gắn cờ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flaggedReviews.map(review => (
                                <tr key={review.id} className={review.status === 'Hidden' ? 'row-hidden' : ''}>
                                    <td>
                                        <div className="user-info">
                                            <strong>{review.reviewerName}</strong>
                                            <span>ID: {review.reviewerId}</span>
                                        </div>
                                    </td>
                                    <td>{review.productTitle}</td>
                                    <td>
                                        <div className="rating">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                                            ))}
                                        </div>
                                        <p className="comment">{review.comment}</p>
                                    </td>
                                    <td>
                                        {review.reportedBySeller && (
                                            <div className="seller-report" style={{ marginBottom: '10px', borderBottom: '1px dashed #ddd', paddingBottom: '5px' }}>
                                                <span className="badge danger">Seller Reported</span>
                                                <p style={{ fontSize: '12px', margin: '5px 0', fontStyle: 'italic' }}>"{review.sellerReportReason}"</p>
                                            </div>
                                        )}
                                        {review.reports && review.reports.length > 0 && (
                                            <div className="community-reports" style={{ marginBottom: '5px' }}>
                                                {review.reports.map(rep => (
                                                    <div key={rep.id} style={{ fontSize: '12px', marginBottom: '8px', padding: '5px', background: '#f5f5f5', borderRadius: '4px' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#666' }}>{rep.reporterName}: </span>
                                                        <span className="badge warning" style={{ fontSize: '10px' }}>{rep.reason}</span>
                                                        {rep.description && <p style={{ margin: '3px 0 0 0', color: '#333' }}>{rep.description}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {(!review.reportedBySeller && (!review.reports || review.reports.length === 0)) && (
                                            <span className="badge warning">
                                                {review.flagReason || (review.rating === 1 ? '1 sao' : 'Hệ thống quét')}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-hide"
                                                onClick={() => handleAction(review.id, 'Hidden', 'Hide')}
                                                disabled={review.status === 'Hidden' || actionLoading[review.id]}
                                            >
                                                {actionLoading[review.id] ? <span className="spinner-small"></span> : 'Ẩn'}
                                            </button>
                                            <button 
                                                className="btn btn-skip"
                                                onClick={() => handleAction(review.id, 'Visible', 'Keep')}
                                                disabled={review.status === 'Visible' || actionLoading[review.id]}
                                            >
                                                {actionLoading[review.id] ? <span className="spinner-small"></span> : 'Bỏ qua'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button 
                        disabled={!pagination.hasPreviousPage} 
                        onClick={() => setPageNumber(prev => prev - 1)}
                        className="btn-page"
                    >
                        Trước
                    </button>
                    <span className="page-info">Trang {pageNumber} / {pagination.totalPages}</span>
                    <button 
                        disabled={!pagination.hasNextPage} 
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className="btn-page"
                    >
                        Sau
                    </button>
                </div>
            </section>
        </div>
    );
};
