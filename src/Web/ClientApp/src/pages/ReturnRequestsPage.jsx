import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import returnRequestService from '../services/returnRequestService';

const STATUS_TABS = [
  { key: 'Pending',   label: 'Chờ xử lý',   color: '#f59e0b' },
  { key: 'Escalated', label: 'Khiếu nại',   color: '#6366f1' },
  { key: 'Approved',  label: 'Đã hoàn tiền', color: '#10b981' },
  { key: 'Rejected',  label: 'Đã từ chối',   color: '#ef4444' },
];

const statusBadge = {
  Pending:               { bg: '#fef3c7', color: '#92400e', text: 'Chờ xử lý'       },
  Approved:              { bg: '#d1fae5', color: '#065f46', text: 'Đã hoàn tiền'    },
  Rejected:              { bg: '#fee2e2', color: '#991b1b', text: 'Đã từ chối'     },
  WaitingForReturnLabel: { bg: '#e0e7ff', color: '#3730a3', text: 'Đợi mã vận đơn' },
  ReturnLabelProvided:   { bg: '#dcfce7', color: '#166534', text: 'Đã cấp mã VD'   },
  Returned:              { bg: '#fef9c3', color: '#854d0e', text: 'Đã trả hàng'    },
  Escalated:             { bg: '#ffedd5', color: '#9a3412', text: 'Đang khiếu nại' },
};

export default function ReturnRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await returnRequestService.getReturnRequests(status);
      setRequests(data);
    } catch {
      setError('Không thể tải danh sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const filtered = requests.filter((r) =>
    searchId ? String(r.orderId).includes(searchId.trim()) : true
  );

  const badge = (status) => {
    const b = statusBadge[status] || { bg: '#f3f4f6', color: '#374151', text: status };
    return (
      <span style={{
        background: b.bg, color: b.color,
        padding: '2px 10px', borderRadius: 20,
        fontSize: 12, fontWeight: 600,
      }}>
        {b.text}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '24px 36px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>
              📦 Quản lý Đơn hàng & Hoàn trả
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              Kiểm duyệt và xử lý các yêu cầu hoàn trả từ khách hàng
            </p>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm theo ID đơn hàng..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                padding: '9px 14px 9px 38px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 13, width: 220, outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchId(''); }}
              style={{
                padding: '10px 22px',
                border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: activeTab === tab.key ? tab.color : '#6b7280',
                borderBottom: activeTab === tab.key ? `2.5px solid ${tab.color}` : '2.5px solid transparent',
                transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab.label}
              {activeTab === tab.key && requests.length > 0 && (
                <span style={{
                  marginLeft: 8, background: tab.color,
                  color: '#fff', borderRadius: 10,
                  padding: '1px 7px', fontSize: 11,
                }}>
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 36px' }}>
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5',
            color: '#991b1b', borderRadius: 10, padding: '12px 18px',
            marginBottom: 20, fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #e5e7eb',
              borderTop: '3px solid #6366f1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Đang tải dữ liệu...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80,
            background: '#fff', borderRadius: 14,
            border: '1px dashed #d1d5db',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 500 }}>
              {searchId ? `Không tìm thấy đơn hàng #${searchId}` : 'Không có yêu cầu nào trong mục này'}
            </p>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #e5e7eb',
            overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 100px 1fr 1fr 130px 120px 100px',
              padding: '12px 20px', background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
            }}>
              <span>ID</span>
              <span>Đơn #</span>
              <span>Khách hàng</span>
              <span>Lý do</span>
              <span>Tổng tiền</span>
              <span>Ngày tạo</span>
              <span>Trạng thái</span>
            </div>

            {/* Rows */}
            {filtered.map((r, idx) => (
              <div
                key={r.id}
                onClick={() => navigate(`/return-requests/${r.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 1fr 1fr 130px 120px 100px',
                  padding: '15px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer', alignItems: 'center',
                  transition: 'background 0.15s',
                  fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ color: '#6b7280', fontWeight: 500 }}>#{r.id}</span>
                <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{r.orderId}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{r.buyerUsername || '—'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{r.buyerEmail}</div>
                </div>
                <span style={{
                  color: '#374151',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', display: 'block',
                  maxWidth: 200,
                }}>
                  {r.reason || '—'}
                </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {r.totalPrice ? `${Number(r.totalPrice).toLocaleString('vi-VN')}đ` : '—'}
                </span>
                <span style={{ color: '#6b7280' }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                </span>
                {badge(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}