import axios from 'axios';

// URL gốc (API)
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

const warrantyApi = {
    /**
     * Lấy danh sách bảo hành (đã phân trang)
     * Params: search, page, limit, sort_by, sort_dir, ma, ten, sn, customer[], status...
     */
    getList: (params) => apiClient.get('/warranty', { params }),

    // Dropdown Khách hàng
    getCustomers: () => apiClient.get('/warranty/customers'),

    // Chi tiết (theo Serial ID hoặc Warranty ID tùy logic)
    getDetail: (serialId) => apiClient.get(`/warranty/${serialId}`),

    // Các chức năng thêm/sửa/xóa (nếu cần)
    create: (data) => apiClient.post('/warranty', data),
    update: (id, data) => apiClient.put(`/warranty/${id}`, data),
    delete: (id) => apiClient.delete(`/warranty/${id}`),
};

export default warrantyApi;