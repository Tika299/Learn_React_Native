import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, CalendarIcon } from '../../components/Icons';

// 2. IMPORT API
import reportApi from '../../api/reportApi';

// Helper Format Tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ReportQuotationScreen() {
  const [searchText, setSearchText] = useState('');
  const [reportData, setReportData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [timeRange, setTimeRange] = useState({ label: 'Tất cả' });

  // --- 1. GỌI API ---
  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getQuotation();
      if (res.data.status === 'success') {
        // API trả về: { status: 'success', quotations: [...] }
        const data = res.data.quotations || [];
        setReportData(data);
        setFullData(data);
      } else {
        setReportData([]);
        setFullData([]);
      }
    } catch (error) {
      console.error("Lỗi lấy báo cáo báo giá:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. TÍNH TỔNG (Footer) ---
  const stats = useMemo(() => {
    return reportData.reduce((acc, item) => {
      acc.totalCount += 1;
      const amount = parseFloat(item.total_amount || 0);
      acc.totalAmount += amount;

      // Backend trả về 'status_return'
      // 3: Hoàn thành, 4: Khách không đồng ý (theo logic Controller)
      const status = parseInt(item.status_return);

      if (status === 3) {
        acc.completedCount += 1;
        acc.completedAmount += amount;
      } else if (status === 4) {
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

  // --- 3. SEARCH (Client-side) ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const lower = text.toLowerCase();
      const filtered = fullData.filter(item =>
        (item.quotation_code && item.quotation_code.toLowerCase().includes(lower)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(lower))
      );
      setReportData(filtered);
    } else {
      setReportData(fullData);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  // --- 4. RENDER UI ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
      <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã phiếu</Text><SortIcon /></View>
      <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon /></View>
      <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập</Text><SortIcon /></View>
      <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tổng tiền</Text><SortIcon /></View>
      <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Phiếu TN</Text><SortIcon /></View>
      <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Tình trạng</Text><SortIcon /></View>
    </View>
  );

  const renderTableRow = ({ item }) => {
    // Xác định trạng thái để tô màu
    const status = parseInt(item.status_return);
    let statusText = 'Đang xử lý';
    let statusColor = 'text-gray-500';

    if (status === 3) {
      statusText = 'Hoàn thành';
      statusColor = 'text-green-600';
    } else if (status === 4) {
      statusText = 'Từ chối';
      statusColor = 'text-red-500';
    } else if (status === 1 || status === 2) {
      statusText = 'Đang xử lý';
      statusColor = 'text-blue-500';
    }

    return (
      <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        <View className="w-28 px-2"><Text className="text-sm font-medium text-purple-700">{item.quotation_code}</Text></View>
        <View className="w-40 px-2"><Text className="text-sm text-gray-800" numberOfLines={1}>{item.customer_name}</Text></View>
        <View className="w-28 px-2"><Text className="text-sm text-gray-600">{item.quotation_date}</Text></View>
        <View className="w-32 px-2"><Text className="text-sm text-gray-800 font-medium">{formatCurrency(item.total_amount)}</Text></View>
        <View className="w-28 px-2"><Text className="text-sm font-medium text-purple-700">{item.form_code_receiving}</Text></View>
        <View className="w-32 px-2 items-center"><Text className={`text-xs font-bold ${statusColor}`}>{statusText}</Text></View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header defaultActiveMenu="REPORTS" activeSubMenu="Báo cáo phiếu báo giá" onSubMenuPress={handleSubMenuPress} />
      <ActionToolbar searchText={searchText} setSearchText={handleSearch} onImportPress={() => Alert.alert("Excel", "Xuất file báo cáo")} />

      <View className="bg-white px-3 pt-2">
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
          <View className="flex-row items-center">
            <CalendarIcon />
            <View className="ml-2"><Text className="text-xs text-gray-500">Thời gian:</Text><Text className="text-xs font-bold text-gray-800">{timeRange.label}</Text></View>
          </View>
          <Text className="text-[10px] text-gray-400">▼</Text>
        </TouchableOpacity>
        <View className="items-center py-2"><Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO PHIẾU BÁO GIÁ</Text></View>
      </View>

      <View className="flex-1 bg-white px-3 pb-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
            <View>
              {renderTableHeader()}

              {loading ? (
                <View className="p-10 w-screen items-center"><ActivityIndicator size="large" color="#2563EB" /></View>
              ) : (
                <FlatList
                  data={reportData}
                  renderItem={renderTableRow}
                  keyExtractor={item => item.id.toString()}
                  ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500">Không có dữ liệu</Text></View>}
                />
              )}

              {/* Footer Summary Blocks */}
              <View className="bg-gray-50 border-t border-gray-200 p-3">
                <View className="mb-2 border-b border-gray-200 pb-2">
                  <Text className="text-xs font-bold text-gray-500 mb-1">TỔNG QUÁT:</Text>
                  <View className="flex-row justify-between mb-1"><Text className="text-sm text-gray-700">Tổng phiếu:</Text><Text className="text-sm font-bold text-red-600">{stats.totalCount}</Text></View>
                  <View className="flex-row justify-between"><Text className="text-sm text-gray-700">Doanh thu dự kiến:</Text><Text className="text-sm font-bold text-red-600">{formatCurrency(stats.totalAmount)}</Text></View>
                </View>

                <View className="mb-2 border-b border-gray-200 pb-2">
                  <Text className="text-xs font-bold text-green-600 mb-1">HOÀN THÀNH:</Text>
                  <View className="flex-row justify-between mb-1"><Text className="text-sm text-gray-700">Số lượng phiếu:</Text><Text className="text-sm font-bold text-green-600">{stats.completedCount}</Text></View>
                  <View className="flex-row justify-between"><Text className="text-sm text-gray-700">Tổng tiền:</Text><Text className="text-sm font-bold text-green-600">{formatCurrency(stats.completedAmount)}</Text></View>
                </View>

                <View>
                  <Text className="text-xs font-bold text-red-500 mb-1">TỪ CHỐI / THẤT BẠI:</Text>
                  <View className="flex-row justify-between"><Text className="text-sm text-gray-700">Phiếu khách từ chối:</Text><Text className="text-sm font-bold text-red-500">{stats.rejectedCount}</Text></View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterModalVisible(false)}>
          <View className="bg-white rounded-t-xl p-4">
            <Text className="text-lg font-bold text-center mb-4">Chọn thời gian</Text>
            {['Tất cả', 'Tháng này', 'Tháng trước'].map((opt, idx) => (
              <TouchableOpacity key={idx} className="py-3 border-b border-gray-100" onPress={() => { setTimeRange({ label: opt }); setFilterModalVisible(false); }}>
                <Text className="text-center text-gray-700">{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}