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

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../../components/Icons';

// API
import warehouseApi from '../../../api/warehouseApi';

export default function WarehouseScreen() {
  // --- STATE ---
  const [searchText, setSearchText] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Filter Modal
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
    ma: '',
    ten: '',
    address: ''
  });

  // --- EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWarehouses(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---
  const fetchWarehouses = async (pageNumber = 1, isRefresh = false) => {
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

      const response = await warehouseApi.getList(params);
      const result = response.data;

      if (result.success) {
        if (isRefresh || pageNumber === 1) {
          setWarehouses(result.data);
        } else {
          setWarehouses(prev => [...prev, ...result.data]);
        }
        setPage(result.pagination.current_page);
        setLastPage(result.pagination.last_page);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách kho:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa kho "${name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await warehouseApi.delete(id);
              if (res.data.success) {
                Alert.alert("Thành công", "Đã xóa kho");
                fetchWarehouses(1, true);
              }
            } catch (error) {
              const msg = error.response?.data?.message || "Không thể xóa kho";
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
    fetchWarehouses(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
      setIsLoadingMore(true);
      fetchWarehouses(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchWarehouses(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', ten: '', address: '' });
    setFilterModalVisible(false);
    fetchWarehouses(1, true);
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  const handleEdit = (item) => {
    Alert.alert("Chỉnh sửa", `Mở trang chỉnh sửa kho: ${item.name}`);
    // navigation.navigate('EditWarehouse', { id: item.id });
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
      <TouchableOpacity
        className="w-32 px-4 flex-row items-center border-r border-gray-200"
        onPress={() => handleSort('code')}
      >
        <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã Kho</Text>
        <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} />
      </TouchableOpacity>

      <TouchableOpacity
        className="w-60 px-4 flex-row items-center border-r border-gray-200"
        onPress={() => handleSort('name')}
      >
        <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên Kho</Text>
        <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} />
      </TouchableOpacity>

      <View className="w-60 px-4 flex-row items-center border-r border-gray-200">
        <Text className="text-xs font-bold text-gray-700">Địa chỉ</Text>
      </View>

      <View className="w-16 px-2 flex-row items-center justify-center">
        <Text className="text-xs font-bold text-gray-700">Xóa</Text>
      </View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleEdit(item)}
      className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50"
    >
      <View className="w-32 px-4">
        <Text className="text-sm text-gray-800">{item.code}</Text>
      </View>
      <View className="w-60 px-4">
        <Text className="text-sm font-medium text-purple-700">{item.name}</Text>
      </View>
      <View className="w-60 px-4">
        <Text className="text-sm text-gray-600" numberOfLines={1}>{item.address}</Text>
      </View>
      <View className="w-16 px-2 items-center justify-center">
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          className="p-2 bg-gray-100 rounded-full"
        >
          <TrashIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">

      <Header
        defaultActiveMenu="SETUP"
        activeSubMenu="Kho"
        onSubMenuPress={handleSubMenuPress}
      />

      <ActionToolbar
        searchText={searchText}
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo mới kho")}
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
                  data={warehouses}
                  renderItem={renderTableRow}
                  keyExtractor={item => item.id.toString()}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  onEndReached={onLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4" /> : null}
                  ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có kho nào</Text></View>}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
          <View className="bg-white rounded-t-xl p-4 h-3/4 w-full">
            <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
              <Text className="text-lg font-bold text-gray-800">Bộ lọc Kho</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Mã Kho</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({ ...filterValues, ma: val })} placeholder="Nhập mã kho..." />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Tên Kho</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ten} onChangeText={(val) => setFilterValues({ ...filterValues, ten: val })} placeholder="Nhập tên kho..." />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Địa chỉ</Text>
                <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.address} onChangeText={(val) => setFilterValues({ ...filterValues, address: val })} placeholder="Nhập địa chỉ..." />
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