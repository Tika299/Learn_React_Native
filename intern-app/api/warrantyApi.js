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
     * Lấy danh sách bảo hành (Đã được group theo Serial)
     * Params: { 
     *   search, page, per_page, sort_by, sort_dir, 
     *   ma, ten, brand, sn, customer[], status...
     * }
     */
    getList: (params) => {
        return apiClient.get('/warranty', { params });
    },

    /**
     * Lấy chi tiết bảo hành của 1 Serial
     */
    getDetailBySerial: (serialId) => {
        return apiClient.get(`/warranty/${serialId}`);
    },

    /**
     * Lấy danh sách khách hàng để lọc
     */
    getCustomers: () => {
        return apiClient.get('/warranty/customers');
    },

    // Các hàm thêm/sửa/xóa nếu cần thiết
    create: (data) => apiClient.post('/warranty', data),
    update: (id, data) => apiClient.put(`/warranty/${id}`, data),
    delete: (id) => apiClient.delete(`/warranty/${id}`),
};

export default warrantyApi;