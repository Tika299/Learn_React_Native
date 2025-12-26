import axios from 'axios';

// URL gốc (Lưu ý: Bạn đang dùng web.php nên không có đuôi /api)
const BASE_URL = 'http://192.168.30.130:8000/api';

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
    getList: (params) => apiClient.get('/customers', { params }),

    getGroups: () => apiClient.get('/customers/groups'),

    // Thêm mới
    create: (data) => apiClient.post('/customers', data),

    // Cập nhật
    update: (id, data) => apiClient.put(`/customers/${id}`, data),

    // Xóa (Lưu ý: Route backend bạn đặt tên là 'detele' -> sai chính tả trong controller, nhưng phải gọi đúng tên đó)
    delete: (id) => apiClient.delete(`/customers/${id}`),
};

export default customerApi;