import React, { useState, useEffect } from 'react';
import { 
    View, Text, SafeAreaView, ScrollView, FlatList, Modal, Alert, 
    TouchableOpacity, TextInput, ActivityIndicator, RefreshControl 
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';
import warehouseApi from '../../api/warehouseApi';

export default function WarehouseScreen() {
    // --- STATE DATA ---
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);

    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- FORM STATE ---
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        warehouse_code: '',
        warehouse_name: '',
        address: '',
        type: 1 
    });

    // --- FILTER STATE ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    
    // 1. Thêm 'type' vào state lọc
    const [filterValues, setFilterValues] = useState({
        ma: '', 
        ten: '', 
        address: '',
        type: null // null: Tất cả, 1: Kho thường, 2: Kho bảo hành
    });

    // --- EFFECT ---
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWarehouses(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---
    const fetchWarehouses = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, per_page: 20,
                search: searchText, 
                sort_by: sortBy, sort_dir: sortDir,
                ...filterValues // Gửi type lên server
            };
            const res = await warehouseApi.getList(params);
            if (res.data.success) {
                const data = res.data.data;
                const list = Array.isArray(data) ? data : (data.data || []);
                
                if (isRefresh || pageNumber === 1) {
                    setWarehouses(list);
                } else {
                    setWarehouses(prev => [...prev, ...list]);
                }

                if (res.data.pagination) {
                    setPage(res.data.pagination.current_page);
                    setLastPage(res.data.pagination.last_page);
                    setTotalRecords(res.data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Lỗi tải danh sách kho:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- CRUD HANDLERS ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ warehouse_code: '', warehouse_name: '', address: '', type: 1 });
        setFormModalVisible(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            warehouse_code: item.code,
            warehouse_name: item.name,
            address: item.address || '',
            type: parseInt(item.type) || 1
        });
        setFormModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.warehouse_code || !formData.warehouse_name) {
            Alert.alert("Lỗi", "Vui lòng nhập Mã kho và Tên kho");
            return;
        }
        try {
            let res;
            if (isEditing) res = await warehouseApi.update(editId, formData);
            else res = await warehouseApi.create(formData);

            if (res.data.success) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật" : "Đã thêm mới");
                setFormModalVisible(false);
                fetchWarehouses(1, true);
            } else {
                Alert.alert("Lỗi", res.data.message);
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lưu dữ liệu");
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert("Xác nhận", `Xóa kho: ${name}?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    const res = await warehouseApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa kho");
                        fetchWarehouses(1, true);
                    } else {
                        Alert.alert("Lỗi", res.data.message);
                    }
                } catch (error) { Alert.alert("Lỗi", "Không thể xóa kho này"); }
            }}
        ]);
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchWarehouses(1, true);
    };

    // 2. Reset type về null khi xóa lọc
    const handleClearFilter = () => {
        setFilterValues({ ma: '', ten: '', address: '', type: null });
        setFilterModalVisible(false);
        fetchWarehouses(1, true);
    };

    // --- RENDER ---
    const renderTableRow = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-32 px-4"><Text className="text-sm text-gray-800 font-medium">{item.code}</Text></View>
            <View className="w-60 px-4"><Text className="text-sm font-bold text-blue-700">{item.name}</Text></View>
            <View className="w-32 px-4">
                <View className={`px-2 py-1 rounded self-start ${item.type == 1 ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-xs ${item.type == 1 ? 'text-green-800' : 'text-orange-800'}`}>
                        {item.type == 1 ? 'Kho thường' : 'Kho bảo hành'}
                    </Text>
                </View>
            </View>
            <View className="w-60 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.address}</Text></View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="SETUP" activeSubMenu="Kho" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterModalVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{flexGrow: 1}}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <TouchableOpacity onPress={() => handleSort('code')} className="w-32 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Mã Kho</Text><SortIcon color={sortBy==='code'?'#2563EB':'#9CA3AF'}/></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('name')} className="w-60 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Tên Kho</Text><SortIcon color={sortBy==='name'?'#2563EB':'#9CA3AF'}/></TouchableOpacity>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Loại</Text></View>
                            <View className="w-60 px-4"><Text className="font-bold text-gray-700">Địa chỉ</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4"/> :
                        <FlatList 
                            data={warehouses} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWarehouses(1, true)} />}
                            onEndReached={() => { if (!loading && page < lastPage) fetchWarehouses(page + 1); }}
                            ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có kho nào</Text></View>}
                        />}
                    </View>
                </ScrollView>
            </View>

            {/* MODAL FORM */}
            <Modal animationType="slide" transparent={true} visible={formModalVisible} onRequestClose={() => setFormModalVisible(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setFormModalVisible(false)} className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-t-xl p-5 h-[70%]">
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Cập nhật Kho' : 'Thêm Kho mới'}</Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1 font-bold">Mã kho *</Text><TextInput className="border p-3 rounded" value={formData.warehouse_code} onChangeText={t => setFormData({...formData, warehouse_code: t})} placeholder="KHO01" /></View>
                            <View className="mb-3"><Text className="mb-1 font-bold">Tên kho *</Text><TextInput className="border p-3 rounded" value={formData.warehouse_name} onChangeText={t => setFormData({...formData, warehouse_name: t})} placeholder="Kho chính..." /></View>
                            <View className="mb-3"><Text className="mb-1">Loại kho</Text>
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => setFormData({...formData, type: 1})} className={`mr-3 px-4 py-2 rounded border ${formData.type === 1 ? 'bg-green-100 border-green-500' : 'bg-gray-50'}`}><Text className={formData.type === 1 ? 'text-green-700 font-bold' : 'text-gray-600'}>Kho thường</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFormData({...formData, type: 2})} className={`px-4 py-2 rounded border ${formData.type === 2 ? 'bg-orange-100 border-orange-500' : 'bg-gray-50'}`}><Text className={formData.type === 2 ? 'text-orange-700 font-bold' : 'text-gray-600'}>Kho bảo hành</Text></TouchableOpacity>
                                </View>
                            </View>
                            <View className="mb-3"><Text className="mb-1">Địa chỉ</Text><TextInput className="border p-3 rounded" value={formData.address} onChangeText={t => setFormData({...formData, address: t})} placeholder="Địa chỉ..." /></View>
                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4" onPress={handleSave}><Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'THÊM MỚI'}</Text></TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* MODAL FILTER (Đã Fix lỗi đóng) */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                {/* Lớp nền: Bấm vào đóng */}
                <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
                    {/* Nội dung: Bấm vào KHÔNG đóng */}
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-white rounded-t-xl p-4 h-[70%] w-full">
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc Kho</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Mã Kho</Text><TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({...filterValues, ma: t})} /></View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Tên Kho</Text><TextInput className="border p-2 rounded" value={filterValues.ten} onChangeText={t => setFilterValues({...filterValues, ten: t})} /></View>
                            
                            {/* 3. Phần chọn Loại Kho */}
                            <View className="mb-3">
                                <Text className="mb-2 text-gray-600">Loại kho</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity 
                                        onPress={() => setFilterValues({...filterValues, type: null})} 
                                        className={`mr-2 mb-2 px-3 py-2 rounded border ${filterValues.type === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                                    >
                                        <Text className={filterValues.type === null ? 'text-blue-700 font-bold' : 'text-gray-600'}>Tất cả</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={() => setFilterValues({...filterValues, type: 1})} 
                                        className={`mr-2 mb-2 px-3 py-2 rounded border ${filterValues.type === 1 ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}`}
                                    >
                                        <Text className={filterValues.type === 1 ? 'text-green-700 font-bold' : 'text-gray-600'}>Kho thường</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={() => setFilterValues({...filterValues, type: 2})} 
                                        className={`mr-2 mb-2 px-3 py-2 rounded border ${filterValues.type === 2 ? 'bg-orange-100 border-orange-500' : 'bg-gray-50 border-gray-300'}`}
                                    >
                                        <Text className={filterValues.type === 2 ? 'text-orange-700 font-bold' : 'text-gray-600'}>Kho bảo hành</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mb-3"><Text className="mb-1 text-gray-600">Địa chỉ</Text><TextInput className="border p-2 rounded" value={filterValues.address} onChangeText={t => setFilterValues({...filterValues, address: t})} /></View>
                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}