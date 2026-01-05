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

export default function ReportExportImportScreen() {
    const [searchText, setSearchText] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filter State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [displayFilterLabel, setDisplayFilterLabel] = useState('Tất cả');

    // Giá trị bộ lọc
    const [filterValues, setFilterValues] = useState({
        ma: '',
        ten: '',
        type: '',   // thang, quy, nam
        month: '',
        year: '',
        quarter: '',
        date: ['', ''],
        so_luong_nhap: ['', ''],
        so_luong_xuat: ['', '']
    });

    useEffect(() => {
        fetchReport();
    }, []);

    // --- API FUNCTIONS ---
    const fetchReport = async (customFilters = null) => {
        setLoading(true);
        try {
            const filtersToSend = customFilters || filterValues;

            // 1. Làm sạch params: Loại bỏ chuỗi rỗng và mảng rỗng
            const params = {};
            Object.keys(filtersToSend).forEach(key => {
                const value = filtersToSend[key];
                if (Array.isArray(value)) {
                    // Nếu là mảng (date, so_luong...), chỉ gửi nếu có ít nhất 1 phần tử có giá trị
                    if (value[0] !== '' || value[1] !== '') {
                        params[key] = value;
                    }
                } else if (value !== '' && value !== null && value !== undefined) {
                    params[key] = value;
                }
            });

            console.log("Params gửi đi:", params); // Debug

            const res = await reportApi.getExportImport(params);

            // 2. Xử lý phản hồi API (Hỗ trợ cả 2 cấu trúc)
            let dataList = [];

            if (res.data.status === 'success') {
                // Trường hợp gọi API mặc định (reportExportImportApp)
                dataList = res.data.data;
            } else if (Array.isArray(res.data.data)) {
                // Trường hợp gọi API lọc (filterExportImport)
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
            acc.import += parseInt(item.total_import || 0);
            acc.export += parseInt(item.total_export || 0);
            return acc;
        }, { import: 0, export: 0 });
    }, [reportData]);

    // --- CLIENT-SIDE SEARCH ---
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
        handleClearFilter(); // Reset filter về mặc định khi reload
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

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-2"><Text className="text-sm text-gray-800 font-medium">{item.product_code}</Text></View>
            <View className="w-56 px-2"><Text className="text-sm text-gray-800" numberOfLines={2}>{item.product_name}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800 font-medium">{item.total_import}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800 font-medium">{item.total_export}</Text></View>
        </View>
    );

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon /></View>
            <View className="w-56 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center border-r border-gray-200 justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Nhập</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700 mr-1">SL Xuất</Text><SortIcon /></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="REPORTS" activeSubMenu="Báo cáo xuất nhập" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                onImportPress={() => Alert.alert("Excel", "Xuất file")}
                onFilterPress={() => setFilterModalVisible(true)}
            />

            <View className="bg-white px-3 pt-2">
                <TouchableOpacity
                    onPress={() => setFilterModalVisible(true)}
                    className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                >
                    <View className="flex-row items-center">
                        <CalendarIcon />
                        <View className="ml-2">
                            <Text className="text-xs text-gray-500">Thời gian:</Text>
                            <Text className="text-xs font-bold text-gray-800">{displayFilterLabel}</Text>
                        </View>
                    </View>
                    <Text className="text-[10px] text-gray-400">▼</Text>
                </TouchableOpacity>
                <View className="items-center py-2"><Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO HÀNG XUẤT NHẬP</Text></View>
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
                                    keyExtractor={item => item.product_id.toString()}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                                    ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500">Không có dữ liệu</Text></View>}
                                />
                            }
                            <View className="bg-gray-50 border-t border-gray-200 p-3">
                                <View className="flex-row justify-end mb-1"><Text className="text-sm text-gray-600 font-bold mr-2">Tổng nhập: <Text className="text-blue-600">{totals.import}</Text></Text></View>
                                <View className="flex-row justify-end"><Text className="text-sm text-gray-600 font-bold mr-2">Tổng xuất: <Text className="text-red-600">{totals.export}</Text></Text></View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* --- MODAL BỘ LỌC --- */}
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

                                    // Logic kiểm tra active đơn giản
                                    const isActive = filterValues.type === (type === 'this_year' ? 'nam' : (type === 'this_quarter' ? 'quy' : 'thang'));

                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => selectQuickTime(type)}
                                            className={`px-3 py-2 rounded mr-2 mb-2 border ${isActive ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-200'}`}
                                        >
                                            <Text className={isActive ? 'text-blue-700 font-bold' : 'text-gray-700'}>{label}</Text>
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

                            {/* 4. KHOẢNG SỐ LƯỢNG */}
                            <Text className="font-bold text-gray-700 mb-2">Số lượng Nhập</Text>
                            <View className="flex-row justify-between mb-3">
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Min" keyboardType="numeric" value={filterValues.so_luong_nhap[0]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_nhap: [t, filterValues.so_luong_nhap[1]] })} />
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Max" keyboardType="numeric" value={filterValues.so_luong_nhap[1]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_nhap: [filterValues.so_luong_nhap[0], t] })} />
                            </View>

                            <Text className="font-bold text-gray-700 mb-2">Số lượng Xuất</Text>
                            <View className="flex-row justify-between mb-4">
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Min" keyboardType="numeric" value={filterValues.so_luong_xuat[0]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_xuat: [t, filterValues.so_luong_xuat[1]] })} />
                                <TextInput className="border p-2 rounded w-[48%]" placeholder="Max" keyboardType="numeric" value={filterValues.so_luong_xuat[1]} onChangeText={t => setFilterValues({ ...filterValues, so_luong_xuat: [filterValues.so_luong_xuat[0], t] })} />
                            </View>
                        </ScrollView>

                        <View className="flex-row mt-3 border-t pt-3">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text className="font-bold text-gray-700">Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}