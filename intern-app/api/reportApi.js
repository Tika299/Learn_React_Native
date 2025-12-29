import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Quan trọng để Laravel nhận diện là AJAX
    }
});

const reportApi = {
    // --- 1. TỔNG QUÁT ---
    getOverview: () => {
        return apiClient.get('/reports/overview');
    },
    // Lọc tổng quát (dataName: 'phieuXN', 'baoCaoTK'...)
    filterOverview: (params) => {
        return apiClient.get('/reports/filter-period', { params });
    },

    // --- 2. XUẤT NHẬP ---
    getExportImport: (params) => {
        // Nếu có params (lọc), gọi API filter, ngược lại gọi API thường
        if (params && Object.keys(params).length > 0) {
            return apiClient.get('/reports/filter-export-import', { params });
        }
        return apiClient.get('/reports/export-import');
    },

    // --- 3. TIẾP NHẬN - TRẢ HÀNG ---
    getReceiptReturn: (params) => {
        if (params && Object.keys(params).length > 0) {
            return apiClient.get('/reports/filter-receipt-return', { params });
        }
        return apiClient.get('/reports/receipt-return');
    },

    // --- 4. BÁO GIÁ ---
    getQuotation: (params) => {
        if (params && Object.keys(params).length > 0) {
            return apiClient.get('/reports/filter-quotation', { params });
        }
        return apiClient.get('/reports/quotation');
    }
};

export default reportApi;