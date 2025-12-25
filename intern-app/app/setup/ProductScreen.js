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
import Svg, { Path } from 'react-native-svg';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import productApi from '../../api/productApi';

export default function ProductScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination & Count
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sort
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Filter Modal
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [productGroups, setProductGroups] = useState([]);
  // Filter Values
  const [filterValues, setFilterValues] = useState({
      ma: '',
      ten: '',
      hang: '',
      group_id: null // ID nhóm đang chọn
  });

  // --- EFFECT ---

  // 1. Load danh sách nhóm khi vào màn hình
  useEffect(() => {
    fetchGroups();
  }, []);

  // 2. Load sản phẩm (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchGroups = async () => {
    try {
        const res = await productApi.getGroups();
        if (res.data.success) {
            setProductGroups(res.data.data);
        }
    } catch (err) {
        console.error("Lỗi lấy nhóm hàng:", err);
    }
  };

  const fetchProducts = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            per_page: 20,
            search: searchText,
            sort_by: sortBy,
            sort_dir: sortDir,
            // Spread Filter Values
            ...filterValues
        };

        const response = await productApi.getList(params);
        const result = response.data;

        if (result.success) {
            if (isRefresh || pageNumber === 1) {
                setProducts(result.data);
            } else {
                setProducts(prev => [...prev, ...result.data]);
            }
            setPage(result.pagination.current_page);
            setLastPage(result.pagination.last_page);
            setTotalProducts(result.total); // Backend trả về key 'total'
        }
    } catch (error) {
        console.error("Lỗi lấy hàng hóa:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
                try {
                    const res = await productApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa sản phẩm");
                        // Refresh lại list
                        fetchProducts(1, true);
                    }
                } catch (error) {
                    // Nếu lỗi 422 (Có serial...)
                    const msg = error.response?.data?.message || "Không thể xóa sản phẩm";
                    Alert.alert("Lỗi", msg);
                }
            }
        }
      ]
    );
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
    fetchProducts(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchProducts(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchProducts(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', ten: '', hang: '', group_id: null });
    setFilterModalVisible(false);
    fetchProducts(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // Lấy tên nhóm đang chọn để hiển thị
  const getCurrentGroupName = () => {
      if (!filterValues.group_id) return "Chưa chọn nhóm (Tất cả)";
      const group = productGroups.find(g => g.id === filterValues.group_id);
      return group ? group.group_name : "Nhóm không xác định";
  };

  // --- RENDER HEADER BẢNG ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity 
            className="w-40 px-4 flex-row items-center border-r border-gray-200"
            onPress={() => handleSort('code')}
        >
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã hàng</Text>
            <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity 
            className="w-60 px-4 flex-row items-center border-r border-gray-200"
            onPress={() => handleSort('name')}
        >
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên hàng</Text>
            <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity 
            className="w-32 px-4 flex-row items-center border-r border-gray-200"
            onPress={() => handleSort('brand')}
        >
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'brand' ? 'text-blue-600' : 'text-gray-700'}`}>Hãng</Text>
            <SortIcon color={sortBy === 'brand' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-16 px-2 flex-row items-center justify-center">
            <Text className="text-xs font-bold text-gray-700">Xóa</Text>
        </View>
    </View>
  );

  // --- RENDER DÒNG DỮ LIỆU ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        <View className="w-40 px-4">
            <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
        </View>
        <View className="w-60 px-4">
            <Text className="text-sm text-gray-800">{item.name}</Text>
        </View>
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header 
        defaultActiveMenu="SETUP"
        activeSubMenu="Hàng hoá"
        onSubMenuPress={handleSubMenuPress}
      />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo mới hàng hóa")}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      {/* Table Content */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {/* Header: Hiển thị nhóm đang chọn */}
                    <TouchableOpacity 
                        className="bg-white border-b border-gray-200 p-3"
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text className="text-purple-700 font-medium text-sm">
                            Nhóm hàng hóa: <Text className="font-bold">{getCurrentGroupName()}</Text>
                            <Text className="text-gray-400 text-xs ml-2"> (Nhấn để lọc)</Text>
                        </Text>
                    </TouchableOpacity>

                    {renderTableHeader()}

                    {loading && page === 1 ? (
                         <View className="p-10 w-screen items-center">
                            <ActivityIndicator size="large" color="#2563EB" />
                        </View>
                    ) : (
                        <FlatList 
                            data={products}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null
                            }
                            ListEmptyComponent={
                                <View className="p-10 w-screen items-center justify-center">
                                    <Text className="text-gray-500 italic">Không có hàng hóa nào</Text>
                                </View>
                            }
                        />
                    )}

                    {/* Footer: Tổng số lượng */}
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">
                            SL hàng hoá: <Text className="font-bold">{totalProducts}</Text>
                         </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- FILTER MODAL --- */}
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
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Hàng hóa</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                        <Text className="text-gray-500 font-bold">Đóng</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Input Mã Hàng */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Mã hàng</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md p-3 bg-gray-50"
                            placeholder="Nhập mã hàng..."
                            value={filterValues.ma}
                            onChangeText={(val) => setFilterValues({...filterValues, ma: val})}
                        />
                    </View>

                    {/* Input Tên Hàng */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Tên hàng</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md p-3 bg-gray-50"
                            placeholder="Nhập tên hàng..."
                            value={filterValues.ten}
                            onChangeText={(val) => setFilterValues({...filterValues, ten: val})}
                        />
                    </View>

                    {/* Input Hãng */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md p-3 bg-gray-50"
                            placeholder="Samsung, Apple,..."
                            value={filterValues.hang}
                            onChangeText={(val) => setFilterValues({...filterValues, hang: val})}
                        />
                    </View>

                    {/* Chọn Nhóm Hàng */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Nhóm hàng hóa</Text>
                        <View className="flex-row flex-wrap">
                            <TouchableOpacity
                                className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
                                    filterValues.group_id === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'
                                }`}
                                onPress={() => setFilterValues({...filterValues, group_id: null})}
                            >
                                <Text className={filterValues.group_id === null ? 'text-blue-700 font-bold' : 'text-gray-600'}>
                                    Tất cả
                                </Text>
                            </TouchableOpacity>

                            {productGroups.map(group => (
                                <TouchableOpacity
                                    key={group.id}
                                    className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
                                        filterValues.group_id === group.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'
                                    }`}
                                    onPress={() => setFilterValues({...filterValues, group_id: group.id})}
                                >
                                    <Text className={filterValues.group_id === group.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>
                                        {group.group_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                    <TouchableOpacity 
                        className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center"
                        onPress={handleClearFilter}
                    >
                        <Text className="text-gray-700 font-bold">Đặt lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-1 bg-blue-600 p-3 rounded-md items-center"
                        onPress={handleApplyFilter}
                    >
                        <Text className="text-white font-bold">Áp dụng</Text>
                    </TouchableOpacity>
                </View>
             </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}