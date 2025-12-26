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
    ActivityIndicator,
    TextInput
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, CalendarIcon } from '../../components/Icons';

// 2. IMPORT API
import reportApi from '../../api/reportApi';

export default function ReportReceiptReturnScreen() {
    const [searchText, setSearchText] = useState('');
    const [reportData, setReportData] = useState([]); // Dữ liệu hiển thị
    const [fullData, setFullData] = useState([]);     // Dữ liệu gốc (để search)
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
            // Gọi API lấy dữ liệu báo cáo
            const res = await reportApi.getReceiptReturn();

            if (res.data.status === 'success') {
                const data = res.data.data || [];
                setReportData(data);
                setFullData(data);
            }
        } catch (error) {
            console.error("Lỗi lấy báo cáo TN-TH:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu báo cáo.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. TÍNH TỔNG TỰ ĐỘNG (Dựa trên dữ liệu đang hiển thị) ---
    const totals = useMemo(() => {
        return reportData.reduce((acc, item) => {
            // Backend trả về string, cần parse sang số
            acc.receive += parseInt(item.total_receive || 0);
            acc.return += parseInt(item.total_return || 0);
            return acc;
        }, { receive: 0, return: 0 });
    }, [reportData]);

    // --- 3. XỬ LÝ TÌM KIẾM (Client-side) ---
    const handleSearch = (text) => {
        setSearchText(text);
        if (text) {
            const lowerText = text.toLowerCase();
            const filtered = fullData.filter(item =>
                (item.product_code && item.product_code.toLowerCase().includes(lowerText)) ||
                (item.product_name && item.product_name.toLowerCase().includes(lowerText))
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
            <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon /></View>
            <View className="w-56 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center border-r border-gray-200 justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Tiếp nhận</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Đã trả</Text><SortIcon /></View>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-2">
                <Text className="text-sm text-gray-800">{item.product_code}</Text>
            </View>
            <View className="w-56 px-2">
                <Text className="text-sm text-gray-800" numberOfLines={2}>{item.product_name}</Text>
            </View>
            <View className="w-32 px-2 items-center">
                <Text className="text-sm text-gray-800 font-medium">{item.total_receive}</Text>
            </View>
            <View className="w-32 px-2 items-center">
                <Text className="text-sm text-gray-800 font-medium">{item.total_return}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="REPORTS" activeSubMenu="Báo cáo tiếp nhận - trả hàng" onSubMenuPress={handleSubMenuPress} />

            <ActionToolbar
                searchText={searchText}
                setSearchText={handleSearch}
                onImportPress={() => Alert.alert("Excel", "Xuất file Excel báo cáo")}
            />

            {/* Time Filter Bar */}
            <View className="bg-white px-3 pt-2">
                <TouchableOpacity onPress={() => setFilterModalVisible(true)} className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <View className="flex-row items-center">
                        <CalendarIcon />
                        <View className="ml-2"><Text className="text-xs text-gray-500">Thời gian:</Text><Text className="text-xs font-bold text-gray-800">{timeRange.label}</Text></View>
                    </View>
                    <Text className="text-[10px] text-gray-400">▼</Text>
                </TouchableOpacity>
                <View className="items-center py-2"><Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO HÀNG TIẾP NHẬN - TRẢ HÀNG</Text></View>
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
                                    keyExtractor={(item, index) => item.product_id ? item.product_id.toString() : index.toString()}
                                    ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500">Không có dữ liệu</Text></View>}
                                />
                            )}

                            {/* Footer Summary */}
                            <View className="bg-gray-50 border-t border-gray-200 p-3">
                                <View className="flex-row justify-end mb-1">
                                    <Text className="text-sm text-gray-600 font-bold mr-2">Tổng tiếp nhận: <Text className="text-blue-600">{totals.receive}</Text></Text>
                                </View>
                                <View className="flex-row justify-end">
                                    <Text className="text-sm text-gray-600 font-bold mr-2">Tổng trả hàng: <Text className="text-red-600">{totals.return}</Text></Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Modal Lọc Thời Gian (Demo UI) */}
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