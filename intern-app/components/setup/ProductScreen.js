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
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon } from '../../../components/Icons';

// --- ICON THÙNG RÁC (Lấy từ HTML gốc) ---
const TrashIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path opacity="0.936" fillRule="evenodd" clipRule="evenodd" d="M6.40625 0.968766C7.44813 0.958304 8.48981 0.968772 9.53125 1.00016C9.5625 1.03156 9.59375 1.06296 9.625 1.09436C9.65625 1.49151 9.66663 1.88921 9.65625 2.28746C10.7189 2.277 11.7814 2.28747 12.8438 2.31886C12.875 2.35025 12.9063 2.38165 12.9375 2.41305C12.9792 2.99913 12.9792 3.58522 12.9375 4.17131C12.9063 4.24457 12.8542 4.2969 12.7813 4.32829C12.6369 4.35948 12.4911 4.36995 12.3438 4.35969C12.3542 7.45762 12.3438 10.5555 12.3125 13.6533C12.1694 14.3414 11.7632 14.7914 11.0938 15.0034C9.01044 15.0453 6.92706 15.0453 4.84375 15.0034C4.17433 14.7914 3.76808 14.3414 3.625 13.6533C3.59375 10.5555 3.58333 7.45762 3.59375 4.35969C3.3794 4.3844 3.18148 4.34254 3 4.2341C2.95833 3.62708 2.95833 3.02007 3 2.41305C3.03125 2.38165 3.0625 2.35025 3.09375 2.31886C4.15605 2.28747 5.21855 2.277 6.28125 2.28746C6.27088 1.88921 6.28125 1.49151 6.3125 1.09436C6.35731 1.06018 6.38856 1.01832 6.40625 0.968766ZM6.96875 1.65951C7.63544 1.65951 8.30206 1.65951 8.96875 1.65951C8.96875 1.86882 8.96875 2.07814 8.96875 2.28746C8.30206 2.28746 7.63544 2.28746 6.96875 2.28746C6.96875 2.07814 6.96875 1.86882 6.96875 1.65951ZM3.65625 2.9782C6.53125 2.9782 9.40625 2.9782 12.2813 2.9782C12.2813 3.18752 12.2813 3.39684 12.2813 3.60615C9.40625 3.60615 6.53125 3.60615 3.65625 3.60615C3.65625 3.39684 3.65625 3.18752 3.65625 2.9782ZM4.34375 4.35969C6.76044 4.35969 9.17706 4.35969 11.5938 4.35969C11.6241 7.5032 11.5929 10.643 11.5 13.7789C11.3553 14.05 11.1366 14.2279 10.8438 14.3127C8.92706 14.3546 7.01044 14.3546 5.09375 14.3127C4.80095 14.2279 4.5822 14.05 4.4375 13.7789C4.34462 10.643 4.31337 7.5032 4.34375 4.35969Z" fill="#6C6F74"/>
    <Path opacity="0.891" fillRule="evenodd" clipRule="evenodd" d="M5.78125 5.28118C6.0306 5.2259 6.20768 5.30924 6.3125 5.53118C6.35419 8.052 6.35419 10.5729 6.3125 13.0937C6.08333 13.427 5.85417 13.427 5.625 13.0937C5.58333 10.552 5.58333 8.01037 5.625 5.46868C5.69031 5.4141 5.7424 5.3516 5.78125 5.28118Z" fill="#6C6F74"/>
    <Path opacity="0.891" fillRule="evenodd" clipRule="evenodd" d="M7.78125 5.28118C8.03063 5.2259 8.20769 5.30924 8.3125 5.53118C8.35419 8.052 8.35419 10.5729 8.3125 13.0937C8.08331 13.427 7.85419 13.427 7.625 13.0937C7.58331 10.552 7.58331 8.01037 7.625 5.46868C7.69031 5.4141 7.74238 5.3516 7.78125 5.28118Z" fill="#6C6F74"/>
    <Path opacity="0.891" fillRule="evenodd" clipRule="evenodd" d="M9.78125 5.28118C10.0306 5.2259 10.2077 5.30924 10.3125 5.53118C10.3542 8.052 10.3542 10.5729 10.3125 13.0937C10.0833 13.427 9.85419 13.427 9.625 13.0937C9.58331 10.552 9.58331 8.01037 9.625 5.46868C9.69031 5.4141 9.74238 5.3516 9.78125 5.28118Z" fill="#6C6F74"/>
  </Svg>
);

// --- DỮ LIỆU MẪU ---
const MOCK_PRODUCTS = [
  { id: '7', code: 'SAMSUNG_S24', name: 'Samsung Galaxy S24', brand: 'Samsung' },
  { id: '6', code: 'IPHONE15', name: 'iPhone 15 Pro Max', brand: 'Apple' },
];

export default function ProductScreen() {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_PRODUCTS.filter(item => 
            item.name.toLowerCase().includes(text.toLowerCase()) || 
            item.code.toLowerCase().includes(text.toLowerCase())
        );
        setProducts(filtered);
    } else {
        setProducts(MOCK_PRODUCTS);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: () => {
                setProducts(products.filter(p => p.id !== id));
                Alert.alert("Thành công", "Đã xóa sản phẩm");
            }
        }
      ]
    );
  };

  // --- HEADER BẢNG ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        {/* Cột Mã hàng - 30% */}
        <View className="w-40 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text>
            <SortIcon />
        </View>
        {/* Cột Tên hàng - 40% */}
        <View className="w-60 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text>
            <SortIcon />
        </View>
        {/* Cột Hãng - 20% */}
        <View className="w-32 px-4 flex-row items-center border-r border-gray-200">
            <Text className="text-xs font-bold text-gray-700 mr-1">Hãng</Text>
            <SortIcon />
        </View>
        {/* Cột Hành động - 10% */}
        <View className="w-16 px-2 flex-row items-center justify-center">
            <Text className="text-xs font-bold text-gray-700">Xóa</Text>
        </View>
    </View>
  );

  // --- DÒNG DỮ LIỆU ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng (Màu tím như HTML) */}
        <View className="w-40 px-4">
            <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
        </View>
        
        {/* Tên hàng */}
        <View className="w-60 px-4">
            <Text className="text-sm text-gray-800">{item.name}</Text>
        </View>
        
        {/* Hãng */}
        <View className="w-32 px-4">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.code)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header dùng chung */}
      <Header 
        defaultActiveMenu="SETUP"
        activeSubMenu="Hàng hoá"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar dùng chung */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo mới hàng hóa")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Hiện modal lọc hàng hóa")}
        // HTML gốc trang này không thấy nút Import, nhưng nếu cần bạn cứ thêm props: onImportPress
      />

      {/* 3. Table Content */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {/* Header: Nhóm hàng hóa */}
                    <View className="bg-white border-b border-gray-200 p-3">
                        <Text className="text-purple-700 font-medium text-sm">
                            Nhóm hàng hóa: Chưa chọn nhóm
                        </Text>
                    </View>

                    {/* Table Header */}
                    {renderTableHeader()}

                    {/* Table List */}
                    <FlatList 
                        data={products}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có hàng hóa nào</Text>
                            </View>
                        }
                    />

                    {/* Footer: Tổng số lượng */}
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center">
                         <Text className="text-purple-700 text-sm">
                            SL hàng hoá: <Text className="font-bold">{products.length}</Text>
                         </Text>
                    </View>

                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}