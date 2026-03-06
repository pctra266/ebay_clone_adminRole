import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService'; // Đảm bảo đường dẫn này đúng với dự án của bạn

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Accessories'];
const SHOPS = ['All', 'TechStore_VN', 'FashionTrend', 'LuxuryWatches', 'GadgetWorld', 'BagStore'];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        'Pending Review': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
        'Resolved': { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
        'Rejected': { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    };
    const s = styles[status] || styles['Pending Review'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: s.bg, color: s.color,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            {status}
        </span>
    );
};

// ─── Review Modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ product, onClose, onResolve }) => {
    // decision bây giờ sẽ lưu số (1, 2 hoặc 3) thay vì chữ
    const [decision, setDecision] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Giả định bạn có hàm getViolationDetails
                const data = await productService.getViolationDetails(product.id);
                setDetails(data);
            } catch (e) {
                console.error('Lỗi khi tải chi tiết vi phạm:', e);
            }
        };
        fetchDetails();
    }, [product.id]);

    const handleSubmit = async () => {
        if (!decision) return;
        setLoading(true);
        try {
            // ĐÃ SỬA Ở ĐÂY: Payload chuẩn xác 100% theo Record C# Backend
            const payload = {
                productId: product.id,
                action: decision,       // Truyền số 1 (Xóa), 2 (Ẩn), hoặc 3 (Từ chối báo cáo)
                adminNote: note,        // Đổi key từ 'note' thành 'adminNote'
                violationType: "Khác"   // Có thể fix cứng tạm hoặc làm thêm dropdown sau
            };

            // Gọi API thật để gửi quyết định xử lý
            await productService.resolveViolation(product.id, payload);

            // Báo cho component cha biết để update lại list giao diện
            onResolve(product.id, decision);
            onClose();
        } catch (e) {
            console.error('Lỗi khi gửi quyết định xử lý:', e);
            alert('Đã xảy ra lỗi khi xử lý. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình các nút bấm dựa theo Enum của C#
    const ACTION_BUTTONS = [
        { id: 1, label: '🗑 Xóa & Cảnh báo', color: '#991B1B', border: '#EF4444', bg: '#FEF2F2', activeBg: '#FCA5A5' },
        { id: 2, label: '👁️ Tạm ẩn bài', color: '#92400E', border: '#F59E0B', bg: '#FFFBEB', activeBg: '#FDE68A' },
        { id: 3, label: '✅ Bỏ qua (Báo cáo sai)', color: '#065F46', border: '#10B981', bg: '#ECFDF5', activeBg: '#A7F3D0' }
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16,
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
                boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
                animation: 'slideUp 0.25s ease',
            }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Đang xem xét</p>
                        <h3 style={{ color: '#fff', margin: '4px 0 0', fontSize: 16, fontFamily: "'Sora', sans-serif" }}>
                            #{product.id} · {product.title}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Product Info */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                        <img src={product.image || 'https://via.placeholder.com/52'} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1E293B', fontSize: 14 }}>{product.title}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748B' }}>Shop: <b>{product.shopName || 'Unknown'}</b></p>
                        </div>
                    </div>

                    {/* Violation Details */}
                    {details ? (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
                                Danh sách báo cáo ({details?.reports?.length || 0})
                            </p>
                            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 12, maxHeight: 180, overflowY: 'auto' }}>
                                {details?.reports && details.reports.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {details.reports.map((r, i) => (
                                            <div key={r.reportId || i} style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: 6, padding: '8px 12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                    <strong style={{ fontSize: 13, color: '#92400E' }}>
                                                        [{r.reporterType}] {r.reason}
                                                    </strong>
                                                    <span style={{ fontSize: 11, background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 12, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#78350F', marginBottom: r.proofDocumentUrl ? 6 : 0 }}>
                                                    ⏱ {new Date(r.createdAt).toLocaleString('vi-VN')}
                                                </div>
                                                {r.proofDocumentUrl && (
                                                    <div style={{ fontSize: 12 }}>
                                                        <a href={r.proofDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
                                                            📎 Xem bằng chứng
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: 13, color: '#92400E' }}>Không có dữ liệu báo cáo chi tiết.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: 20, textAlign: 'center', color: '#64748B', fontSize: 13, padding: '20px 0' }}>
                            ⏳ Đang tải chi tiết vi phạm...
                        </div>
                    )}

                    {/* Decision Buttons */}
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Quyết định xử lý</p>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        {ACTION_BUTTONS.map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setDecision(btn.id)}
                                style={{
                                    flex: 1, padding: '10px 4px', borderRadius: 8, border: '2px solid',
                                    cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                                    borderColor: decision === btn.id ? btn.border : '#E2E8F0',
                                    background: decision === btn.id ? btn.activeBg : '#fff',
                                    color: decision === btn.id ? btn.color : '#64748B',
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Ghi chú của Admin (Bắt buộc nếu xoá/tạm ẩn)..."
                        rows={3}
                        style={{ width: '100%', borderRadius: 8, border: '1.5px solid #E2E8F0', padding: '10px 12px', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1E293B' }}
                    />

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Huỷ</button>
                        <button onClick={handleSubmit} disabled={!decision || loading} style={{
                            flex: 2, padding: '11px 0', borderRadius: 8, border: 'none', cursor: decision ? 'pointer' : 'not-allowed',
                            background: decision ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#CBD5E1',
                            color: '#fff', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                        }}>
                            {loading ? '⏳ Đang xử lý...' : '✅ Xác nhận quyết định'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ProductModerationPage = () => {
    const [activeTab, setActiveTab] = useState('Reported');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [shopFilter, setShopFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // Thêm state quản lý tổng số item để phân trang
    const PER_PAGE = 5;
    const totalPages = Math.ceil(totalItems / PER_PAGE) || 1;
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Gọi API thật để lấy danh sách sản phẩm quản lý
            const data = await productService.getManagedProducts({
                pageNumber: page,
                pageSize: PER_PAGE,
                tab: activeTab
            });
            // Giả định API trả về dạng { items: [...], total: 100 } hoặc mảng trực tiếp
            console.log('API trả về:', data);
            setProducts(data.items || data);
            setTotalItems(data.totalCount || (data.items ? data.items.length : data.length));
        } catch (err) {
            console.error('Không thể tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleResolve = (id, decision) => {
        // Cập nhật lại UI dựa trên quyết định
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, status: decision === 'Approve' ? 'Resolved' : decision === 'Remove' ? 'Rejected' : 'Resolved' } : p
        ));

        // Tuỳ chọn: Bạn cũng có thể gọi lại fetchProducts() ở đây để đồng bộ 100% với server
        // fetchProducts(); 
    };

    // Nếu lọc qua API thì phần filter client này có thể bỏ qua hoặc để lại nếu bạn chỉ fetch toàn bộ
    const filtered = products.filter(p => {
        // 1. Kiểm tra Category (Lưu ý: kiểm tra p.category có tồn tại không)
        const matchCat = categoryFilter === 'All' || categoryFilter.includes('All') || p.category === categoryFilter;

        // 2. Kiểm tra Shop
        const matchShop = shopFilter === 'All' || shopFilter.includes('All') || p.shopName === shopFilter;

        // 3. Kiểm tra Search (Dùng optional chaining ?. để tránh lỗi nếu title null)
        const matchSearch = search === '' ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            String(p.id).includes(search);

        // 4. QUAN TRỌNG: Bỏ kiểm tra p.status === 'Pending Review' 
        // vì Server đã lọc theo activeTab cho bạn rồi.
        return matchCat && matchShop && matchSearch;
    });

    const pendingCount = products.filter(p => p.status === 'Pending Review').length;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .skeleton { background: linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%); background-size: 400px; animation: shimmer 1.4s infinite; border-radius: 6px; }
        .row-hover:hover { background: #F0F7FF !important; }
        .btn-review:hover { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        select:focus, input:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

            <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', sans-serif", padding: '28px 20px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                    {/* Page Header */}
                    <div style={{ marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#0F172A' }}>Reported Product Moderation</h1>
                                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Quản lý và xử lý các sản phẩm bị báo cáo vi phạm</p>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'slideUp 0.35s ease' }}>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 24px' }}>
                            {['All Products', 'Reported Products'].map((tab, i) => {
                                const key = i === 0 ? 'All' : 'Reported';
                                const active = activeTab === key;
                                return (
                                    <button key={tab} onClick={() => { setActiveTab(key); setPage(1); }} style={{
                                        padding: '16px 4px', marginRight: 24, border: 'none', background: 'none',
                                        fontSize: 14, fontWeight: active ? 600 : 400,
                                        color: active ? '#2563EB' : '#64748B',
                                        borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                    }}>
                                        {tab}
                                        {i === 1 && pendingCount > 0 && (
                                            <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>{pendingCount}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filters */}
                        <div style={{ padding: '16px 24px', display: 'flex', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 32px 8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                {CATEGORIES.map(c => <option key={c}>{c === 'All' ? 'Filter by Category (All)' : c}</option>)}
                            </select>
                            <select value={shopFilter} onChange={e => setShopFilter(e.target.value)} style={{ padding: '8px 32px 8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                                {SHOPS.map(s => <option key={s}>{s === 'All' ? 'Filter by Shop Name (All)' : s}</option>)}
                            </select>
                            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94A3B8' }}>🔍</span>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product name or ID..." style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#1E293B', background: '#fff', boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC' }}>
                                        {['Product ID', 'Image & Product Name', 'Shop Name', 'Reason for Report', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array(4).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                {[70, 200, 110, 140, 120, 80].map((w, j) => (
                                                    <td key={j} style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                                        <div className="skeleton" style={{ height: 16, width: w }} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#94A3B8', fontSize: 14 }}>
                                                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                                                Không tìm thấy sản phẩm nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((product, idx) => (
                                            <tr key={product.id} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s', animationDelay: `${idx * 0.05}s`, animation: 'fadeIn 0.3s ease both' }}>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B', fontWeight: 500 }}>#{product.id}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <img src={product.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid #E2E8F0', flexShrink: 0 }} />
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', cursor: 'pointer', textDecoration: 'none' }} onMouseEnter={e => e.target.style.textDecoration = 'underline'} onMouseLeave={e => e.target.style.textDecoration = 'none'}>{product.title}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{product.shopName}</td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{product.reason}</td>
                                                <td style={{ padding: '14px 16px' }}><StatusBadge status={product.status} /></td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    {product.reportReasons.length > 0 ? (
                                                        <button className="btn-review" onClick={() => setSelectedProduct(product)} style={{
                                                            background: '#2563EB', color: '#fff', border: 'none', borderRadius: 7,
                                                            padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                                        }}>Review</button>
                                                    ) : (
                                                        <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>✔ Done</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                            <span style={{ fontSize: 13, color: '#64748B' }}>
                                Showing {totalItems === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalItems)} of {totalItems} items
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {totalItems > 0 && (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                style={{
                                                    width: 32, height: 32,
                                                    borderRadius: 7,
                                                    border: '1.5px solid',
                                                    borderColor: page === p ? '#2563EB' : '#E2E8F0',
                                                    background: page === p ? '#EFF6FF' : '#fff',
                                                    color: page === p ? '#2563EB' : '#64748B',
                                                    fontWeight: page === p ? 700 : 400,
                                                    cursor: 'pointer',
                                                    fontSize: 13
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {selectedProduct && (
                <ReviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onResolve={handleResolve} />
            )}
        </>
    );
};

export default ProductModerationPage;