// src/api/groupApi.js
import axios from 'axios';

// Thay đổi URL này thành địa chỉ server thực tế của bạn
// Nếu chạy trên Android Emulator: http://10.0.2.2:8000/api
// Nếu chạy trên iOS Simulator: http://192.168.1.11:8000/api
const BASE_URL = 'http://192.168.1.11:8000/api'; 

// Cấu hình axios cơ bản (nên đưa vào file axiosClient riêng để tái sử dụng)
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Thêm token nếu API yêu cầu đăng nhập
    }
});

const groupApi = {
    /**
     * Lấy danh sách nhóm (có phân trang, tìm kiếm, sắp xếp)
     * @param {object} params { search, type_id, sort_by, sort_dir, page, per_page }
     */
    getList: (params) => {
        return apiClient.get('/groups', { params });
    },

    /**
     * Lấy danh sách loại nhóm (Dropdown)
     */
    getTypes: () => {
        return apiClient.get('/groups/types');
    },

    /**
     * Xóa nhóm
     */
    delete: (id) => {
        return apiClient.delete(`/groups/${id}`);
    },

    /**
     * Tạo mới (dành cho màn hình Create)
     */
    create: (data) => {
        return apiClient.post('/groups', data);
    },

    /**
     * Cập nhật (dành cho màn hình Edit)
     */
    update: (id, data) => {
        return apiClient.put(`/groups/${id}`, data);
    }
};

export default groupApi;