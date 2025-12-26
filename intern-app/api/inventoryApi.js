import axios from 'axios';

// URL gốc (API)
const BASE_URL = 'http://192.168.30.130:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

const inventoryApi = {
    /**
     * Lấy danh sách tồn kho
     * Params: { 
     *   search, page, per_page, sort_by, sort_dir, 
     *   ma, ten, brand, sn, provider[], status[], date_from, date_to... 
     * }
     */
    getList: (params) => {
        return apiClient.get('/inventory', { params });
    },

    /**
     * API Check tồn kho nhanh (checkStock)
     * Dùng cho chức năng tìm kiếm nhanh nếu cần
     */
    checkStock: (keyword) => {
        return apiClient.get('/inventory/check', { params: { keyword } });
    },

    // Lấy danh sách NCC để lọc
    getProviders: () => apiClient.get('/inventory/providers'), // Hoặc endpoint danh sách provider
    
    // Lấy danh sách Kho để lọc
    getWarehouses: () => apiClient.get('/inventory/warehouses'),
};

export default inventoryApi;