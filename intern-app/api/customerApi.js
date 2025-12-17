import axios from 'axios';

// URL gốc (Lưu ý: Bạn đang dùng web.php nên không có đuôi /api)
const BASE_URL = 'http://localhost:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để tránh lỗi 302 Redirect
    }
});

const customerApi = {
    /**
     * Lấy danh sách khách hàng
     * params: { search, page, per_page, sort_by, sort_dir, group_id }
     */
    getList: (params) => {
        return apiClient.get('/customers', { params });
    },

    /**
     * Lấy danh sách nhóm khách hàng (Để dùng trong Modal lọc)
     */
    getGroups: () => {
        return apiClient.get('/customers/groups');
    },

    delete: (id) => {
        return apiClient.delete(`/customers/${id}`);
    },

    create: (data) => {
        return apiClient.post('/customers', data);
    },

    update: (id, data) => {
        return apiClient.put(`/customers/${id}`, data);
    }
};

export default customerApi;