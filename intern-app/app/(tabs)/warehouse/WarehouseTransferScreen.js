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
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../../components/Icons';

// API
import transferApi from '../../../api/transferApi';

// Helper: Format ngày
const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Helper: Map trạng thái
const getStatusInfo = (status) => {
    // Giả sử: 1 = Hoàn thành, 0 = Đang chuyển/Hủy
    switch (parseInt(status)) {
        case 1: return { text: 'Hoàn thành', color: 'text-green-600' };
        case 0: return { text: 'Đang chuyển', color: 'text-orange-500' };
        default: return { text: 'Mới tạo', color: 'text-gray-600' };
    }
};

export default function WarehouseTransferScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter Modal
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
      code: '',
      status: '', // 1 or 0
      from_date: '',
      to_date: ''
  });

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchTransfers(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // --- API FUNCTIONS ---

  const fetchTransfers = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            // Controller dùng paginate(10) mặc định, nếu muốn đổi thì gửi thêm param 'limit' (cần sửa controller để nhận)
            code: searchText || filterValues.code, 
            status: filterValues.status,
            from_date: filterValues.from_date,
            to_date: filterValues.to_date
        };

        const response = await transferApi.getList(params);
        const result = response.data;

        if (result.success) {
            // Controller trả về: { success: true, data: { current_page, data: [], ... } }
            const paginationData = result.data; 
            const dataList = paginationData.data || [];

            if (isRefresh || pageNumber === 1) {
                setTransfers(dataList);
            } else {
                setTransfers(prev => [...prev, ...dataList]);
            }
            
            setPage(paginationData.current_page || 1);
            setLastPage(paginationData.last_page || 1);
            setTotalRecords(paginationData.total || 0);
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách chuyển kho:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu chuyển ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
                try {
                    const res = await transferApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa phiếu chuyển kho");
                        fetchTransfers(1, true);
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
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransfers(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchTransfers(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchTransfers(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ code: '', status: '', from_date: '', to_date: '' });
    setFilterModalVisible(false);
    fetchTransfers(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Mã phiếu</Text></View>
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ngày lập</Text></View>
        <View className="w-32 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Kho xuất</Text></View>
        <View className="w-32 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Kho nhận</Text></View>
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Trạng thái</Text></View>
        <View className="w-48 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ghi chú</Text></View>
        <View className="w-16 px-2 flex-row justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => {
      const statusInfo = getStatusInfo(item.status);
      
      return (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            {/* Mã phiếu */}
            <View className="w-28 px-4">
                <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
            </View>
            
            {/* Ngày lập */}
            <View className="w-28 px-4">
                <Text className="text-sm text-gray-600">{formatDate(item.transfer_date)}</Text>
            </View>
            
            {/* Kho xuất (Cần backend join bảng warehouses) */}
            <View className="w-32 px-4">
                <Text className="text-sm text-gray-600">
                    {item.from_warehouse?.warehouse_name || item.from_warehouse_id}
                </Text>
            </View>

            {/* Kho nhận */}
            <View className="w-32 px-4">
                <Text className="text-sm text-gray-600">
                    {item.to_warehouse?.warehouse_name || item.to_warehouse_id}
                </Text>
            </View>

            {/* Trạng thái */}
            <View className="w-28 px-4">
                <Text className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</Text>
            </View>

            {/* Ghi chú */}
            <View className="w-48 px-4">
                <Text className="text-sm text-gray-600" numberOfLines={2}>{item.note}</Text>
            </View>

            {/* Nút Xóa */}
            <View className="w-16 px-2 items-center justify-center">
                <TouchableOpacity 
                    onPress={() => handleDelete(item.id, item.code)}
                    className="p-2 bg-gray-100 rounded-full"
                >
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </View>
      );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu chuyển kho" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu chuyển kho mới")}
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
                            data={transfers}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu chuyển kho nào</Text></View>}
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
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Chuyển kho</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Mã phiếu</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.code} onChangeText={(t) => setFilterValues({...filterValues, code: t})} placeholder="Nhập mã phiếu..." />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Trạng thái (1: Hoàn thành, 0: Đang chuyển)</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.status} onChangeText={(t) => setFilterValues({...filterValues, status: t})} placeholder="Nhập 1 hoặc 0..." keyboardType="numeric" />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Từ ngày</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.from_date} onChangeText={(t) => setFilterValues({...filterValues, from_date: t})} placeholder="YYYY-MM-DD" />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Đến ngày</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.to_date} onChangeText={(t) => setFilterValues({...filterValues, to_date: t})} placeholder="YYYY-MM-DD" />
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