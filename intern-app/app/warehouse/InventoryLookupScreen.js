import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Platform
} from 'react-native';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon } from '../../components/Icons';

// API
import inventoryApi from '../../api/inventoryApi';

export default function InventoryLookupScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Filter Modal
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
      ma: '',
      ten: '',
      brand: '',
      sn: '',
      // Có thể mở rộng thêm: provider, date_from, date_to...
  });

  // --- EFFECT ---
  
  // Gọi API khi thay đổi search, sort
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchInventory(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchInventory = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            per_page: 20,
            search: searchText,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...filterValues // Spread các giá trị lọc
        };

        const response = await inventoryApi.getList(params);
        const result = response.data;

        if (result.success) {
            if (isRefresh || pageNumber === 1) {
                setInventory(result.data);
            } else {
                setInventory(prev => [...prev, ...result.data]);
            }
            setPage(result.pagination.current_page);
            setLastPage(result.pagination.last_page);
            setTotalRecords(result.pagination.total);
        }
    } catch (error) {
        console.error("Lỗi lấy dữ liệu tồn kho:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
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
    fetchInventory(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchInventory(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchInventory(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', ten: '', brand: '', sn: '' });
    setFilterModalVisible(false);
    fetchInventory(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('code')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã hàng</Text>
            <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-48 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('name')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên hàng</Text>
            <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-24 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('brand')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'brand' ? 'text-blue-600' : 'text-gray-700'}`}>Hãng</Text>
            <SortIcon color={sortBy === 'brand' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-40 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('serial')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'serial' ? 'text-blue-600' : 'text-gray-700'}`}>S/N</Text>
            <SortIcon color={sortBy === 'serial' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-40 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('provider')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'provider' ? 'text-blue-600' : 'text-gray-700'}`}>Nhà cung cấp</Text>
            <SortIcon color={sortBy === 'provider' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-32 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('import_date')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'import_date' ? 'text-blue-600' : 'text-gray-700'}`}>Ngày nhập</Text>
            <SortIcon color={sortBy === 'import_date' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-32 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('warehouse')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'warehouse' ? 'text-blue-600' : 'text-gray-700'}`}>Kho</Text>
            <SortIcon color={sortBy === 'warehouse' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-24 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('duration')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'duration' ? 'text-blue-600' : 'text-gray-700'}`}>Tồn kho</Text>
            <SortIcon color={sortBy === 'duration' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-32 px-4 flex-row items-center">
            <Text className="text-xs font-bold text-gray-700">Trạng thái</Text>
        </View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng */}
        <View className="w-28 px-4">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Tên hàng */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-800" numberOfLines={2}>{item.name}</Text>
        </View>
        
        {/* Hãng */}
        <View className="w-24 px-4">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>

        {/* S/N (Serial) */}
        <View className="w-40 px-4">
            {item.serial ? (
                <Text className="text-sm font-medium text-purple-700">{item.serial}</Text>
            ) : (
                <Text className="text-sm text-gray-400">--</Text>
            )}
        </View>

        {/* Nhà cung cấp */}
        <View className="w-40 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.provider}</Text>
        </View>

        {/* Ngày nhập */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.import_date}</Text>
        </View>

        {/* Kho */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.warehouse}</Text>
        </View>

        {/* Thời gian tồn (duration) */}
        <View className="w-24 px-4">
            <Text className="text-sm text-gray-800">{item.duration}</Text>
        </View>

        {/* Trạng thái */}
        <View className="w-32 px-4">
            <Text className={`text-sm ${item.status === 'Tới hạn bảo trì' ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                {item.status}
            </Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Tra cứu tồn kho" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onFilterPress={() => setFilterModalVisible(true)}
        onImportPress={() => Alert.alert("Thông báo", "Chức năng xuất Excel")}
        // Không có nút tạo mới ở màn hình này
      />

      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}

                    {loading && page === 1 ? (
                        <View className="p-10 w-screen items-center"><ActivityIndicator size="large" color="#2563EB" /></View>
                    ) : (
                        <FlatList 
                            data={inventory}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không tìm thấy dữ liệu tồn kho</Text></View>}
                        />
                    )}
                    
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">Tổng số kết quả: <Text className="font-bold">{totalRecords}</Text></Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
             <View className="bg-white rounded-t-xl p-4 h-3/4 w-full">
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Tồn kho</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Mã hàng</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({...filterValues, ma: val})} placeholder="Nhập mã hàng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Tên hàng</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ten} onChangeText={(val) => setFilterValues({...filterValues, ten: val})} placeholder="Nhập tên hàng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Hãng</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.brand} onChangeText={(val) => setFilterValues({...filterValues, brand: val})} placeholder="Nhập tên hãng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Serial Number (S/N)</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.sn} onChangeText={(val) => setFilterValues({...filterValues, sn: val})} placeholder="Nhập số Serial..." />
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