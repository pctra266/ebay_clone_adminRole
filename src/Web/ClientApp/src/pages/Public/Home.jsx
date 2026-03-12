import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService'; // Đảm bảo đường dẫn đúng
import { reviewsService } from '../../services/reviewsService';

export const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State cho Report Modal ---
    const [reportingProductId, setReportingProductId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState({
        reason: 'Counterfeit Item',
        description: '',
        evidenceFiles: '',
        priority: 'Low'
    });

    // --- State cho Review Modal ---
    const [reviewingProductId, setReviewingProductId] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Tuỳ thuộc vào API thực tế, ở đây mình giả định hàm lấy danh sách
                const data = await productService.getAllProducts();
                // Nếu backend trả về phân trang, nhớ đổi thành data.items || data
                setProducts(data.items || data || []); 
            } catch (error) {
                console.error("Không thể tải dữ liệu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // --- Hàm mở Modal ---
    const handleOpenReport = (productId) => {
        setReportingProductId(productId);
        // Reset form mỗi khi mở pop-up mới
        setReportData({
            reason: 'Counterfeit Item',
            description: '',
            evidenceFiles: '',
            priority: 'Low'
        });
    };

    // --- Hàm đóng Modal ---
    const handleCloseReport = () => {
        setReportingProductId(null);
    };

    const handleOpenReview = (productId) => {
        setReviewingProductId(productId);
        setReviewData({ rating: 5, comment: '' });
    };

    const handleCloseReview = () => {
        setReviewingProductId(null);
    };

    // --- Hàm xử lý thay đổi input trong Form ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    // --- Hàm Submit Form Report ---
    const handleSubmitReport = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                productId: reportingProductId,
                reporterUserId: 1, // TODO: Thay bằng ID user đang đăng nhập thực tế từ Context/Redux
                reporterType: "User", // Hardcode theo yêu cầu BE
                reason: reportData.reason,
                description: reportData.description,
                // Chuyển string URL thành mảng JSON string cho khớp với 'string? EvidenceFiles' của C#
                evidenceFiles: reportData.evidenceFiles ? JSON.stringify([reportData.evidenceFiles]) : null,
                status: "Pending",
                priority: reportData.priority
            };

            // Gọi API bằng service bạn đã định nghĩa
            await productService.reportProduct(reportingProductId, payload);
            
            alert("Đã gửi báo cáo thành công!");
            handleCloseReport(); // Đóng modal sau khi gửi thành công
        } catch (error) {
            console.error(error);
            alert("Lỗi khi gửi báo cáo. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                productId: reviewingProductId,
                reviewerId: 1, // Mock user ID
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment
            };

            await reviewsService.createReview(payload);
            
            alert("Đã gửi đánh giá thành công! Đánh giá sẽ được kiểm duyệt nếu có nội dung nhạy cảm.");
            handleCloseReview();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi gửi đánh giá.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <p style={{ padding: 20 }}>Đang tải danh sách sản phẩm...</p>;
    }

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h2>Danh sách Sản Phẩm (Gọi bằng Axios Custom)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {products.length === 0 ? (
                    <li>Chưa có sản phẩm nào.</li>
                ) : (
                    products.map((product) => (
                        <li key={product.id} style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 500 }}>
                            <span>
                                <strong>{product.title}</strong> - Giá: {product.price}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => handleOpenReview(product.id)}
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                                >
                                    Đánh giá
                                </button>
                                <button 
                                    onClick={() => handleOpenReport(product.id)}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                                >
                                    Report
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            {/* --- REPORT MODAL --- */}
            {reportingProductId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', padding: '24px', borderRadius: '8px', 
                        width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Báo cáo sản phẩm #{reportingProductId}</h3>
                        
                        <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            
                            {/* Lý do báo cáo */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Lý do vi phạm</label>
                                <select 
                                    name="reason" 
                                    value={reportData.reason} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Counterfeit Item">Hàng giả / Nhái</option>
                                    <option value="Inappropriate Content">Nội dung không phù hợp</option>
                                    <option value="Prohibited Item">Hàng cấm</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            {/* Mô tả chi tiết */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Mô tả chi tiết</label>
                                <textarea 
                                    name="description" 
                                    value={reportData.description} 
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Vui lòng cung cấp thêm thông tin..."
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                />
                            </div>

                            {/* Bằng chứng */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Link bằng chứng (Tuỳ chọn)</label>
                                <input 
                                    type="text" 
                                    name="evidenceFiles" 
                                    value={reportData.evidenceFiles} 
                                    onChange={handleInputChange}
                                    placeholder="https://imgur.com/your-image"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>

                            {/* Mức độ ưu tiên */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Mức độ ưu tiên</label>
                                <select 
                                    name="priority" 
                                    value={reportData.priority} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Low">Thấp</option>
                                    <option value="High">Cao</option>
                                </select>
                                <span style={{ fontSize: '11px', color: '#666' }}>*VeRO (chủ sở hữu bản quyền) sẽ luôn là Critical từ hệ thống.</span>
                            </div>

                            {/* Nút hành động */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleCloseReport} 
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#f9fafb', cursor: 'pointer' }}
                                >
                                    Huỷ
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- REVIEW MODAL --- */}
            {reviewingProductId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', padding: '24px', borderRadius: '12px', 
                        width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#1a1a1a' }}>Đánh giá sản phẩm #{reviewingProductId}</h3>
                        
                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Số sao</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                            style={{
                                                background: 'none', border: 'none', fontSize: '24px', 
                                                color: star <= reviewData.rating ? '#ffc107' : '#ddd',
                                                cursor: 'pointer', padding: 0
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Nhận xét của bạn</label>
                                <textarea 
                                    value={reviewData.comment} 
                                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                    required
                                    rows={4}
                                    placeholder="Chia sẻ trải nghiệm của bạn..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                                />
                                {reviewData.comment && ["lừa đảo", "đmm", "chết"].some(w => reviewData.comment.toLowerCase().includes(w)) && (
                                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                        ⚠️ Nội dung chứa từ ngữ nhạy cảm, sẽ bị hệ thống gắn cờ.
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleCloseReview} 
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Huỷ
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    style={{ 
                                        flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                                        background: '#3b82f6', color: '#fff', fontWeight: 'bold', 
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};