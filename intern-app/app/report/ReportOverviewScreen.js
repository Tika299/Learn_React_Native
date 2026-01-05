import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Pressable, ActivityIndicator, RefreshControl
} from 'react-native';

// COMPONENTS & ICONS
import Header from '../../components/Header';
import { ImportExport, ReceiveReturn, Inventory, Quotation } from '../../components/Icons';

// API
import reportApi from '../../api/reportApi';

// --- HELPERS ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '...';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Trả về nguyên gốc nếu không parse được
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// --- COMPONENT CARD ---
const ReportCard = ({ title, fromDate, toDate, filterLabel, onFilterPress, icon, children, color }) => {
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
                            <Text className="text-xs font-bold text-gray-700">{formatDate(fromDate)}</Text>
                            <Text className="text-xs text-gray-500 mx-1"> - </Text>
                            <Text className="text-xs font-bold text-gray-700">{formatDate(toDate)}</Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-xs text-gray-600 font-medium">{filterLabel}</Text>
                        <Text className="text-[10px] text-blue-500 mt-1">Thay đổi ▼</Text>
                    </View>
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

    // Filter State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [currentFilterType, setCurrentFilterType] = useState(null);

    // Lưu label hiển thị riêng cho từng card
    const [filterLabels, setFilterLabels] = useState({
        phieuXN: 'Tất cả',
        phieuTNTH: 'Tất cả',
        baoCaoTK: 'Tất cả',
        hangXN: 'Tất cả',
        phieuBG: 'Tất cả'
    });

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

    // --- LOGIC LỌC QUAN TRỌNG NHẤT ---
    const applyFilter = async (optionIndex, optionLabel) => {
        // optionIndex: 0 (Tất cả), 1 (Tháng này), 2 (Tháng trước), 3 (3 tháng trước)
        setFilterModalVisible(false);

        // Cập nhật label hiển thị trên Card
        setFilterLabels(prev => ({ ...prev, [currentFilterType]: optionLabel }));

        try {
            // Gọi API filter
            const res = await reportApi.filterOverview(currentFilterType, optionIndex);

            if (res.data.details) {
                const newData = res.data.details;

                // Cập nhật State Data hiện tại bằng cách Merge dữ liệu mới vào
                setData(prevData => {
                    const updatedData = { ...prevData };

                    // Ánh xạ dữ liệu trả về (newData) vào đúng các biến state của từng Card
                    // Dựa vào logic trả về trong ReportController.php -> filterReportOverview

                    switch (currentFilterType) {
                        case 'phieuXN': // Xuất nhập
                            updatedData.phieuNhap = newData.phieuNhap;
                            updatedData.phieuXuat = newData.phieuXuat;
                            updatedData.fromDateExIm = newData.ngayBatDau;
                            updatedData.toDateExIm = newData.ngayKetThuc;
                            break;

                        case 'phieuTNTH': // Tiếp nhận - Trả hàng
                            updatedData.phieuTiepNhan = newData.phieuTiepNhan;
                            updatedData.phieuTraHang = newData.phieuTraHang;
                            updatedData.phieuChuaXL = newData.phieuChuaXL;
                            updatedData.phieuQuaHan = newData.phieuQuaHan;
                            updatedData.fromDatePhieuTNTH = newData.ngayBatDau;
                            updatedData.toDatePhieuTNTH = newData.ngayKetThuc;
                            break;

                        case 'baoCaoTK': // Tồn kho
                            updatedData.tonKho = newData.tonKho;
                            updatedData.hangMuon = newData.hangMuon;
                            updatedData.toiHanBT = newData.toiHanBT;
                            updatedData.fromDateInventory = newData.ngayBatDau;
                            updatedData.toDateInventory = newData.ngayKetThuc;
                            break;

                        case 'hangXN': // Hàng hóa Xuất nhập
                            updatedData.hangNhap = newData.hangNhap;
                            updatedData.hangXuat = newData.hangXuat;
                            updatedData.fromDateProductExIm = newData.ngayBatDau;
                            updatedData.toDateProductExIm = newData.ngayKetThuc;
                            break;

                        case 'phieuBG': // Báo giá
                            updatedData.phieuHoanThanh = newData.phieuHoanThanh;
                            updatedData.phieuKhongDongY = newData.phieuKhongDongY;
                            updatedData.tongTienHoanThanh = newData.tongTienHoanThanh;
                            updatedData.tongTienKhongDongY = newData.tongTienKhongDongY;
                            updatedData.fromDateQuotation = newData.ngayBatDau;
                            updatedData.toDateQuotation = newData.ngayKetThuc;
                            break;

                        default:
                            break;
                    }
                    return updatedData;
                });
            }
        } catch (e) {
            console.error("Lỗi lọc:", e);
            Alert.alert("Lỗi", "Không thể lọc dữ liệu.");
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Reset label về mặc định
        setFilterLabels({ phieuXN: 'Tất cả', phieuTNTH: 'Tất cả', baoCaoTK: 'Tất cả', hangXN: 'Tất cả', phieuBG: 'Tất cả' });
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
                        <ReportCard
                            title="Báo cáo phiếu xuất nhập"
                            fromDate={data.fromDateExIm} toDate={data.toDateExIm}
                            filterLabel={filterLabels.phieuXN}
                            color="yellow" icon={<ImportExport />}
                            onFilterPress={() => handleFilterPress('phieuXN')}
                        >
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu nhập</Text><Text className="text-sm font-bold text-yellow-600">{data.phieuNhap}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Phiếu xuất</Text><Text className="text-sm font-bold text-yellow-600">{data.phieuXuat}</Text></View>
                        </ReportCard>

                        {/* 2. PHIẾU TN-TH */}
                        <ReportCard
                            title="Báo cáo phiếu tiếp nhận - trả hàng"
                            fromDate={data.fromDatePhieuTNTH} toDate={data.toDatePhieuTNTH}
                            filterLabel={filterLabels.phieuTNTH}
                            color="green" icon={<ReceiveReturn />}
                            onFilterPress={() => handleFilterPress('phieuTNTH')}
                        >
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu tiếp nhận</Text><Text className="text-sm font-bold text-green-600">{data.phieuTiepNhan}</Text></View>
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Phiếu chưa xử lý</Text><Text className="text-sm font-bold text-green-600">{data.phieuChuaXL}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Phiếu quá hạn</Text><Text className="text-sm font-bold text-green-600">{data.phieuQuaHan}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Phiếu trả hàng</Text><Text className="text-sm font-bold text-green-600">{data.phieuTraHang}</Text></View>
                        </ReportCard>

                        {/* 3. TỒN KHO */}
                        <ReportCard
                            title="Báo cáo tồn kho"
                            fromDate={data.fromDateInventory} toDate={data.toDateInventory}
                            filterLabel={filterLabels.baoCaoTK}
                            color="blue" icon={<Inventory />}
                            onFilterPress={() => handleFilterPress('baoCaoTK')}
                        >
                            <View className="flex-row justify-between mb-1">
                                <Text className="text-sm font-bold text-gray-700">Hàng tồn kho</Text>
                                <View className="flex-row"><Text className="text-sm font-bold text-sky-600">{data.tonKho} </Text><Text className="text-xs text-gray-500">({data.hangMuon} hàng mượn)</Text></View>
                            </View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Tới hạn bảo trì</Text><Text className="text-sm font-bold text-sky-600">{data.toiHanBT}</Text></View>
                        </ReportCard>

                        {/* 4. HÀNG XUẤT NHẬP */}
                        <ReportCard
                            title="Báo cáo hàng xuất nhập"
                            fromDate={data.fromDateProductExIm} toDate={data.toDateProductExIm}
                            filterLabel={filterLabels.hangXN}
                            color="pink" icon={<ImportExport />}
                            onFilterPress={() => handleFilterPress('hangXN')}
                        >
                            <View className="flex-row justify-between mb-1"><Text className="text-sm font-bold text-gray-700">Hàng nhập</Text><Text className="text-sm font-bold text-pink-600">{data.hangNhap}</Text></View>
                            <View className="flex-row justify-between"><Text className="text-sm font-bold text-gray-700">Hàng xuất</Text><Text className="text-sm font-bold text-pink-600">{data.hangXuat}</Text></View>
                        </ReportCard>

                        {/* 5. BÁO GIÁ */}
                        <ReportCard
                            title="Báo cáo phiếu báo giá"
                            fromDate={data.fromDateQuotation} toDate={data.toDateQuotation}
                            filterLabel={filterLabels.phieuBG}
                            color="blue" icon={<Quotation />}
                            onFilterPress={() => handleFilterPress('phieuBG')}
                        >
                            <View className="flex-row justify-between items-center mb-2 border-b border-gray-200 pb-2 border-dashed">
                                <View><Text className="text-sm font-bold text-gray-700">Hoàn thành ({data.phieuHoanThanh})</Text></View>
                                <Text className="text-sm font-bold text-sky-600">{formatCurrency(data.tongTienHoanThanh)}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <View><Text className="text-sm font-bold text-gray-700">Không đồng ý ({data.phieuKhongDongY})</Text></View>
                                <Text className="text-sm font-bold text-pink-500">{formatCurrency(data.tongTienKhongDongY)}</Text>
                            </View>
                        </ReportCard>
                    </>
                )}
            </ScrollView>

            {/* MODAL LỌC (Dùng Pressable để fix lỗi click input) */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4" onPress={(e) => e.stopPropagation()}>
                        <Text className="text-lg font-bold text-center mb-4 text-gray-800">
                            Lọc thời gian
                        </Text>

                        {/* Các lựa chọn: 0, 1, 2, 3 */}
                        {[
                            { idx: 0, label: 'Tất cả' },
                            { idx: 1, label: 'Tháng này' },
                            { idx: 2, label: 'Tháng trước' },
                            { idx: 3, label: '3 tháng trước' }
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.idx}
                                className="py-3 border-b border-gray-100 active:bg-gray-50"
                                onPress={() => applyFilter(opt.idx, opt.label)}
                            >
                                <Text className="text-center text-base text-gray-700">{opt.label}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity className="mt-4 p-3 rounded-lg bg-gray-100" onPress={() => setFilterModalVisible(false)}>
                            <Text className="text-center text-gray-600 font-bold">Đóng</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}