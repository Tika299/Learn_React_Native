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

// --- MOCK DATA (Dựa trên HTML) ---
const MOCK_IMPORTS = [
  { 
    id: '2', 
    code: 'PNH00002', 
    date: '25/10/2023', 
    provider: 'Công ty TNHH FPT Shop', 
    warehouse: 'Kho Hàng Mới', 
    creator: 'Nguyễn Văn Thiên', 
    note: 'Nhập hàng đợt 1' 
  },
  // Thêm dữ liệu giả để test
  { 
    id: '1', 
    code: 'PNH00001', 
    date: '24/10/2023', 
    provider: 'Công ty CP Sữa Việt Nam', 
    warehouse: 'Kho Bảo Hành', 
    creator: 'Trần Lê Thục Uyên', 
    note: 'Nhập nguyên liệu' 
  },
];

export default function ImportScreen() {
  const [searchText, setSearchText] = useState('');
  const [imports, setImports] = useState(MOCK_IMPORTS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_IMPORTS.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.provider.toLowerCase().includes(text.toLowerCase())
        );
        setImports(filtered);
    } else {
        setImports(MOCK_IMPORTS);
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
            onPress: () => {
                setImports(imports.filter(i => i.id !== id));
                Alert.alert("Thành công", "Đã xóa phiếu nhập");
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
        {/* Nhà cung cấp */}
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Nhà cung cấp</Text><SortIcon/></View>
        {/* Kho */}
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Kho</Text><SortIcon/></View>
        {/* Người lập */}
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Người lập phiếu</Text><SortIcon/></View>
        {/* Ghi chú */}
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ghi chú</Text><SortIcon/></View>
        {/* Xóa */}
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700"></Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu (Màu tím, link) */}
        <View className="w-28 px-2">
            <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-800">{item.date}</Text>
        </View>
        
        {/* Nhà cung cấp (Cắt dòng nếu dài) */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1} ellipsizeMode="tail">
                {item.provider}
            </Text>
        </View>

        {/* Kho */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.warehouse}</Text>
        </View>

        {/* Người lập */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-600">{item.creator}</Text>
        </View>

        {/* Ghi chú */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.note}</Text>
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
      
      {/* 
          1. Header: Chọn OPERATIONS (Nghiệp vụ) và Highlight 'Phiếu nhập hàng'
      */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Phiếu nhập hàng"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu nhập mới")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Hiện modal lọc phiếu nhập")}
        onImportPress={() => Alert.alert("Excel", "Nhập từ Excel")}
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
                        data={imports}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có phiếu nhập nào</Text>
                            </View>
                        }
                    />
                    
                    {/* Footer Count (nếu cần) */}
                    <View className="bg-gray-50 border-t border-gray-200 p-2 flex-row justify-end items-center">
                         <Text className="text-gray-600 text-xs mr-2">Tổng số phiếu: {imports.length}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}