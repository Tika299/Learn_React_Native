import axios from 'axios';

// URL gốc (đang dùng web.php nên không có /api)
const BASE_URL = 'http://192.168.30.130:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Chặn lỗi 302 Redirect
    }
});

const providerApi = {
    /**
     * Lấy danh sách NCC
     * params: { search, page, per_page, sort_by, sort_dir, ma, ten, address, phone... }
     */
    getList: (params) => {
        return apiClient.get('/providers', { params });
    },

    /**
     * Lấy danh sách nhóm NCC (Dropdown)
     */
    getGroups: () => {
        return apiClient.get('/providers/groups');
    },

    delete: (id) => {
        return apiClient.delete(`/providers/${id}`);
    },

    create: (data) => {
        return apiClient.post('/providers', data);
    },

    update: (id, data) => {
        return apiClient.put(`/providers/${id}`, data);
    }
};

export default providerApi;