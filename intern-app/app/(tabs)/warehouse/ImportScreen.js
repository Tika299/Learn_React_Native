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
import importApi from '../../../api/importApi';

export default function ImportScreen() {
  // --- STATE DỮ LIỆU ---
  const [searchText, setSearchText] = useState('');
  const [imports, setImports] = useState([]);
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
  // Filter Values (Tương ứng với API backend yêu cầu)
  const [filterValues, setFilterValues] = useState({
    ma: '',       // Mã phiếu
    ngay_lap: '', // Ngày lập
    ncc: '',      // Tên nhà cung cấp
    kho: '',      // Tên kho
    nguoi_lap: '',// Người lập
    ghi_chu: ''   // Ghi chú
  });

  // --- EFFECT ---

  // Gọi API khi thay đổi search, sort, filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImports(1, true);
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchImports = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
      const params = {
        page: pageNumber,
        // limit: 20, // Controller bạn dùng 'limit', còn mặc định Laravel là 'per_page'
        per_page: 20,
        search: searchText,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...filterValues
      };

      const response = await importApi.getImportList(params);
      const result = response.data;

      // Log ra xem cấu trúc thực tế để debug
      console.log("API Response:", JSON.stringify(result, null, 2));

      if (result.success) {
        // --- SỬA LỖI Ở ĐÂY ---
        // Controller trả về: 'data' => $imports (là object phân trang)
        // Nên mảng thật sự nằm ở: result.data.data
        const dataArray = result.data.data || [];
        const pagination = result.data; // Chứa current_page, last_page...

        if (isRefresh || pageNumber === 1) {
          setImports(dataArray);
        } else {
          setImports(prev => [...prev, ...dataArray]);
        }

        // Cập nhật thông tin phân trang từ object pagination
        setPage(pagination.current_page || 1);
        setLastPage(pagination.last_page || 1);
        setTotalRecords(pagination.total || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách phiếu nhập:", error);
      Alert.alert("Lỗi", "Không tải được dữ liệu từ server");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu nhập ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await importApi.deleteImport(id);
              if (res.data.success) {
                Alert.alert("Thành công", "Đã xóa phiếu nhập");
                fetchImports(1, true); // Refresh list
              }
            } catch (error) {
              const msg = error.response?.data?.message || "Không thể xóa phiếu nhập";
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
    fetchImports(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
      setIsLoadingMore(true);
      fetchImports(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchImports(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', ngay_lap: '', ncc: '', kho: '', nguoi_lap: '', ghi_chu: '' });
    setFilterModalVisible(false);
    fetchImports(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
      <TouchableOpacity
        className="w-28 px-4 flex-row items-center border-r border-gray-200"
        onPress={() => handleSort('code')}
      >
        <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã phiếu</Text>
        <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-28 px-4 flex-row items-center border-r border-gray-200"
        onPress={() => handleSort('date')}
      >
        <Text className={`text-xs font-bold mr-1 ${sortBy === 'date' ? 'text-blue-600' : 'text-gray-700'}`}>Ngày lập</Text>
        <SortIcon color={sortBy === 'date' ? '#2563EB' : '#9CA3AF'} />
      </TouchableOpacity>

      <View className="w-48 px-4 flex-row items-center border-r border-gray-200">
        <Text className="text-xs font-bold text-gray-700">Nhà cung cấp</Text>
      </View>
      <View className="w-32 px-4 flex-row items-center border-r border-gray-200">
        <Text className="text-xs font-bold text-gray-700">Kho</Text>
      </View>
      <View className="w-40 px-4 flex-row items-center border-r border-gray-200">
        <Text className="text-xs font-bold text-gray-700">Người lập</Text>
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
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
      {/* Mã phiếu */}
      <View className="w-28 px-4">
        <Text className="text-sm font-medium text-purple-700">
          {item.import_code || item.code}
        </Text>
      </View>

      {/* Ngày lập: Xử lý định dạng ngày nếu cần */}
      <View className="w-28 px-4">
        <Text className="text-sm text-gray-800">
          {/* Nếu backend trả về date_create dạng YYYY-MM-DD */}
          {item.date_create || item.created_at}
        </Text>
      </View>

      {/* Nhà cung cấp */}
      <View className="w-48 px-4">
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {/* Ưu tiên 1: Nếu trả về object nested (Cách 1) */}
          {item.provider?.provider_name}

          {/* Ưu tiên 2: Nếu trả về chuỗi phẳng (do dùng join) */}
          {item.provider_name}

          {/* Dự phòng */}
          {(!item.provider && !item.provider_name) ? '---' : ''}
        </Text>
      </View>

      {/* Kho */}
      <View className="w-32 px-4">
        <Text className="text-sm text-gray-600">
          {item.warehouse?.warehouse_name || item.warehouse_name || '---'}
        </Text>
      </View>

      {/* Người lập */}
      <View className="w-40 px-4">
        <Text className="text-sm text-gray-600">
          {item.user?.name || item.name || item.user_name || '---'}
        </Text>
      </View>

      {/* Ghi chú */}
      <View className="w-48 px-4">
        <Text className="text-sm text-gray-600" numberOfLines={1}>{item.note}</Text>
      </View>

      {/* Nút Xóa */}
      <View className="w-16 px-2 items-center justify-center">
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.import_code)}
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
        defaultActiveMenu="OPERATIONS"
        activeSubMenu="Phiếu nhập hàng"
        onSubMenuPress={handleSubMenuPress}
      />

      <ActionToolbar
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu nhập mới")}
        onFilterPress={() => setFilterModalVisible(true)}
        onImportPress={() => Alert.alert("Excel", "Nhập từ Excel")}
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
                  data={imports}
                  renderItem={renderTableRow}
                  keyExtractor={item => item.id.toString()}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  onEndReached={onLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4" /> : null}
                  ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có phiếu nhập nào</Text></View>}
                />
              )}

              <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                <Text className="text-purple-700 text-sm">Tổng số phiếu: <Text className="font-bold">{totalRecords || imports.length}</Text></Text>
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
              <Text className="text-lg font-bold text-gray-800">Bộ lọc Phiếu nhập</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Mã phiếu */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Mã phiếu</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({ ...filterValues, ma: val })} placeholder="Nhập mã phiếu..." />
              </View>
              {/* Ngày lập (Dạng text tạm thời, nên dùng DatePicker) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Ngày lập</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ngay_lap} onChangeText={(val) => setFilterValues({ ...filterValues, ngay_lap: val })} placeholder="dd/mm/yyyy" />
              </View>
              {/* Nhà cung cấp */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ncc} onChangeText={(val) => setFilterValues({ ...filterValues, ncc: val })} placeholder="Tên nhà cung cấp..." />
              </View>
              {/* Kho */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Kho</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.kho} onChangeText={(val) => setFilterValues({ ...filterValues, kho: val })} placeholder="Tên kho..." />
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