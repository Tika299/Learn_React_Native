import axios from 'axios';

// URL gốc (Web.php -> Không có /api)
const BASE_URL = 'http://localhost:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để chặn lỗi 302 Redirect
    }
});

const warehouseApi = {
    /**
     * Lấy danh sách kho
     * Params: { search, page, per_page, sort_by, sort_dir, ma, ten, address }
     */
    getList: (params) => {
        return apiClient.get('/warehouses', { params });
    },

    /**
     * Lấy chi tiết kho
     */
    getDetail: (id) => {
        return apiClient.get(`/warehouses/${id}`);
    },

    /**
     * Tạo mới kho
     */
    create: (data) => {
        return apiClient.post('/warehouses', data);
    },

    /**
     * Cập nhật kho
     */
    update: (id, data) => {
        return apiClient.put(`/warehouses/${id}`, data);
    },

    /**
     * Xóa kho
     */
    delete: (id) => {
        return apiClient.delete(`/warehouses/${id}`);
    }
};

export default warehouseApi;