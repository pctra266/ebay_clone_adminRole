
const API_BASE = "/api";

const endpoints = {
  users: `${API_BASE}/Users`,
  broadcasts: `${API_BASE}/Broadcasts`,
  adminRoles: `${API_BASE}/AdminRoles`,
  auditLogs: `${API_BASE}/AuditLogs`,
};

export default endpoints;

// src/constants/endpoints.js

export const ENDPOINTS = {
    PRODUCTS: {
        // GET, POST danh sách chung
        BASE: '/api/products', 
        
        // GET danh sách quản lý (Màn hình 5)
        MANAGED: '/api/products/managed',
        
        // Cần truyền ID (PUT, DELETE, GET by ID) -> Dùng arrow function
        DETAIL: (id) => `/api/products/${id}`, 
        
        // Các tính năng đặc thù
        VIOLATION_DETAILS: (id) => `/api/products/managed/${id}/violation-details`,
        RESOLVE_VIOLATION: (id) => `/api/products/managed/${id}/resolve-violation`,
    },
    
    // Sau này bạn có module khác thì cứ thêm vào đây:
    // USERS: { BASE: '/api/users', ... },
    // ORDERS: { ... }
};

