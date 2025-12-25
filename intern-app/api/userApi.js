import axios from 'axios';

// URL gốc (Web.php -> Không có /api)
const BASE_URL = 'http://192.168.1.11:8000/api'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để chặn lỗi 302 Redirect
    }
});

const userApi = {
    /**
     * Lấy danh sách nhân viên
     * Params: { search, page, per_page, sort_by, sort_dir, group_id, roles[], ma, ten, email... }
     */
    getList: (params) => {
        // Lưu ý: roles có thể là mảng, axios cần paramsSerializer nếu backend yêu cầu format đặc biệt
        // Nhưng Laravel mặc định hiểu roles[]=1&roles[]=2
        return apiClient.get('/users', { params });
    },

    /**
     * Lấy danh sách Nhóm nhân viên (Để lọc)
     */
    getGroups: () => {
        return apiClient.get('/users/groups');
    },

    /**
     * Lấy danh sách Vai trò (Roles) (Để lọc)
     */
    getRoles: () => {
        return apiClient.get('/users/roles');
    },

    /**
     * Xóa nhân viên
     */
    delete: (id) => {
        return apiClient.delete(`/users/${id}`);
    },

    // Create / Update nếu cần
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
};

export default userApi;