import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  Platform 
} from 'react-native';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../Header';
import ActionToolbar from '../ActionToolbar';
import { SortIcon } from '../Icons';

// --- MOCK DATA (Dựa trên HTML của bạn) ---
const MOCK_WAREHOUSES = [
  { id: '1', code: 'KHM', name: 'Kho Hàng Mới' },
  { id: '2', code: 'KBH', name: 'Kho Bảo Hành' },
  { id: '3', code: 'KTL', name: 'Kho Thanh Lý' }, // Thêm ví dụ cho danh sách dài hơn
];

export default function WarehouseScreen() {
  const [searchText, setSearchText] = useState('');
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_WAREHOUSES.filter(item => 
            item.name.toLowerCase().includes(text.toLowerCase()) || 
            item.code.toLowerCase().includes(text.toLowerCase())
        );
        setWarehouses(filtered);
    } else {
        setWarehouses(MOCK_WAREHOUSES);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  const handleEdit = (item) => {
      Alert.alert("Chỉnh sửa", `Mở trang chỉnh sửa kho: ${item.name}`);
  }

  // --- TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        {/* Cột Mã Kho - 30% */}
        <View className="w-32 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700 mr-1">Mã Kho</Text>
            <SortIcon />
        </View>
        {/* Cột Tên Kho - 70% (flex-1 để chiếm hết phần còn lại) */}
        <View className="flex-1 px-4 flex-row items-center">
            <Text className="text-xs font-bold text-gray-700 mr-1">Tên Kho</Text>
            <SortIcon />
        </View>
    </View>
  );

  // --- TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <TouchableOpacity 
        onPress={() => handleEdit(item)}
        className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50"
    >
        {/* Mã Kho */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Tên Kho (Màu tím, link) */}
        <View className="flex-1 px-4">
            <Text className="text-sm font-medium text-purple-700">{item.name}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: Chọn SETUP và Highlight 'Kho' */}
      <Header 
        defaultActiveMenu="SETUP" 
        activeSubMenu="Kho"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar: Tìm kiếm & Tạo mới */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo mới kho")}
        // Trang này trong HTML không thấy nút filter, nhưng nếu cần bạn cứ thêm onFilterPress
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View className="w-full min-w-full"> 
                    {/* min-w-full để đảm bảo bảng luôn full màn hình nếu ít cột */}
                    
                    {/* Table Header */}
                    {renderTableHeader()}

                    {/* Table List */}
                    <FlatList 
                        data={warehouses}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có kho nào</Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}