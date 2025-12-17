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


// --- MOCK DATA (Dựa trên HTML Báo giá) ---
const MOCK_QUOTATIONS = [
  { 
    id: '5', 
    code: 'QT-PG9ZHXDE', 
    customer: 'Nguyễn Văn An', 
    date: '10/04/2013', 
    receivingCode: 'PN000001', 
    totalAmount: '34,544,667', 
    type: 'Bảo hành',
    note: 'Atque iusto accusantium vel iusto repellendus praesentium molestias consequatur aut ducimus delectus omnis consequatur.' 
  },
  { 
    id: '4', 
    code: 'QT-PLLUFLTA', 
    customer: 'Cửa hàng Di Động Minh Phát', 
    date: '22/01/1981', 
    receivingCode: 'PN000001', 
    totalAmount: '24,981,221', 
    type: 'Bảo hành',
    note: 'Dolorum molestiae animi reprehenderit ipsam vitae qui autem nam.' 
  },
  { 
    id: '3', 
    code: 'QT-OVGXRZTE', 
    customer: 'Phạm Minh Đức', 
    date: '21/02/2017', 
    receivingCode: 'PN000002', 
    totalAmount: '16,120,359', 
    type: 'Dịch vụ',
    note: 'Quam enim voluptatem qui sed error exercitationem quia eum est eaque temporibus est a.' 
  },
  { 
    id: '2', 
    code: 'QT-GNLK3XCK', 
    customer: 'Tập đoàn XYZ', 
    date: '13/10/1974', 
    receivingCode: 'PN000002', 
    totalAmount: '18,006,961', 
    type: 'Dịch vụ',
    note: 'Nobis et similique maxime non officiis natus architecto nemo facilis dolores molestiae.' 
  },
  { 
    id: '1', 
    code: 'QT-YCIHTBAD', 
    customer: 'Cửa hàng Di Động Minh Phát', 
    date: '06/07/1997', 
    receivingCode: 'PN000001', 
    totalAmount: '37,519,870', 
    type: 'Bảo hành',
    note: 'Harum voluptas in ex iusto repudiandae quo.' 
  },
];

export default function QuotationScreen() {
  const [searchText, setSearchText] = useState('');
  const [quotations, setQuotations] = useState(MOCK_QUOTATIONS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_QUOTATIONS.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.customer.toLowerCase().includes(text.toLowerCase())
        );
        setQuotations(filtered);
    } else {
        setQuotations(MOCK_QUOTATIONS);
    }
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu báo giá ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: () => {
                setQuotations(quotations.filter(q => q.id !== id));
                Alert.alert("Thành công", "Đã xóa phiếu báo giá");
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
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã phiếu</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Phiếu tiếp nhận</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tổng tiền</Text><SortIcon/></View>
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Loại phiếu</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ghi chú</Text><SortIcon/></View>
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
        <View className="w-28 px-2">
            <TouchableOpacity>
                <Text className="text-sm font-medium text-purple-700">{item.receivingCode}</Text>
            </TouchableOpacity>
        </View>

        {/* Tổng tiền */}
        <View className="w-28 px-2">
            <Text className="text-sm font-bold text-gray-800">{item.totalAmount}</Text>
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
      
      {/* 1. Header: Chọn OPERATIONS và Highlight 'Phiếu báo giá' */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Phiếu báo giá"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu báo giá mới")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc phiếu báo giá")}
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}
                    <FlatList 
                        data={quotations}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có phiếu báo giá nào</Text>
                            </View>
                        }
                    />
                    
                    {/* Footer Count */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-end items-center">
                         <Text className="text-gray-600 text-xs mr-2">Tổng số phiếu: {quotations.length}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}