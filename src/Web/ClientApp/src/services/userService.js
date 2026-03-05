import axios from "axios";
import { ENDPOINTS } from "./endpoints";

export const userService = {
    getUsers: async (params) => {
        const response = await axios.get(ENDPOINTS.USERS.BASE, { params });
        return response.data;
    },

    getUserById: async (id) => {
        const response = await axios.get(ENDPOINTS.USERS.DETAIL(id));
        return response.data;
    },

    approveUser: async (id, adminId) => {
        const response = await axios.post(ENDPOINTS.USERS.APPROVE(id), { adminId });
        return response.data;
    },

    banUser: async (id, reason, adminId) => {
        const response = await axios.post(ENDPOINTS.USERS.BAN(id), { reason, adminId });
        return response.data;
    },

    unbanUser: async (id, adminId) => {
        const response = await axios.post(ENDPOINTS.USERS.UNBAN(id), { adminId });
        return response.data;
    }
};

