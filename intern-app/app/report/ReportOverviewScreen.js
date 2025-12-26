import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
// IMPORT ICONS
import { ImportExport, ReceiveReturn, Inventory, Quotation } from '../../components/Icons'; // Giả sử bạn đã có
import Header from '../../components/Header';
import reportApi from '../../api/reportApi';

// Component Card (Giữ nguyên UI của bạn)
const ReportCard = ({ title, fromDate, toDate, filterText, onFilterPress, icon, children, color }) => {
    const bgColors = { yellow: 'bg-yellow-50', green: 'bg-green-50', blue: 'bg-sky-50', pink: 'bg-pink-50' };
    const bgColor = bgColors[color] || 'bg-white';
    return (
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <View className="p-3 border-b border-gray-100">
                <Text className="text-base font-bold text-gray-800 mb-2">{title}</Text>
                <TouchableOpacity onPress={onFilterPress} className="flex-row items-center justify-between border border-gray-300 rounded px-3 py-2 bg-gray-50">
                    <View>
                        <Text className="text-xs text-gray-500 mb-1">Thời gian:</Text>
                        <View className="flex-row items-center">
                            <Text className="text-xs font-bold text-gray-700">{fromDate}</Text>
                            <Text className="text-xs text-gray-500 mx-1"> - </Text>
                            <Text className="text-xs font-bold text-gray-700">{toDate}</Text>
                        </View>
                    </View>
                    <View className="items-end"><Text className="text-xs text-gray-600 font-medium">{filterText}</Text><Text className="text-[10px] text-blue-500 mt-1">Thay đổi ▼</Text></View>
                </TouchableOpacity>
            </View>
            <View className={`p-4 flex-row items-center ${bgColor}`}>
                <View className="mr-4">{icon}</View>
                <View className="flex-1">{children}</View>
            </View>
        </View>
    );
};

export default function ReportOverviewScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [currentFilterType, setCurrentFilterType] = useState(null); // 'phieuXN', 'phieuTNTH'...

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await reportApi.getOverview();
            setData(res.data);
        } catch (error) {
            console.error("Lỗi lấy báo cáo tổng quan:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleFilterPress = (type) => {
        setCurrentFilterType(type);
        setFilterModalVisible(true);
    };

    // Xử lý lọc thời gian (Gọi API filterReportPeriodTime)
    const applyFilter = async (rangeType) => { // rangeType: 0 (all), 1 (this month), 2 (last month)...
        // Note: Controller của bạn dùng dataValue (0,1,2,3) để lọc theo khoảng thời gian định sẵn
        // Hoặc date_start, date_end để lọc tùy chỉnh.
        // Ở đây demo lọc theo dataValue.
        setFilterModalVisible(false);
        // Logic cập nhật từng phần dữ liệu riêng lẻ khá phức tạp nếu không reload lại trang.
        // Để đơn giản cho demo, bạn có thể gọi lại fetchOverview() hoặc implement logic update từng state con.
        Alert.alert("Thông báo", "Tính năng lọc chi tiết đang cập nhật...");
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOverview();
    };

    if (loading && !data) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#2563EB" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="REPORTS" activeSubMenu="Tổng quát báo cáo" />

            <ScrollView
                className="flex-1 px-3 py-3"
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {data && (
                    <>
                        {/* 1. PHIẾU XUẤT NHẬP */}
                        <ReportCard title="Báo cáo phiếu xuất nhập" fromDate={data.fromDateExIm} toDate={data.toDateExIm} filterText="Tất cả" color="yellow" icon={<ImportExport />} onFilterPress={() => handleFilterPress('phieuXN')}>
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu nhập</Text><Text className="text-sm font-bold text-yellow-600">{data.phieuNhap}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Phiếu xuất</Text><Text className="text-sm font-bold text-yellow-600">{data.phieuXuat}</Text></View>
                        </ReportCard>

                        {/* 2. PHIẾU TN-TH */}
                        <ReportCard title="Báo cáo phiếu tiếp nhận - trả hàng" fromDate={data.fromDatePhieuTNTH} toDate={data.toDatePhieuTNTH} filterText="Tất cả" color="green" icon={<ReceiveReturn />} onFilterPress={() => handleFilterPress('phieuTNTH')}>
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu tiếp nhận</Text><Text className="text-sm font-bold text-green-600">{data.phieuTiepNhan}</Text></View>
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu chưa xử lý</Text><Text className="text-sm font-bold text-green-600">{data.phieuChuaXL}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Phiếu quá hạn</Text><Text className="text-sm font-bold text-green-600">{data.phieuQuaHan}</Text></View>
                        </ReportCard>

                        {/* 3. TỒN KHO */}
                        <ReportCard title="Báo cáo tồn kho" fromDate={data.fromDateInventory} toDate={data.toDateInventory} filterText="Tất cả" color="blue" icon={<Inventory />} onFilterPress={() => handleFilterPress('baoCaoTK')}>
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm font-bold text-gray-700">Hàng tồn kho</Text>
                                <View className="flex-row"><Text className="text-sm font-bold text-sky-600">{data.tonKho} </Text><Text className="text-xs text-gray-500">({data.hangMuon} hàng mượn)</Text></View>
                            </View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Tới hạn bảo trì</Text><Text className="text-sm font-bold text-sky-600">{data.toiHanBT}</Text></View>
                        </ReportCard>

                        {/* 4. HÀNG XUẤT NHẬP */}
                        <ReportCard title="Báo cáo hàng xuất nhập" fromDate={data.fromDateProductExIm} toDate={data.toDateProductExIm} filterText="Tất cả" color="pink" icon={<ImportExport />} onFilterPress={() => handleFilterPress('hangXN')}>
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Hàng nhập</Text><Text className="text-sm font-bold text-pink-600">{data.hangNhap}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Hàng xuất</Text><Text className="text-sm font-bold text-pink-600">{data.hangXuat}</Text></View>
                        </ReportCard>

                        {/* 5. BÁO GIÁ */}
                        <ReportCard title="Báo cáo phiếu báo giá" fromDate={data.fromDateQuotation} toDate={data.toDateQuotation} filterText="Tất cả" color="blue" icon={<Quotation />} onFilterPress={() => handleFilterPress('phieuBG')}>
                            <View className="flex-row justify-between items-center mb-2 border-b border-gray-200 pb-2 border-dashed">
                                <View><Text className="text-sm font-bold text-gray-700">Hoàn thành ({data.phieuHoanThanh})</Text></View>
                                <Text className="text-sm font-bold text-sky-600">{new Intl.NumberFormat('vi-VN').format(data.tongTienHoanThanh)} ₫</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <View><Text className="text-sm font-bold text-gray-700">Không đồng ý ({data.phieuKhongDongY})</Text></View>
                                <Text className="text-sm font-bold text-pink-500">{new Intl.NumberFormat('vi-VN').format(data.tongTienKhongDongY)} ₫</Text>
                            </View>
                        </ReportCard>
                    </>
                )}
            </ScrollView>

            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterModalVisible(false)}>
                    <View className="bg-white rounded-t-xl p-4">
                        <Text className="text-lg font-bold text-center mb-4">Lọc thời gian</Text>
                        {['Tất cả', 'Tháng này', 'Tháng trước', '3 tháng trước'].map((opt, idx) => (
                            <TouchableOpacity key={idx} className="py-3 border-b border-gray-100" onPress={() => applyFilter(idx)}>
                                <Text className="text-center text-base text-gray-700">{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}