import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl, Pressable
} from 'react-native';

// COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';
import DropdownSelect from '../../components/DropdownSelect';

// API
import transferApi from '../../api/transferApi';

// --- HELPER STATUS ---
const getStatusInfo = (status) => {
    // 1: Hoàn thành, 0: Hủy/Mới (Tùy logic backend)
    switch (parseInt(status)) {
        case 1: return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' };
        case 0: return { text: 'Đang chuyển', color: 'text-orange-600', bg: 'bg-orange-100' };
        default: return { text: 'Mới tạo', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
};

export default function WarehouseTransferScreen() {
    // --- STATE LIST ---
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const onLoadMore = () => {
        if (!isLoadingMore && page < lastPage) {
            setIsLoadingMore(true);
            fetchTransfers(page + 1);
        }
    };
    // const [filterData, setFilterData] = useState({});

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Search & Sort
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE DROPDOWN ---
    const [warehouses, setWarehouses] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [formattedProducts, setFormattedProducts] = useState([]);

    // --- STATE FORM ---
    const [formVisible, setFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        from_warehouse_id: null,
        to_warehouse_id: null,
        transfer_date: new Date().toISOString().split('T')[0],
        status: 1,
        note: '',
        products: [] // [{ product_id, quantity, serial_id, note }]
    });

    // --- STATE FILTER ---
    const [filterVisible, setFilterVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        code: '', status: [], from_date: '', to_date: ''
    });

    // --- EFFECT ---
    useEffect(() => { fetchDropdowns(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchTransfers(1, true), 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---
    const fetchDropdowns = async () => {
        try {
            const [wRes, pRes] = await Promise.all([
                transferApi.getWarehouses(),
                transferApi.getProducts()
            ]);

            // Bảo vệ cho Warehouses
            const warehouseData = wRes?.data?.data || [];
            if (Array.isArray(warehouseData)) {
                setWarehouses(warehouseData);
            } else {
                console.error("Dữ liệu Warehouses không phải array:", warehouseData);
                setWarehouses([]);
            }

            // Bảo vệ cho Products
            const productData = pRes?.data?.data || [];
            if (Array.isArray(productData)) {
                setProductsList(productData);
                setFormattedProducts(productData.map(p => ({
                    ...p, label_display: `${p.product_code} - ${p.product_name}`
                })));
            } else {
                console.error("Dữ liệu Products không phải array:", productData);
                setProductsList([]);
                setFormattedProducts([]);
            }
        } catch (e) {
            console.error("Lỗi tải dropdown:", e);
            setWarehouses([]);
            setProductsList([]);
            setFormattedProducts([]);
        }
    };

    const fetchTransfers = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const cleanFilters = {};
            if (filterValues.code) cleanFilters.code = filterValues.code;
            if (filterValues.status && filterValues.status.length > 0) cleanFilters.status = filterValues.status;

            const params = {
                page: pageNumber, limit: 20,
                search: searchText, // Backend search chung
                sort_by: sortBy, sort_dir: sortDir,
                ...cleanFilters
            };
            const response = await transferApi.getList(params);
            const result = response.data; // { success: true, data: { current_page, data: [...] } }

            if (result.success) {
                // --- SỬA LỖI LẤY DATA ---
                // Kiểm tra cấu trúc trả về thực tế
                let dataList = [];
                let total = 0;

                if (Array.isArray(result.data)) {
                    // Trường hợp 1: Trả về mảng trực tiếp
                    dataList = result.data;
                    total = dataList.length;
                } else if (result.data && result.data.data) {
                    // Trường hợp 2: Trả về Pagination Object (Laravel Default)
                    dataList = result.data.data;
                    total = result.data.total;
                    setPage(result.data.current_page);
                    setLastPage(result.data.last_page);
                }

                if (isRefresh || pageNumber === 1) {
                    setTransfers(dataList);
                } else {
                    setTransfers(prev => [...prev, ...dataList]);
                }

                setTotalRecords(total);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // --- CRUD ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            code: `PCK${Math.floor(Math.random() * 10000)}`,
            from_warehouse_id: null, to_warehouse_id: null,
            transfer_date: new Date().toISOString().split('T')[0],
            status: 1, note: '',
            products: [{ product_id: null, quantity: 1, serial_id: null, note: '' }]
        });
        setFormVisible(true);
    };

    const openEditModal = async (item) => {
        setIsEditing(true);
        setEditId(item.id);
        try {
            const res = await transferApi.getDetail(item.id);
            if (res.data.success) {
                const d = res.data.data;

                // --- SỬA LOGIC MAPPING TẠI ĐÂY ---
                // Backend trả về mảng 'items' (do relation hasMany trong Model)
                const itemsList = d.items || [];

                setFormData({
                    code: d.code,
                    from_warehouse_id: d.from_warehouse_id,
                    to_warehouse_id: d.to_warehouse_id,
                    transfer_date: formatDate(d.transfer_date),
                    status: d.status,
                    note: d.note || '',

                    // Map items vào danh sách sản phẩm trên Form
                    products: itemsList.map(p => ({
                        product_id: p.product_id,
                        quantity: p.quantity || 1,
                        // Hiển thị mã Serial (String) lấy từ relation serialNumber
                        serial: p.serial_number ? p.serial_number.serial_code : '',
                        note: p.note || ''
                    }))
                });
                setFormVisible(true);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không tải được chi tiết");
        }
    };

    const handleSave = async () => {
        if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn Kho nguồn và Kho đích");
            return;
        }
        if (formData.from_warehouse_id === formData.to_warehouse_id) {
            Alert.alert("Lỗi", "Kho nguồn và Kho đích không được trùng nhau");
            return;
        }
        if (formData.products.length === 0) {
            Alert.alert("Thiếu thông tin", "Vui lòng thêm sản phẩm cần chuyển");
            return;
        }

        try {
            let res;
            if (isEditing) res = await transferApi.update(editId, formData);
            else res = await transferApi.create(formData);

            if (res.data.success) {
                Alert.alert("Thành công");
                setFormVisible(false);
                fetchTransfers(1, true);
            } else {
                Alert.alert("Lỗi", res.data.message);
            }
        } catch (e) {
            Alert.alert("Lỗi", e.response?.data?.message || "Lỗi hệ thống");
        }
    };

    const handleDelete = (id, code) => {
        Alert.alert("Xác nhận", `Xóa phiếu ${code}?`, [
            { text: "Hủy" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    await transferApi.delete(id); fetchTransfers(1, true);
                }
            }
        ]);
    };

    // --- PRODUCT FORM LOGIC ---
    const addProductRow = () => {
        setFormData({ ...formData, products: [...formData.products, { product_id: null, quantity: 1, note: '' }] });
    };
    const updateProductRow = (index, field, value) => {
        const newP = [...formData.products];
        newP[index][field] = value;
        setFormData({ ...formData, products: newP });
    };
    const removeProductRow = (index) => {
        const newP = [...formData.products];
        newP.splice(index, 1);
        setFormData({ ...formData, products: newP });
    };

    // --- FILTERS ---
    const handleApplyFilter = () => { setFilterVisible(false); fetchTransfers(1, true); };
    const handleClearFilter = () => { setFilterValues({ code: '', status: [], from_date: '', to_date: '' }); setFilterVisible(false); fetchTransfers(1, true); };

    // --- RENDER TABLE ---
    const renderTableRow = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);
        return (
            <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
                <View className="w-28 px-4"><Text className="text-sm font-bold text-purple-700">{item.code}</Text></View>
                <View className="w-28 px-4"><Text className="text-sm text-gray-600">{formatDate(item.transfer_date)}</Text></View>
                <View className="w-32 px-4"><Text className="text-sm text-gray-800" numberOfLines={1}>{item.from_warehouse?.warehouse_name || item.from_warehouse_id}</Text></View>
                <View className="w-32 px-4"><Text className="text-sm text-gray-800" numberOfLines={1}>{item.to_warehouse?.warehouse_name || item.to_warehouse_id}</Text></View>
                <View className="w-28 px-4"><View className={`px-2 py-1 rounded self-start ${statusInfo.bg}`}><Text className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</Text></View></View>
                <View className="w-40 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.note}</Text></View>
                <View className="w-16 px-2 items-center"><TouchableOpacity onPress={() => handleDelete(item.id, item.code)} className="p-2 bg-gray-100 rounded-full"><TrashIcon /></TouchableOpacity></View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu chuyển kho" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Kho xuất</Text></View>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Kho nhận</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Trạng thái</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Ghi chú</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={transfers} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTransfers(1, true)} />}
                                onEndReached={onLoadMore}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
                            />}
                        <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL FORM --- */}
            <Modal animationType="slide" transparent={true} visible={formVisible} onRequestClose={() => setFormVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFormVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-5 h-[90%]" onPress={e => e.stopPropagation()}>
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa phiếu chuyển' : 'Tạo phiếu chuyển'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>

                            <View className="mb-3"><Text className="mb-1 text-gray-700">Mã phiếu</Text>
                                <TextInput className="border p-2 rounded bg-gray-100" value={formData.code} editable={!isEditing} />
                            </View>

                            <View className="flex-row justify-between mb-3">
                                <View className="w-[48%]"><Text className="mb-1 text-gray-700 font-medium">Kho nguồn (Xuất)</Text>
                                    <DropdownSelect data={warehouses} labelField="name" valueField="id" value={formData.from_warehouse_id} onChange={v => setFormData({ ...formData, from_warehouse_id: v })} placeholder="Chọn kho..." search={true} />
                                </View>
                                <View className="w-[48%]"><Text className="mb-1 text-gray-700 font-medium">Kho đích (Nhập)</Text>
                                    <DropdownSelect data={warehouses} labelField="name" valueField="id" value={formData.to_warehouse_id} onChange={v => setFormData({ ...formData, to_warehouse_id: v })} placeholder="Chọn kho..." search={true} />
                                </View>
                            </View>

                            <View className="mb-3"><Text className="mb-1">Ngày chuyển</Text><TextInput className="border p-2 rounded" value={formData.transfer_date} onChangeText={t => setFormData({ ...formData, transfer_date: t })} placeholder="YYYY-MM-DD" /></View>
                            <View className="mb-3"><Text className="mb-1">Ghi chú</Text><TextInput className="border p-2 rounded" value={formData.note} onChangeText={t => setFormData({ ...formData, note: t })} /></View>

                            <View className="mb-3"><Text className="mb-1">Trạng thái</Text>
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => setFormData({ ...formData, status: 1 })} className={`mr-3 px-3 py-2 border rounded ${formData.status === 1 ? 'bg-green-100' : 'bg-white'}`}><Text>Hoàn thành</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFormData({ ...formData, status: 0 })} className={`px-3 py-2 border rounded ${formData.status === 0 ? 'bg-orange-100' : 'bg-white'}`}><Text>Đang chuyển</Text></TouchableOpacity>
                                </View>
                            </View>

                            {/* SẢN PHẨM */}
                            <View className="flex-row justify-between items-center mt-4 mb-2">
                                <Text className="font-bold text-gray-800">II. Hàng hóa</Text>
                                <TouchableOpacity onPress={addProductRow} className="bg-blue-500 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm SP</Text></TouchableOpacity>
                            </View>

                            {formData.products.map((item, index) => (
                                <View key={index} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-bold">SP #{index + 1}</Text>
                                        <TouchableOpacity onPress={() => removeProductRow(index)}><Text className="text-red-500 text-xs">Xóa</Text></TouchableOpacity>
                                    </View>
                                    <View className="mb-2">
                                        <DropdownSelect data={formattedProducts} labelField="label_display" valueField="id" value={item.product_id} onChange={v => updateProductRow(index, 'product_id', v)} placeholder="Chọn sản phẩm..." search={true} />
                                    </View>
                                    <View className="flex-row justify-between">
                                        <View className="w-[30%]"><Text className="text-xs mb-1">Số lượng</Text>
                                            <TextInput className="border p-1 rounded bg-white text-center" value={item.quantity.toString()} onChangeText={t => updateProductRow(index, 'quantity', parseInt(t) || 1)} keyboardType="numeric" />
                                        </View>
                                        <View className="w-[65%]"><Text className="text-xs mb-1">Serial (nếu có)</Text>
                                            <TextInput className="border p-1 rounded bg-white" value={item.serial_id} onChangeText={t => updateProductRow(index, 'serial_id', t)} placeholder="Nhập serial..." />
                                        </View>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-6" onPress={handleSave}><Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'TẠO PHIẾU'}</Text></TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- MODAL FILTER --- */}
            <Modal animationType="slide" transparent={true} visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[60%] w-full" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded" value={filterValues.code} onChangeText={t => setFilterValues({ ...filterValues, code: t })} /></View>

                            <View className="mb-3"><Text className="mb-1">Trạng thái</Text>
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, status: [1] })} className="mr-2 mb-2 px-3 py-1 border rounded"><Text>Hoàn thành</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, status: [0] })} className="mr-2 mb-2 px-3 py-1 border rounded"><Text>Đang chuyển</Text></TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}