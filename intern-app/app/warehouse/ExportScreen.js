import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, Pressable
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';
import DropdownSelect from '../../components/DropdownSelect';

// API
import exportApi from '../../api/exportApi';

export default function ExportScreen() {
    // --- STATE LIST ---
    const [exports, setExports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchText, setSearchText] = useState('');

    // Sorting
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE DROPDOWN ---
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    // --- STATE FORM (Add/Edit) ---
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        export_code: '',
        customer_id: null,
        warehouse_id: null,
        date_create: new Date().toISOString().split('T')[0],
        note: '',
        products: [] // Mảng: { product_id, quantity, serial }
    });

    // --- STATE FILTER ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '',
        customer_id: null,
        warehouse_id: null
    });

    // --- EFFECT ---
    useEffect(() => { fetchDropdowns(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchExports(1, true), 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---

    const fetchDropdowns = async () => {
        try {
            const [cRes, wRes, pRes] = await Promise.all([
                exportApi.getCustomers(), // Cần đảm bảo endpoint này trả về list khách hàng
                exportApi.getWarehouses(),
                exportApi.getProducts()
            ]);

            // Xử lý dữ liệu trả về tùy theo cấu trúc API của bạn
            if (cRes.data.data) setCustomers(cRes.data.data);
            if (wRes.data.data) setWarehouses(wRes.data.data);
            if (pRes.data.data) setProducts(pRes.data.data);

        } catch (e) { console.log("Lỗi tải dữ liệu dropdown:", e); }
    };

    const fetchExports = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber,
                limit: 20,
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...filterValues
            };

            const res = await exportApi.getList(params);
            const result = res.data;

            if (result.success || result.status) {
                // --- SỬA LỖI TẠI ĐÂY ---
                // API trả về: result.data (Pagination Object) -> result.data.data (Array Items)
                const paginationData = result.data;
                const dataList = paginationData.data || [];

                if (isRefresh || pageNumber === 1) {
                    setExports(dataList);
                } else {
                    setExports(prev => [...prev, ...dataList]);
                }

                // Cập nhật phân trang
                setPage(paginationData.current_page || 1);
                setLastPage(paginationData.last_page || 1);
                setTotalRecords(paginationData.total || 0);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false); // Đảm bảo tắt loading
        }
    };

    // --- HANDLERS FORM ---

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            export_code: `PX${Math.floor(Math.random() * 10000)}`, // Mã tự động demo
            customer_id: null,
            warehouse_id: null,
            date_create: new Date().toISOString().split('T')[0],
            note: '',
            products: []
        });
        setFormVisible(true);
    };

    const openEditModal = async (item) => {
        setIsEditing(true);
        setEditId(item.id);
        try {
            const res = await exportApi.getDetail(item.id);
            if (res.data.success) {
                const d = res.data.data;
                setFormData({
                    export_code: d.export_code,
                    customer_id: d.customer_id,
                    warehouse_id: d.warehouse_id,
                    date_create: d.date_create ? d.date_create.split(' ')[0] : '',
                    note: d.note,
                    // Map product_exports -> products
                    products: d.product_export ? d.product_export.map(p => ({
                        product_id: p.product_id,
                        quantity: p.quantity,
                        serial: p.serial_number ? p.serial_number.serial_code : '', // Lấy mã serial nếu có
                        product_name: p.product ? p.product.product_name : ''
                    })) : []
                });
                setFormVisible(true);
            }
        } catch (e) { Alert.alert("Lỗi", "Không lấy được chi tiết"); }
    };

    // Logic thêm/sửa/xóa dòng sản phẩm
    const handleAddProductRow = () => {
        setFormData({ ...formData, products: [...formData.products, { product_id: null, quantity: 1, serial: '' }] });
    };
    const handleUpdateRow = (index, field, value) => {
        const newProds = [...formData.products];
        newProds[index][field] = value;
        setFormData({ ...formData, products: newProds });
    };
    const handleRemoveRow = (index) => {
        const newProds = [...formData.products];
        newProds.splice(index, 1);
        setFormData({ ...formData, products: newProds });
    };

    const handleSave = async () => {
        // Validate sơ bộ
        if (!formData.customer_id || !formData.warehouse_id || formData.products.length === 0) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn Khách hàng, Kho và ít nhất 1 sản phẩm.");
            return;
        }

        try {
            let res;
            if (isEditing) res = await exportApi.update(editId, formData);
            else res = await exportApi.create(formData);

            if (res.data.success) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật" : "Đã tạo phiếu xuất");
                setFormVisible(false);
                fetchExports(1, true);
            } else {
                Alert.alert("Lỗi", JSON.stringify(res.data.message));
            }
        } catch (e) {
            Alert.alert("Lỗi", e.response?.data?.message || "Lỗi hệ thống");
        }
    };

    const handleDelete = (id, code) => {
        Alert.alert("Xác nhận", `Xóa phiếu xuất ${code}?`, [
            { text: "Hủy" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        const res = await exportApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công");
                            fetchExports(1, true);
                        } else {
                            Alert.alert("Lỗi", res.data.message);
                        }
                    } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
                }
            }
        ]);
    };

    // --- HANDLERS FILTER ---
    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchExports(1, true);
    };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', customer_id: null, warehouse_id: null });
        setFilterModalVisible(false);
        fetchExports(1, true);
    };

    // --- RENDER TABLE ---
    const renderTableRow = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            {/* Mã phiếu */}
            <View className="w-28 px-4">
                <Text className="text-sm font-bold text-purple-700">{item.export_code}</Text>
            </View>

            {/* Ngày lập: Cắt chuỗi để lấy YYYY-MM-DD */}
            <View className="w-28 px-4">
                <Text className="text-sm text-gray-800">
                    {item.date_create ? item.date_create.split(' ')[0] : ''}
                </Text>
            </View>

            {/* Khách hàng: Ưu tiên customername có sẵn ở root */}
            <View className="w-40 px-4">
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {item.customername || item.customer?.customer_name || '---'}
                </Text>
            </View>

            {/* Kho (Tạm thời API chưa trả về tên kho ở root, lấy từ warehouse_id nếu chưa join) */}
            {/* Nếu API đã join warehouses, hãy dùng item.warehouse_name */}
            <View className="w-32 px-4">
                <Text className="text-sm text-gray-600">
                    {item.warehouse_name || ('Kho ' + item.warehouse_id)}
                </Text>
            </View>

            {/* Nút Xóa */}
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.export_code)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu xuất hàng" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                onCreatePress={openAddModal}
                onFilterPress={() => setFilterModalVisible(true)}
            />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Khách hàng</Text></View>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Kho</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={exports} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchExports(1, true)} />}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
                            />}
                        <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL FORM (THÊM / SỬA) --- */}
            <Modal animationType="slide" transparent={true} visible={formVisible} onRequestClose={() => setFormVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-5 h-[90%]">
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa phiếu xuất' : 'Tạo phiếu xuất'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                            <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>
                            <View className="flex-row justify-between mb-3">
                                <View className="w-[48%]"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded bg-gray-100" value={formData.export_code} editable={!isEditing} /></View>
                                <View className="w-[48%]"><Text className="mb-1">Ngày lập</Text><TextInput className="border p-2 rounded" value={formData.date_create} onChangeText={t => setFormData({ ...formData, date_create: t })} placeholder="YYYY-MM-DD" /></View>
                            </View>

                            {/* KHÁCH HÀNG */}
                            <View className="mb-3">
                                <Text className="mb-1 text-gray-700 font-medium">Khách hàng</Text>
                                <DropdownSelect
                                    data={customers}
                                    labelField="customer_name" // <--- SỬA THÀNH 'customer_name'
                                    valueField="id"
                                    value={formData.customer_id}
                                    onChange={(value) => setFormData({ ...formData, customer_id: value })}
                                    placeholder="Chọn khách hàng..."
                                    search={true} // Bật tìm kiếm
                                />
                            </View>

                            {/* KHO */}
                            <View className="mb-3">
                                <Text className="mb-1 text-gray-700 font-medium">Kho xuất</Text>
                                <DropdownSelect
                                    data={warehouses}
                                    value={formData.warehouse_id}
                                    onChange={(value) => setFormData({ ...formData, warehouse_id: value })}
                                    labelField="name" // Hoặc 'warehouse_name' tùy API kho trả về
                                    valueField="id"
                                    placeholder="Chọn kho..."
                                />
                            </View>

                            {/* DANH SÁCH SẢN PHẨM */}
                            <View className="flex-row justify-between items-center mt-4 mb-2">
                                <Text className="font-bold text-gray-800">II. Danh sách hàng hóa</Text>
                                <TouchableOpacity onPress={handleAddProductRow} className="bg-blue-500 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm hàng</Text></TouchableOpacity>
                            </View>

                            {formData.products.map((item, index) => (
                                <View key={index} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-bold">Sản phẩm #{index + 1}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveRow(index)}>
                                            <Text className="text-red-500 text-xs">Xóa</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Chọn Sản phẩm trong dòng chi tiết */}
                                    <View className="mb-2">
                                        <DropdownSelect
                                            data={products}
                                            value={item.product_id}
                                            onChange={(value) => handleUpdateRow(index, 'product_id', value)}
                                            labelField="product_name" // API sản phẩm trả về 'product_name'
                                            valueField="id"
                                            placeholder="Tìm sản phẩm..."
                                            search={true} // Cho phép tìm kiếm
                                        />
                                    </View>

                                    <View className="flex-row justify-between">
                                        <View className="w-[48%]">
                                            <Text className="mb-1 text-xs">Số lượng:</Text>
                                            <TextInput
                                                className="border p-1 rounded bg-white text-center"
                                                value={item.quantity.toString()}
                                                onChangeText={t => handleUpdateRow(index, 'quantity', parseInt(t) || 0)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View className="w-[48%]">
                                            <Text className="mb-1 text-xs">Serial (nếu có):</Text>
                                            <TextInput
                                                className="border p-1 rounded bg-white"
                                                value={item.serial}
                                                onChangeText={t => handleUpdateRow(index, 'serial', t)}
                                                placeholder="Nhập serial..."
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-6" onPress={handleSave}>
                                <Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'TẠO PHIẾU'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL FILTER --- */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[70%] w-full" onPress={(e) => e.stopPropagation()}>
                        <Text className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Bộ lọc Phiếu xuất</Text>

                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Mã phiếu</Text>
                                <TextInput className="border p-3 rounded bg-gray-50" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} />
                            </View>

                            {/* Filter Khách hàng */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Khách hàng</Text>
                                <DropdownSelect
                                    data={customers}
                                    labelField="customer_name" // <--- SỬA THÀNH 'customer_name'
                                    valueField="id"
                                    value={formData.customer_id}
                                    onChange={(value) => setFormData({ ...formData, customer_id: value })}
                                    placeholder="Chọn khách hàng..."
                                    search={true} // Bật tìm kiếm
                                />
                            </View>

                            {/* Filter Kho */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Kho xuất</Text>
                                <DropdownSelect
                                    data={warehouses}
                                    value={filterValues.warehouse_id}
                                    onChange={(value) => setFilterValues({ ...filterValues, warehouse_id: value })}
                                    labelField="name" // Check lại API trả về 'name' hay 'warehouse_name'
                                    valueField="id"
                                    placeholder="Tất cả kho"
                                />
                            </View>
                        </ScrollView>

                        <View className="mt-4 pt-3 border-t flex-row">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

        </SafeAreaView>
    );
}