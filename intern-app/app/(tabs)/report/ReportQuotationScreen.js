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

// --- HÀM FORMAT TIỀN TỆ ---
const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' đ';
};

// --- MOCK DATA ---
const MOCK_DATA = [
  { 
    id: '1', 
    code: 'QT-PG9ZHXDE', 
    customer: 'Nguyễn Văn An', 
    date: '10/04/2025', 
    amount: 34544667, 
    receivingCode: 'PN000001', 
    status: 'Hoàn thành' 
  },
  { 
    id: '2', 
    code: 'QT-PLLUFLTA', 
    customer: 'Cửa hàng Di Động Minh Phát', 
    date: '22/01/2025', 
    amount: 24981221, 
    receivingCode: 'PN000001', 
    status: 'Khách không đồng ý' 
  },
  { 
    id: '3', 
    code: 'QT-OVGXRZTE', 
    customer: 'Phạm Minh Đức', 
    date: '21/02/2025', 
    amount: 16120359, 
    receivingCode: 'PN000002', 
    status: 'Hoàn thành' 
  },
  { 
    id: '4', 
    code: 'QT-GNLK3XCK', 
    customer: 'Tập đoàn XYZ', 
    date: '13/10/2025', 
    amount: 18006961, 
    receivingCode: 'PN000002', 
    status: 'Đang xử lý' 
  },
];

export default function ReportQuotationScreen() {
  const [searchText, setSearchText] = useState('');
  const [reportData, setReportData] = useState(MOCK_DATA);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: '17-12-2025', end: '17-12-2025', label: 'Tất cả' });

  // --- TÍNH TOÁN TỔNG (Footer Logic) ---
  const stats = useMemo(() => {
    return reportData.reduce((acc, item) => {
        // Tổng toàn bộ
        acc.totalCount += 1;
        acc.totalAmount += item.amount;

        // Theo trạng thái
        if (item.status === 'Hoàn thành') {
            acc.completedCount += 1;
            acc.completedAmount += item.amount;
        } else if (item.status === 'Khách không đồng ý') {
            acc.rejectedCount += 1;
        }
        
        return acc;
    }, { 
        totalCount: 0, 
        totalAmount: 0, 
        completedCount: 0, 
        completedAmount: 0, 
        rejectedCount: 0 
    });
  }, [reportData]);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_DATA.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.customer.toLowerCase().includes(text.toLowerCase())
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
      setTimeRange({ ...timeRange, label: option });
      setFilterModalVisible(false);
  };

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã phiếu</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tổng tiền</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Phiếu TN</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Tình trạng</Text><SortIcon/></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã phiếu */}
        <View className="w-28 px-2">
            <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
        </View>
        
        {/* Khách hàng */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-800" numberOfLines={1}>{item.customer}</Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.date}</Text>
        </View>

        {/* Tổng tiền */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-800 font-medium">{formatCurrency(item.amount)}</Text>
        </View>

        {/* Phiếu TN */}
        <View className="w-28 px-2">
            <Text className="text-sm font-medium text-purple-700">{item.receivingCode}</Text>
        </View>

        {/* Tình trạng (Màu sắc theo trạng thái) */}
        <View className="w-32 px-2 items-center">
            <Text className={`text-xs font-bold ${
                item.status === 'Hoàn thành' ? 'text-green-600' :
                item.status === 'Khách không đồng ý' ? 'text-red-500' : 'text-gray-500'
            }`}>
                {item.status}
            </Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: REPORTS -> Báo cáo phiếu báo giá */}
      <Header 
        defaultActiveMenu="REPORTS" 
        activeSubMenu="Báo cáo phiếu báo giá"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onImportPress={() => Alert.alert("Excel", "Xuất file Excel báo cáo")}
      />

      {/* 3. Time Filter Bar */}
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
              <Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO PHIẾU BÁO GIÁ</Text>
          </View>
      </View>

      {/* 4. Content Table & Summary */}
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
                    
                    {/* 
                       Footer Summary: 
                       Được thiết kế lại dạng khối dọc để phù hợp với mobile 
                       thay vì 1 hàng ngang quá dài như web.
                    */}
                    <View className="bg-gray-50 border-t border-gray-200 p-3">
                        <View className="mb-2 border-b border-gray-200 pb-2">
                             <Text className="text-xs font-bold text-gray-500 mb-1">TỔNG QUÁT:</Text>
                             <View className="flex-row justify-between mb-1">
                                <Text className="text-sm text-gray-700">Tổng phiếu báo giá:</Text>
                                <Text className="text-sm font-bold text-red-600">{stats.totalCount}</Text>
                             </View>
                             <View className="flex-row justify-between">
                                <Text className="text-sm text-gray-700">Tổng doanh thu dự kiến:</Text>
                                <Text className="text-sm font-bold text-red-600">{formatCurrency(stats.totalAmount)}</Text>
                             </View>
                        </View>

                        <View className="mb-2 border-b border-gray-200 pb-2">
                             <Text className="text-xs font-bold text-green-600 mb-1">HOÀN THÀNH:</Text>
                             <View className="flex-row justify-between mb-1">
                                <Text className="text-sm text-gray-700">Số lượng phiếu:</Text>
                                <Text className="text-sm font-bold text-green-600">{stats.completedCount}</Text>
                             </View>
                             <View className="flex-row justify-between">
                                <Text className="text-sm text-gray-700">Tổng tiền:</Text>
                                <Text className="text-sm font-bold text-green-600">{formatCurrency(stats.completedAmount)}</Text>
                             </View>
                        </View>

                        <View>
                             <Text className="text-xs font-bold text-red-500 mb-1">TỪ CHỐI / THẤT BẠI:</Text>
                             <View className="flex-row justify-between">
                                <Text className="text-sm text-gray-700">Phiếu khách từ chối:</Text>
                                <Text className="text-sm font-bold text-red-500">{stats.rejectedCount}</Text>
                             </View>
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
            <View className="bg-white rounded-t-xl p-4">
                <Text className="text-lg font-bold text-center mb-4 text-gray-800">Chọn thời gian</Text>
                {['Tất cả', 'Tháng này', 'Tháng trước', '3 tháng trước', 'Khoảng thời gian'].map((opt, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        className="py-3 border-b border-gray-100"
                        onPress={() => handleTimeFilter(opt)}
                    >
                        <Text className={`text-center text-base ${timeRange.label === opt ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}