import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList,
    Modal, Alert, TouchableOpacity, ActivityIndicator,
    RefreshControl, TextInput
} from 'react-native';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import customerApi from '../../api/customerApi';

export default function CustomerScreen() {
    // --- STATE DATA ---
    const [customers, setCustomers] = useState([]);
    const [customerGroups, setCustomerGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // --- STATE DỮ LIỆU ---
    const [searchText, setSearchText] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Sorting
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE FILTER ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '', ten: '', phone: '', address: '', group_id: null
    });

    // Filter Modal
    const [selectedGroupId, setSelectedGroupId] = useState(null); // ID nhóm đang chọn lọc

    // --- STATE FORM (Add/Edit) ---
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        customer_code: '',
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        tax_code: '',
        group_id: null,
        note: ''
    });
    // --- EFFECT ---

    // 1. Lấy danh sách nhóm khách hàng (chạy 1 lần khi vào màn hình)
    useEffect(() => {
        fetchCustomerGroups();
    }, []);

    // 2. Tìm kiếm (Debounce) & Thay đổi Filter/Sort
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir, selectedGroupId]);
    // Khi searchText, sort, hoặc group thay đổi -> gọi lại API trang 1

    // --- FUNCTION GỌI API ---

    const fetchCustomerGroups = async () => {
        try {
            const res = await customerApi.getGroups();
            if (res.data.success) setCustomerGroups(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchCustomers = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, per_page: 20,
                search: searchText,
                sort_by: sortBy, sort_dir: sortDir,
                ...filterValues
            };
            const res = await customerApi.getList(params);
            if (res.data.success) {
                const data = res.data.data;
                setCustomers(isRefresh ? data : [...customers, ...data]);
                setPage(res.data.pagination.current_page);
                setLastPage(res.data.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách khách hàng:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // --- CRUD HANDLERS ---

    // Mở Form Thêm
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            customer_code: '', customer_name: '', phone: '', email: '',
            address: '', tax_code: '', group_id: null, note: ''
        });
        setFormModalVisible(true);
    };

    // Mở Form Sửa
    const openEditModal = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            customer_code: item.customer_code,
            customer_name: item.customer_name,
            phone: item.phone || '',
            email: item.email || '',
            address: item.address || '',
            tax_code: item.tax_code || '',
            group_id: item.group_id,
            note: item.note || ''
        });
        setFormModalVisible(true);
    };

    // Lưu (Thêm/Sửa)
    const handleSave = async () => {
        if (!formData.customer_code || !formData.customer_name) {
            Alert.alert("Lỗi", "Vui lòng nhập Mã và Tên khách hàng");
            return;
        }

        try {
            let res;
            if (isEditing) {
                res = await customerApi.update(editId, formData);
            } else {
                res = await customerApi.create(formData);
            }

            if (res.data.success) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng mới");
                setFormModalVisible(false);
                fetchCustomers(1, true);
            } else {
                Alert.alert("Lỗi", res.data.message || "Thao tác thất bại");
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                Alert.alert("Lỗi dữ liệu", Object.values(errors)[0][0]);
            } else {
                Alert.alert("Lỗi", error.response?.data?.message || "Lỗi hệ thống");
            }
        }
    };

    // Xóa
    const handleDelete = (id, name) => {
        Alert.alert("Xác nhận", `Xóa khách hàng: ${name}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive",
                onPress: async () => {
                    try {
                        const res = await customerApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa khách hàng");
                            fetchCustomers(1, true);
                        } else {
                            Alert.alert("Lỗi", res.data.message);
                        }
                    } catch (error) {
                        Alert.alert("Lỗi", "Không thể xóa khách hàng này");
                    }
                }
            }
        ]);
    };

    // --- HANDLERS ---

    const handleSubMenuPress = (item) => {
        Alert.alert("Chuyển trang", `Đi đến: ${item.name}`);
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
        fetchCustomers(1, true);
    };

    const onLoadMore = () => {
        if (!isLoadingMore && page < lastPage) {
            setIsLoadingMore(true);
            fetchCustomers(page + 1, false);
        }
    };

    const handleSelectGroupFilter = (id) => {
        // Nếu nhấn lại nhóm đang chọn thì bỏ chọn (toggle)
        if (selectedGroupId === id) {
            setSelectedGroupId(null);
        } else {
            setSelectedGroupId(id);
        }
        // Đóng modal sau khi chọn (hoặc có thể để nút "Áp dụng" riêng)
        setFilterModalVisible(false);
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchCustomers(1, true);
    };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', ten: '', phone: '', address: '', group_id: null });
        setFilterModalVisible(false);
        fetchCustomers(1, true);
    };

    // --- RENDER UI ---

    const renderTableRow = ({ item }) => (
        <TouchableOpacity
            onPress={() => openEditModal(item)}
            className="flex-row border-b border-gray-100 py-3 bg-white items-center"
        >
            <View className="w-32 px-4"><Text className="text-sm text-gray-800 font-medium">{item.customer_code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm font-bold text-blue-700">{item.customer_name}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.phone}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.address}</Text></View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.customer_name)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="SETUP" activeSubMenu="Khách hàng" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                onCreatePress={openAddModal}
                onFilterPress={() => setFilterModalVisible(true)}
            />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        {/* Header Table */}
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <TouchableOpacity onPress={() => handleSort('code')} className="w-32 px-4 flex-row items-center">
                                <Text className="font-bold text-gray-700 mr-1">Mã KH</Text><SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('name')} className="w-48 px-4 flex-row items-center">
                                <Text className="font-bold text-gray-700 mr-1">Tên khách hàng</Text><SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
                            </TouchableOpacity>
                            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Điện thoại</Text></View>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Địa chỉ</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>

                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={customers} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCustomers(1, true)} />}
                                onEndReached={() => { if (!loading && page < lastPage) fetchCustomers(page + 1); }}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có khách hàng</Text></View>}
                            />}
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL ADD / EDIT --- */}
            <Modal animationType="slide" transparent={true} visible={formModalVisible} onRequestClose={() => setFormModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-5 h-[90%]">
                        <View className="flex-row justify-between mb-4 border-b border-gray-200 pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}><Text className="text-gray-500 font-bold text-lg">✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-3">
                                <Text className="text-gray-700 mb-1 font-bold">Mã khách hàng <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.customer_code} onChangeText={t => setFormData({ ...formData, customer_code: t })} placeholder="KH001" />
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-700 mb-1 font-bold">Tên khách hàng <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.customer_name} onChangeText={t => setFormData({ ...formData, customer_name: t })} placeholder="Nhập tên..." />
                            </View>
                            <View className="flex-row justify-between">
                                <View className="mb-3 w-[48%]">
                                    <Text className="text-gray-700 mb-1">Điện thoại</Text>
                                    <TextInput className="border border-gray-300 rounded p-3" value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />
                                </View>
                                <View className="mb-3 w-[48%]">
                                    <Text className="text-gray-700 mb-1">Mã số thuế</Text>
                                    <TextInput className="border border-gray-300 rounded p-3" value={formData.tax_code} onChangeText={t => setFormData({ ...formData, tax_code: t })} />
                                </View>
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-700 mb-1">Email</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} keyboardType="email-address" />
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-700 mb-1">Địa chỉ</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2 font-bold">Nhóm khách hàng</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {customerGroups.map(g => (
                                        <TouchableOpacity key={g.id}
                                            className={`mr-2 px-4 py-2 rounded-full border ${formData.group_id === g.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                                            onPress={() => setFormData({ ...formData, group_id: g.id })}>
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

            {/* --- MODAL FILTER --- */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
                    <View className="bg-white rounded-t-xl p-4 h-[80%] w-full">
                        <Text className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Bộ lọc Khách hàng</Text>
                        <ScrollView>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Mã KH</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} />
                            </View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Tên KH</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.ten} onChangeText={t => setFilterValues({ ...filterValues, ten: t })} />
                            </View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">SĐT</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.phone} onChangeText={t => setFilterValues({ ...filterValues, phone: t })} keyboardType="phone-pad" />
                            </View>

                            <Text className="mb-2 text-gray-600">Nhóm khách hàng</Text>
                            <View className="flex-row flex-wrap mb-4">
                                <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, group_id: null })} className={`mr-2 mb-2 px-3 py-1 rounded border ${filterValues.group_id === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}>
                                    <Text>Tất cả</Text>
                                </TouchableOpacity>
                                {customerGroups.map(g => (
                                    <TouchableOpacity key={g.id} onPress={() => setFilterValues({ ...filterValues, group_id: g.id })} className={`mr-2 mb-2 px-3 py-1 rounded border ${filterValues.group_id === g.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}>
                                        <Text>{g.group_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}