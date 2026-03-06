import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService'; // Đảm bảo đường dẫn đúng

export const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- State cho Report Modal ---
    const [reportingProductId, setReportingProductId] = useState(null); // Lưu ID sản phẩm đang bị report
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState({
        reason: 'Counterfeit Item', // Giá trị mặc định
        description: '',
        evidenceFiles: '',
        priority: 'Low'
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
                            <button 
                                onClick={() => handleOpenReport(product.id)}
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
                            >
                                Report
                            </button>
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
        </div>
    );
};