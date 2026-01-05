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
    getOverview: () => apiClient.get('/reports/overview'),

    // Sửa lại đường dẫn gọi API lọc
    filterOverview: (dataName, dataValue) => {
        return apiClient.get('/reports/filter-overview', {
            params: {
                dataName: dataName,
                dataValue: dataValue
            }
        });
    },

    // ... (Các hàm khác giữ nguyên)
    getExportImport: (params) => apiClient.get('/reports/export-import', { params }), // Example check logic inside if needed
    getReceiptReturn: (params) => apiClient.get('/reports/receipt-return', { params }),
    getQuotation: (params) => apiClient.get('/reports/quotation', { params }),
};

export default reportApi;