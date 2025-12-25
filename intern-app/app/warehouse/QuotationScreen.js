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
import quotationApi from '../../api/quotationApi';

// Helper: Format tiền tệ
const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper: Format ngày (Giả sử date string dạng YYYY-MM-DD)
const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default function QuotationScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [quotations, setQuotations] = useState([]);
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
      quotation_code: '', // Mã phiếu
      customer_name: '',  // Tên khách hàng (Cần backend hỗ trợ search like)
      receiving_code: '', // Mã phiếu tiếp nhận
      notes: ''           // Ghi chú
  });

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchQuotations(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchQuotations = async (pageNumber = 1, isRefresh = false) => {
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

        const response = await quotationApi.getList(params);
        const result = response.data;

        if (result.status === true || result.success) {
            const dataList = result.data.data || []; // Laravel Paginate structure
            
            if (isRefresh || pageNumber === 1) {
                setQuotations(dataList);
            } else {
                setQuotations(prev => [...prev, ...dataList]);
            }
            
            setPage(result.data.current_page || 1);
            setLastPage(result.data.last_page || 1);
            setTotalRecords(result.data.total || 0);
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách báo giá:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu báo giá ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
                try {
                    const res = await quotationApi.delete(id);
                    if (res.data.status) {
                        Alert.alert("Thành công", "Đã xóa phiếu báo giá");
                        fetchQuotations(1, true);
                    } else {
                        Alert.alert("Lỗi", res.data.message || "Không thể xóa");
                    }
                } catch (error) {
                    Alert.alert("Lỗi", "Đã có lỗi xảy ra khi xóa");
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
    fetchQuotations(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchQuotations(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchQuotations(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ quotation_code: '', customer_name: '', receiving_code: '', notes: '' });
    setFilterModalVisible(false);
    fetchQuotations(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity className="w-32 px-4 border-r border-gray-200 flex-row items-center" onPress={() => handleSort('quotation_code')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'quotation_code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã phiếu</Text>
            <SortIcon color={sortBy === 'quotation_code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-40 px-4 border-r border-gray-200 flex-row items-center" onPress={() => handleSort('customer_id')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'customer_id' ? 'text-blue-600' : 'text-gray-700'}`}>Khách hàng</Text>
            <SortIcon color={sortBy === 'customer_id' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <TouchableOpacity className="w-28 px-4 border-r border-gray-200 flex-row items-center" onPress={() => handleSort('quotation_date')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'quotation_date' ? 'text-blue-600' : 'text-gray-700'}`}>Ngày lập</Text>
            <SortIcon color={sortBy === 'quotation_date' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-32 px-4 border-r border-gray-200 flex-row items-center"><Text className="text-xs font-bold text-gray-700">Phiếu tiếp nhận</Text></View>
        
        <TouchableOpacity className="w-32 px-4 border-r border-gray-200 flex-row items-center" onPress={() => handleSort('total_amount')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'total_amount' ? 'text-blue-600' : 'text-gray-700'}`}>Tổng tiền</Text>
            <SortIcon color={sortBy === 'total_amount' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>

        <View className="w-48 px-4 border-r border-gray-200 flex-row items-center"><Text className="text-xs font-bold text-gray-700">Ghi chú</Text></View>
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu */}
        <View className="w-32 px-4">
            <TouchableOpacity onPress={() => Alert.alert("Chi tiết", `ID: ${item.id}`)}>
                <Text className="text-sm font-medium text-purple-700">{item.quotation_code}</Text>
            </TouchableOpacity>
        </View>
        
        {/* Khách hàng (Truy cập object relation) */}
        <View className="w-40 px-4">
            <Text className="text-sm text-gray-800" numberOfLines={1}>
                {item.customer?.customer_name || '---'}
            </Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-4">
            <Text className="text-sm text-gray-600">{formatDate(item.quotation_date)}</Text>
        </View>

        {/* Phiếu tiếp nhận (Truy cập object relation) */}
        <View className="w-32 px-4">
            <TouchableOpacity onPress={() => Alert.alert("Thông tin", `Phiếu tiếp nhận: ${item.reception?.form_code_receiving}`)}>
                <Text className="text-sm font-medium text-purple-700">
                    {item.reception?.form_code_receiving || '---'}
                </Text>
            </TouchableOpacity>
        </View>

        {/* Tổng tiền */}
        <View className="w-32 px-4">
            <Text className="text-sm font-bold text-red-600">{formatCurrency(item.total_amount)}</Text>
        </View>

        {/* Ghi chú */}
        <View className="w-48 px-4">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.notes}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.quotation_code)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu báo giá" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu báo giá mới")}
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
                            data={quotations}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu báo giá nào</Text></View>}
                        />
                    )}
                    
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">Tổng số phiếu: <Text className="font-bold">{totalRecords}</Text></Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
             <View className="bg-white rounded-t-xl p-4 h-2/3 w-full">
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Báo giá</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Mã phiếu</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.quotation_code} onChangeText={(t) => setFilterValues({...filterValues, quotation_code: t})} placeholder="Nhập mã phiếu..." />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Khách hàng</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.customer_name} onChangeText={(t) => setFilterValues({...filterValues, customer_name: t})} placeholder="Nhập tên khách hàng..." />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Mã phiếu tiếp nhận</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.receiving_code} onChangeText={(t) => setFilterValues({...filterValues, receiving_code: t})} placeholder="Nhập mã phiếu tiếp nhận..." />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Ghi chú</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.notes} onChangeText={(t) => setFilterValues({...filterValues, notes: t})} placeholder="Nhập nội dung ghi chú..." />
                    </View>
                </ScrollView>

                <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                    <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text className="font-bold">Đặt lại</Text></TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                </View>
             </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}