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
    /**
     * Lấy danh sách phiếu tiếp nhận
     * Params: search, page, limit, sort_by, sort_dir...
     */
    getList: (params) => {
        return apiClient.get('/receivings/list', { params });
    },

    /**
     * Lấy chi tiết
     */
    getDetail: (id) => {
        return apiClient.get(`/receivings/detail/${id}`);
    },

    /**
     * Xóa phiếu
     */
    delete: (id) => {
        return apiClient.delete(`/receivings/delete/${id}`);
    },

    /**
     * Cập nhật trạng thái nhanh
     * Data: { recei: id_phieu, status: number_status }
     */
    updateStatus: (data) => {
        return apiClient.post('/receivings/update-status', data);
    },

    // Các hàm create/update đầy đủ nếu cần
    create: (data) => apiClient.post('/receivings/add', data),
    update: (id, data) => apiClient.put(`/receivings/change/${id}`, data),
};

export default receivingApi;