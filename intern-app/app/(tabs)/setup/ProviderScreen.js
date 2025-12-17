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
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon } from '../../../components/Icons';

// API
import providerApi from '../../../api/providerApi';

export default function ProviderScreen() {
    // --- STATE DỮ LIỆU ---
    const [searchText, setSearchText] = useState('');
    const [providers, setProviders] = useState([]);
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
    // State lưu giá trị bộ lọc nâng cao (mapping đúng với API PHP yêu cầu)
    const [filterValues, setFilterValues] = useState({
        ma: '',
        ten: '',
        address: '',
        phone: '',
        email: '',
        note: ''
    });

    // --- EFFECT ---
    // Gọi API khi: Search thay đổi, Sort thay đổi, hoặc bấm nút "Xác nhận" ở filter (khi filterValues thay đổi và được apply)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProviders(1, true);
        }, 500); // Debounce 500ms
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---
    const fetchProviders = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);

        try {
            // Gom tất cả params
            const params = {
                page: pageNumber,
                per_page: 20,
                search: searchText, // Tìm kiếm chung
                sort_by: sortBy,
                sort_dir: sortDir,
                // Spread bộ lọc nâng cao vào params
                ...filterValues 
            };

            const response = await providerApi.getList(params);
            const result = response.data;

            if (result.success) {
                if (isRefresh || pageNumber === 1) {
                    setProviders(result.data);
                } else {
                    setProviders(prev => [...prev, ...result.data]);
                }
                setPage(result.pagination.current_page);
                setLastPage(result.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách NCC:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // --- HANDLERS ---
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
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-32 px-4"><Text className="text-sm text-gray-800 font-medium">{item.code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-800 font-medium">{item.name}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600">{item.address}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.phone}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600">{item.email}</Text></View>
            <View className="w-40 px-4"><Text className="text-sm text-gray-600">{item.note}</Text></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Nhà cung cấp"
                onSubMenuPress={handleSubMenuPress}
            />

            <ActionToolbar
                searchText={searchText}
                setSearchText={setSearchText}
                onFilterPress={() => setFilterModalVisible(true)}
                onImportPress={() => Alert.alert("Thông báo", "Chức năng Nhập Excel")}
                onCreatePress={() => Alert.alert("Thông báo", "Chức năng Tạo mới")}
            />

            <View className="flex-1 bg-white px-3 py-2">
                <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            {renderTableHeader()}

                            {loading && page === 1 ? (
                                <View className="p-10 w-screen items-center">
                                    <ActivityIndicator size="large" color="#2563EB" />
                                </View>
                            ) : (
                                <FlatList
                                    data={providers}
                                    renderItem={renderTableRow}
                                    keyExtractor={item => item.id.toString()}
                                    refreshControl={
                                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                    }
                                    onEndReached={onLoadMore}
                                    onEndReachedThreshold={0.5}
                                    ListFooterComponent={
                                        isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4" /> : null
                                    }
                                    ListEmptyComponent={
                                        <View className="p-10 w-screen items-center justify-center">
                                            <Text className="text-gray-500 italic">Không tìm thấy nhà cung cấp nào</Text>
                                        </View>
                                    }
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* --- MODAL BỘ LỌC --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <TouchableOpacity 
                    className="flex-1 justify-end bg-black/50"
                    activeOpacity={1}
                    onPress={() => setFilterModalVisible(false)}
                >
                    <View className="bg-white rounded-t-xl p-4 h-3/4 w-full">
                        <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                            <Text className="text-lg font-bold text-gray-800">Bộ lọc Nhà cung cấp</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Text className="text-gray-500 font-bold">Đóng</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Input Mã NCC */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Mã NCC</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-800"
                                    placeholder="Nhập mã..."
                                    value={filterValues.ma}
                                    onChangeText={(text) => handleFilterChange('ma', text)}
                                />
                            </View>

                            {/* Input Tên NCC */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Tên nhà cung cấp</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-800"
                                    placeholder="Nhập tên..."
                                    value={filterValues.ten}
                                    onChangeText={(text) => handleFilterChange('ten', text)}
                                />
                            </View>

                            {/* Input Địa chỉ */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Địa chỉ</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-800"
                                    placeholder="Nhập địa chỉ..."
                                    value={filterValues.address}
                                    onChangeText={(text) => handleFilterChange('address', text)}
                                />
                            </View>

                             {/* Input Điện thoại */}
                             <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-1">Điện thoại</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-800"
                                    placeholder="Nhập số điện thoại..."
                                    keyboardType="phone-pad"
                                    value={filterValues.phone}
                                    onChangeText={(text) => handleFilterChange('phone', text)}
                                />
                            </View>
                        </ScrollView>

                        <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center"
                                onPress={clearFilter}
                            >
                                <Text className="text-gray-700 font-bold">Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-600 p-3 rounded-md items-center"
                                onPress={applyFilter}
                            >
                                <Text className="text-white font-bold">Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}