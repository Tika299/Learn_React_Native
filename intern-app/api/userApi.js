import axios from 'axios';

// URL gốc (Web.php -> Không có /api)
const BASE_URL = 'http://192.168.30.130:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để chặn lỗi 302 Redirect
    }
});

const userApi = {
    /**
     * Lấy danh sách nhân viên (kèm tìm kiếm, lọc)
     * Params: search, page, roles, group_id...
     */
    getList: (params) => {
        return apiClient.get('/users', { params });
    },

    /**
     * Lấy danh sách nhóm (cho dropdown)
     */
    getGroups: () => {
        return apiClient.get('/users/groups');
    },

    /**
     * Lấy danh sách vai trò (cho dropdown)
     */
    getRoles: () => {
        return apiClient.get('/users/roles');
    },

    /**
     * Tạo mới nhân viên
     * Data: { name, email, password, group_id, role, ... }
     */
    create: (data) => {
        return apiClient.post('/users', data);
    },

    /**
     * Cập nhật nhân viên
     */
    update: (id, data) => {
        return apiClient.put(`/users/${id}`, data);
    },

    /**
     * Xóa nhân viên
     */
    delete: (id) => {
        return apiClient.delete(`/users/${id}`);
    }
};

export default userApi;