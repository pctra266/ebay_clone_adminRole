import axios from 'axios';
import { ENDPOINTS } from './endpoints';

export const productService = {
    // Tương ứng với group.MapGet(GetProducts) ở backend
    getAllProducts: async () => {
        try {
            // Chỉ cần gọi đúng route bạn đã định nghĩa ở C#
            const response = await axios.get(ENDPOINTS.PRODUCTS.BASE);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            throw error;
        }
    },
    
    // Bạn có thể viết sẵn các hàm khác chờ dùng sau:
    // getProductById: async (id) => { ... },
    // createProduct: async (payload) => { ... },
};