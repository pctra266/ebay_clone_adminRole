import { apiRequest } from './httpClient';

const BASE = '/api/adminreturnrequests';

const returnRequestService = {
  // Màn hình 6.1 - Bước 1: Lấy danh sách theo status
  getReturnRequests: (status = 'Pending') =>
    apiRequest(`${BASE}?status=${status}`),

  // Màn hình 6.1 - Bước 3: Lấy chi tiết 1 yêu cầu
  getReturnRequestDetail: (id) =>
    apiRequest(`${BASE}/${id}`),

  // Màn hình 6.1 - Bước 4: Chấp nhận hoàn tiền
  approveReturnRequest: (id, adminNote = '') =>
    apiRequest(`${BASE}/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ returnRequestId: id, adminNote }),
    }),

  // Màn hình 6.1 - Bước 4: Từ chối hoàn tiền
  rejectReturnRequest: (id, adminNote) =>
    apiRequest(`${BASE}/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ returnRequestId: id, adminNote }),
    }),
};

export default returnRequestService;