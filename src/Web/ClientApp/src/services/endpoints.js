export const ENDPOINTS = {
    PRODUCTS: {
        BASE: "/api/products",
        MANAGED: "/api/products/managed",
        DETAIL: (id) => `/api/products/${id}`,
        VIOLATION_DETAILS: (id) => `/api/products/managed/${id}/violation-details`,
        RESOLVE_VIOLATION: (id) => `/api/products/managed/${id}/resolve-violation`,
    },
    USERS: {
        BASE: "/api/users",
        DETAIL: (id) => `/api/users/${id}`,
        APPROVE: (id) => `/api/users/${id}/approve`,
        BAN: (id) => `/api/users/${id}/ban`,
        UNBAN: (id) => `/api/users/${id}/unban`,
    },
};
