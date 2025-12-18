import axios from 'axios';

// URL gốc trỏ về api (Đảm bảo backend đã chạy route:clear)
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Chặn lỗi 302 Redirect
    }
});

const exportApi = {
    /**
     * Lấy danh sách phiếu xuất
     * Params: { search, page, limit, sort_by, sort_dir, ma, note, serial, product_name, customer... }
     */
    getList: (params) => {
        return apiClient.get('/exports/list', { params });
    },

    /**
     * Lấy chi tiết phiếu xuất
     */
    getDetail: (id) => {
        return apiClient.get(`/exports/detail/${id}`);
    },

    /**
     * Tạo mới phiếu xuất
     */
    create: (data) => {
        return apiClient.post('/exports/add', data);
    },

    /**
     * Cập nhật phiếu xuất
     */
    update: (id, data) => {
        return apiClient.put(`/exports/change/${id}`, data);
    },

    /**
     * Xóa phiếu xuất
     */
    delete: (id) => {
        return apiClient.delete(`/exports/delete/${id}`);
    }
};

export default exportApi;