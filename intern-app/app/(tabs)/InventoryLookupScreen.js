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

// --- MOCK DATA (Dựa trên HTML Tra cứu tồn kho) ---
const MOCK_INVENTORY = [
  { 
    id: '6', 
    code: 'LAP001', 
    name: 'Laptop Dell Inspiron 15 3511', 
    brand: 'Dell', 
    serial: '', 
    provider: 'Công ty Sony Việt Nam', 
    importDate: '08/12/2025', 
    warehouse: 'Kho Hàng Mới', 
    duration: '0 ngày', 
    status: '' 
  },
  { 
    id: '5', 
    code: 'TV001', 
    name: 'Smart TV Sony 55 inch 4K', 
    brand: 'Sony', 
    serial: 'MACM2-2024-01', 
    provider: 'Thế Giới Di Động', 
    importDate: '15/11/2023', 
    warehouse: 'Kho Hàng Mới', 
    duration: '-755 ngày', 
    status: '' 
  },
  { 
    id: '4', 
    code: 'LAP002', 
    name: 'MacBook Air M2 2022', 
    brand: 'Apple', 
    serial: 'DELL3511-004D', 
    serialNote: '(Hàng mượn)', // Thêm trường ghi chú cho S/N
    provider: 'CellphoneS', 
    importDate: '20/09/2024', 
    warehouse: 'Kho Hàng Mới', 
    duration: '0 ngày', 
    status: '' 
  },
  { 
    id: '1', 
    code: 'LAP001', 
    name: 'Laptop Dell Inspiron 15 3511', 
    brand: 'Dell', 
    serial: 'DELL3511-001A', 
    provider: 'Công ty TNHH FPT Shop', 
    importDate: '10/07/2024', 
    warehouse: 'Kho Hàng Mới', 
    duration: '-517 ngày', 
    status: 'Tới hạn bảo trì' // Trạng thái đặc biệt
  },
];

export default function InventoryLookupScreen() {
  const [searchText, setSearchText] = useState('');
  const [inventory, setInventory] = useState(MOCK_INVENTORY);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_INVENTORY.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.serial.toLowerCase().includes(text.toLowerCase())
        );
        setInventory(filtered);
    } else {
        setInventory(MOCK_INVENTORY);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon/></View>
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Hãng</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">S/N</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Nhà cung cấp</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày nhập</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Kho</Text><SortIcon/></View>
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tồn kho</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Trạng thái</Text><SortIcon/></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Tên hàng */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-800" numberOfLines={2}>{item.name}</Text>
        </View>
        
        {/* Hãng */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-600">{item.brand}</Text>
        </View>

        {/* S/N (Serial Number) - Có thể có link và note */}
        <View className="w-40 px-2">
            {item.serial ? (
                <View>
                    <TouchableOpacity>
                        <Text className="text-sm font-medium text-purple-700">{item.serial}</Text>
                    </TouchableOpacity>
                    {item.serialNote && (
                        <Text className="text-xs text-gray-500 mt-0.5">{item.serialNote}</Text>
                    )}
                </View>
            ) : (
                <Text className="text-sm text-gray-400">--</Text>
            )}
        </View>

        {/* Nhà cung cấp */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.provider}</Text>
        </View>

        {/* Ngày nhập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.importDate}</Text>
        </View>

        {/* Kho */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.warehouse}</Text>
        </View>

        {/* Thời gian tồn */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-800">{item.duration}</Text>
        </View>

        {/* Trạng thái (Xử lý màu đỏ) */}
        <View className="w-32 px-2">
            <Text className={`text-sm ${item.status === 'Tới hạn bảo trì' ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                {item.status}
            </Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: OPERATIONS -> Tra cứu tồn kho */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Tra cứu tồn kho"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        // Trang này thường không có nút tạo mới, chỉ có filter/export
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc tồn kho")}
        onImportPress={() => Alert.alert("Xuất Excel", "Xuất báo cáo tồn kho")}
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
                        data={inventory}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không tìm thấy dữ liệu tồn kho</Text>
                            </View>
                        }
                    />
                    
                    {/* Pagination Info */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-between items-center px-4">
                         <Text className="text-gray-500 text-xs">Hiển thị {inventory.length} kết quả</Text>
                         {/* Placeholder Pagination Buttons */}
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