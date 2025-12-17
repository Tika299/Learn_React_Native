import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Pressable
} from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

// 1. IMPORT HEADER
import Header from '../../../components/Header';
import {
    ImportExport,
    ReceiveReturn,
    Inventory,
    Quotation,
} from '../../../components/Icons';

// --- ICONS RIÊNG CHO BÁO CÁO (Convert từ HTML) ---

// --- COMPONENT REUSABLE: THẺ BÁO CÁO (REPORT CARD) ---
const ReportCard = ({ title, fromDate, toDate, filterText, onFilterPress, icon, children, color }) => {
    // Màu nền tiêu đề và nền icon dựa trên props color
    const bgColors = {
        yellow: 'bg-yellow-50',
        green: 'bg-green-50',
        blue: 'bg-sky-50',
        pink: 'bg-pink-50'
    };

    // Màu text tiêu đề số liệu
    const textColors = {
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        blue: 'text-sky-600',
        pink: 'text-pink-600'
    };

    const bgColor = bgColors[color] || 'bg-white';
    const textColor = textColors[color] || 'text-gray-800';

    return (
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
            {/* 1. Header: Title & Filter */}
            <View className="p-3 border-b border-gray-100">
                <Text className="text-base font-bold text-gray-800 mb-2">{title}</Text>

                {/* Date Filter Box */}
                <TouchableOpacity
                    onPress={onFilterPress}
                    className="flex-row items-center justify-between border border-gray-300 rounded px-3 py-2 bg-gray-50"
                >
                    <View>
                        <Text className="text-xs text-gray-500 mb-1">Thời gian:</Text>
                        <View className="flex-row items-center">
                            <Text className="text-xs font-bold text-gray-700">{fromDate}</Text>
                            <Text className="text-xs text-gray-500 mx-1"> - </Text>
                            <Text className="text-xs font-bold text-gray-700">{toDate}</Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-xs text-gray-600 font-medium">{filterText}</Text>
                        <Text className="text-[10px] text-blue-500 mt-1">Thay đổi ▼</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 2. Content: Icon & Data */}
            <View className={`p-4 flex-row items-center ${bgColor}`}>
                {/* Icon */}
                <View className="mr-4">
                    {icon}
                </View>

                {/* Data Lines */}
                <View className="flex-1">
                    {children}
                </View>
            </View>
        </View>
    );
};

// --- MÀN HÌNH CHÍNH: TỔNG QUÁT BÁO CÁO ---
export default function ReportOverviewScreen() {
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Hàm xử lý mở bộ lọc
    const handleFilterPress = (reportName) => {
        setSelectedReport(reportName);
        setFilterModalVisible(true);
    };

    const handleSubMenuPress = (item) => {
        console.log("Navigating to:", item.name);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            {/* 1. HEADER */}
            <Header
                defaultActiveMenu="REPORTS"
                activeSubMenu="Tổng quát báo cáo"
                onSubMenuPress={handleSubMenuPress}
            />

            <ScrollView className="flex-1 px-3 py-3" contentContainerStyle={{ paddingBottom: 20 }}>

                {/* --- 1. BÁO CÁO PHIẾU XUẤT NHẬP (Màu Vàng) --- */}
                <ReportCard
                    title="Báo cáo phiếu xuất nhập"
                    fromDate="25-10-2023"
                    toDate="15-11-2023"
                    filterText="Tất cả"
                    color="yellow"
                    icon={< ImportExport />}
                    onFilterPress={() => handleFilterPress('Phiếu XN')}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Phiếu nhập</Text>
                        <Text className="text-sm font-bold text-yellow-600">1</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-bold text-gray-700">Phiếu xuất</Text>
                        <Text className="text-sm font-bold text-yellow-600">4</Text>
                    </View>
                </ReportCard>

                {/* --- 2. BÁO CÁO PHIẾU TIẾP NHẬN - TRẢ HÀNG (Màu Xanh Lá) --- */}
                <ReportCard
                    title="Báo cáo phiếu tiếp nhận - trả hàng"
                    fromDate="09-12-2025"
                    toDate="11-12-2025"
                    filterText="Tất cả"
                    color="green"
                    icon={<ReceiveReturn />}
                    onFilterPress={() => handleFilterPress('Phiếu TN-TH')}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Phiếu tiếp nhận</Text>
                        <Text className="text-sm font-bold text-green-600">2</Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Phiếu chưa xử lý</Text>
                        <Text className="text-sm font-bold text-green-600">2</Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Phiếu quá hạn</Text>
                        <Text className="text-sm font-bold text-green-600">0</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-bold text-gray-700">Phiếu trả hàng</Text>
                        <Text className="text-sm font-bold text-green-600">0</Text>
                    </View>
                </ReportCard>

                {/* --- 3. BÁO CÁO TỒN KHO (Màu Xanh Dương) --- */}
                <ReportCard
                    title="Báo cáo tồn kho"
                    fromDate="08-12-2025"
                    toDate="11-12-2025"
                    filterText="Tất cả"
                    color="blue"
                    icon={<Inventory />}
                    onFilterPress={() => handleFilterPress('Tồn kho')}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Hàng tồn kho</Text>
                        <View className="flex-row">
                            <Text className="text-sm font-bold text-sky-600">11 </Text>
                            <Text className="text-xs text-gray-500">(1 hàng mượn)</Text>
                        </View>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-bold text-gray-700">Hàng tới hạn bảo trì</Text>
                        <Text className="text-sm font-bold text-sky-600">2</Text>
                    </View>
                </ReportCard>

                {/* --- 4. BÁO CÁO HÀNG XUẤT NHẬP (Màu Xanh Dương) --- */}
                <ReportCard
                    title="Báo cáo hàng xuất nhập"
                    fromDate="08-12-2025"
                    toDate="08-12-2025"
                    filterText="Tất cả"
                    color="blue"
                    icon={<ImportExport />} // Dùng lại icon XN
                    onFilterPress={() => handleFilterPress('Hàng XN')}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Hàng nhập</Text>
                        <Text className="text-sm font-bold text-sky-600">1</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-bold text-gray-700">Hàng xuất</Text>
                        <Text className="text-sm font-bold text-pink-600">0</Text>
                    </View>
                </ReportCard>

                {/* --- 5. BÁO CÁO HÀNG TIẾP NHẬN - TRẢ HÀNG (Màu Xanh Dương) --- */}
                <ReportCard
                    title="Báo cáo hàng tiếp nhận - trả hàng"
                    fromDate="08-12-2025"
                    toDate="11-12-2025"
                    filterText="Tất cả"
                    color="blue"
                    icon={<ReceiveReturn />} // Dùng lại icon TN
                    onFilterPress={() => handleFilterPress('Hàng TN-TH')}
                >
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-700">Hàng tiếp nhận</Text>
                        <Text className="text-sm font-bold text-sky-600">3</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-bold text-gray-700">Hàng trả hàng</Text>
                        <Text className="text-sm font-bold text-pink-600">1</Text>
                    </View>
                </ReportCard>

                {/* --- 6. BÁO CÁO PHIẾU BÁO GIÁ (Màu Xanh Dương) --- */}
                <ReportCard
                    title="Báo cáo phiếu báo giá"
                    fromDate="17-12-2025"
                    toDate="17-12-2025"
                    filterText="Tất cả"
                    color="blue"
                    icon={<Quotation />}
                    onFilterPress={() => handleFilterPress('Báo giá')}
                >
                    {/* Dòng 1: Hoàn thành */}
                    <View className="flex-row justify-between items-center mb-2 border-b border-gray-200 pb-2 border-dashed">
                        <View>
                            <Text className="text-sm font-bold text-gray-700">Phiếu hoàn thành</Text>
                            <Text className="text-xs text-gray-500">Tổng tiền</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-sm font-bold text-sky-600">0</Text>
                            <Text className="text-xs font-bold text-sky-600">0 ₫</Text>
                        </View>
                    </View>
                    {/* Dòng 2: Không đồng ý */}
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-sm font-bold text-gray-700">Khách không đồng ý</Text>
                            <Text className="text-xs text-gray-500">Tổng tiền</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-sm font-bold text-pink-500">0</Text>
                            <Text className="text-xs font-bold text-pink-500">0 ₫</Text>
                        </View>
                    </View>
                </ReportCard>

            </ScrollView>

            {/* --- MODAL BỘ LỌC THỜI GIAN (GIẢ LẬP) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterModalVisible(false)}>
                    <View className="bg-white rounded-t-xl p-4" onStartShouldSetResponder={() => true}>
                        <Text className="text-lg font-bold text-center mb-4">Lọc thời gian: {selectedReport}</Text>

                        {['Tất cả', 'Tháng này', 'Tháng trước', '3 tháng trước', 'Khoảng thời gian'].map((opt, idx) => (
                            <TouchableOpacity
                                key={idx}
                                className="py-3 border-b border-gray-100"
                                onPress={() => {
                                    setFilterModalVisible(false);
                                    Alert.alert("Đã chọn", opt);
                                }}
                            >
                                <Text className="text-center text-base text-gray-700">{opt}</Text>
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