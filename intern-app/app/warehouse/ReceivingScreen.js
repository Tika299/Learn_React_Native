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
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import receivingApi from '../../api/receivingApi';

// --- HELPER: MAP STATUS & TYPE (Giống PHP Backend) ---
const getFormTypeText = (type) => {
    switch (parseInt(type)) {
        case 1: return { text: 'Bảo hành', color: 'text-gray-600' };
        case 2: return { text: 'Dịch vụ', color: 'text-green-600' };
        case 3: return { text: 'BH Dịch vụ', color: 'text-yellow-600' };
        default: return { text: 'Khác', color: 'text-gray-500' };
    }
};

const getStatusText = (status) => {
    switch (parseInt(status)) {
        case 1: return { text: 'Tiếp nhận', color: 'text-gray-600', bg: 'bg-gray-100' };
        case 2: return { text: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-100' };
        case 3: return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' };
        case 4: return { text: 'Khách từ chối', color: 'text-red-600', bg: 'bg-red-100' };
        default: return { text: '---', color: 'text-gray-500', bg: 'bg-gray-50' };
    }
};

const getStateText = (state) => {
    switch (parseInt(state)) {
        case 1: return { text: 'Chưa xử lý', color: 'text-yellow-600' };
        case 2: return { text: 'Quá hạn', color: 'text-red-600' };
        default: return { text: 'Bình thường', color: 'text-gray-600' };
    }
};

export default function ReceivingScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [receivings, setReceivings] = useState([]);
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
      ma: '',       // Mã phiếu
      note: '',     // Ghi chú
      customer: [], // Khách hàng (Nếu cần dropdown)
      status: []    // Trạng thái
  });

  // Action Modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchReceivings(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]); // Add dependencies if sort implemented

  // --- API FUNCTIONS ---

  const fetchReceivings = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            limit: 20,
            search: searchText,
            ...filterValues
        };

        const response = await receivingApi.getList(params);
        const result = response.data;

        if (result.status === 'success' || result.success) {
            // Data API trả về có thể nằm trong result.data.data (Pagination object) hoặc result.data (Array)
            // Cần linh hoạt dựa trên output thực tế của Controller
            const dataList = result.data.data ? result.data.data : result.data; 
            const pagination = result.data;

            if (isRefresh || pageNumber === 1) {
                setReceivings(dataList);
            } else {
                setReceivings(prev => [...prev, ...dataList]);
            }
            
            // Cập nhật phân trang
            if (pagination.current_page) {
                setPage(pagination.current_page);
                setLastPage(pagination.last_page);
                setTotalRecords(pagination.total);
            }
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: async () => {
                try {
                    const res = await receivingApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa phiếu tiếp nhận");
                        fetchReceivings(1, true);
                    } else {
                        Alert.alert("Lỗi", res.data.msg || res.data.message || "Không thể xóa");
                    }
                } catch (error) {
                    Alert.alert("Lỗi", "Đã có lỗi xảy ra khi xóa");
                }
            }
        }
      ]
    );
  };

  const handleChangeStatus = async (statusId) => {
      if (!selectedItem) return;
      try {
          const data = {
              recei: selectedItem.id,
              status: statusId
          };
          const res = await receivingApi.updateStatus(data);
          if (res.data.status === 'success') {
              Alert.alert("Thành công", "Cập nhật trạng thái thành công");
              setActionModalVisible(false);
              fetchReceivings(1, true); // Refresh list
          }
      } catch (error) {
          Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
      }
  };

  // --- HANDLERS ---
  const onRefresh = () => {
    setRefreshing(true);
    fetchReceivings(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchReceivings(page + 1, false);
    }
  };

  const openActionModal = (item) => {
      setSelectedItem(item);
      setActionModalVisible(true);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Mã phiếu</Text></View>
        <View className="w-40 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Khách hàng</Text></View>
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ngày lập</Text></View>
        <View className="w-24 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Loại phiếu</Text></View>
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Tình trạng</Text></View>
        <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Trạng thái</Text></View>
        <View className="w-40 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ghi chú</Text></View>
        <View className="w-16 px-2 flex-row justify-center"><Text className="text-xs font-bold text-gray-700"></Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => {
      // Mapping dữ liệu từ API
      // Backend: form_code_receiving, customername, date_created, form_type, status, state, notes
      const formType = getFormTypeText(item.form_type);
      const statusInfo = getStatusText(item.status);
      const stateInfo = getStateText(item.state);

      return (
        <TouchableOpacity 
            onPress={() => openActionModal(item)}
            className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50"
        >
            {/* Mã phiếu */}
            <View className="w-28 px-4">
                <Text className="text-sm font-medium text-purple-700">{item.form_code_receiving}</Text>
            </View>
            
            {/* Khách hàng (Lấy customername nếu join, hoặc customer.customer_name nếu relation) */}
            <View className="w-40 px-4">
                <Text className="text-sm text-gray-800" numberOfLines={1}>
                    {item.customername || item.customer?.customer_name}
                </Text>
            </View>
            
            {/* Ngày lập */}
            <View className="w-28 px-4">
                <Text className="text-sm text-gray-600">
                    {item.date_created?.split(' ')[0] || item.date_created}
                </Text>
            </View>

            {/* Loại phiếu */}
            <View className="w-24 px-4">
                <Text className={`text-sm font-medium ${formType.color}`}>{formType.text}</Text>
            </View>

            {/* Tình trạng (Status: Tiếp nhận, Hoàn thành...) */}
            <View className="w-28 px-4">
                <View className={`px-2 py-1 rounded-md self-start ${statusInfo.bg}`}>
                    <Text className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</Text>
                </View>
            </View>

            {/* Trạng thái (State: Quá hạn, Bình thường...) */}
            <View className="w-28 px-4">
                <Text className={`text-sm ${stateInfo.color}`}>{stateInfo.text}</Text>
            </View>

            {/* Ghi chú */}
            <View className="w-40 px-4">
                <Text className="text-sm text-gray-600" numberOfLines={1}>{item.notes}</Text>
            </View>

            {/* Nút Xóa */}
            <View className="w-16 px-2 items-center justify-center">
                <TouchableOpacity 
                    onPress={() => handleDelete(item.id, item.form_code_receiving)}
                    className="p-2 bg-gray-100 rounded-full"
                >
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu tiếp nhận" />

      <ActionToolbar 
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu tiếp nhận mới")}
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
                            data={receivings}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu nào</Text></View>}
                        />
                    )}
                    
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">Tổng số: <Text className="font-bold">{totalRecords || receivings.length}</Text></Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL TÁC VỤ --- */}
      <Modal animationType="fade" transparent={true} visible={actionModalVisible} onRequestClose={() => setActionModalVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center p-4" onPress={() => setActionModalVisible(false)}>
            <View className="bg-white w-full max-w-sm rounded-lg shadow-lg p-4" onStartShouldSetResponder={() => true}>
                <View className="mb-4 border-b border-gray-200 pb-2">
                    <Text className="text-lg font-bold text-gray-800">Tác vụ: {selectedItem?.form_code_receiving}</Text>
                </View>
                
                {/* Chuyển nhanh trạng thái */}
                <Text className="text-gray-500 text-sm mb-2 font-medium">Chuyển trạng thái:</Text>
                <View className="flex-row flex-wrap justify-between mb-4">
                    <TouchableOpacity onPress={() => handleChangeStatus(2)} className="bg-blue-100 p-2 rounded mb-2 w-[48%] items-center"><Text className="text-blue-700 font-bold">Đang xử lý</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleChangeStatus(3)} className="bg-green-100 p-2 rounded mb-2 w-[48%] items-center"><Text className="text-green-700 font-bold">Hoàn thành</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleChangeStatus(4)} className="bg-red-100 p-2 rounded mb-2 w-[48%] items-center"><Text className="text-red-700 font-bold">Từ chối</Text></TouchableOpacity>
                </View>

                <TouchableOpacity className="py-3 border-t border-gray-100" onPress={() => Alert.alert("Thông báo", "Chức năng Tạo phiếu trả")}>
                    <Text className="text-base text-blue-600 text-center">Tạo phiếu trả hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity className="py-3 border-t border-gray-100" onPress={() => Alert.alert("Thông báo", "Chức năng Tạo báo giá")}>
                    <Text className="text-base text-green-600 text-center">Tạo phiếu báo giá</Text>
                </TouchableOpacity>

                <TouchableOpacity className="mt-4 bg-gray-200 p-3 rounded-lg" onPress={() => setActionModalVisible(false)}>
                    <Text className="text-center font-bold text-gray-700">Đóng</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
      </Modal>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
             <View className="bg-white rounded-t-xl p-4 h-2/3 w-full">
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Phiếu tiếp nhận</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>
                <ScrollView>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Mã phiếu</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.ma} onChangeText={(t) => setFilterValues({...filterValues, ma: t})} placeholder="Nhập mã..." />
                    </View>
                    <View className="mb-4"><Text className="text-gray-700 mb-1">Ghi chú</Text>
                        <TextInput className="border border-gray-300 rounded p-2" value={filterValues.note} onChangeText={(t) => setFilterValues({...filterValues, note: t})} placeholder="Nhập ghi chú..." />
                    </View>
                </ScrollView>
                <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                    <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={() => { setFilterValues({ma:'', note:'', customer:[], status:[]}); setFilterModalVisible(false); fetchReceivings(1, true); }}><Text className="font-bold">Đặt lại</Text></TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={() => { setFilterModalVisible(false); fetchReceivings(1, true); }}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                </View>
             </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}