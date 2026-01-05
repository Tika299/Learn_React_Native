import axios from 'axios';

// URL gốc API
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

const transferApi = {
    /**
     * Lấy danh sách phiếu chuyển
     * Params: search, page, limit, status, from_date, to_date...
     */
    getList: (params) => {
        return apiClient.get('/warehouse-transfer/list', { params });
    },

    getDetail: (id) => {
        return apiClient.get(`/warehouse-transfer/detail/${id}`);
    },

    create: (data) => {
        return apiClient.post('/warehouse-transfer/add', data);
    },

    update: (id, data) => {
        return apiClient.put(`/warehouse-transfer/change/${id}`, data);
    },

    delete: (id) => {
        return apiClient.delete(`/warehouse-transfer/delete/${id}`);
    },

    // --- Helper ---
    getWarehouses: () => apiClient.get('/warehouses'), // Để chọn kho nguồn/đích
    getProducts: () => apiClient.get('/products'),     // Để chọn sản phẩm
};

export default transferApi;