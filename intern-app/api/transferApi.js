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

const transferApi = {
    /**
     * Lấy danh sách phiếu chuyển kho
     * Params: search, page, limit, status, from_date, to_date...
     */
    getList: (params) => {
        return apiClient.get('/warehouse-transfer/list', { params });
    },

    /**
     * Lấy chi tiết phiếu
     */
    getDetail: (id) => {
        return apiClient.get(`/warehouse-transfer/detail/${id}`);
    },

    /**
     * Tạo mới
     */
    create: (data) => {
        return apiClient.post('/warehouse-transfer/add', data);
    },

    /**
     * Cập nhật
     */
    update: (id, data) => {
        return apiClient.put(`/warehouse-transfer/change/${id}`, data);
    },

    /**
     * Xóa phiếu
     */
    delete: (id) => {
        return apiClient.delete(`/warehouse-transfer/delete/${id}`);
    }
};

export default transferApi;