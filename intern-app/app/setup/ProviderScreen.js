import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    FlatList,
    Modal,
    Alert,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
    RefreshControl
} from 'react-native';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import providerApi from '../../api/providerApi';

export default function ProviderScreen() {
    // --- STATE DỮ LIỆU ---
    const [searchText, setSearchText] = useState('');
    const [providers, setProviders] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Sorting
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // Filter Modal State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        provider_code: '',
        provider_name: '',
        phone: '',
        email: '',
        address: '',
        contact_person: '',
        tax_code: '',
        group_id: null,
        note: ''
    });
    // State lưu giá trị bộ lọc nâng cao (mapping đúng với API PHP yêu cầu)
    const [filterValues, setFilterValues] = useState({
        ma: '', ten: '', phone: '', group_id: null
    });

    // --- EFFECT ---
    useEffect(() => { fetchGroups(); }, []);

    // Gọi API khi: Search thay đổi, Sort thay đổi, hoặc bấm nút "Xác nhận" ở filter (khi filterValues thay đổi và được apply)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProviders(1, true);
        }, 500); // Debounce 500ms
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---

    const fetchGroups = async () => {
        try {
            const res = await providerApi.getGroups();
            if (res.data.success) setGroups(res.data.data);
        } catch (e) { console.error(e); }
    };

    const fetchProviders = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, per_page: 20,
                search: searchText, sort_by: sortBy, sort_dir: sortDir,
                ...filterValues
            };
            const res = await providerApi.getList(params);
            if (res.data.success) {
                const data = res.data.data;
                setProviders(isRefresh ? data : [...providers, ...data]);
                setPage(res.data.pagination.current_page);
                setLastPage(res.data.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi tải NCC:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- HANDLERS ---

    // --- CRUD ---
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ provider_code: '', provider_name: '', phone: '', email: '', address: '', contact_person: '', tax_code: '', group_id: null, note: '' });
        setFormModalVisible(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            provider_code: item.provider_code,
            provider_name: item.provider_name,
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
            contact_person: item.contact_person || '',
            tax_code: item.tax_code || '',
            group_id: item.group_id,
            note: item.note || ''
        });
        setFormModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.provider_code || !formData.provider_name) {
            Alert.alert("Lỗi", "Vui lòng nhập Mã và Tên NCC");
            return;
        }
        try {
            let res;
            if (isEditing) res = await providerApi.update(editId, formData);
            else res = await providerApi.create(formData);

            if (res.data.success) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật" : "Đã thêm mới");
                setFormModalVisible(false);
                fetchProviders(1, true);
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
        Alert.alert("Xác nhận", `Xóa nhà cung cấp: ${name}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        const res = await providerApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa");
                            fetchProviders(1, true);
                        } else {
                            Alert.alert("Lỗi", res.data.message);
                        }
                    } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
                }
            }
        ]);
    };

    const handleSubMenuPress = (item) => {
        Alert.alert("Chuyển trang", item.name);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviders(1, true);
    };

    const onLoadMore = () => {
        if (!isLoadingMore && page < lastPage) {
            setIsLoadingMore(true);
            fetchProviders(page + 1, false);
        }
    };

    // Xử lý thay đổi text trong Modal Filter
    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    // Khi nhấn nút "Xác nhận" trong Modal
    const applyFilter = () => {
        setFilterModalVisible(false);
        fetchProviders(1, true); // Gọi lại API trang 1
        Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
    };

    // Khi nhấn nút "Hủy bỏ" hoặc xóa lọc
    const clearFilter = () => {
        setFilterValues({ ma: '', ten: '', address: '', phone: '', email: '', note: '' });
        setFilterModalVisible(false);
        fetchProviders(1, true); // Reset lại list
    };

    // --- UI RENDERING ---

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity
                className="w-32 px-4 flex-row items-center"
                onPress={() => handleSort('code')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã NCC</Text>
                <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity
                className="w-48 px-4 flex-row items-center"
                onPress={() => handleSort('name')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên nhà cung cấp</Text>
                <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity
                className="w-48 px-4 flex-row items-center"
                onPress={() => handleSort('address')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'address' ? 'text-blue-600' : 'text-gray-700'}`}>Địa chỉ</Text>
                <SortIcon color={sortBy === 'address' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <View className="w-32 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700">Điện thoại</Text>
            </View>

            <View className="w-48 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700">Email</Text>
            </View>

            <View className="w-40 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700">Ghi chú</Text>
            </View>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-4"><Text className="text-sm font-medium text-gray-800">{item.provider_code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm font-bold text-blue-700">{item.provider_name}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.phone}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.email}</Text></View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.provider_name)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="SETUP" activeSubMenu="Nhà cung cấp" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterModalVisible(true)} />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <TouchableOpacity onPress={() => handleSort('code')} className="w-28 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Mã NCC</Text><SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('name')} className="w-48 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Tên NCC</Text><SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Điện thoại</Text></View>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Email</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={providers} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProviders(1, true)} />}
                                onEndReached={() => { if (!loading && page < lastPage) fetchProviders(page + 1); }}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
                            />}
                    </View>
                </ScrollView>
            </View>

            {/* MODAL FORM */}
            <Modal animationType="slide" transparent={true} visible={formModalVisible} onRequestClose={() => setFormModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-5 h-[90%]">
                        <View className="flex-row justify-between mb-4 border-b pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Cập nhật NCC' : 'Thêm NCC mới'}</Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Mã NCC <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border p-3 rounded" value={formData.provider_code} onChangeText={t => setFormData({ ...formData, provider_code: t })} placeholder="NCC001" />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Tên NCC <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border p-3 rounded" value={formData.provider_name} onChangeText={t => setFormData({ ...formData, provider_name: t })} placeholder="Công ty A..." />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Người liên hệ</Text>
                                <TextInput className="border p-3 rounded" value={formData.contact_person} onChangeText={t => setFormData({ ...formData, contact_person: t })} />
                            </View>
                            <View className="flex-row justify-between">
                                <View className="mb-3 w-[48%]"><Text className="text-gray-700 mb-1">Điện thoại</Text>
                                    <TextInput className="border p-3 rounded" value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />
                                </View>
                                <View className="mb-3 w-[48%]"><Text className="text-gray-700 mb-1">Mã số thuế</Text>
                                    <TextInput className="border p-3 rounded" value={formData.tax_code} onChangeText={t => setFormData({ ...formData, tax_code: t })} />
                                </View>
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Email</Text>
                                <TextInput className="border p-3 rounded" value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} keyboardType="email-address" />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Địa chỉ</Text>
                                <TextInput className="border p-3 rounded" value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />
                            </View>
                            <View className="mb-4"><Text className="text-gray-700 mb-2 font-bold">Nhóm NCC</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {groups.map(g => (
                                        <TouchableOpacity key={g.id} className={`mr-2 px-4 py-2 rounded-full border ${formData.group_id === g.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`} onPress={() => setFormData({ ...formData, group_id: g.id })}>
                                            <Text className={formData.group_id === g.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>{g.group_name}</Text>
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
                    <View className="bg-white rounded-t-xl p-4 h-[70%] w-full">
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc NCC</Text>
                        <ScrollView>
                            <View className="mb-3"><Text className="mb-1">Mã NCC</Text><TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} /></View>
                            <View className="mb-3"><Text className="mb-1">Tên NCC</Text><TextInput className="border p-2 rounded" value={filterValues.ten} onChangeText={t => setFilterValues({ ...filterValues, ten: t })} /></View>
                            <View className="mb-3"><Text className="mb-1">SĐT</Text><TextInput className="border p-2 rounded" value={filterValues.phone} onChangeText={t => setFilterValues({ ...filterValues, phone: t })} keyboardType="phone-pad" /></View>
                            <View className="mb-3"><Text className="mb-1">Nhóm NCC</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, group_id: null })} className={`mr-2 mb-2 px-3 py-1 border rounded ${filterValues.group_id === null ? 'bg-blue-100' : 'bg-gray-50'}`}><Text>Tất cả</Text></TouchableOpacity>
                                    {groups.map(g => (
                                        <TouchableOpacity key={g.id} onPress={() => setFilterValues({ ...filterValues, group_id: g.id })} className={`mr-2 mb-2 px-3 py-1 border rounded ${filterValues.group_id === g.id ? 'bg-blue-100' : 'bg-gray-50'}`}><Text>{g.group_name}</Text></TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={() => { setFilterValues({ ma: '', ten: '', phone: '', group_id: null }); setFilterModalVisible(false); fetchProviders(1, true); }}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={() => { setFilterModalVisible(false); fetchProviders(1, true); }}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}