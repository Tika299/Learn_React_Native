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

const receivingApi = {
    getList: (params) => apiClient.get('/receivings/list', { params }),

    getDetail: (id) => apiClient.get(`/receivings/detail/${id}`),

    create: (data) => apiClient.post('/receivings/add', data),

    update: (id, data) => apiClient.put(`/receivings/change/${id}`, data),

    delete: (id) => apiClient.delete(`/receivings/delete/${id}`),

    updateStatus: (data) => apiClient.post('/receivings/update-status', data),

    // --- Helpers Dropdown ---
    getCustomers: () => apiClient.get('/customers'), // Lấy danh sách khách
    getProducts: () => apiClient.get('/products'),          // Lấy danh sách sản phẩm
};

export default receivingApi;