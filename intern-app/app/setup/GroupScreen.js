import React, { useState, useEffect } from 'react';
import { 
    View, Text, SafeAreaView, ScrollView, FlatList, Modal, Alert, 
    TouchableOpacity, TextInput, ActivityIndicator, RefreshControl 
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

import groupApi from '../../api/groupApi';

export default function GroupScreen() {
    // --- STATE ---
    const [groups, setGroups] = useState([]);
    const [groupTypes, setGroupTypes] = useState([]); // List loại nhóm
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- FORM STATE ---
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        group_code: '',
        group_name: '',
        group_type_id: null,
        description: ''
    });

    // --- FILTER STATE ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        code: '', name: '', type_id: null
    });

    // --- EFFECT ---
    useEffect(() => { fetchTypes(); }, []);
    
    useEffect(() => {
        const timer = setTimeout(() => { fetchGroups(1, true); }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API CALLS ---
    const fetchTypes = async () => {
        try {
            const res = await groupApi.getTypes();
            if (res.data.success) setGroupTypes(res.data.data);
        } catch (e) { console.error(e); }
    };

    const fetchGroups = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, per_page: 20,
                search: searchText, sort_by: sortBy, sort_dir: sortDir,
                ...filterValues
            };
            const res = await groupApi.getList(params);
            if (res.data.success) {
                const data = res.data.data;
                setGroups(isRefresh ? data : [...groups, ...data]);
                setPage(res.data.pagination.current_page);
                setLastPage(res.data.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi tải nhóm:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- CRUD ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ group_code: '', group_name: '', group_type_id: null, description: '' });
        setFormModalVisible(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            group_code: item.group_code,
            group_name: item.group_name,
            group_type_id: item.group_type_id,
            description: item.description || ''
        });
        setFormModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.group_code || !formData.group_name || !formData.group_type_id) {
            Alert.alert("Lỗi", "Vui lòng nhập Mã, Tên và chọn Loại nhóm");
            return;
        }
        try {
            let res;
            if (isEditing) res = await groupApi.update(editId, formData);
            else res = await groupApi.create(formData);

            if (res.data.success) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật" : "Đã thêm mới");
                setFormModalVisible(false);
                fetchGroups(1, true);
            } else {
                Alert.alert("Lỗi", res.data.message);
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) Alert.alert("Lỗi dữ liệu", Object.values(errors)[0][0]);
            else Alert.alert("Lỗi", "Không thể lưu dữ liệu");
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert("Xác nhận", `Xóa nhóm: ${name}?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    const res = await groupApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa");
                        fetchGroups(1, true);
                    } else {
                        Alert.alert("Cảnh báo", res.data.message); // Hiển thị lỗi ràng buộc
                    }
                } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
            }}
        ]);
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    // --- RENDER ---
    const renderTableRow = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-4"><Text className="text-sm font-medium text-gray-800">{item.group_code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm font-bold text-blue-700">{item.group_name}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.type_name}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.description}</Text></View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.group_name)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="SETUP" activeSubMenu="Nhóm đối tượng" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterModalVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{flexGrow: 1}}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <TouchableOpacity onPress={() => handleSort('code')} className="w-28 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Mã nhóm</Text><SortIcon color={sortBy==='code'?'#2563EB':'#9CA3AF'}/></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('name')} className="w-48 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Tên nhóm</Text><SortIcon color={sortBy==='name'?'#2563EB':'#9CA3AF'}/></TouchableOpacity>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Loại nhóm</Text></View>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Mô tả</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4"/> :
                        <FlatList 
                            data={groups} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchGroups(1, true)} />}
                            onEndReached={() => { if (!loading && page < lastPage) fetchGroups(page + 1); }}
                            ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
                        />}
                    </View>
                </ScrollView>
            </View>

            {/* MODAL FORM */}
            <Modal animationType="slide" transparent={true} visible={formModalVisible} onRequestClose={() => setFormModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-5 h-[80%]">
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Cập nhật Nhóm' : 'Thêm Nhóm mới'}</Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Mã nhóm <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border p-3 rounded" value={formData.group_code} onChangeText={t => setFormData({...formData, group_code: t})} placeholder="G001" />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Tên nhóm <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border p-3 rounded" value={formData.group_name} onChangeText={t => setFormData({...formData, group_name: t})} placeholder="Nhóm VIP..." />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Mô tả</Text>
                                <TextInput className="border p-3 rounded" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
                            </View>
                            <View className="mb-4"><Text className="text-gray-700 mb-2 font-bold">Loại nhóm <Text className="text-red-500">*</Text></Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {groupTypes.map(t => (
                                        <TouchableOpacity key={t.id} className={`mr-2 px-4 py-2 rounded-full border ${formData.group_type_id === t.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`} onPress={() => setFormData({...formData, group_type_id: t.id})}>
                                            <Text className={formData.group_type_id === t.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>{t.group_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mb-6" onPress={handleSave}>
                                <Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'THÊM MỚI'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* MODAL FILTER */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
                    <View className="bg-white rounded-t-xl p-4 h-[60%] w-full">
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc Nhóm</Text>
                        <ScrollView>
                            <View className="mb-3"><Text className="mb-1">Mã nhóm</Text><TextInput className="border p-2 rounded" value={filterValues.code} onChangeText={t => setFilterValues({...filterValues, code: t})} /></View>
                            <View className="mb-3"><Text className="mb-1">Tên nhóm</Text><TextInput className="border p-2 rounded" value={filterValues.name} onChangeText={t => setFilterValues({...filterValues, name: t})} /></View>
                            <View className="mb-3"><Text className="mb-1">Loại nhóm</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity onPress={() => setFilterValues({...filterValues, type_id: null})} className={`mr-2 mb-2 px-3 py-1 border rounded ${filterValues.type_id===null?'bg-blue-100':'bg-gray-50'}`}><Text>Tất cả</Text></TouchableOpacity>
                                    {groupTypes.map(t => (
                                        <TouchableOpacity key={t.id} onPress={() => setFilterValues({...filterValues, type_id: t.id})} className={`mr-2 mb-2 px-3 py-1 border rounded ${filterValues.type_id===t.id?'bg-blue-100':'bg-gray-50'}`}><Text>{t.group_name}</Text></TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={() => { setFilterValues({code:'', name:'', type_id: null}); setFilterModalVisible(false); fetchGroups(1, true); }}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={() => { setFilterModalVisible(false); fetchGroups(1, true); }}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}