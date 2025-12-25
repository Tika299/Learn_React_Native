import axios from "axios";

// 1. URL gốc trỏ về api (Đảm bảo backend đã chạy route:clear)
const BASE_URL = 'http://192.168.1.11:8000/api';

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
    getImportList: (params) => {
        // Trong api.php bạn định nghĩa prefix('imports') -> get('/list')
        // URL thực tế là: /api/imports/list
        return apiClient.get('/imports/list', { params });
    },

    getImportDetail: (id) => {
        return apiClient.get(`/imports/detail/${id}`);
    },

    createImport: (data) => {
        return apiClient.post('/imports/add', data);
    },

    deleteImport: (id) => {
        // Trong api.php bạn định nghĩa: delete('/delete/{id}')
        // URL thực tế là: /api/imports/delete/{id}
        return apiClient.delete(`/imports/delete/${id}`);
    },

    updateImport: (id, data) => {
        return apiClient.put(`/imports/change/${id}`, data);
    },

    // Thêm hàm lấy danh sách kho và NCC để lọc (nếu cần)
    // getWarehouses: () => ..., 
    // getProviders: () => ...,
}

export default importApi;