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
import { SortIcon, TrashIcon } from '../../../components/Icons';

// --- MOCK DATA (Tự tạo vì HTML body rỗng) ---
const MOCK_TRANSFERS = [
  { 
    id: '1', 
    code: 'CK00001', 
    date: '15/12/2025', 
    fromWarehouse: 'Kho Hàng Mới', 
    toWarehouse: 'Kho Bảo Hành', 
    status: 'Hoàn thành', 
    note: 'Chuyển máy lỗi về kho bảo hành' 
  },
  { 
    id: '2', 
    code: 'CK00002', 
    date: '16/12/2025', 
    fromWarehouse: 'Kho Bảo Hành', 
    toWarehouse: 'Kho Hàng Mới', 
    status: 'Đang chuyển', 
    note: 'Trả máy đã sửa xong' 
  },
];

export default function WarehouseTransferScreen() {
  const [searchText, setSearchText] = useState('');
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_TRANSFERS.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.note.toLowerCase().includes(text.toLowerCase())
        );
        setTransfers(filtered);
    } else {
        setTransfers(MOCK_TRANSFERS);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu chuyển ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: () => {
                setTransfers(transfers.filter(t => t.id !== id));
                Alert.alert("Thành công", "Đã xóa phiếu");
            }
        }
      ]
    );
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        {/* Mã phiếu */}
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã phiếu</Text><SortIcon/></View>
        {/* Ngày lập */}
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập</Text><SortIcon/></View>
        {/* Kho xuất */}
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Kho xuất</Text><SortIcon/></View>
        {/* Kho nhận */}
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Kho nhận</Text><SortIcon/></View>
        {/* Trạng thái */}
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Trạng thái</Text><SortIcon/></View>
        {/* Ghi chú */}
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ghi chú</Text><SortIcon/></View>
        {/* Xóa */}
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700"></Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu (Link) */}
        <View className="w-28 px-2">
            <TouchableOpacity>
                <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
            </TouchableOpacity>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.date}</Text>
        </View>
        
        {/* Kho xuất */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.fromWarehouse}</Text>
        </View>

        {/* Kho nhận */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.toWarehouse}</Text>
        </View>

        {/* Trạng thái */}
        <View className="w-28 px-2">
            <Text className={`text-sm ${item.status === 'Hoàn thành' ? 'text-green-600' : 'text-orange-500'}`}>
                {item.status}
            </Text>
        </View>

        {/* Ghi chú */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>{item.note}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.code)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: Chọn OPERATIONS và Highlight 'Phiếu chuyển kho' */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Phiếu chuyển kho"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu chuyển kho mới")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc phiếu chuyển kho")}
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}
                    <FlatList 
                        data={transfers}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có phiếu chuyển kho nào</Text>
                            </View>
                        }
                    />
                    
                    {/* Footer Count */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-end items-center">
                         <Text className="text-gray-600 text-xs mr-2">Tổng số phiếu: {transfers.length}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}