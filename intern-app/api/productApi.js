import axios from 'axios';

// URL gốc (Web.php -> Không có /api)
const BASE_URL = 'http://192.168.1.11:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để chặn lỗi 302 Redirect
    }
});

const productApi = {
    /**
     * Lấy danh sách sản phẩm
     * Params: { search, page, per_page, sort_by, sort_dir, group_id, ma, ten, hang ... }
     */
    getList: (params) => {
        return apiClient.get('/products', { params });
    },

    /**
     * Lấy danh sách nhóm hàng hóa (Để lọc)
     */
    getGroups: () => {
        return apiClient.get('/products/groups');
    },

    /**
     * Xóa sản phẩm
     */
    delete: (id) => {
        return apiClient.delete(`/products/${id}`);
    },

    // Các hàm create/update nếu cần sau này
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
};

export default productApi;