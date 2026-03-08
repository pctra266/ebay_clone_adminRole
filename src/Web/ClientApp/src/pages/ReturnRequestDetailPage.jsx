import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import returnRequestService from '../services/returnRequestService';

export default function ReturnRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // 'approve' | 'reject' | null
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Lightbox
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await returnRequestService.getReturnRequestDetail(id);
        setDetail(data);
      } catch {
        setError('Không thể tải chi tiết yêu cầu.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAction = async () => {
    if (modal === 'reject' && !adminNote.trim()) {
      setSubmitError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      if (modal === 'approve') {
        await returnRequestService.approveReturnRequest(Number(id), adminNote);
      } else {
        await returnRequestService.rejectReturnRequest(Number(id), adminNote);
      }
      // Bước 4 kết quả: quay lại danh sách (đơn đã mất khỏi Pending)
      navigate('/return-requests', { state: { toast: modal === 'approve' ? 'Đã chấp nhận hoàn tiền!' : 'Đã từ chối yêu cầu.' } });
    } catch {
      setSubmitError('Xử lý thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const parseImages = (raw) => {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return [raw]; }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ color: '#ef4444', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>{error || 'Không tìm thấy yêu cầu.'}</p>
          <button onClick={() => navigate('/return-requests')} style={backBtnStyle}>← Quay lại danh sách</button>
        </div>
      </div>
    );
  }

  const images = parseImages(detail.evidenceImages);
  const isPending = detail.status === 'Pending';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/return-requests')}
            style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
          >
            ← Quay lại
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              Chi tiết Yêu cầu Hoàn trả #{detail.id}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
              Đơn hàng #{detail.orderId} · Tạo lúc {detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : '—'}
            </p>
          </div>
        </div>

        <StatusChip status={detail.status} />
      </div>

      {/* Main Content */}
      <div style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, maxWidth: 1200, margin: '0 auto' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Thông tin yêu cầu */}
          <Card title="📋 Thông tin yêu cầu hoàn trả">
            <Row label="Khách hàng" value={
              <span>
                <strong>{detail.buyerUsername || '—'}</strong>
                {detail.buyerEmail && <span style={{ color: '#6b7280', marginLeft: 8, fontSize: 12 }}>({detail.buyerEmail})</span>}
              </span>
            } />
            <Row label="Lý do hoàn trả" value={<span style={{ color: '#dc2626', fontWeight: 600 }}>{detail.reason || '—'}</span>} />
            <Row label="Giải pháp của Shop" value={detail.shopSolution || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Shop chưa đề xuất giải pháp</span>} />
            {detail.adminNote && <Row label="Ghi chú Admin" value={detail.adminNote} />}
            {detail.resolvedAt && <Row label="Thời điểm xử lý" value={new Date(detail.resolvedAt).toLocaleString('vi-VN')} />}
          </Card>

          {/* Hình ảnh bằng chứng — Bước 3 */}
          <Card title="🖼️ Hình ảnh bằng chứng từ khách hàng">
            {images.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Khách hàng chưa cung cấp hình ảnh bằng chứng.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                {images.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setLightbox(url)}
                    style={{
                      width: 130, height: 130, borderRadius: 10,
                      overflow: 'hidden', cursor: 'zoom-in',
                      border: '2px solid #e5e7eb',
                      transition: 'border-color 0.2s, transform 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <img src={url} alt={`evidence-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sản phẩm trong đơn */}
          <Card title="🛒 Sản phẩm trong đơn hàng">
            {(!detail.orderItems || detail.orderItems.length === 0) ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Không có dữ liệu sản phẩm.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.orderItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '10px 10px', color: '#111827', fontWeight: 500 }}>{item.productTitle || `ID #${item.productId}`}</td>
                      <td style={{ padding: '10px 10px', color: '#374151' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 10px', color: '#374151' }}>{item.unitPrice ? `${Number(item.unitPrice).toLocaleString('vi-VN')}đ` : '—'}</td>
                      <td style={{ padding: '10px 10px', fontWeight: 600, color: '#111827' }}>
                        {item.unitPrice && item.quantity ? `${(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tóm tắt đơn hàng */}
          <Card title="📦 Tóm tắt đơn hàng">
            <Row label="Mã đơn" value={<strong style={{ color: '#4f46e5' }}>#{detail.orderId}</strong>} />
            <Row label="Ngày đặt" value={detail.orderDate ? new Date(detail.orderDate).toLocaleDateString('vi-VN') : '—'} />
            <Row label="Trạng thái đơn" value={detail.orderStatus} />
            <div style={{ borderTop: '1px dashed #e5e7eb', margin: '12px 0' }} />
            <Row label="Tổng tiền hoàn" value={
              <span style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                {detail.totalPrice ? `${Number(detail.totalPrice).toLocaleString('vi-VN')}đ` : '—'}
              </span>
            } />
          </Card>

          {/* ACTION PANEL — Bước 4 */}
          {isPending && (
            <div style={{
              background: '#fff', borderRadius: 14, padding: 24,
              border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111827' }}>⚖️ Quyết định xử lý</h3>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
                Chọn hành động để xử lý yêu cầu này. Sau khi xử lý, đơn sẽ rời khỏi danh sách chờ.
              </p>
              <button
                onClick={() => { setModal('approve'); setAdminNote(''); setSubmitError(''); }}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: '#10b981', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 10, transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#059669'}
                onMouseLeave={e => e.target.style.background = '#10b981'}
              >
                ✅ Chấp nhận hoàn tiền
              </button>
              <button
                onClick={() => { setModal('reject'); setAdminNote(''); setSubmitError(''); }}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: '#fff', color: '#ef4444',
                  border: '1.5px solid #ef4444',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.target.style.background = '#fff'; }}
              >
                ❌ Từ chối yêu cầu
              </button>
            </div>
          )}

          {/* Đã xử lý */}
          {!isPending && (
            <div style={{
              background: detail.status === 'Approved' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${detail.status === 'Approved' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: 14, padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>
                {detail.status === 'Approved' ? '✅' : '❌'}
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: detail.status === 'Approved' ? '#065f46' : '#991b1b', fontSize: 14 }}>
                {detail.status === 'Approved' ? 'Đã chấp nhận hoàn tiền' : 'Đã từ chối yêu cầu'}
              </p>
              {detail.resolvedAt && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6b7280' }}>
                  Lúc {new Date(detail.resolvedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL — Confirm Action */}
      {modal && (
        <div
          onClick={() => !submitting && setModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: 32,
              width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.2s ease',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>
              {modal === 'approve' ? '✅' : '❌'}
            </div>
            <h2 style={{ margin: '0 0 6px', textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827' }}>
              {modal === 'approve' ? 'Xác nhận Chấp nhận hoàn tiền' : 'Xác nhận Từ chối'}
            </h2>
            <p style={{ margin: '0 0 20px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              {modal === 'approve'
                ? `Hoàn lại ${detail.totalPrice ? Number(detail.totalPrice).toLocaleString('vi-VN') + 'đ' : ''} cho khách hàng ${detail.buyerUsername || ''}.`
                : 'Yêu cầu sẽ bị từ chối và khách hàng sẽ được thông báo.'}
            </p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Ghi chú Admin {modal === 'reject' && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              placeholder={modal === 'approve' ? 'Nhập ghi chú (tùy chọn)...' : 'Nhập lý do từ chối (bắt buộc)...'}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid #e5e7eb', fontSize: 13, resize: 'vertical',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />

            {submitError && (
              <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0' }}>⚠️ {submitError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setModal(null)}
                disabled={submitting}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  color: '#374151', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Huỷ
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  border: 'none',
                  background: modal === 'approve' ? '#10b981' : '#ef4444',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {submitting ? 'Đang xử lý...' : (modal === 'approve' ? 'Xác nhận hoàn tiền' : 'Xác nhận từ chối')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, cursor: 'zoom-out',
          }}
        >
          <img src={lightbox} alt="evidence" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 80px rgba(0,0,0,0.5)' }} />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', top: 20, right: 24,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#fff', width: 40, height: 40, borderRadius: '50%',
              fontSize: 20, cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Reusable sub-components ── */

function Card({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 24,
      border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13 }}>
      <span style={{ color: '#6b7280', minWidth: 120 }}>{label}</span>
      <span style={{ color: '#111827', textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

function StatusChip({ status }) {
  const map = {
    Pending:  { bg: '#fef3c7', color: '#92400e', label: '⏳ Chờ xử lý'    },
    Approved: { bg: '#d1fae5', color: '#065f46', label: '✅ Đã chấp nhận' },
    Rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Đã từ chối'   },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '6px 16px', borderRadius: 20,
      fontSize: 13, fontWeight: 700,
    }}>
      {s.label}
    </span>
  );
}

const backBtnStyle = {
  marginTop: 16, padding: '9px 18px',
  background: '#6366f1', color: '#fff',
  border: 'none', borderRadius: 8,
  cursor: 'pointer', fontSize: 13, fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
};