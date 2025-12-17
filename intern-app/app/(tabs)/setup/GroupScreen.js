import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';

// Import các component UI cũ của bạn
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon } from '../../../components/Icons'; // Giả sử icon này có thể nhận prop color/active

// Import API Service vừa tạo
import groupApi from '../../../api/groupApi';

export default function GroupScreen() {
    // --- STATE ---
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Sorting State
    const [sortBy, setSortBy] = useState('id'); // code, name, type
    const [sortDir, setSortDir] = useState('desc'); // asc, desc

    // --- EFFECT: Xử lý tìm kiếm (Debounce) ---
    // Khi searchText thay đổi, reset page về 1 và gọi API
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGroups(1, true); // true = reset data cũ
        }, 500); // Delay 500ms để tránh spam API khi gõ
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- FUNCTION: Gọi API ---
    const fetchGroups = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1) setLoading(true);
        
        try {
            const params = {
                page: pageNumber,
                per_page: 20,
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
            };

            const response = await groupApi.getList(params);
            
            // Cấu trúc response từ Laravel: { success: true, data: [...], pagination: {...} }
            const result = response.data; 

            if (result.success) {
                if (isRefresh || pageNumber === 1) {
                    setData(result.data);
                } else {
                    setData(prev => [...prev, ...result.data]);
                }
                
                // Cập nhật thông tin phân trang
                setPage(result.pagination.current_page);
                setLastPage(result.pagination.last_page);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách nhóm:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    // --- HANDLER: Xử lý sự kiện ---

    const handleSubMenuPress = (item) => {
        // Xử lý chuyển trang hoặc lọc theo loại
        console.log("Sub menu:", item);
    };

    const handleCreatePress = () => {
        // Điều hướng sang màn hình tạo mới
        Alert.alert("Thông báo", "Chức năng Tạo mới đang phát triển");
    };

    const handleSort = (field) => {
        // Nếu đang sort field này rồi thì đảo chiều, nếu chưa thì set lại field và mặc định asc
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        // useEffect sẽ tự kích hoạt fetchGroups khi sortBy/sortDir đổi
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroups(1, true);
    };

    const onLoadMore = () => {
        if (!isLoadingMore && page < lastPage) {
            setIsLoadingMore(true);
            fetchGroups(page + 1, false);
        }
    };

    // --- RENDER COMPONENT ---

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity 
                className="flex-1 px-4 flex-row items-center" 
                onPress={() => handleSort('code')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Mã đối tượng
                </Text>
                <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity 
                className="flex-1 px-4 flex-row items-center"
                onPress={() => handleSort('name')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Tên nhóm
                </Text>
                <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>

            <TouchableOpacity 
                className="flex-1 px-4 flex-row items-center"
                onPress={() => handleSort('type')}
            >
                <Text className={`text-xs font-bold mr-1 ${sortBy === 'type' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Loại nhóm
                </Text>
                <SortIcon color={sortBy === 'type' ? '#2563EB' : '#9CA3AF'} />
            </TouchableOpacity>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <TouchableOpacity 
            className="flex-row border-b border-gray-100 py-3 bg-white items-center"
            onPress={() => Alert.alert("Chi tiết", `Xem chi tiết: ${item.name}`)}
        >
            <View className="flex-1 px-4">
                <Text className="text-sm text-gray-800 font-medium">{item.code}</Text>
            </View>
            <View className="flex-1 px-4">
                <Text className="text-sm text-gray-600">{item.name}</Text>
            </View>
            <View className="flex-1 px-4">
                <Text className="text-sm text-gray-600">{item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color="#0000ff" />
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Nhóm đối tượng"
                onSubMenuPress={handleSubMenuPress}
            />

            <ActionToolbar
                searchText={searchText}
                setSearchText={setSearchText} // Update state -> trigger useEffect
                onCreatePress={handleCreatePress}
            />

            <View className="flex-1 px-3 py-3">
                <View className="bg-white rounded-lg shadow overflow-hidden flex-1 border border-gray-200">
                    {renderTableHeader()}
                    
                    {loading && page === 1 ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text className="text-gray-500 mt-2">Đang tải dữ liệu...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            renderItem={renderTableRow}
                            keyExtractor={(item) => item.id.toString()}
                            // Refresh (Kéo xuống để làm mới)
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                            // Infinite Scroll (Kéo xuống đáy để load thêm)
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            ListEmptyComponent={
                                <View className="p-5 items-center">
                                    <Text className="text-gray-500">Không tìm thấy dữ liệu</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}