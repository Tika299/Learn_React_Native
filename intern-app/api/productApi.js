import axios from 'axios';

// URL gốc (Web.php -> Không có /api)
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Quan trọng để chặn lỗi 302 Redirect
    }
});

const productApi = {
    /**
     * Lấy danh sách sản phẩm
     * Params: { search, page, per_page, sort_by, sort_dir, group_id, ma, ten, hang ... }
     */
    getList: (params) => apiClient.get('/products', { params }),

    getGroups: () => apiClient.get('/products/groups'),

    // Lưu ý: Route backend bạn dùng 'add' cho create và 'update' cho edit
    create: (data) => apiClient.post('/products', data), // POST /api/products (gọi hàm add trong controller nếu route trỏ đúng)

    update: (id, data) => apiClient.put(`/products/${id}`, data),

    delete: (id) => apiClient.delete(`/products/${id}`),
};

export default productApi;