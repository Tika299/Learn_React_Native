import React, { useState, useEffect } from 'react';
import { 
    View, Text, SafeAreaView, ScrollView, FlatList, 
    Modal, Alert, TouchableOpacity, ActivityIndicator, 
    RefreshControl 
} from 'react-native';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon } from '../../components/Icons';

// API
import customerApi from '../../api/customerApi';

export default function CustomerScreen() {
    // --- STATE DỮ LIỆU ---
    const [searchText, setSearchText] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Sorting
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // Filter Modal
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [customerGroups, setCustomerGroups] = useState([]); // Danh sách nhóm để chọn trong modal
    const [selectedGroupId, setSelectedGroupId] = useState(null); // ID nhóm đang chọn lọc

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
            if (res.data.success) {
                setCustomerGroups(res.data.data);
            }
        } catch (error) {
            console.log("Lỗi lấy nhóm khách hàng:", error);
        }
    };

    const fetchCustomers = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);

        try {
            const params = {
                page: pageNumber,
                per_page: 20,
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
                group_id: selectedGroupId || '', // Truyền ID nhóm nếu có
            };

            const response = await customerApi.getList(params);
            const result = response.data;

            if (result.success) {
                if (isRefresh || pageNumber === 1) {
                    setCustomers(result.data);
                } else {
                    setCustomers(prev => [...prev, ...result.data]);
                }
                setPage(result.pagination.current_page);
                setLastPage(result.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách khách hàng:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
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

    // --- RENDER UI ---

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity 
                className="w-32 px-4 flex-row items-center" 
                onPress={() => handleSort('code')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã KH</Text>
                <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity 
                className="w-48 px-4 flex-row items-center"
                onPress={() => handleSort('name')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên khách hàng</Text>
                <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <View className="w-40 px-4 flex-row items-center">
                 <Text className="text-xs font-bold text-gray-700">Điện thoại</Text>
            </View>

            <TouchableOpacity 
                className="w-60 px-4 flex-row items-center"
                onPress={() => handleSort('address')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'address' ? 'text-blue-600' : 'text-gray-700'}`}>Địa chỉ</Text>
                <SortIcon color={sortBy === 'address' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-32 px-4"><Text className="text-sm text-gray-800 font-medium">{item.code || item.customer_code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-800">{item.name || item.customer_name}</Text></View>
            <View className="w-40 px-4"><Text className="text-sm text-gray-600">{item.phone || item.phone_number}</Text></View>
            <View className="w-60 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.address}</Text></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Khách hàng"
                onSubMenuPress={handleSubMenuPress}
            />

            <ActionToolbar
                searchText={searchText}
                setSearchText={setSearchText}
                onFilterPress={() => setFilterModalVisible(true)}
                onCreatePress={() => Alert.alert("Thông báo", "Chức năng tạo mới khách hàng")}
                onImportPress={() => Alert.alert("Thông báo", "Chức năng nhập Excel")}
            />

            <View className="flex-1 bg-white border-t border-gray-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        {renderTableHeader()}
                        
                        {loading && page === 1 ? (
                            <View className="p-10 w-screen items-center">
                                <ActivityIndicator size="large" color="#2563EB" />
                            </View>
                        ) : (
                            <FlatList
                                data={customers}
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
                                    <View className="p-10 w-screen items-center">
                                        <Text className="text-gray-500 italic">Không tìm thấy dữ liệu</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* --- MODAL LỌC THEO NHÓM --- */}
            <Modal visible={filterModalVisible} animationType="fade" transparent={true}>
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setFilterModalVisible(false)}
                >
                    <View className="bg-white rounded-t-xl p-5 h-2/3 w-full">
                        <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <Text className="text-lg font-bold text-gray-800">Lọc theo nhóm khách hàng</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Text className="text-blue-600 font-medium">Đóng</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView>
                            <TouchableOpacity 
                                className={`p-3 rounded-lg mb-2 flex-row justify-between items-center ${selectedGroupId === null ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                                onPress={() => handleSelectGroupFilter(null)}
                            >
                                <Text className={`${selectedGroupId === null ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>Tất cả khách hàng</Text>
                                {selectedGroupId === null && <Text className="text-blue-600">✓</Text>}
                            </TouchableOpacity>

                            {customerGroups.map(group => (
                                <TouchableOpacity 
                                    key={group.id}
                                    className={`p-3 rounded-lg mb-2 flex-row justify-between items-center ${selectedGroupId === group.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                                    onPress={() => handleSelectGroupFilter(group.id)}
                                >
                                    <Text className={`${selectedGroupId === group.id ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                                        {group.name || group.group_name}
                                    </Text>
                                    {selectedGroupId === group.id && <Text className="text-blue-600">✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    );
}