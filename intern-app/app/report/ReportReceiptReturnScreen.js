import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Pressable, TextInput
} from 'react-native';

// COMPONENT
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, CalendarIcon } from '../../components/Icons';

// API
import reportApi from '../../api/reportApi';

// Helper: Lấy ngày hiện tại
const getCurrentDate = () => {
    const now = new Date();
    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        quarter: Math.floor((now.getMonth() + 3) / 3)
    };
};

export default function ReportReceiptReturnScreen() {
    // --- STATE ---
    const [searchText, setSearchText] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filter State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [displayFilterLabel, setDisplayFilterLabel] = useState('Tất cả');

    // Giá trị bộ lọc (Mapping theo Controller filterReceiptReturn)
    const [filterValues, setFilterValues] = useState({
        ma: '',
        ten: '',
        type: '',   // thang, quy, nam
        month: '',
        year: '',
        quarter: '',
        date: ['', ''], // [from, to]
        so_luong_nhap: ['', ''], // [min, max] - Đại diện cho Tiếp nhận
        so_luong_xuat: ['', '']  // [min, max] - Đại diện cho Trả hàng (dựa theo logic controller cũ của bạn)
    });

    // --- EFFECT ---
    useEffect(() => {
        fetchReport();
    }, []);

    // --- API FUNCTIONS ---
    const fetchReport = async (customFilters = null) => {
        setLoading(true);
        try {
            const filtersToSend = customFilters || filterValues;

            // 1. Clean params
            const params = {};
            Object.keys(filtersToSend).forEach(key => {
                const value = filtersToSend[key];
                if (Array.isArray(value)) {
                    if (value[0] !== '' || value[1] !== '') params[key] = value;
                } else if (value) {
                    params[key] = value;
                }
            });

            console.log("Params Filter:", params);

            // 2. Call API
            const res = await reportApi.getReceiptReturn(params);

            let dataList = [];
            // Support cả 2 cấu trúc trả về (mặc định vs lọc)
            if (res.data.status === 'success') {
                dataList = res.data.data;
            } else if (Array.isArray(res.data.data)) {
                dataList = res.data.data;
            }

            setReportData(dataList || []);
        } catch (error) {
            console.error("Lỗi fetch report:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- TÍNH TỔNG ---
    const totals = useMemo(() => {
        return reportData.reduce((acc, item) => {
            acc.receive += parseInt(item.total_receive || 0);
            acc.return += parseInt(item.total_return || 0);
            return acc;
        }, { receive: 0, return: 0 });
    }, [reportData]);

    // --- CLIENT SEARCH ---
    const filteredData = useMemo(() => {
        if (!searchText) return reportData;
        const lower = searchText.toLowerCase();
        return reportData.filter(item =>
            (item.product_code && item.product_code.toLowerCase().includes(lower)) ||
            (item.product_name && item.product_name.toLowerCase().includes(lower))
        );
    }, [reportData, searchText]);

    // --- HANDLERS ---
    const onRefresh = () => {
        setRefreshing(true);
        handleClearFilter();
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchReport();
    };

    const handleClearFilter = () => {
        const emptyFilter = { ma: '', ten: '', type: '', month: '', year: '', quarter: '', date: ['', ''], so_luong_nhap: ['', ''], so_luong_xuat: ['', ''] };
        setFilterValues(emptyFilter);
        setDisplayFilterLabel('Tất cả');
        setFilterModalVisible(false);
        fetchReport(emptyFilter);
    };

    const selectQuickTime = (type) => {
        const { month, year, quarter } = getCurrentDate();
        let newFilter = { ...filterValues, type: '', month: '', year: '', quarter: '', date: ['', ''] };
        let label = 'Tất cả';

        switch (type) {
            case 'this_month':
                newFilter.type = 'thang'; newFilter.month = month; newFilter.year = year;
                label = `Tháng ${month}/${year}`;
                break;
            case 'last_month':
                let lm = month - 1; let ly = year;
                if (lm === 0) { lm = 12; ly = year - 1; }
                newFilter.type = 'thang'; newFilter.month = lm; newFilter.year = ly;
                label = `Tháng ${lm}/${ly}`;
                break;
            case 'this_quarter':
                newFilter.type = 'quy'; newFilter.quarter = quarter; newFilter.year = year;
                label = `Quý ${quarter}/${year}`;
                break;
            case 'this_year':
                newFilter.type = 'nam'; newFilter.year = year;
                label = `Năm ${year}`;
                break;
        }
        setFilterValues(newFilter);
        setDisplayFilterLabel(label);
    };

    // --- RENDER TABLE ---
    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-2"><Text className="text-sm text-gray-800">{item.product_code}</Text></View>
            <View className="w-56 px-2"><Text className="text-sm text-gray-800" numberOfLines={2}>{item.product_name}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800 font-medium">{item.total_receive}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800 font-medium">{item.total_return}</Text></View>
        </View>
    );

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon /></View>
            <View className="w-56 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center border-r border-gray-200 justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Tiếp nhận</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Đã trả</Text><SortIcon /></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="REPORTS" activeSubMenu="Báo cáo tiếp nhận - trả hàng" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                onImportPress={() => Alert.alert("Excel", "Xuất file")}
                onFilterPress={() => setFilterModalVisible(true)}
            />

            {/* Time Filter UI */}
            <View className="bg-white px-3 pt-2">
                <TouchableOpacity onPress={() => setFilterModalVisible(true)} className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <View className="flex-row items-center">
                        <CalendarIcon />
                        <View className="ml-2"><Text className="text-xs text-gray-500">Thời gian:</Text><Text className="text-xs font-bold text-gray-800">{displayFilterLabel}</Text></View>
                    </View>
                    <Text className="text-[10px] text-gray-400">▼</Text>
                </TouchableOpacity>
                <View className="items-center py-2"><Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO TIẾP NHẬN - TRẢ HÀNG</Text></View>
            </View>

            <View className="flex-1 bg-white px-3 pb-2">
                <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            {renderTableHeader()}
                            {loading ? <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} /> :
                                <FlatList
                                    data={filteredData}
                                    renderItem={renderTableRow}
                                    keyExtractor={item => item.product_id ? item.product_id.toString() : Math.random().toString()}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                                    ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500">Không có dữ liệu</Text></View>}
                                />
                            }
                            {/* Footer Summary */}
                            <View className="bg-gray-50 border-t border-gray-200 p-3">
                                <View className="flex-row justify-end mb-1"><Text className="text-sm text-gray-600 font-bold mr-2">Tổng tiếp nhận: <Text className="text-blue-600">{totals.receive}</Text></Text></View>
                                <View className="flex-row justify-end"><Text className="text-sm text-gray-600 font-bold mr-2">Tổng trả hàng: <Text className="text-red-600">{totals.return}</Text></Text></View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* --- MODAL BỘ LỌC CHI TIẾT --- */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[85%] w-full" onPress={e => e.stopPropagation()}>
                        <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                            <Text className="text-lg font-bold text-gray-800">Bộ lọc Báo cáo</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                        </View>

                        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            {/* 1. CHỌN NHANH THỜI GIAN */}
                            <Text className="font-bold text-gray-700 mb-2">Thời gian nhanh</Text>
                            <View className="flex-row flex-wrap mb-4">
                                {['this_month', 'last_month', 'this_quarter', 'this_year'].map((type) => {
                                    let label = '';
                                    if (type === 'this_month') label = 'Tháng này';
                                    if (type === 'last_month') label = 'Tháng trước';
                                    if (type === 'this_quarter') label = 'Quý này';
                                    if (type === 'this_year') label = 'Năm nay';
                                    return (
                                        <TouchableOpacity key={type} onPress={() => selectQuickTime(type)} className="bg-gray-100 px-3 py-2 rounded mr-2 mb-2 border border-gray-200">
                                            <Text className="text-gray-700">{label}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>

                            {/* 2. KHOẢNG NGÀY */}
                            <Text className="font-bold text-gray-700 mb-2">Hoặc chọn khoảng ngày</Text>
                            <View className="flex-row justify-between mb-4">
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Từ (YYYY-MM-DD)" value={filterValues.date[0]} onChangeText={t => setFilterValues({ ...filterValues, date: [t, filterValues.date[1]], type: '' })} />
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Đến (YYYY-MM-DD)" value={filterValues.date[1]} onChangeText={t => setFilterValues({ ...filterValues, date: [filterValues.date[0], t], type: '' })} />
                            </View>

                            {/* 3. THÔNG TIN HÀNG */}
                            <Text className="font-bold text-gray-700 mb-2">Thông tin hàng hóa</Text>
                            <View className="mb-3"><TextInput className="border p-2 rounded" placeholder="Mã hàng..." value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} /></View>
                            <View className="mb-4"><TextInput className="border p-2 rounded" placeholder="Tên hàng..." value={filterValues.ten} onChangeText={t => setFilterValues({ ...filterValues, ten: t })} /></View>

                            {/* 4. KHOẢNG SỐ LƯỢNG (Dùng biến so_luong_nhap để lọc Tiếp nhận, so_luong_xuat để lọc Trả hàng - theo logic backend cũ) */}
                            <Text className="font-bold text-gray-700 mb-2">Số lượng Tiếp nhận</Text>
                            <View className="flex-row justify-between mb-3">
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Min" keyboardType="numeric" value={filterValues.so_luong_nhap[0]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_nhap: [t, filterValues.so_luong_nhap[1]] })} />
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Max" keyboardType="numeric" value={filterValues.so_luong_nhap[1]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_nhap: [filterValues.so_luong_nhap[0], t] })} />
                            </View>

                            <Text className="font-bold text-gray-700 mb-2">Số lượng Trả hàng</Text>
                            <View className="flex-row justify-between mb-4">
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Min" keyboardType="numeric" value={filterValues.so_luong_xuat[0]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_xuat: [t, filterValues.so_luong_xuat[1]] })} />
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Max" keyboardType="numeric" value={filterValues.so_luong_xuat[1]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_xuat: [filterValues.so_luong_xuat[0], t] })} />
                            </View>

                        </ScrollView>
                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}