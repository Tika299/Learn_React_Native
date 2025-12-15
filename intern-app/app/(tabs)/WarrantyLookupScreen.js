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
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon } from '../../components/Icons';

// --- MOCK DATA (Dựa trên HTML Tra cứu bảo hành) ---
const MOCK_WARRANTIES = [
  { 
    id: '4', 
    code: 'LAP002', 
    brand: 'Apple', 
    serial: 'DELL3511-004D', 
    customer: 'Trần Thị Bé', 
    sellDate: '20/09/2024', 
    warrantyInfo: 'Bảo hành Apple 12 tháng: 12 tháng', 
    expiryStatus: 'Hết bảo hành (2 tháng 25 ngày trước)', 
    isExpired: true,
    activationDate: '',
    serviceWarranty: 'Bảo hành chính hãng: tháng',
    status: 'Bảo hành chính hãng: Còn bảo hành'
  },
  { 
    id: '3', 
    code: 'PHN002', 
    brand: 'Samsung', 
    serial: 'DELL3511-003C', 
    customer: 'Phạm Minh Đức', 
    sellDate: '15/03/2025', 
    warrantyInfo: 'Sửa mainboard – Có phí: không bảo hành', 
    expiryStatus: 'Hết bảo hành (9 tháng 0 ngày trước)', 
    isExpired: true,
    activationDate: '',
    serviceWarranty: '',
    status: 'Sửa mainboard – Có phí: Hết bảo hành'
  },
  { 
    id: '2', 
    code: 'PHN001', 
    brand: 'Apple', 
    serial: 'DELL3511-002B', 
    customer: 'Đỗ Quang Huy (VIP)', 
    sellDate: '20/02/2025', 
    warrantyInfo: 'Đổi máy mới do lỗi camera: 36 tháng | AppleCare+: 36 tháng', 
    expiryStatus: 'Còn 2 năm 2 tháng 4 ngày', 
    isExpired: false,
    activationDate: '',
    serviceWarranty: 'Bảo hành máy đổi mới: tháng | Bảo hành AppleCare+: tháng',
    status: 'Bảo hành máy đổi mới: Bảo hành DV | Bảo hành AppleCare+: Còn bảo hành'
  },
  { 
    id: '1', 
    code: 'LAP001', 
    brand: 'Dell', 
    serial: 'DELL3511-001A', 
    customer: 'Nguyễn Văn An', 
    sellDate: '10/11/2025', 
    warrantyInfo: 'Sửa màn hình – Dịch vụ: không bảo hành | Gia hạn bảo hành thêm: 12 tháng', 
    expiryStatus: 'Hết bảo hành (1 tháng 5 ngày trước)', 
    isExpired: true,
    activationDate: '15/11/2025',
    serviceWarranty: 'Gia hạn thêm 12 tháng: 12 tháng | Bảo hành chính hãng: tháng',
    status: 'Sửa màn hình – Dịch vụ: Hết bảo hành | Gia hạn thêm 12 tháng: Còn bảo hành'
  },
];

export default function WarrantyLookupScreen() {
  const [searchText, setSearchText] = useState('');
  const [warranties, setWarranties] = useState(MOCK_WARRANTIES);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_WARRANTIES.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.serial.toLowerCase().includes(text.toLowerCase()) ||
            item.customer.toLowerCase().includes(text.toLowerCase())
        );
        setWarranties(filtered);
    } else {
        setWarranties(MOCK_WARRANTIES);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon/></View>
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Hãng</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">S/N</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày bán</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Bảo hành</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Hạn bảo hành</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày kích hoạt BH</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">BH Dịch vụ</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Tình trạng</Text><SortIcon/></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Hãng */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>

        {/* S/N (Màu tím, link) */}
        <View className="w-40 px-2">
            <TouchableOpacity>
                <Text className="text-sm font-medium text-purple-700">{item.serial}</Text>
            </TouchableOpacity>
        </View>

        {/* Khách hàng */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.customer}</Text>
        </View>

        {/* Ngày bán */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.sellDate}</Text>
        </View>

        {/* Thông tin Bảo hành */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.warrantyInfo}</Text>
        </View>

        {/* Hạn bảo hành (Xử lý màu Xanh/Đỏ) */}
        <View className="w-48 px-2">
            <Text className={`text-sm font-medium ${item.isExpired ? 'text-red-500' : 'text-green-600'}`}>
                {item.expiryStatus}
            </Text>
        </View>

        {/* Ngày kích hoạt BH DV */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.activationDate || '--'}</Text>
        </View>

        {/* Bảo hành Dịch vụ */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.serviceWarranty || '--'}</Text>
        </View>

        {/* Tình trạng */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.status}</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: OPERATIONS -> Tra cứu bảo hành */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Tra cứu bảo hành"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc thông tin bảo hành")}
        // Trang này thường không có nút tạo mới hay import
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {/* Table Header */}
                    {renderTableHeader()}

                    {/* Table List */}
                    <FlatList 
                        data={warranties}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không tìm thấy dữ liệu bảo hành</Text>
                            </View>
                        }
                    />
                    
                    {/* Pagination Info */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-between items-center px-4">
                         <Text className="text-gray-500 text-xs">Hiển thị {warranties.length} kết quả</Text>
                         <View className="flex-row">
                            <TouchableOpacity className="px-2"><Text className="text-gray-400">{'<'}</Text></TouchableOpacity>
                            <TouchableOpacity className="px-2"><Text className="text-gray-400">{'>'}</Text></TouchableOpacity>
                         </View>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}