import axios from 'axios';

// URL gốc API
const BASE_URL = 'http://192.168.1.11:8000/api'; 

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
     * Params: search, page, limit, sort_by, sort_dir...
     */
    getList: (params) => {
        return apiClient.get('/return-form/list', { params });
    },

    /**
     * Lấy chi tiết
     */
    getDetail: (id) => {
        return apiClient.get(`/return-form/detail/${id}`);
    },

    /**
     * Tạo mới
     */
    create: (data) => {
        return apiClient.post('/return-form/add', data);
    },

    /**
     * Cập nhật
     */
    update: (id, data) => {
        return apiClient.put(`/return-form/change/${id}`, data);
    },

    /**
     * Xóa phiếu
     */
    delete: (id) => {
        // Controller dùng method delete(Request $request, $id) nhưng route định nghĩa là /delete/{id}
        return apiClient.delete(`/return-form/delete/${id}`);
    }
};

export default returnFormApi;