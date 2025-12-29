import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl, Pressable
} from 'react-native';

// COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// Import Dropdown
import DropdownSelect from '../../components/DropdownSelect';

// API
import receivingApi from '../../api/receivingApi';

// --- HELPER STATUS ---
const getFormTypeText = (type) => {
    switch (parseInt(type)) {
        case 1: return { text: 'Bảo hành', color: 'text-gray-600' };
        case 2: return { text: 'Dịch vụ', color: 'text-green-600' };
        case 3: return { text: 'BH Dịch vụ', color: 'text-yellow-600' };
        default: return { text: 'Khác', color: 'text-gray-500' };
    }
};
const getStatusText = (status) => {
    switch (parseInt(status)) {
        case 1: return { text: 'Tiếp nhận', color: 'text-gray-600', bg: 'bg-gray-100' };
        case 2: return { text: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-100' };
        case 3: return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' };
        case 4: return { text: 'Khách từ chối', color: 'text-red-600', bg: 'bg-red-100' };
        default: return { text: '---', color: 'text-gray-500', bg: 'bg-gray-50' };
    }
};
const getStateText = (state) => {
    switch (parseInt(state)) {
        case 1: return { text: 'Mới', color: 'text-gray-600' };
        case 2: return { text: 'Đang xử lý', color: 'text-blue-600' };
        case 3: return { text: 'Đã hoàn thành', color: 'text-green-600' };
        case 4: return { text: 'Khách từ chối', color: 'text-red-600' };
        default: return { text: '---', color: 'text-gray-500' };
    }
};

export default function ReceivingScreen() {
    // --- STATE LIST ---
    const [receivings, setReceivings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Search & Sort
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE DROPDOWN ---
    const [customers, setCustomers] = useState([]);
    const [productsList, setProductsList] = useState([]);
    // Tạo danh sách sản phẩm có format label đẹp hơn (Mã - Tên)
    const [formattedProducts, setFormattedProducts] = useState([]);

    // --- STATE FORM (Add/Edit) ---
    const [formVisible, setFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        branch_id: 1,
        form_type: 1,
        customer_id: null,
        contact_person: '',
        phone: '',
        address: '',
        date_created: new Date().toISOString().split('T')[0],
        notes: '',
        status: 1,
        products: []
    });

    // --- STATE FILTER ---
    const [filterVisible, setFilterVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '',
        customer: null, // Đổi thành null (single select) cho dropdown
        status: [],
        form_type: []
    });

    // --- EFFECT ---
    useEffect(() => { fetchDropdowns(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchReceivings(1, true), 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API ---
    const fetchDropdowns = async () => {
        try {
            const [cRes, pRes] = await Promise.all([
                receivingApi.getCustomers(),
                receivingApi.getProducts()
            ]);
            if (cRes.data.success || cRes.data.data) setCustomers(cRes.data.data);
            if (pRes.data.success || pRes.data.data) {
                const rawProducts = pRes.data.data;
                setProductsList(rawProducts);
                const formatted = rawProducts.map(p => ({
                    ...p,
                    label_display: `${p.product_code} - ${p.product_name}`
                }));
                setFormattedProducts(formatted);
            }
        } catch (e) { console.error("Lỗi dropdown:", e); }
    };

    const fetchReceivings = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            // 1. Làm sạch params (Bỏ null/empty) để Backend nhận diện đúng
            const cleanFilters = {};
            if (filterValues.ma) cleanFilters.ma = filterValues.ma;
            if (filterValues.customer) cleanFilters.customer = filterValues.customer;
            if (filterValues.status && filterValues.status.length > 0) cleanFilters.status = filterValues.status;

            const params = {
                page: pageNumber,
                limit: 20,
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...cleanFilters // Chỉ gửi những cái có giá trị
            };

            console.log("Params gửi đi:", params); // Debug

            const response = await receivingApi.getList(params);
            const result = response.data;

            if (result.status === 'success' || result.success) {
                let dataList = [];
                let total = 0;

                if (Array.isArray(result.data)) {
                    dataList = result.data;
                    total = dataList.length;
                } else if (result.data && result.data.data) {
                    dataList = result.data.data;
                    total = result.data.total;
                    setPage(result.data.current_page);
                    setLastPage(result.data.last_page);
                }

                if (isRefresh || pageNumber === 1) {
                    setReceivings(dataList);
                } else {
                    setReceivings(prev => [...prev, ...dataList]);
                }
                setTotalRecords(total);
            }
        } catch (error) { console.error("Lỗi tải danh sách:", error); }
        finally { setLoading(false); setRefreshing(false); setIsLoadingMore(false); }
    };

    // --- CRUD HANDLERS ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            branch_id: 1, form_type: 1, customer_id: null,
            contact_person: '', phone: '', address: '',
            date_created: new Date().toISOString().split('T')[0],
            notes: '', status: 1,
            products: [{ product_id: null, quantity: 1, serial: '' }]
        });
        setFormVisible(true);
    };

    const openEditModal = async (item) => {
        setIsEditing(true);
        setEditId(item.id);
        try {
            const res = await receivingApi.getDetail(item.id);
            if (res.data.success) {
                const d = res.data.data;
                setFormData({
                    branch_id: d.branch_id,
                    form_type: d.form_type,
                    customer_id: d.customer_id,
                    contact_person: d.contact_person || '',
                    phone: d.phone || '',
                    address: d.address || '',
                    date_created: d.date_created ? d.date_created.split(' ')[0] : '',
                    notes: d.notes || '',
                    status: d.status,
                    products: d.received_products ? d.received_products.map(p => ({
                        product_id: p.product_id,
                        quantity: p.quantity,
                        serial: p.serial ? p.serial.serial_code : '',
                        note: p.note || ''
                    })) : []
                });
                setFormVisible(true);
            }
        } catch (e) { Alert.alert("Lỗi", "Không tải được chi tiết"); }
    };

    const handleSave = async () => {
        if (!formData.customer_id) { Alert.alert("Thiếu thông tin", "Vui lòng chọn khách hàng"); return; }
        if (formData.products.length === 0) { Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất 1 sản phẩm"); return; }

        for (let p of formData.products) {
            if (!p.product_id) { Alert.alert("Thiếu thông tin", "Vui lòng chọn sản phẩm trong danh sách"); return; }
        }

        try {
            let res;
            if (isEditing) res = await receivingApi.update(editId, formData);
            else res = await receivingApi.create(formData);

            if (res.data.success || res.data.status === true) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật" : "Đã tạo phiếu");
                setFormVisible(false);
                fetchReceivings(1, true);
            } else {
                Alert.alert("Lỗi", JSON.stringify(res.data.errors || res.data.message));
            }
        } catch (e) { Alert.alert("Lỗi", "Hệ thống gặp sự cố"); }
    };

    const handleDelete = (id, code) => {
        Alert.alert("Xác nhận", `Xóa phiếu ${code}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        const res = await receivingApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa");
                            fetchReceivings(1, true);
                        } else {
                            Alert.alert("Lỗi", res.data.message);
                        }
                    } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
                }
            }
        ]);
    };

    // --- PRODUCT ROW LOGIC ---
    const addProductRow = () => {
        setFormData({ ...formData, products: [...formData.products, { product_id: null, quantity: 1, serial: '' }] });
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

    // --- HANDLERS FILTER ---
    const handleApplyFilter = () => { setFilterVisible(false); fetchReceivings(1, true); };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', customer: null, status: [], form_type: [] });
        setFilterVisible(false);
        fetchReceivings(1, true);
    };

    // Hàm chọn nhiều trạng thái (Toggle)
    const toggleStatusFilter = (value) => {
        const current = filterValues.status || [];
        if (current.includes(value)) {
            // Nếu đã có thì bỏ
            setFilterValues({ ...filterValues, status: current.filter(item => item !== value) });
        } else {
            // Nếu chưa có thì thêm
            setFilterValues({ ...filterValues, status: [...current, value] });
        }
    };

    // --- RENDER TABLE ---
    const renderTableRow = ({ item }) => {
        const formType = getFormTypeText(item.form_type);
        const statusInfo = getStatusText(item.status);
        const stateInfo = getStateText(item.state);
        const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

        return (
            <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50">
                <View className="w-28 px-4"><Text className="text-sm font-bold text-purple-700">{item.form_code_receiving}</Text></View>
                <View className="w-40 px-4"><Text className="text-sm text-gray-800" numberOfLines={1}>{item.customername || item.customer?.customer_name || '---'}</Text></View>
                <View className="w-28 px-4"><Text className="text-sm text-gray-600">{formatDate(item.date_created)}</Text></View>
                <View className="w-24 px-4"><Text className={`text-sm font-medium ${formType.color}`}>{formType.text}</Text></View>
                <View className="w-28 px-4"><View className={`px-2 py-1 rounded self-start ${statusInfo.bg}`}><Text className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</Text></View></View>
                <View className="w-28 px-4"><Text className={`text-sm ${stateInfo.color}`}>{stateInfo.text}</Text></View>
                <View className="w-40 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.notes}</Text></View>
                <View className="w-16 px-2 items-center"><TouchableOpacity onPress={() => handleDelete(item.id, item.form_code_receiving)} className="p-2 bg-gray-100 rounded-full"><TrashIcon /></TouchableOpacity></View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu tiếp nhận" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Khách hàng</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
                            <View className="w-24 px-4"><Text className="font-bold text-gray-700">Loại</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Tình trạng</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Trạng thái</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Ghi chú</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={receivings} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchReceivings(1, true)} />}
                                onEndReached={() => { if (!loading && page < lastPage) fetchReceivings(page + 1); }}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có phiếu nào</Text></View>}
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
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa phiếu tiếp nhận' : 'Tạo phiếu tiếp nhận'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>

                            {/* Dropdown Khách hàng */}
                            <View className="mb-3">
                                <Text className="mb-1 text-gray-700 font-medium">Khách hàng</Text>
                                <DropdownSelect
                                    data={customers}
                                    labelField="customer_name"
                                    valueField="id"
                                    value={formData.customer_id}
                                    onChange={(value) => setFormData({ ...formData, customer_id: value })}
                                    placeholder="Chọn khách hàng..."
                                    search={true}
                                />
                            </View>

                            <View className="flex-row justify-between mb-3">
                                <View className="w-[48%]"><Text className="mb-1">Loại phiếu</Text>
                                    <View className="flex-row flex-wrap">
                                        <TouchableOpacity onPress={() => setFormData({ ...formData, form_type: 1 })} className={`mr-2 mb-2 px-2 py-1 border rounded ${formData.form_type === 1 ? 'bg-blue-100' : 'bg-white'}`}><Text>Bảo hành</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setFormData({ ...formData, form_type: 2 })} className={`mr-2 mb-2 px-2 py-1 border rounded ${formData.form_type === 2 ? 'bg-green-100' : 'bg-white'}`}><Text>Dịch vụ</Text></TouchableOpacity>
                                    </View>
                                </View>
                                <View className="w-[48%]"><Text className="mb-1">Tình trạng</Text>
                                    <View className="flex-row flex-wrap">
                                        <TouchableOpacity onPress={() => setFormData({ ...formData, status: 1 })} className={`mr-2 mb-2 px-2 py-1 border rounded ${formData.status === 1 ? 'bg-gray-200' : 'bg-white'}`}><Text>Tiếp nhận</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setFormData({ ...formData, status: 2 })} className={`mr-2 mb-2 px-2 py-1 border rounded ${formData.status === 2 ? 'bg-blue-100' : 'bg-white'}`}><Text>Xử lý</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View className="mb-3"><Text className="mb-1">Ngày lập</Text><TextInput className="border p-2 rounded" value={formData.date_created} onChangeText={t => setFormData({ ...formData, date_created: t })} placeholder="YYYY-MM-DD" /></View>
                            <View className="mb-3"><Text className="mb-1">Ghi chú</Text><TextInput className="border p-2 rounded" value={formData.notes} onChangeText={t => setFormData({ ...formData, notes: t })} /></View>

                            <View className="flex-row justify-between items-center mt-4 mb-2">
                                <Text className="font-bold text-gray-800">II. Sản phẩm tiếp nhận</Text>
                                <TouchableOpacity onPress={addProductRow} className="bg-blue-500 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm SP</Text></TouchableOpacity>
                            </View>

                            {formData.products.map((item, index) => (
                                <View key={index} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-bold">Sản phẩm #{index + 1}</Text>
                                        <TouchableOpacity onPress={() => removeProductRow(index)}><Text className="text-red-500 text-xs">Xóa</Text></TouchableOpacity>
                                    </View>

                                    {/* Dropdown Sản phẩm */}
                                    <View className="mb-2">
                                        <DropdownSelect
                                            data={formattedProducts}
                                            labelField="label_display"
                                            valueField="id"
                                            value={item.product_id}
                                            onChange={(val) => updateProductRow(index, 'product_id', val)}
                                            placeholder="Chọn sản phẩm..."
                                            search={true}
                                        />
                                    </View>

                                    <View className="flex-row justify-between">
                                        <View className="w-[30%]"><Text className="text-xs mb-1">Số lượng</Text>
                                            <TextInput className="border p-1 rounded bg-white text-center" value={item.quantity.toString()} onChangeText={t => updateProductRow(index, 'quantity', parseInt(t) || 1)} keyboardType="numeric" />
                                        </View>
                                        <View className="w-[65%]"><Text className="text-xs mb-1">Serial/IMEI</Text>
                                            <TextInput className="border p-1 rounded bg-white" value={item.serial} onChangeText={t => updateProductRow(index, 'serial', t)} placeholder="Nhập serial..." />
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-6" onPress={handleSave}>
                                <Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'TẠO PHIẾU'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- MODAL FILTER --- */}
            <Modal animationType="slide" transparent={true} visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[70%] w-full" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Mã phiếu</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} placeholder="Nhập mã..." />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Khách hàng</Text>
                                <DropdownSelect
                                    data={customers}
                                    labelField="customer_name"
                                    valueField="id"
                                    value={filterValues.customer}
                                    onChange={(value) => setFilterValues({ ...filterValues, customer: value })}
                                    placeholder="Tất cả khách hàng"
                                    search={true}
                                />
                            </View>

                            {/* Filter Status (Multi Select) */}
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Tình trạng</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity
                                        onPress={() => toggleStatusFilter(1)}
                                        className={`mr-2 mb-2 px-3 py-2 border rounded ${filterValues.status.includes(1) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}
                                    >
                                        <Text className={filterValues.status.includes(1) ? 'text-blue-700 font-bold' : 'text-gray-600'}>Tiếp nhận</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => toggleStatusFilter(2)}
                                        className={`mr-2 mb-2 px-3 py-2 border rounded ${filterValues.status.includes(2) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}
                                    >
                                        <Text className={filterValues.status.includes(2) ? 'text-blue-700 font-bold' : 'text-gray-600'}>Đang xử lý</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => toggleStatusFilter(3)}
                                        className={`mr-2 mb-2 px-3 py-2 border rounded ${filterValues.status.includes(3) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}
                                    >
                                        <Text className={filterValues.status.includes(3) ? 'text-blue-700 font-bold' : 'text-gray-600'}>Hoàn thành</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => toggleStatusFilter(4)}
                                        className={`mr-2 mb-2 px-3 py-2 border rounded ${filterValues.status.includes(4) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}
                                    >
                                        <Text className={filterValues.status.includes(4) ? 'text-blue-700 font-bold' : 'text-gray-600'}>Từ chối</Text>
                                    </TouchableOpacity>
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