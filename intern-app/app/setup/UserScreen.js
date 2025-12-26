import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    FlatList,
    Alert,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import userApi from '../../api/userApi';

export default function UserScreen() {
    // --- STATE DATA ---
    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    // Sorting
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // Filter Data Sources (Dropdowns)
    const [userGroups, setUserGroups] = useState([]); // Danh sách nhóm
    const [rolesList, setRolesList] = useState([]);   // Danh sách vai trò

    // Filter Modal & Values
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '',
        ten: '',
        email: '',
        phone: '',
        group_id: null,
        roles: [] // Mảng ID các role được chọn
    });

    // --- STATE FORM (ADD/EDIT) ---
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        employee_code: '',
        name: '',
        email: '',
        password: '', // Chỉ dùng khi tạo mới hoặc đổi pass
        phone: '',
        address: '',
        group_id: null,
        role: null // Lưu ý: Backend cần role_id hoặc role name tùy config
    });

    // --- EFFECT ---

    // 1. Load Group & Role khi vào màn hình
    useEffect(() => {
        fetchDropdownData();
    }, []);
    useEffect(() => {
        fetchFilterData();
    }, []);

    // 2. Load User khi search/sort thay đổi
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---
    // --- API FUNCTIONS ---
    const fetchDropdownData = async () => {
        try {
            const [gRes, rRes] = await Promise.all([userApi.getGroups(), userApi.getRoles()]);
            if (gRes.data.success) setUserGroups(gRes.data.data);
            if (rRes.data.success) setRolesList(rRes.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchFilterData = async () => {
        try {
            const [groupRes, roleRes] = await Promise.all([
                userApi.getGroups(),
                userApi.getRoles()
            ]);
            if (groupRes.data.success) setUserGroups(groupRes.data.data);
            if (roleRes.data.success) setRolesList(roleRes.data.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu lọc:", error);
        }
    };

    const fetchUsers = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber,
                per_page: 20,
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...filterValues // Spread filter values
            };

            const response = await userApi.getList(params);
            const result = response.data;

            if (result.success) {
                if (isRefresh || pageNumber === 1) {
                    setUsers(result.data);
                } else {
                    setUsers(prev => [...prev, ...result.data]);
                }
                setPage(result.pagination.current_page);
                setLastPage(result.pagination.last_page);
                setTotalUsers(result.total);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách nhân viên:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // --- 2. CRUD HANDLERS ---

    // Mở Form Thêm mới
    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            employee_code: '', name: '', email: '', password: '',
            phone: '', address: '', group_id: null, role: null
        });
        setFormModalVisible(true);
    };

    // Mở Form Sửa
    const openEditModal = (item) => {
        setIsEditing(true);
        setEditId(item.id);

        // LOGIC TỰ ĐỘNG TÌM ROLE NẾU BACKEND CHƯA KỊP UPDATE
        // Nếu backend đã trả về role_id thì dùng luôn, 
        // nếu chưa thì thử tìm trong rolesList dựa theo tên (item.role)
        let selectedRoleId = item.role_id;

        if (!selectedRoleId && item.role) {
            const foundRole = rolesList.find(r => r.name === item.role);
            if (foundRole) selectedRoleId = foundRole.id;
        }

        setFormData({
            employee_code: item.code || '',
            name: item.name,
            email: item.email,
            password: '',
            phone: item.phone || '',
            address: item.address || '',
            group_id: item.group_id,
            role: selectedRoleId // <--- Đã sửa: Gán ID vai trò vào đây
        });
        setFormModalVisible(true);
    };

    // Xử lý Lưu (Thêm hoặc Sửa)
    const handleSave = async () => {
        // Validate cơ bản
        if (!formData.name || !formData.email) {
            Alert.alert("Lỗi", "Vui lòng nhập Tên và Email");
            return;
        }
        if (!isEditing && !formData.password) {
            Alert.alert("Lỗi", "Vui lòng nhập Mật khẩu cho nhân viên mới");
            return;
        }

        try {
            // Chuẩn bị dữ liệu gửi đi (Loại bỏ password nếu rỗng khi edit)
            const payload = { ...formData };
            if (isEditing && !payload.password) delete payload.password;

            let res;
            if (isEditing) {
                res = await userApi.update(editId, payload);
            } else {
                res = await userApi.create(payload);
            }

            if (res.data.success || res.status === 200 || res.status === 201) {
                Alert.alert("Thành công", isEditing ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên mới");
                setFormModalVisible(false);
                fetchUsers(1, true); // Refresh list
            } else {
                Alert.alert("Lỗi", res.data.message || "Thao tác thất bại");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi hệ thống";
            const errors = error.response?.data?.errors;
            // Hiển thị chi tiết lỗi validate từ Laravel
            if (errors) {
                const firstError = Object.values(errors)[0][0];
                Alert.alert("Lỗi dữ liệu", firstError);
            } else {
                Alert.alert("Lỗi", msg);
            }
        }
    };

    // Xử lý Xóa
    const handleDelete = (id, name) => {
        Alert.alert("Xác nhận xóa", `Xóa nhân viên ${name}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive",
                onPress: async () => {
                    try {
                        const res = await userApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa nhân viên");
                            fetchUsers(1, true);
                        }
                    } catch (error) {
                        Alert.alert("Lỗi", error.response?.data?.message || "Không thể xóa");
                    }
                }
            }
        ]);
    };

    // --- HANDLERS ---
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
        fetchUsers(1, true);
    };

    const onLoadMore = () => {
        if (!isLoadingMore && page < lastPage) {
            setIsLoadingMore(true);
            fetchUsers(page + 1, false);
        }
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchUsers(1, true);
        Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
    };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', ten: '', email: '', phone: '', group_id: null, roles: [] });
        setFilterModalVisible(false);
        fetchUsers(1, true);
    };

    const handleRoleSelect = (roleId) => {
        // Toggle role selection
        const currentRoles = filterValues.roles;
        if (currentRoles.includes(roleId)) {
            setFilterValues({ ...filterValues, roles: currentRoles.filter(id => id !== roleId) });
        } else {
            setFilterValues({ ...filterValues, roles: [...currentRoles, roleId] });
        }
    };

    const getCurrentGroupName = () => {
        if (!filterValues.group_id) return "Chưa chọn nhóm (Tất cả)";
        const group = userGroups.find(g => g.id === filterValues.group_id);
        return group ? group.group_name : "Nhóm không xác định";
    };

    const handleSubMenuPress = (item) => {
        Alert.alert("Chuyển trang", item.name);
    };

    // --- RENDER HEADER ---
    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('code')}>
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã NV</Text>
                <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity className="w-48 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('name')}>
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên nhân viên</Text>
                <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('role')}>
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'role' ? 'text-blue-600' : 'text-gray-700'}`}>Chức vụ</Text>
                <SortIcon color={sortBy === 'role' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>
            <View className="w-40 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Địa chỉ</Text></View>
            <View className="w-32 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Điện thoại</Text></View>
            <View className="w-48 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Email</Text></View>
            <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
        </View>
    );

    // --- RENDER ROW ---
    const renderTableRow = ({ item }) => (
        <TouchableOpacity
            onPress={() => openEditModal(item)} // Nhấn dòng để sửa
            className="flex-row border-b border-gray-100 py-3 bg-white items-center"
        >
            <View className="w-28 px-4"><Text className="text-sm text-gray-800">{item.code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm font-bold text-blue-700">{item.name}</Text></View>
            <View className="w-28 px-4"><View className="bg-gray-100 px-2 py-1 rounded"><Text className="text-xs">{item.role}</Text></View></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600">{item.email}</Text></View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="SETUP" activeSubMenu="Nhân viên" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                onCreatePress={openAddModal} // Mở modal thêm mới
                onFilterPress={() => setFilterModalVisible(true)}
            />

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        {/* Header Table */}
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã NV</Text></View>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Họ tên</Text></View>
                            <View className="w-28 px-4"><Text className="font-bold text-gray-700">Chức vụ</Text></View>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Email</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>
                        {/* List */}
                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={users} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(1, true)} />}
                                onEndReached={() => { if (!loading && page < lastPage) fetchUsers(page + 1); }}
                            />}
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL ADD / EDIT USER --- */}
            <Modal animationType="slide" transparent={true} visible={formModalVisible} onRequestClose={() => setFormModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-5 h-[90%]">
                        <View className="flex-row justify-between mb-4 border-b border-gray-200 pb-2">
                            <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</Text>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)}><Text className="text-gray-500 font-bold text-lg">✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Mã NV */}
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Mã nhân viên</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.employee_code} onChangeText={t => setFormData({ ...formData, employee_code: t })} placeholder="NV001" />
                            </View>
                            {/* Tên */}
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Họ và tên <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholder="Nhập họ tên..." />
                            </View>
                            {/* Email */}
                            <View className="mb-3"><Text className="text-gray-700 mb-1 font-bold">Email <Text className="text-red-500">*</Text></Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} placeholder="example@email.com" keyboardType="email-address" />
                            </View>
                            {/* Mật khẩu */}
                            <View className="mb-3">
                                <Text className="text-gray-700 mb-1 font-bold">Mật khẩu {isEditing && <Text className="font-normal italic text-xs text-gray-400">(Để trống nếu không đổi)</Text>}</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.password} onChangeText={t => setFormData({ ...formData, password: t })} placeholder="******" secureTextEntry />
                            </View>
                            {/* Phone & Address */}
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Điện thoại</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} keyboardType="phone-pad" />
                            </View>
                            <View className="mb-3"><Text className="text-gray-700 mb-1">Địa chỉ</Text>
                                <TextInput className="border border-gray-300 rounded p-3" value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />
                            </View>

                            {/* Dropdown Nhóm */}
                            <View className="mb-3"><Text className="text-gray-700 mb-2 font-bold">Nhóm nhân viên</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {userGroups.map(g => (
                                        <TouchableOpacity key={g.id}
                                            className={`mr-2 px-4 py-2 rounded-full border ${formData.group_id === g.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                                            onPress={() => setFormData({ ...formData, group_id: g.id })}>
                                            <Text className={formData.group_id === g.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>{g.group_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Dropdown Vai trò (Role) */}
                            <View className="mb-6"><Text className="text-gray-700 mb-2 font-bold">Chức vụ (Role)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {rolesList.map(r => (
                                        <TouchableOpacity key={r.id}
                                            className={`mr-2 px-4 py-2 rounded-full border ${formData.role === r.id ? 'bg-purple-100 border-purple-500' : 'bg-gray-50 border-gray-300'}`}
                                            onPress={() => setFormData({ ...formData, role: r.id })}>
                                            <Text className={formData.role === r.id ? 'text-purple-700 font-bold' : 'text-gray-600'}>{r.name}</Text>
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
                    <View className="bg-white rounded-t-xl p-4 h-5/6 w-full">
                        <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                            <Text className="text-lg font-bold text-gray-800">Bộ lọc Nhân viên</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Basic Inputs */}
                            <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Mã NV</Text>
                                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({ ...filterValues, ma: val })} placeholder="Nhập mã nhân viên..." />
                            </View>
                            <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Tên nhân viên</Text>
                                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ten} onChangeText={(val) => setFilterValues({ ...filterValues, ten: val })} placeholder="Nhập tên nhân viên..." />
                            </View>

                            {/* Filter Group */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Nhóm nhân viên</Text>
                                <View className="flex-row flex-wrap">
                                    <TouchableOpacity className={`px-3 py-2 rounded-full border mr-2 mb-2 ${filterValues.group_id === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'}`} onPress={() => setFilterValues({ ...filterValues, group_id: null })}>
                                        <Text className={filterValues.group_id === null ? 'text-blue-700 font-bold' : 'text-gray-600'}>Tất cả</Text>
                                    </TouchableOpacity>
                                    {userGroups.map(group => (
                                        <TouchableOpacity key={group.id} className={`px-3 py-2 rounded-full border mr-2 mb-2 ${filterValues.group_id === group.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'}`} onPress={() => setFilterValues({ ...filterValues, group_id: group.id })}>
                                            <Text className={filterValues.group_id === group.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>{group.group_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Filter Roles */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Chức vụ (Vai trò)</Text>
                                <View className="flex-row flex-wrap">
                                    {rolesList.map(role => (
                                        <TouchableOpacity key={role.id}
                                            className={`px-3 py-2 rounded-md border mr-2 mb-2 ${filterValues.roles.includes(role.id) ? 'bg-purple-100 border-purple-500' : 'bg-gray-100 border-gray-300'}`}
                                            onPress={() => handleRoleSelect(role.id)}>
                                            <Text className={filterValues.roles.includes(role.id) ? 'text-purple-700 font-bold' : 'text-gray-600'}>{role.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center" onPress={handleClearFilter}><Text className="text-gray-700 font-bold">Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded-md items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}