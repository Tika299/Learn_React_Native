import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, FlatList, Alert,
  TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, Pressable
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path } from 'react-native-svg';

// COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

// API
import importApi from '../../api/importApi';

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

  // --- STATE DROPDOWN ---
  const [providers, setProviders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // --- STATE FORM (Add/Edit) ---
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    import_code: '',
    provider_id: null,
    warehouse_id: null,
    date_create: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    note: '',
    products: [] // Mảng chứa { product_id, quantity }
  });

  // Filter Modal
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // Filter Values (Tương ứng với API backend yêu cầu)

  // --- STATE FILTER ---
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
    ma: '',
    provider_id: null, // Đổi từ ncc -> provider_id
    warehouse_id: null // Đổi từ kho -> warehouse_id
  });

  // --- EFFECT ---

  useEffect(() => { fetchDropdowns(); }, []);

  // Gọi API khi thay đổi search, sort, filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImports(1, true);
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchDropdowns = async () => {
    try {
      // Cần đảm bảo backend có các route này hoặc dùng api list tương ứng
      // Ở đây giả định bạn đã có
      const [pRes, wRes, prodRes] = await Promise.all([
        importApi.getProviders(),
        importApi.getWarehouses(),
        importApi.getProducts()
      ]);
      if (pRes.data.success || pRes.data.data) setProviders(pRes.data.data);
      if (wRes.data.success || wRes.data.data) setWarehouses(wRes.data.data);
      if (prodRes.data.success || prodRes.data.data) setProducts(prodRes.data.data);
    } catch (e) { console.log("Lỗi dropdown:", e); }
  };

  const fetchImports = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
      // Params gửi đi sẽ bao gồm: page, limit, search, ma, provider_id, warehouse_id
      const params = {
        page: pageNumber,
        limit: 20,
        search: searchText,
        ...filterValues
      };

      console.log("Params Filter:", params); // Log kiểm tra xem có provider_id chưa

      const res = await importApi.getList(params);
      if (res.data.success) {
        const data = res.data.data || [];
        setImports(isRefresh ? data : [...imports, ...data]);
        setPage(res.data.pagination.current_page);
        setLastPage(res.data.pagination.last_page);
        setTotalRecords(res.data.pagination.total);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // --- HANDLERS FORM ---
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      import_code: `PN${Math.floor(Math.random() * 10000)}`, // Sinh mã tự động demo
      provider_id: null, warehouse_id: null,
      date_create: new Date().toISOString().split('T')[0],
      note: '', products: []
    });
    setFormVisible(true);
  };

  const openEditModal = async (item) => {
    setIsEditing(true);
    setEditId(item.id);

    try {
      // Gọi API chi tiết
      const res = await importApi.getDetail(item.id);

      if (res.data.success) {
        const d = res.data.data;

        // Map dữ liệu từ Backend vào Form
        setFormData({
          import_code: d.import_code,
          provider_id: d.provider_id,
          warehouse_id: d.warehouse_id,
          // Cắt chuỗi ngày giờ nếu có (VD: 2025-12-20 10:00:00 -> 2025-12-20)
          date_create: d.date_create ? d.date_create.split(' ')[0] : '',
          note: d.note || '',

          // QUAN TRỌNG: Map danh sách sản phẩm con
          // Backend trả về 'product_imports' (tên bảng/quan hệ)
          // Frontend cần 'products' với cấu trúc { product_id, quantity }
          products: d.product_imports ? d.product_imports.map(p => ({
            product_id: p.product_id,
            quantity: p.quantity,
            // Lưu thêm tên để hiển thị (nếu backend có trả về relation product)
            product_name: p.product ? p.product.product_name : 'Sản phẩm'
          })) : []
        });

        setFormVisible(true);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy dữ liệu phiếu nhập");
      }
    } catch (e) {
      console.error("Lỗi getDetail:", e);
      Alert.alert("Lỗi", "Không lấy được chi tiết phiếu nhập");
    }
  };

  const handleAddProductRow = () => {
    // Thêm 1 dòng sản phẩm rỗng vào mảng
    setFormData({
      ...formData,
      products: [...formData.products, { product_id: null, quantity: 1 }]
    });
  };

  const handleUpdateProductRow = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const handleRemoveProductRow = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData({ ...formData, products: newProducts });
  };

  const handleSave = async () => {
    if (!formData.provider_id || !formData.warehouse_id || formData.products.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn NCC, Kho và ít nhất 1 sản phẩm.");
      return;
    }
    try {
      let res;
      if (isEditing) res = await importApi.update(editId, formData);
      else res = await importApi.create(formData);

      if (res.data.success) {
        Alert.alert("Thành công");
        setFormVisible(false);
        fetchImports(1, true);
      } else {
        Alert.alert("Lỗi", JSON.stringify(res.data.message));
      }
    } catch (e) { Alert.alert("Lỗi", "Lỗi hệ thống"); }
  };

  // --- HANDLE EXCEL IMPORT ---
  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const data = new FormData();
      data.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const res = await importApi.uploadExcel(data);
      if (res.data.success) {
        Alert.alert("Thành công", res.data.message);
        fetchImports(1, true);
      } else {
        Alert.alert("Lỗi", res.data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể upload file");
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

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center">
      <View className="w-28 px-4"><Text className="text-sm font-bold text-purple-700">{item.import_code}</Text></View>
      <View className="w-28 px-4"><Text className="text-sm text-gray-800">{item.date_create ? item.date_create.split(' ')[0] : ''}</Text></View>
      <View className="w-40 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.provider?.provider_name}</Text></View>
      <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.warehouse?.warehouse_name}</Text></View>
      <View className="w-16 px-2 items-center">
        <TouchableOpacity onPress={() => handleDelete(item.id, item.import_code)} className="p-2 bg-gray-100 rounded-full">
          <TrashIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu nhập hàng" />
      <ActionToolbar
        searchText={searchText} setSearchText={setSearchText}
        onCreatePress={openAddModal}
        onFilterPress={() => {
          setFilterModalVisible(true);
        }}
        onImportPress={handleImportExcel} // Nút Nhập Excel
      />

      <View className="flex-1 bg-white px-3 py-2">
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <View>
            <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
              <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
              <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
              <View className="w-40 px-4"><Text className="font-bold text-gray-700">Nhà cung cấp</Text></View>
              <View className="w-32 px-4"><Text className="font-bold text-gray-700">Kho</Text></View>
              <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
            </View>
            {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
              <FlatList
                data={imports} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchImports(1, true)} />}
                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có dữ liệu</Text></View>}
              />}
            <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
          </View>
        </ScrollView>
      </View>

      {/* MODAL FORM (THÊM / SỬA) */}
      <Modal animationType="slide" transparent={true} visible={formVisible} onRequestClose={() => setFormVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-xl p-5 h-[90%]">
            <View className="flex-row justify-between mb-4 border-b pb-2">
              <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa phiếu nhập' : 'Tạo phiếu nhập'}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* THÔNG TIN CHUNG */}
              <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>
              <View className="flex-row justify-between mb-3">
                <View className="w-[48%]"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded bg-gray-100" value={formData.import_code} editable={!isEditing} /></View>
                <View className="w-[48%]"><Text className="mb-1">Ngày lập</Text><TextInput className="border p-2 rounded" value={formData.date_create} onChangeText={t => setFormData({ ...formData, date_create: t })} placeholder="YYYY-MM-DD" /></View>
              </View>

              <View className="mb-3"><Text className="mb-1">Nhà cung cấp</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {providers.map(p => (
                    <TouchableOpacity key={p.id} className={`mr-2 px-3 py-2 border rounded ${formData.provider_id === p.id ? 'bg-blue-100 border-blue-500' : ''}`} onPress={() => setFormData({ ...formData, provider_id: p.id })}><Text>{p.provider_name}</Text></TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-3"><Text className="mb-1">Kho nhập</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {warehouses.map(w => (
                    <TouchableOpacity
                      key={w.id}
                      className={`mr-2 px-3 py-2 border rounded ${formData.warehouse_id === w.id ? 'bg-green-100 border-green-500' : ''}`}
                      onPress={() => setFormData({ ...formData, warehouse_id: w.id })}
                    >
                      {/* SỬA TẠI ĐÂY: w.name thay vì w.warehouse_name */}
                      {/* Logic: Nếu API kho trả về 'name', dùng 'name'. Nếu trả 'warehouse_name', dùng 'warehouse_name' */}
                      <Text>{w.name || w.warehouse_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* DANH SÁCH SẢN PHẨM */}
              <View className="flex-row justify-between items-center mt-4 mb-2">
                <Text className="font-bold text-gray-800">II. Danh sách hàng hóa</Text>
                <TouchableOpacity onPress={handleAddProductRow} className="bg-blue-500 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm hàng</Text></TouchableOpacity>
              </View>

              {formData.products.map((item, index) => (
                <View key={index} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-bold">Sản phẩm #{index + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemoveProductRow(index)}><Text className="text-red-500 text-xs">Xóa</Text></TouchableOpacity>
                  </View>
                  {/* Chọn sản phẩm (Simplified Dropdown) */}
                  <ScrollView horizontal className="mb-2" showsHorizontalScrollIndicator={false}>
                    {products.map(prod => (
                      <TouchableOpacity key={prod.id}
                        className={`mr-2 px-2 py-1 border rounded ${item.product_id === prod.id ? 'bg-purple-100 border-purple-500' : 'bg-white'}`}
                        onPress={() => handleUpdateProductRow(index, 'product_id', prod.id)}
                      >
                        <Text className="text-xs">{prod.product_code} - {prod.product_name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View className="flex-row items-center">
                    <Text className="mr-2">Số lượng:</Text>
                    <TextInput
                      className="border p-1 rounded w-20 bg-white text-center"
                      value={item.quantity.toString()}
                      onChangeText={t => handleUpdateProductRow(index, 'quantity', parseInt(t) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-6" onPress={handleSave}>
                <Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'TẠO PHIẾU'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL FILTER --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterModalVisible(false)}>
          <Pressable
            className="bg-white rounded-t-xl p-4 h-[70%] w-full" // Tăng chiều cao lên xíu
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              Bộ lọc Phiếu nhập
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {/* 1. MÃ PHIẾU */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Mã phiếu</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-3 bg-gray-50"
                  value={filterValues.ma}
                  onChangeText={(val) => setFilterValues({ ...filterValues, ma: val })}
                  placeholder="Nhập mã phiếu..."
                />
              </View>

              {/* 2. NHÀ CUNG CẤP (Chọn ID) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {/* Nút Tất cả */}
                  <TouchableOpacity
                    onPress={() => setFilterValues({ ...filterValues, provider_id: null })}
                    className={`mr-2 px-3 py-2 border rounded-full ${filterValues.provider_id === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <Text className={filterValues.provider_id === null ? 'text-blue-700 font-bold' : 'text-gray-600'}>Tất cả</Text>
                  </TouchableOpacity>

                  {/* Danh sách NCC */}
                  {providers.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setFilterValues({ ...filterValues, provider_id: p.id })}
                      className={`mr-2 px-3 py-2 border rounded-full ${filterValues.provider_id === p.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                    >
                      <Text className={filterValues.provider_id === p.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>
                        {p.provider_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 3. KHO (Chọn ID) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Kho nhập</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setFilterValues({ ...filterValues, warehouse_id: null })}
                    className={`mr-2 px-3 py-2 border rounded-full ${filterValues.warehouse_id === null ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <Text className={filterValues.warehouse_id === null ? 'text-green-700 font-bold' : 'text-gray-600'}>Tất cả</Text>
                  </TouchableOpacity>

                  {warehouses.map(w => (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => setFilterValues({ ...filterValues, warehouse_id: w.id })}
                      className={`mr-2 px-3 py-2 border rounded-full ${filterValues.warehouse_id === w.id ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}`}
                    >
                      <Text className={filterValues.warehouse_id === w.id ? 'text-green-700 font-bold' : 'text-gray-600'}>
                        {w.name || w.warehouse_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

            </ScrollView>

            <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center"
                onPress={() => {
                  // Reset filter
                  setFilterValues({ ma: '', provider_id: null, warehouse_id: null });
                  setFilterModalVisible(false);
                  fetchImports(1, true);
                }}
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

          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}