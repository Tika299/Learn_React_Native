import axios from 'axios';

// URL gốc API (Đảm bảo backend chạy route:clear)
const BASE_URL = 'http://192.168.1.11:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Chặn lỗi 302
    }
});

const quotationApi = {
    /**
     * Lấy danh sách phiếu báo giá
     * Params: { search, page, per_page, sort_by, sort_dir, quotation_code, customer_id... }
     */
    getList: (params) => {
        return apiClient.get('/quotations/list', { params });
    },

    /**
     * Lấy chi tiết phiếu báo giá
     */
    getDetail: (id) => {
        return apiClient.get(`/quotations/detail/${id}`);
    },

    /**
     * Tạo mới phiếu báo giá
     */
    create: (data) => {
        return apiClient.post('/quotations/add', data);
    },

    /**
     * Cập nhật phiếu báo giá
     */
    update: (id, data) => {
        return apiClient.put(`/quotations/change/${id}`, data);
    },

    /**
     * Xóa phiếu báo giá
     */
    delete: (id) => {
        return apiClient.delete(`/quotations/delete/${id}`);
    }
};

export default quotationApi;