import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon, CalendarIcon } from '../../../components/Icons';

// --- MOCK DATA (Dựa trên HTML) ---
const MOCK_DATA = [
  { id: '1', code: 'LAP001', name: 'Laptop Dell Inspiron 15 3511', importQty: 1, exportQty: 0 },
  { id: '2', code: 'LAP002', name: 'MacBook Air M2 2022', importQty: 0, exportQty: 0 },
  { id: '3', code: 'PHN001', name: 'iPhone 15 Pro Max', importQty: 0, exportQty: 0 },
  { id: '4', code: 'PHN002', name: 'Samsung Galaxy S24 Ultra', importQty: 0, exportQty: 0 },
  { id: '5', code: 'TV001', name: 'Smart TV Sony 55 inch 4K', importQty: 0, exportQty: 0 },
  { id: '6', code: 'IPHONE15', name: 'iPhone 15 Pro Max', importQty: 0, exportQty: 0 },
  { id: '7', code: 'SAMSUNG_S24', name: 'Samsung Galaxy S24', importQty: 0, exportQty: 0 },
];

export default function ReportExportImportScreen() {
  const [searchText, setSearchText] = useState('');
  const [reportData, setReportData] = useState(MOCK_DATA);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: '25-10-2023', end: '15-11-2023', label: 'Tất cả' });

  // --- TÍNH TỔNG ---
  const totals = useMemo(() => {
    return reportData.reduce((acc, item) => {
        acc.import += item.importQty;
        acc.export += item.exportQty;
        return acc;
    }, { import: 0, export: 0 });
  }, [reportData]);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_DATA.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setReportData(filtered);
    } else {
        setReportData(MOCK_DATA);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  const handleTimeFilter = (option) => {
      // Logic giả lập thay đổi thời gian
      let label = option;
      let start = '01-11-2023';
      let end = '30-11-2023';
      
      if(option === 'Tất cả') { start = '25-10-2023'; end = '15-11-2023'; }
      
      setTimeRange({ start, end, label });
      setFilterModalVisible(false);
      Alert.alert("Đã lọc", `Dữ liệu theo: ${label}`);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon/></View>
        <View className="w-56 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200 justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Nhập</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Xuất</Text><SortIcon/></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã hàng */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-800">{item.code}</Text>
        </View>
        
        {/* Tên hàng */}
        <View className="w-56 px-2">
            <Text className="text-sm text-gray-800" numberOfLines={2}>{item.name}</Text>
        </View>
        
        {/* SL Nhập */}
        <View className="w-32 px-2 items-center">
            <Text className="text-sm text-gray-800">{item.importQty}</Text>
        </View>

        {/* SL Xuất */}
        <View className="w-32 px-2 items-center">
            <Text className="text-sm text-gray-800">{item.exportQty}</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: REPORTS -> Báo cáo xuất nhập */}
      <Header 
        defaultActiveMenu="REPORTS" 
        activeSubMenu="Báo cáo xuất nhập"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onImportPress={() => Alert.alert("Excel", "Xuất file Excel")} // Tái sử dụng nút Import làm nút Export Excel
        // Không có nút tạo mới hay filter nâng cao ở đây
      />

      {/* 3. Time Filter Bar (Giống phần màu xám trên web) */}
      <View className="bg-white px-3 pt-2">
          <TouchableOpacity 
            onPress={() => setFilterModalVisible(true)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
              <View className="flex-row items-center">
                  <CalendarIcon />
                  <View className="ml-2">
                      <Text className="text-xs text-gray-500">Thời gian:</Text>
                      <View className="flex-row">
                          <Text className="text-xs font-bold text-gray-800">{timeRange.start}</Text>
                          <Text className="text-xs mx-1">→</Text>
                          <Text className="text-xs font-bold text-gray-800">{timeRange.end}</Text>
                      </View>
                  </View>
              </View>
              <View className="items-end">
                  <Text className="text-xs font-bold text-blue-600">{timeRange.label}</Text>
                  <Text className="text-[10px] text-gray-400">▼</Text>
              </View>
          </TouchableOpacity>
          
          <View className="items-center py-2">
              <Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO HÀNG XUẤT NHẬP</Text>
          </View>
      </View>

      {/* 4. Content Table */}
      <View className="flex-1 bg-white px-3 pb-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}
                    <FlatList 
                        data={reportData}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có dữ liệu</Text>
                            </View>
                        }
                    />
                    
                    {/* Footer Summary (Tổng kết màu đỏ) */}
                    <View className="bg-gray-50 border-t border-gray-200 p-3">
                        <View className="flex-row justify-end mb-1">
                            <Text className="text-sm text-red-600 font-bold mr-2">
                                Tổng số lượng hàng nhập: <Text className="text-black">{totals.import}</Text>
                            </Text>
                        </View>
                        <View className="flex-row justify-end">
                            <Text className="text-sm text-red-600 font-bold mr-2">
                                Tổng số lượng hàng xuất: <Text className="text-black">{totals.export}</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL LỌC THỜI GIAN --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterModalVisible(false)}>
            <View className="bg-white rounded-t-xl p-4" onStartShouldSetResponder={() => true}>
                <Text className="text-lg font-bold text-center mb-4 text-gray-800">Chọn thời gian báo cáo</Text>
                
                {['Tất cả', 'Tháng này', 'Tháng trước', '3 tháng trước', 'Khoảng thời gian'].map((opt, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        className="py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => handleTimeFilter(opt)}
                    >
                        <Text className={`text-center text-base ${timeRange.label === opt ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                    className="mt-4 bg-gray-200 p-3 rounded-lg"
                    onPress={() => setFilterModalVisible(false)}
                >
                    <Text className="text-center font-bold text-gray-700">Đóng</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}