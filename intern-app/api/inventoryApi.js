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

const inventoryApi = {
    /**
     * Lấy danh sách tồn kho (kèm tìm kiếm, lọc)
     * Params: search, page, limit, sort_by, sort_dir, ma, ten, brand, sn, provider[], status[], date_from, date_to...
     */
    getList: (params) => {
        return apiClient.get('/inventory', { params }); // Route định nghĩa là /inventory/ (không phải /inventoryLookup)
    },

    /**
     * Check tồn kho nhanh (theo từ khóa)
     */
    checkStock: (keyword) => {
        return apiClient.get('/inventory/check', { params: { keyword } });
    },

    /**
     * Lấy danh sách Nhà cung cấp (Dropdown)
     */
    getProviders: () => {
        return apiClient.get('/inventory/providers');
    },

    /**
     * Lấy danh sách Kho (Dropdown)
     */
    getWarehouses: () => {
        return apiClient.get('/inventory/warehouses');
    }
};

export default inventoryApi;