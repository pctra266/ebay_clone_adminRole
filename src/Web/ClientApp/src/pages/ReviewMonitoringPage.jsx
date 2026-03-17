import React, { useState, useEffect } from 'react';
import './ReviewMonitoring.css';
import axios from 'axios';
import { reviewsService } from '../services/reviewsService';

export const ReviewMonitoringPage = () => {
    const [stats, setStats] = useState(null);
    const [flaggedReviews, setFlaggedReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await axios.get('/api/stats/dashboard');
            setStats(statsRes.data);

            const reviewsData = await reviewsService.getFlaggedReviews();
            setFlaggedReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, action) => {
        try {
            await reviewsService.updateReviewStatus(id, { status, action, adminId: 1 });
            fetchData();
        } catch (error) {
            console.error("Error updating review:", error);
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
                                        <span className="badge warning">
                                            {review.flagReason || (review.rating === 1 ? '1 sao' : 'Hệ thống quét')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-hide"
                                                onClick={() => handleAction(review.id, 'Hidden', 'Hide')}
                                                disabled={review.status === 'Hidden'}
                                            >
                                                Ẩn
                                            </button>
                                            <button 
                                                className="btn btn-skip"
                                                onClick={() => handleAction(review.id, 'Visible', 'Keep')}
                                                disabled={review.status === 'Visible'}
                                            >
                                                Bỏ qua
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};
