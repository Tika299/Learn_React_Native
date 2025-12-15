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
import { SortIcon, TrashIcon } from '../../components/Icons';

// --- MOCK DATA (Tự tạo vì HTML table body rỗng) ---
const MOCK_RETURN_FORMS = [
  { 
    id: '1', 
    code: 'PTH00001', 
    customer: 'Nguyễn Văn An', 
    date: '12/12/2025', 
    receivingCode: 'PN000001', 
    status: 'Đã trả hàng', 
    type: 'Bảo hành', 
    note: 'Đã thay màn hình xong, khách đã kiểm tra.' 
  },
  { 
    id: '2', 
    code: 'PTH00002', 
    customer: 'Vũ Thị Hương', 
    date: '13/12/2025', 
    receivingCode: 'PN000002', 
    status: 'Chờ thanh toán', 
    type: 'Dịch vụ', 
    note: 'Sửa nguồn, chờ khách chuyển khoản.' 
  },
];

export default function ReturnFormScreen() {
  const [searchText, setSearchText] = useState('');
  const [returnForms, setReturnForms] = useState(MOCK_RETURN_FORMS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_RETURN_FORMS.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.customer.toLowerCase().includes(text.toLowerCase())
        );
        setReturnForms(filtered);
    } else {
        setReturnForms(MOCK_RETURN_FORMS);
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
            onPress: () => {
                setReturnForms(returnForms.filter(f => f.id !== id));
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
        {/* Khách hàng */}
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon/></View>
        {/* Ngày lập */}
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập phiếu</Text><SortIcon/></View>
        {/* Phiếu tiếp nhận */}
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Phiếu tiếp nhận</Text><SortIcon/></View>
        {/* Tình trạng */}
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tình trạng</Text><SortIcon/></View>
        {/* Loại phiếu */}
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Loại phiếu</Text><SortIcon/></View>
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
        
        {/* Khách hàng */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-800" numberOfLines={1}>{item.customer}</Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.date}</Text>
        </View>

        {/* Phiếu tiếp nhận (Link) */}
        <View className="w-32 px-2">
            <TouchableOpacity>
                <Text className="text-sm font-medium text-purple-700">{item.receivingCode}</Text>
            </TouchableOpacity>
        </View>

        {/* Tình trạng (Có thể thêm màu nếu cần) */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.status}</Text>
        </View>

        {/* Loại phiếu */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-600">{item.type}</Text>
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
      
      {/* 1. Header: Chọn OPERATIONS và Highlight 'Phiếu trả hàng' */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Phiếu trả hàng"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu trả hàng mới")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc phiếu trả hàng")}
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}
                    <FlatList 
                        data={returnForms}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có phiếu trả hàng nào</Text>
                            </View>
                        }
                    />
                    
                    {/* Footer Count */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-end items-center">
                         <Text className="text-gray-600 text-xs mr-2">Tổng số phiếu: {returnForms.length}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}