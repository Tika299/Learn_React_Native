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
import Svg, { Path } from 'react-native-svg';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import exportApi from '../../api/exportApi';

export default function ExportScreen() {
  // --- STATE DỮ LIỆU ---
  const [searchText, setSearchText] = useState('');
  const [exports, setExports] = useState([]);
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
  
  // Filter Values (Khớp với Controller Backend)
  const [filterValues, setFilterValues] = useState({
      ma: '',           // Mã phiếu
      note: '',         // Ghi chú
      customer_name: '',// Tên khách hàng (Frontend nhập tên để tìm)
      user_name: '',    // Người lập phiếu
      serial: '',       // Serial sản phẩm
      product_name: ''  // Tên sản phẩm
  });

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchExports(1, true);
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchExports = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            limit: 20, // Backend dùng 'limit' thay vì 'per_page' trong paginateForIndex
            search: searchText,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...filterValues
        };

        const response = await exportApi.getList(params);
        const result = response.data;

        // Backend trả về: { success: true, data: { current_page, data: [], ... } }
        // Hoặc: { status: true, data: { ... } } -> tùy controller list()
        
        if (result.status || result.success) {
            const paginationData = result.data; // Object phân trang
            const dataArray = paginationData.data || [];

            if (isRefresh || pageNumber === 1) {
                setExports(dataArray);
            } else {
                setExports(prev => [...prev, ...dataArray]);
            }
            
            setPage(paginationData.current_page || 1);
            setLastPage(paginationData.last_page || 1);
            setTotalRecords(paginationData.total || 0);
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách phiếu xuất:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu xuất ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
                try {
                    const res = await exportApi.delete(id);
                    if (res.data.status || res.data.success) {
                        Alert.alert("Thành công", "Đã xóa phiếu xuất");
                        fetchExports(1, true);
                    } else {
                        // Trường hợp xóa thất bại nhưng backend trả về 200 kèm message
                        Alert.alert("Lỗi", res.data.message || "Không thể xóa");
                    }
                } catch (error) {
                    const msg = error.response?.data?.message || "Không thể xóa phiếu xuất";
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
    fetchExports(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchExports(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchExports(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', note: '', customer_name: '', user_name: '', serial: '', product_name: '' });
    setFilterModalVisible(false);
    fetchExports(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('export_code')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'export_code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã phiếu</Text>
            <SortIcon color={sortBy === 'export_code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('date_create')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'date_create' ? 'text-blue-600' : 'text-gray-700'}`}>Ngày lập</Text>
            <SortIcon color={sortBy === 'date_create' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-48 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700">Khách hàng</Text>
        </View>
        <View className="w-40 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700">Người lập phiếu</Text>
        </View>
        <View className="w-48 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700">Ghi chú</Text>
        </View>
        <View className="w-16 px-2 flex-row items-center justify-center">
            <Text className="text-xs font-bold text-gray-700">Xóa</Text>
        </View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    console.log(item),
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu */}
        <View className="w-28 px-4">
            <Text className="text-sm font-medium text-purple-700">{item.export_code || item.code}</Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-4">
            <Text className="text-sm text-gray-800">{item.date_create || item.date}</Text>
        </View>
        
        {/* Khách hàng (Lấy từ relation customer) */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={1}>
                {item.customer ? item.customer.customer_name : (item.customer_name || '---')}
            </Text>
        </View>

        {/* Người lập (Lấy từ relation user) */}
        <View className="w-40 px-4">
            <Text className="text-sm text-gray-600">
                {item.user ? item.user.name : (item.user_name || '---')}
            </Text>
        </View>

        {/* Ghi chú */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.note}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.export_code)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu xuất hàng" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu xuất mới")}
        onFilterPress={() => setFilterModalVisible(true)}
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
                            data={exports}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu xuất nào</Text></View>}
                        />
                    )}
                    
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">Tổng số phiếu: <Text className="font-bold">{totalRecords || exports.length}</Text></Text>
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
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Phiếu xuất</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Mã phiếu</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({...filterValues, ma: val})} placeholder="Nhập mã phiếu..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Khách hàng</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.customer_name} onChangeText={(val) => setFilterValues({...filterValues, customer_name: val})} placeholder="Nhập tên khách hàng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Người lập phiếu</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.user_name} onChangeText={(val) => setFilterValues({...filterValues, user_name: val})} placeholder="Nhập tên người lập..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Serial Sản phẩm</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.serial} onChangeText={(val) => setFilterValues({...filterValues, serial: val})} placeholder="Tìm theo Serial..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Ghi chú</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.note} onChangeText={(val) => setFilterValues({...filterValues, note: val})} placeholder="Nội dung ghi chú..." />
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