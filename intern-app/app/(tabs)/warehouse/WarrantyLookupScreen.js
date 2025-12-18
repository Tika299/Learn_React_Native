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
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon } from '../../../components/Icons';

// API
import warrantyApi from '../../../api/warrantyApi';

export default function WarrantyLookupScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [warranties, setWarranties] = useState([]);
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
  const [customers, setCustomers] = useState([]); // List khách hàng cho dropdown
  
  const [filterValues, setFilterValues] = useState({
      ma: '',       // Mã hàng
      brand: '',    // Hãng
      sn: '',       // Serial
      customer: []  // Mảng ID khách hàng (Controller hỗ trợ whereIn)
  });

  // --- EFFECT ---

  // 1. Load danh sách khách hàng để lọc (khi mount)
  useEffect(() => {
      fetchCustomers();
  }, []);

  // 2. Load danh sách bảo hành (khi search/sort thay đổi)
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchWarranties(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchCustomers = async () => {
      try {
          const res = await warrantyApi.getCustomers();
          if (res.data.success) {
              setCustomers(res.data.data);
          }
      } catch (error) {
          console.error("Lỗi lấy khách hàng:", error);
      }
  };

  const fetchWarranties = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            per_page: 20,
            search: searchText,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...filterValues
        };

        const response = await warrantyApi.getList(params);
        const result = response.data;

        if (result.success) {
            if (isRefresh || pageNumber === 1) {
                setWarranties(result.data);
            } else {
                setWarranties(prev => [...prev, ...result.data]);
            }
            setPage(result.pagination.current_page);
            setLastPage(result.pagination.last_page);
            setTotalRecords(result.pagination.total);
        }
    } catch (error) {
        console.error("Lỗi lấy dữ liệu bảo hành:", error);
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
    fetchWarranties(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchWarranties(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchWarranties(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', brand: '', sn: '', customer: [] });
    setFilterModalVisible(false);
    fetchWarranties(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity className="w-24 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('code')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã hàng</Text>
            <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-24 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('brand')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'brand' ? 'text-blue-600' : 'text-gray-700'}`}>Hãng</Text>
            <SortIcon color={sortBy === 'brand' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-40 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('serial')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'serial' ? 'text-blue-600' : 'text-gray-700'}`}>S/N</Text>
            <SortIcon color={sortBy === 'serial' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-40 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('customer')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'customer' ? 'text-blue-600' : 'text-gray-700'}`}>Khách hàng</Text>
            <SortIcon color={sortBy === 'customer' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-32 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('sell_date')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'sell_date' ? 'text-blue-600' : 'text-gray-700'}`}>Ngày bán</Text>
            <SortIcon color={sortBy === 'sell_date' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-48 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Bảo hành</Text></View>
        <View className="w-48 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Hạn bảo hành</Text></View>
        <View className="w-32 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Kích hoạt BH</Text></View>
        <View className="w-48 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">BH Dịch vụ</Text></View>
        <View className="w-48 px-4 flex-row items-center"><Text className="text-xs font-bold text-gray-700">Tình trạng</Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng */}
        <View className="w-24 px-4">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Hãng */}
        <View className="w-24 px-4">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>

        {/* S/N */}
        <View className="w-40 px-4">
            <TouchableOpacity onPress={() => Alert.alert("Chi tiết S/N", `Serial ID: ${item.id}`)}>
                <Text className="text-sm font-medium text-purple-700">{item.serial}</Text>
            </TouchableOpacity>
        </View>

        {/* Khách hàng */}
        <View className="w-40 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.customer}</Text>
        </View>

        {/* Ngày bán */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.sell_date}</Text>
        </View>

        {/* Thông tin Bảo hành (Gộp từ API) */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.warranty_info}</Text>
        </View>

        {/* Hạn bảo hành (Xanh/Đỏ dựa trên is_expired) */}
        <View className="w-48 px-4">
            <Text className={`text-sm font-medium ${item.is_expired ? 'text-red-500' : 'text-green-600'}`}>
                {item.expiry_status}
            </Text>
        </View>

        {/* Ngày kích hoạt BH (activation_date) */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.activation_date || '--'}</Text>
        </View>

        {/* Bảo hành Dịch vụ */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.service_warranty || '--'}</Text>
        </View>

        {/* Tình trạng */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.status}</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Tra cứu bảo hành" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
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
                            data={warranties}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không tìm thấy dữ liệu</Text></View>}
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
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Bảo hành</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Mã hàng</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({...filterValues, ma: val})} placeholder="Nhập mã hàng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.brand} onChangeText={(val) => setFilterValues({...filterValues, brand: val})} placeholder="Nhập hãng..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Serial Number</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.sn} onChangeText={(val) => setFilterValues({...filterValues, sn: val})} placeholder="Nhập số Serial..." />
                    </View>
                    
                    {/* Filter Customer (Có thể làm Dropdown, ở đây làm Input cho đơn giản) */}
                    {/* Nếu muốn lọc nhiều Customer thì cần UI Multi-Select */}
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