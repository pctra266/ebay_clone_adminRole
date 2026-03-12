import axios from 'axios';
import { ENDPOINTS } from './endpoints';

export const reviewsService = {
    // POST /api/reviews
    createReview: async (payload) => {
        try {
            const response = await axios.post(ENDPOINTS.REVIEWS.BASE, payload);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            throw error;
        }
    },

    // GET /api/reviews/flagged
    getFlaggedReviews: async () => {
        try {
            const response = await axios.get(ENDPOINTS.REVIEWS.FLAGGED);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đánh giá bị gắn cờ:", error);
            throw error;
        }
    },

    // PUT /api/reviews/{id}/status
    updateReviewStatus: async (id, payload) => {
        try {
            const response = await axios.put(ENDPOINTS.REVIEWS.STATUS(id), payload);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
            throw error;
        }
    }
};
