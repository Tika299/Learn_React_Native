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

// API (Import đúng đường dẫn bạn yêu cầu)
import returnFormApi from '../../api/returnFormApi';

// --- HELPER ---
const getStatusInfo = (status) => {
  // Theo Controller: 1: Hoàn thành, 2: Không đồng ý
  switch (parseInt(status)) {
    case 1: return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' };
    case 2: return { text: 'Khách không đồng ý', color: 'text-red-600', bg: 'bg-red-100' };
    default: return { text: 'Mới tạo', color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

// Helper: Format ngày
const formatDate = (dateString) => {
  if (!dateString) return '--/--/----';
  // Xử lý nếu dateString dạng 'YYYY-MM-DD HH:mm:ss' hoặc 'YYYY-MM-DD'
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default function ReturnFormScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [returnForms, setReturnForms] = useState([]);
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
    ma: '',           // Mã phiếu trả
    recei_code: '',   // Mã phiếu tiếp nhận
    customer_name: '',// Tên khách hàng
    note: ''
  });

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReturnForms(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // --- API FUNCTIONS ---

  const fetchReturnForms = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
      const params = {
        // limit: 20, // Nếu API này không hỗ trợ phân trang thì bỏ tham số này cũng được
        search: searchText,
        ...filterValues
      };

      const response = await returnFormApi.getList(params);
      const result = response.data;

      if (result.success) {
        // --- SỬA LỖI TẠI ĐÂY ---
        // Kiểm tra: Nếu result.data là mảng (Array) thì lấy luôn, 
        // nếu là Object phân trang (có key .data) thì lấy .data.data

        let dataList = [];
        let total = 0;

        if (Array.isArray(result.data)) {
          // Trường hợp 1: API trả về mảng trực tiếp (như JSON bạn gửi)
          dataList = result.data;
          total = dataList.length;
        } else if (result.data && result.data.data) {
          // Trường hợp 2: API trả về Pagination (Laravel default paginate)
          dataList = result.data.data;
          total = result.data.total;
          setPage(result.data.current_page);
          setLastPage(result.data.last_page);
        }

        if (isRefresh || pageNumber === 1) {
          setReturnForms(dataList);
        } else {
          setReturnForms(prev => [...prev, ...dataList]);
        }

        setTotalRecords(total);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách phiếu trả:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu trả hàng ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await returnFormApi.delete(id);
              if (res.data.status || res.data.success) {
                Alert.alert("Thành công", "Đã xóa phiếu trả hàng");
                fetchReturnForms(1, true);
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
    fetchReturnForms(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
      setIsLoadingMore(true);
      fetchReturnForms(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchReturnForms(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', recei_code: '', customer_name: '', note: '' });
    setFilterModalVisible(false);
    fetchReturnForms(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
      <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Mã phiếu</Text></View>
      <View className="w-40 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Khách hàng</Text></View>
      <View className="w-28 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ngày lập</Text></View>
      <View className="w-32 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Phiếu tiếp nhận</Text></View>
      <View className="w-32 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Tình trạng</Text></View>
      <View className="w-48 px-4 border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Ghi chú</Text></View>
      <View className="w-16 px-2 flex-row justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);

    // Xử lý loại phiếu (Form Type) lấy từ root hoặc relation
    // JSON có trường 'form_type' ở ngoài cùng (giá trị 1, 2)
    const formTypeText = item.form_type == 1 ? 'Bảo hành' : (item.form_type == 2 ? 'Dịch vụ' : 'Khác');

    return (
      <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu */}
        <View className="w-28 px-4">
          <Text className="text-sm font-medium text-purple-700">{item.return_code}</Text>
        </View>

        {/* Khách hàng: Ưu tiên customername có sẵn ở ngoài */}
        <View className="w-40 px-4">
          <Text className="text-sm text-gray-800" numberOfLines={1}>
            {item.customername || item.customer?.customer_name || '---'}
          </Text>
        </View>

        {/* Ngày lập */}
        <View className="w-28 px-4">
          <Text className="text-sm text-gray-600">{formatDate(item.date_created)}</Text>
        </View>

        {/* Phiếu tiếp nhận: Ưu tiên form_code_receiving có sẵn ở ngoài */}
        <View className="w-32 px-4">
          <Text className="text-sm font-medium text-blue-600">
            {item.form_code_receiving || item.reception?.form_code_receiving || '---'}
          </Text>
        </View>

        {/* Tình trạng (Status) */}
        <View className="w-32 px-4">
          <View className={`px-2 py-1 rounded-md self-start ${statusInfo.bg}`}>
            <Text className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Loại phiếu */}
        <View className="w-24 px-4">
          <Text className="text-sm text-gray-600">{formTypeText}</Text>
        </View>

        {/* Ghi chú */}
        <View className="w-48 px-4">
          <Text className="text-sm text-gray-600" numberOfLines={1}>{item.notes}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.return_code)}
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

      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu trả hàng" onSubMenuPress={handleSubMenuPress} />

      <ActionToolbar
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu trả hàng mới")}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
            <View>
              {renderTableHeader()}

              {loading && page === 1 ? (
                <View className="p-10 w-screen items-center"><ActivityIndicator size="large" color="#2563EB" /></View>
              ) : (
                <FlatList
                  data={returnForms}
                  renderItem={renderTableRow}
                  keyExtractor={item => item.id.toString()}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  onEndReached={onLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4" /> : null}
                  ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu trả hàng nào</Text></View>}
                />
              )}

              <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                <Text className="text-purple-700 text-sm">Tổng số phiếu: <Text className="font-bold">{totalRecords || returnForms.length}</Text></Text>
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
              <Text className="text-lg font-bold text-gray-800">Bộ lọc Phiếu trả hàng</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
            </View>

            <ScrollView>
              <View className="mb-4"><Text className="text-gray-700 mb-1">Mã phiếu</Text>
                <TextInput className="border border-gray-300 rounded p-2" value={filterValues.ma} onChangeText={(t) => setFilterValues({ ...filterValues, ma: t })} placeholder="Nhập mã phiếu..." />
              </View>
              <View className="mb-4"><Text className="text-gray-700 mb-1">Mã tiếp nhận</Text>
                <TextInput className="border border-gray-300 rounded p-2" value={filterValues.recei_code} onChangeText={(t) => setFilterValues({ ...filterValues, recei_code: t })} placeholder="Nhập mã phiếu tiếp nhận..." />
              </View>
              <View className="mb-4"><Text className="text-gray-700 mb-1">Khách hàng</Text>
                <TextInput className="border border-gray-300 rounded p-2" value={filterValues.customer_name} onChangeText={(t) => setFilterValues({ ...filterValues, customer_name: t })} placeholder="Nhập tên khách hàng..." />
              </View>
              <View className="mb-4"><Text className="text-gray-700 mb-1">Ghi chú</Text>
                <TextInput className="border border-gray-300 rounded p-2" value={filterValues.note} onChangeText={(t) => setFilterValues({ ...filterValues, note: t })} placeholder="Nhập ghi chú..." />
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