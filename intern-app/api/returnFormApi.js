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

const returnFormApi = {
    /**
     * Lấy danh sách phiếu trả hàng
     * Params: search, page, limit, ma, recei_code, customer_id, status...
     */
    getList: (params) => {
        return apiClient.get('/return-forms/list', { params });
    },

    getDetail: (id) => {
        return apiClient.get(`/return-forms/detail/${id}`);
    },

    create: (data) => {
        return apiClient.post('/return-forms/add', data);
    },

    update: (id, data) => {
        return apiClient.put(`/return-forms/change/${id}`, data);
    },

    delete: (id) => {
        return apiClient.delete(`/return-forms/delete/${id}`);
    },

    // --- Helpers Dropdown ---
    getCustomers: () => apiClient.get('/customers'),
    // Lấy danh sách phiếu tiếp nhận để chọn (để biết trả cho phiếu nào)
    getReceivings: () => apiClient.get('/receivings/list'),
    getProducts: () => apiClient.get('/products'),
};

export default returnFormApi;