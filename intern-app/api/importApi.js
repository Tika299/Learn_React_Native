import axios from "axios";

// 1. URL gốc trỏ về api (Đảm bảo backend đã chạy route:clear)
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Chặn lỗi 302
    }
});

const importApi = {
    /**
     * Lấy danh sách phiếu nhập
     * Params: { search, page, per_page, sort_by, sort_dir, ma, ten, provider_id, warehouse_id ... }
     */
    getList: (params) => apiClient.get('/imports/list', { params }),

    getDetail: (id) => apiClient.get(`/imports/detail/${id}`),

    create: (data) => apiClient.post('/imports/add', data),

    update: (id, data) => apiClient.put(`/imports/change/${id}`, data),

    delete: (id) => apiClient.delete(`/imports/delete/${id}`),

    // Upload Excel (Dùng Content-Type multipart/form-data)
    uploadExcel: (formData) => {
        return apiClient.post('/imports/import-excel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Helper lấy danh sách nguồn (Dropdown)
    getProviders: () => apiClient.get('/providers'), // Cần có route này
    getWarehouses: () => apiClient.get('/warehouses'), // Cần có route này
    getProducts: () => apiClient.get('/products'), // Cần có route này
}

export default importApi;