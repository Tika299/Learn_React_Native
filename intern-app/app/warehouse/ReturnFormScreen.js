import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, FlatList, Alert,
  TouchableOpacity, Modal, TextInput, ActivityIndicator, RefreshControl, Pressable
} from 'react-native';

// COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';
import DropdownSelect from '../../components/DropdownSelect';

// API
import returnFormApi from '../../api/returnFormApi';

// --- HELPER ---
const getStatusInfo = (status) => {
  // 1: Hoàn thành, 2: Khách không đồng ý (Theo Controller)
  switch (parseInt(status)) {
    case 1: return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' };
    case 2: return { text: 'Khách từ chối', color: 'text-red-600', bg: 'bg-red-100' };
    default: return { text: 'Mới tạo', color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

export default function ReturnFormScreen() {
  // --- STATE LIST ---
  const [returnForms, setReturnForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search & Sort
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // --- STATE DROPDOWN ---
  const [customers, setCustomers] = useState([]);
  const [receivings, setReceivings] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [formattedProducts, setFormattedProducts] = useState([]);

  // --- STATE FORM ---
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    return_code: '',
    reception_id: null,
    customer_id: null,
    date_created: new Date().toISOString().split('T')[0],
    return_method: 'Trực tiếp', // Default
    user_id: 1, // Fix cứng hoặc lấy từ Auth
    status: 1,
    address: '',
    contact_person: '',
    phone_number: '',
    notes: '',
    products: []
  });

  // --- STATE FILTER ---
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
    ma: '', customer_id: null, status: []
  });

  // --- EFFECT ---
  useEffect(() => { fetchDropdowns(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchReturnForms(1, true), 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---
  const fetchDropdowns = async () => {
    try {
      const [cRes, rRes, pRes] = await Promise.all([
        returnFormApi.getCustomers(),
        returnFormApi.getReceivings(),
        returnFormApi.getProducts()
      ]);
      if (cRes.data.success || cRes.data.data) setCustomers(cRes.data.data);

      // Xử lý Receivings (Có thể cần format label)
      if (rRes.data.status === 'success') {
        const rData = rRes.data.data.data || rRes.data.data;
        setReceivings(rData);
      }

      if (pRes.data.success || pRes.data.data) {
        const pData = pRes.data.data;
        setProductsList(pData);
        setFormattedProducts(pData.map(p => ({
          ...p, label_display: `${p.product_code} - ${p.product_name}`
        })));
      }
    } catch (e) { console.error("Lỗi dropdown:", e); }
  };

  const fetchReturnForms = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
      const params = {
        // limit: 20,
        search: searchText,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...filterValues
      };
      const res = await returnFormApi.getList(params);
      const result = res.data;

      if (result.success) {
        let dataList = [];
        let total = 0;

        if (Array.isArray(result.data)) {
          dataList = result.data;
          total = dataList.length;
        } else if (result.data && result.data.data) {
          dataList = result.data.data;
          total = result.data.total;
          setPage(result.data.current_page);
          setLastPage(result.data.last_page);
        }

        if (isRefresh || pageNumber === 1) setReturnForms(dataList);
        else setReturnForms(prev => [...prev, ...dataList]);

        setTotalRecords(total);
      }
    } catch (error) { console.error("Lỗi tải danh sách:", error); }
    finally { setLoading(false); setRefreshing(false); setIsLoadingMore(false); }
  };

  // --- CRUD HANDLERS ---
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      return_code: `PTH${Math.floor(Math.random() * 100000)}`,
      reception_id: null, customer_id: null,
      date_created: new Date().toISOString().split('T')[0],
      return_method: 'Trực tiếp', status: 1,
      address: '', contact_person: '', phone_number: '', notes: '',
      products: [{ product_id: null, quantity: 1 }]
    });
    setFormVisible(true);
  };

  const openEditModal = async (item) => {
    setIsEditing(true);
    setEditId(item.id);
    try {
      const res = await returnFormApi.getDetail(item.id);
      if (res.data.success) {
        const d = res.data.data;
        setFormData({
          return_code: d.return_code,
          reception_id: d.reception_id,
          customer_id: d.customer_id,
          date_created: formatDate(d.date_created),
          return_method: d.return_method,
          status: parseInt(d.status),
          address: d.address || '',
          contact_person: d.contact_person || '',
          phone_number: d.phone_number || '',
          notes: d.notes || '',
          user_id: d.user_id,
          // Map product_returns -> products
          products: d.product_returns ? d.product_returns.map(p => ({
            product_id: p.product_id,
            quantity: p.quantity,
            notes: p.notes || ''
          })) : []
        });
        setFormVisible(true);
      }
    } catch (e) { Alert.alert("Lỗi", "Không tải được chi tiết"); }
  };

  const handleSave = async () => {
    if (!formData.customer_id || !formData.reception_id) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn Khách hàng và Phiếu tiếp nhận");
      return;
    }
    if (formData.products.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng thêm ít nhất 1 sản phẩm trả lại");
      return;
    }

    try {
      let res;
      if (isEditing) res = await returnFormApi.update(editId, formData);
      else res = await returnFormApi.create(formData);

      if (res.data.status || res.data.success) {
        Alert.alert("Thành công");
        setFormVisible(false);
        fetchReturnForms(1, true);
      } else {
        Alert.alert("Lỗi", JSON.stringify(res.data.errors || res.data.message));
      }
    } catch (e) { Alert.alert("Lỗi", "Hệ thống gặp sự cố"); }
  };

  const handleDelete = (id, code) => {
    Alert.alert("Xác nhận", `Xóa phiếu ${code}?`, [
      { text: "Hủy" },
      {
        text: "Xóa", style: "destructive", onPress: async () => {
          await returnFormApi.delete(id); fetchReturnForms(1, true);
        }
      }
    ]);
  };

  // --- FORM PRODUCTS LOGIC ---
  const addProductRow = () => {
    setFormData({ ...formData, products: [...formData.products, { product_id: null, quantity: 1 }] });
  };
  const updateProductRow = (index, field, value) => {
    const newP = [...formData.products];
    newP[index][field] = value;
    setFormData({ ...formData, products: newP });
  };
  const removeProductRow = (index) => {
    const newP = [...formData.products];
    newP.splice(index, 1);
    setFormData({ ...formData, products: newP });
  };

  // --- FILTERS ---
  const handleApplyFilter = () => { setFilterVisible(false); fetchReturnForms(1, true); };
  const handleClearFilter = () => { setFilterValues({ ma: '', customer_id: null, status: [] }); setFilterVisible(false); fetchReturnForms(1, true); };

  // --- RENDER TABLE ---
  const renderTableRow = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const formTypeText = item.form_type == 1 ? 'Bảo hành' : (item.form_type == 2 ? 'Dịch vụ' : 'Khác');

    return (
      <TouchableOpacity onPress={() => openEditModal(item)} className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50">
        <View className="w-28 px-4"><Text className="text-sm font-bold text-purple-700">{item.return_code}</Text></View>
        <View className="w-40 px-4"><Text className="text-sm text-gray-800" numberOfLines={1}>{item.customername || item.customer?.customer_name || '---'}</Text></View>
        <View className="w-28 px-4"><Text className="text-sm text-gray-600">{formatDate(item.date_created)}</Text></View>
        <View className="w-32 px-4"><Text className="text-sm font-medium text-blue-600">{item.form_code_receiving || item.reception?.form_code_receiving || '---'}</Text></View>
        <View className="w-32 px-4"><View className={`px-2 py-1 rounded self-start ${statusInfo.bg}`}><Text className={`text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</Text></View></View>
        <View className="w-24 px-4"><Text className="text-sm text-gray-600">{formTypeText}</Text></View>
        <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.notes}</Text></View>
        <View className="w-16 px-2 items-center"><TouchableOpacity onPress={() => handleDelete(item.id, item.return_code)} className="p-2 bg-gray-100 rounded-full"><TrashIcon /></TouchableOpacity></View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Phiếu trả hàng" />
      <ActionToolbar searchText={searchText} setSearchText={setSearchText} onCreatePress={openAddModal} onFilterPress={() => setFilterVisible(true)} />

      <View className="flex-1 bg-white px-3 py-2">
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <View>
            <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
              <View className="w-28 px-4"><Text className="font-bold text-gray-700">Mã phiếu</Text></View>
              <View className="w-40 px-4"><Text className="font-bold text-gray-700">Khách hàng</Text></View>
              <View className="w-28 px-4"><Text className="font-bold text-gray-700">Ngày lập</Text></View>
              <View className="w-32 px-4"><Text className="font-bold text-gray-700">Phiếu TN</Text></View>
              <View className="w-32 px-4"><Text className="font-bold text-gray-700">Tình trạng</Text></View>
              <View className="w-24 px-4"><Text className="font-bold text-gray-700">Loại</Text></View>
              <View className="w-48 px-4"><Text className="font-bold text-gray-700">Ghi chú</Text></View>
              <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
            </View>
            {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
              <FlatList
                data={returnForms} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchReturnForms(1, true)} />}
                onEndReached={() => { if (!loading && page < lastPage) fetchReturnForms(page + 1); }}
                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không có phiếu nào</Text></View>}
              />}
            <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
          </View>
        </ScrollView>
      </View>

      {/* --- MODAL FORM --- */}
      <Modal animationType="slide" transparent={true} visible={formVisible} onRequestClose={() => setFormVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFormVisible(false)}>
          <Pressable className="bg-white rounded-t-xl p-5 h-[90%]" onPress={e => e.stopPropagation()}>
            <View className="flex-row justify-between mb-4 border-b pb-2">
              <Text className="text-xl font-bold text-blue-800">{isEditing ? 'Sửa phiếu trả hàng' : 'Tạo phiếu trả hàng'}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}><Text className="font-bold text-lg text-gray-500">✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text className="font-bold text-gray-800 mb-2">I. Thông tin chung</Text>

              <View className="flex-row justify-between mb-3">
                <View className="w-[48%]"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded bg-gray-100" value={formData.return_code} editable={!isEditing} /></View>
                <View className="w-[48%]"><Text className="mb-1">Ngày lập</Text><TextInput className="border p-2 rounded" value={formData.date_created} onChangeText={t => setFormData({ ...formData, date_created: t })} placeholder="YYYY-MM-DD" /></View>
              </View>

              <View className="mb-3"><Text className="mb-1">Khách hàng</Text>
                <DropdownSelect data={customers} labelField="customer_name" valueField="id" value={formData.customer_id} onChange={v => setFormData({ ...formData, customer_id: v })} placeholder="Chọn khách hàng..." search={true} />
              </View>

              <View className="mb-3"><Text className="mb-1">Phiếu tiếp nhận</Text>
                <DropdownSelect data={receivings} labelField="form_code_receiving" valueField="id" value={formData.reception_id} onChange={v => setFormData({ ...formData, reception_id: v })} placeholder="Chọn phiếu tiếp nhận..." search={true} />
              </View>

              <View className="mb-3"><Text className="mb-1">Tình trạng</Text>
                <View className="flex-row">
                  <TouchableOpacity onPress={() => setFormData({ ...formData, status: 1 })} className={`mr-3 px-3 py-2 border rounded ${formData.status === 1 ? 'bg-green-100' : 'bg-white'}`}><Text>Hoàn thành</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setFormData({ ...formData, status: 2 })} className={`px-3 py-2 border rounded ${formData.status === 2 ? 'bg-red-100' : 'bg-white'}`}><Text>Không đồng ý</Text></TouchableOpacity>
                </View>
              </View>

              <View className="mb-3"><Text className="mb-1">Phương thức trả</Text><TextInput className="border p-2 rounded" value={formData.return_method} onChangeText={t => setFormData({ ...formData, return_method: t })} /></View>
              <View className="mb-3"><Text className="mb-1">Ghi chú</Text><TextInput className="border p-2 rounded" value={formData.notes} onChangeText={t => setFormData({ ...formData, notes: t })} /></View>

              {/* SẢN PHẨM */}
              <View className="flex-row justify-between items-center mt-4 mb-2">
                <Text className="font-bold text-gray-800">II. Sản phẩm trả</Text>
                <TouchableOpacity onPress={addProductRow} className="bg-blue-500 px-3 py-1 rounded"><Text className="text-white text-xs">+ Thêm SP</Text></TouchableOpacity>
              </View>

              {formData.products.map((item, index) => (
                <View key={index} className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-bold">SP #{index + 1}</Text>
                    <TouchableOpacity onPress={() => removeProductRow(index)}><Text className="text-red-500 text-xs">Xóa</Text></TouchableOpacity>
                  </View>
                  <View className="mb-2">
                    <DropdownSelect data={formattedProducts} labelField="label_display" valueField="id" value={item.product_id} onChange={v => updateProductRow(index, 'product_id', v)} placeholder="Chọn sản phẩm..." search={true} />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="w-[30%]"><Text className="text-xs mb-1">Số lượng</Text>
                      <TextInput className="border p-1 rounded bg-white text-center" value={item.quantity.toString()} onChangeText={t => updateProductRow(index, 'quantity', parseInt(t) || 1)} keyboardType="numeric" />
                    </View>
                    <View className="w-[65%]"><Text className="text-xs mb-1">Ghi chú SP</Text>
                      <TextInput className="border p-1 rounded bg-white" value={item.notes} onChangeText={t => updateProductRow(index, 'notes', t)} />
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center mt-4 mb-6" onPress={handleSave}><Text className="text-white font-bold text-lg">{isEditing ? 'CẬP NHẬT' : 'TẠO PHIẾU'}</Text></TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterVisible(false)}>
          <Pressable className="bg-white rounded-t-xl p-4 h-[60%] w-full" onPress={e => e.stopPropagation()}>
            <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="mb-3"><Text className="mb-1">Mã phiếu</Text><TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} /></View>
              <View className="mb-4"><Text className="mb-1">Khách hàng</Text>
                <DropdownSelect data={customers} labelField="customer_name" valueField="id" value={filterValues.customer_id} onChange={v => setFilterValues({ ...filterValues, customer_id: v })} placeholder="Tất cả khách hàng" search={true} />
              </View>
              <View className="mb-3"><Text className="mb-1">Tình trạng</Text>
                <View className="flex-row">
                  <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, status: [1] })} className="mr-2 px-3 py-1 border rounded"><Text>Hoàn thành</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilterValues({ ...filterValues, status: [2] })} className="px-3 py-1 border rounded"><Text>Không đồng ý</Text></TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View className="flex-row mt-3 border-t pt-3">
              <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}