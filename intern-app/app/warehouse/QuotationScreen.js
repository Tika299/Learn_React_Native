import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl, Pressable
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';
import DropdownSelect from '../../components/DropdownSelect';

import quotationApi from '../../api/quotationApi';

// Helper format tiền
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function QuotationScreen() {
    // --- STATE LIST ---
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    }
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE DROPDOWN ---
    const [customers, setCustomers] = useState([]);
    const [receivings, setReceivings] = useState([]); // List phiếu tiếp nhận

    // --- STATE FORM (Add/Edit) ---
    const [formVisible, setFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form Data bao gồm mảng services (chi tiết báo giá)
    const [formData, setFormData] = useState({
        quotation_code: '',
        customer_id: null,
        reception_id: null, // Link với phiếu tiếp nhận (nullable)
        quotation_date: new Date().toISOString().split('T')[0],
        notes: '',
        total_amount: 0,
        services: [] // Mảng chứa các object QuotationService
    });

    // --- STATE FILTER ---
    const [filterVisible, setFilterVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({ ma: '', customer: null });

    // --- EFFECT ---
    useEffect(() => { fetchDropdowns(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchQuotations(1, true), 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API ---
    const fetchDropdowns = async () => {
        try {
            const [cRes, rRes] = await Promise.all([
                quotationApi.getCustomers(),
                quotationApi.getReceivings() // Nếu API này hỗ trợ lấy list gọn nhẹ
            ]);
            if (cRes.data.success || cRes.data.data) setCustomers(cRes.data.data);

            // Xử lý list receiving (cần map field cho dropdown)
            if (rRes.data.success || rRes.data.data) {
                const rData = rRes.data.data.data || rRes.data.data; // Tùy cấu trúc phân trang
                setReceivings(rData);
            }
        } catch (e) { console.error("Lỗi dropdown:", e); }
    };

    const fetchQuotations = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, limit: 20,
                search: searchText,
                sort_by: sortBy, sort_dir: sortDir,
                ...filterValues
            };
            const response = await quotationApi.getList(params);
            const result = response.data; // { status: true, data: { current_page, data: [...] } }

            if (result.status === true || result.success) {
                // --- SỬA TẠI ĐÂY ---
                // API trả về: result.data (Pagination) -> result.data.data (Array)
                const paginationData = result.data;
                const dataList = paginationData.data || [];

                if (isRefresh || pageNumber === 1) {
                    setQuotations(dataList);
                } else {
                    setQuotations(prev => [...prev, ...dataList]);
                }

                // Cập nhật phân trang
                setPage(paginationData.current_page || 1);
                setLastPage(paginationData.last_page || 1);
                setTotalRecords(paginationData.total || 0);
            }
        } catch (error) {
            console.error("Lỗi tải báo giá:", error);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // --- LOGIC FORM SERVICES (CHI TIẾT) ---

    const addServiceRow = () => {
        setFormData({
            ...formData,
            services: [
                ...formData.services,
                {
                    service_name: '',
                    unit: 'Cái',
                    brand: '',
                    quantity: 1,
                    unit_price: 0,
                    tax_rate: 0,
                    total: 0,
                    note: ''
                }
            ]
        });
    };

    const removeServiceRow = (index) => {
        const newServices = [...formData.services];
        newServices.splice(index, 1);
        calculateTotalAmount(newServices); // Tính lại tổng tiền
    };

    const updateServiceRow = (index, field, value) => {
        const newServices = [...formData.services];
        const row = newServices[index];

        row[field] = value;

        // Tự động tính thành tiền: SL * Đơn giá * (1 + Thuế%)
        if (['quantity', 'unit_price', 'tax_rate'].includes(field)) {
            const qty = parseFloat(row.quantity) || 0;
            const price = parseFloat(row.unit_price) || 0;
            const tax = parseFloat(row.tax_rate) || 0;

            // Công thức: Total = Qty * Price + (Qty * Price * Tax / 100)
            const subTotal = qty * price;
            const taxAmount = subTotal * (tax / 100);
            row.total = subTotal + taxAmount;
        }

        calculateTotalAmount(newServices);
    };

    const calculateTotalAmount = (services) => {
        const total = services.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        setFormData({ ...formData, services: services, total_amount: total });
    };

    // --- CRUD ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            quotation_code: `BG${Math.floor(Math.random() * 100000)}`,
            customer_id: null, reception_id: null,
            quotation_date: new Date().toISOString().split('T')[0],
            notes: '', total_amount: 0, services: []
        });
        setFormVisible(true);
    };

    const openEditModal = async (item) => {
        setIsEditing(true);
        setEditId(item.id);
        try {
            const res = await quotationApi.getDetail(item.id);
            if (res.data.success) {
                const d = res.data.data;
                setFormData({
                    quotation_code: d.quotation_code,
                    customer_id: d.customer_id,
                    reception_id: d.reception_id,
                    quotation_date: d.quotation_date,
                    notes: d.notes,
                    total_amount: d.total_amount,
                    // Map services từ API (quotation_services) vào form
                    services: d.services ? d.services.map(s => ({
                        service_name: s.service_name,
                        unit: s.unit,
                        brand: s.brand,
                        quantity: s.quantity,
                        unit_price: s.unit_price,
                        tax_rate: s.tax_rate,
                        total: s.total,
                        note: s.note
                    })) : []
                });
                setFormVisible(true);
            }
        } catch (e) { Alert.alert("Lỗi", "Không tải được chi tiết"); }
    };

    const handleSave = async () => {
        if (!formData.customer_id) { Alert.alert("Thiếu thông tin", "Vui lòng chọn khách hàng"); return; }
        if (formData.services.length === 0) { Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất 1 dịch vụ/sản phẩm"); return; }

        // Validate services
        for (let s of formData.services) {
            if (!s.service_name) { Alert.alert("Lỗi", "Tên dịch vụ không được để trống"); return; }
        }

        try {
            let res;
            if (isEditing) res = await quotationApi.update(editId, formData);
            else res = await quotationApi.create(formData);

            if (res.data.success || res.data.status) {
                Alert.alert("Thành công");
                setFormVisible(false);
                fetchQuotations(1, true);
            } else {
                Alert.alert("Lỗi", JSON.stringify(res.data.errors || res.data.message));
            }
        } catch (e) { Alert.alert("Lỗi", "Hệ thống gặp sự cố"); }
    };

    const handleDelete = (id, code) => {
        Alert.alert("Xác nhận", `Xóa phiếu báo giá ${code}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    await quotationApi.delete(id); fetchQuotations(1, true);
                }
            }
        ]);
    };

    // --- RENDER TABLE ---
    const renderTableRow = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            {/* Mã phiếu */}
            <View className="w-32 px-4">
                <Text className="text-sm font-bold text-purple-700">{item.quotation_code}</Text>
            </View>

            {/* Khách hàng */}
            <View className="w-40 px-4">
                <Text className="text-sm text-gray-800" numberOfLines={1}>
                    {item.customer?.customer_name || '---'}
                </Text>
            </View>

            {/* Ngày lập */}
            <View className="w-28 px-4">
                <Text className="text-sm text-gray-600">{formatDate(item.quotation_date)}</Text>
            </View>

            {/* Phiếu tiếp nhận (Lấy từ relation reception) */}
            <View className="w-32 px-4">
                <Text className="text-sm font-medium text-blue-600">
                    {item.reception?.form_code_receiving || '---'}
                </Text>
            </View>

            {/* Tổng tiền */}
            <View className="w-32 px-4">
                <Text className="text-sm font-bold text-red-600">{formatCurrency(item.total_amount)}</Text>
            </View>

            {/* Ghi chú */}
            <View className="w-48 px-4">
                <Text className="text-sm text-gray-600" numberOfLines={1}>{item.notes}</Text>
            </View>

            {/* Nút Xóa */}
            <View className="w-16 px-2 items-center">
                <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.quotation_code)}
                    className="p-2 bg-gray-100 rounded-full"
                >
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu báo giá" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Khách hàng</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Tổng tiền</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={quotations} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchQuotations(1, true)} />}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
                            />}
                        <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL FORM --- */}
            <Modal animationType="slide" transparent={true} visible={formVisible} onRequestClose={() => setFormVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFormVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-5 h-[95%]" onPress={e => e.stopPropagation()}>
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa báo giá' : 'Tạo báo giá'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* 1. THÔNG TIN CHUNG */}
                            <View className="bg-gray-50 p-3 rounded mb-4">
                                <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>
                                <View className="mb-3">
                                    <Text className="mb-1 text-gray-700 font-medium">Khách hàng <Text className="text-red-500">*</Text></Text>
                                    <DropdownSelect
                                        data={customers}
                                        labelField="customer_name"
                                        valueField="id"
                                        value={formData.customer_id}
                                        onChange={(val) => setFormData({ ...formData, customer_id: val })}
                                        placeholder="Chọn khách hàng..."
                                        search={true}
                                    />
                                </View>

                                <View className="mb-3">
                                    <Text className="mb-1 text-gray-700">Phiếu tiếp nhận (Nếu có)</Text>
                                    <DropdownSelect
                                        data={receivings}
                                        labelField="form_code_receiving" // Hiển thị mã PN
                                        valueField="id"
                                        value={formData.reception_id}
                                        onChange={(val) => setFormData({ ...formData, reception_id: val })}
                                        placeholder="Chọn phiếu tiếp nhận..."
                                        search={true}
                                    />
                                </View>

                                <View className="flex-row justify-between">
                                    <View className="w-[48%]"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded bg-white" value={formData.quotation_code} editable={!isEditing} /></View>
                                    <View className="w-[48%]"><Text className="mb-1">Ngày lập</Text><TextInput className="border p-2 rounded bg-white" value={formData.quotation_date} onChangeText={t => setFormData({ ...formData, quotation_date: t })} placeholder="YYYY-MM-DD" /></View>
                                </View>
                                <View className="mt-3"><Text className="mb-1">Ghi chú</Text><TextInput className="border p-2 rounded bg-white" value={formData.notes} onChangeText={t => setFormData({ ...formData, notes: t })} /></View>
                            </View>

                            {/* 2. CHI TIẾT DỊCH VỤ */}
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="font-bold text-gray-800">II. Chi tiết dịch vụ/hàng hóa</Text>
                                <TouchableOpacity onPress={addServiceRow} className="bg-blue-600 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm dòng</Text></TouchableOpacity>
                            </View>

                            {formData.services.map((item, index) => (
                                <View key={index} className="border border-gray-300 rounded p-3 mb-3 bg-white shadow-sm">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-bold text-gray-700">#{index + 1}</Text>
                                        <TouchableOpacity onPress={() => removeServiceRow(index)}><Text className="text-red-500 font-bold text-xs">Xóa</Text></TouchableOpacity>
                                    </View>

                                    <View className="mb-2">
                                        <Text className="text-xs text-gray-500">Tên dịch vụ / Sản phẩm</Text>
                                        <TextInput className="border-b border-gray-200 py-1 text-sm font-medium" value={item.service_name} onChangeText={t => updateServiceRow(index, 'service_name', t)} placeholder="Nhập tên dịch vụ..." />
                                    </View>

                                    <View className="flex-row justify-between mb-2">
                                        <View className="w-[30%]">
                                            <Text className="text-xs text-gray-500">ĐVT</Text>
                                            <TextInput className="border-b border-gray-200 py-1 text-sm" value={item.unit} onChangeText={t => updateServiceRow(index, 'unit', t)} />
                                        </View>
                                        <View className="w-[30%]">
                                            <Text className="text-xs text-gray-500">Hãng</Text>
                                            <TextInput className="border-b border-gray-200 py-1 text-sm" value={item.brand} onChangeText={t => updateServiceRow(index, 'brand', t)} />
                                        </View>
                                        <View className="w-[30%]">
                                            <Text className="text-xs text-gray-500">Số lượng</Text>
                                            <TextInput className="border-b border-gray-200 py-1 text-sm text-center font-bold" value={item.quantity.toString()} onChangeText={t => updateServiceRow(index, 'quantity', t)} keyboardType="numeric" />
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between mb-2">
                                        <View className="w-[48%]">
                                            <Text className="text-xs text-gray-500">Đơn giá</Text>
                                            <TextInput className="border-b border-gray-200 py-1 text-sm text-right" value={item.unit_price.toString()} onChangeText={t => updateServiceRow(index, 'unit_price', t)} keyboardType="numeric" />
                                        </View>
                                        <View className="w-[48%]">
                                            <Text className="text-xs text-gray-500">Thuế (%)</Text>
                                            <TextInput className="border-b border-gray-200 py-1 text-sm text-right" value={item.tax_rate.toString()} onChangeText={t => updateServiceRow(index, 'tax_rate', t)} keyboardType="numeric" />
                                        </View>
                                    </View>

                                    <View className="flex-row justify-end items-center bg-gray-50 p-2 rounded">
                                        <Text className="text-xs text-gray-500 mr-2">Thành tiền:</Text>
                                        <Text className="text-sm font-bold text-blue-700">{formatCurrency(item.total)}</Text>
                                    </View>
                                </View>
                            ))}

                            {/* TỔNG TIỀN */}
                            <View className="bg-blue-50 p-3 rounded mb-4 flex-row justify-between items-center border border-blue-100">
                                <Text className="font-bold text-gray-700 text-lg">TỔNG CỘNG:</Text>
                                <Text className="font-bold text-red-600 text-xl">{formatCurrency(formData.total_amount)}</Text>
                            </View>

                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-2 mb-8" onPress={handleSave}>
                                <Text className="text-white font-bold text-lg">{isEditing ? 'LƯU THAY ĐỔI' : 'TẠO BÁO GIÁ'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- MODAL FILTER (Bạn có thể thêm tương tự) --- */}
            <Modal animationType="slide" transparent={true} visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[50%]" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc</Text>
                        <View className="mb-3"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} /></View>
                        <View className="mb-4">
                            <Text className="mb-1">Khách hàng</Text>
                            <DropdownSelect data={customers} labelField="customer_name" valueField="id" value={filterValues.customer} onChange={v => setFilterValues({ ...filterValues, customer: v })} placeholder="Chọn khách hàng..." search={true} />
                        </View>
                        <View className="mt-4 flex-row justify-end">
                            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded mr-2" onPress={() => { setFilterValues({ ma: '', customer: null }); setFilterVisible(false); fetchQuotations(1, true); }}><Text>Xóa lọc</Text></TouchableOpacity>
                            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded" onPress={() => { setFilterVisible(false); fetchQuotations(1, true); }}><Text className="text-white">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}