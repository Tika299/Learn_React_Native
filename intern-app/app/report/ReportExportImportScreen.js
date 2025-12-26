import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, CalendarIcon } from '../../components/Icons';
import reportApi from '../../api/reportApi';

export default function ReportExportImportScreen() {
    const [searchText, setSearchText] = useState('');
    const [reportData, setReportData] = useState([]);
    const [fullData, setFullData] = useState([]); // Dữ liệu gốc để search client-side
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await reportApi.getExportImport(); // Gọi API
            if (res.data.status === 'success') {
                setReportData(res.data.data);
                setFullData(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        return reportData.reduce((acc, item) => {
            acc.import += parseInt(item.total_import);
            acc.export += parseInt(item.total_export);
            return acc;
        }, { import: 0, export: 0 });
    }, [reportData]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text) {
            const filtered = fullData.filter(item =>
                item.product_code.toLowerCase().includes(text.toLowerCase()) ||
                item.product_name.toLowerCase().includes(text.toLowerCase())
            );
            setReportData(filtered);
        } else {
            setReportData(fullData);
        }
    };

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-2"><Text className="text-sm text-gray-800">{item.product_code}</Text></View>
            <View className="w-56 px-2"><Text className="text-sm text-gray-800" numberOfLines={2}>{item.product_name}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800">{item.total_import}</Text></View>
            <View className="w-32 px-2 items-center"><Text className="text-sm text-gray-800">{item.total_export}</Text></View>
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
            <ActionToolbar searchText={searchText} setSearchText={handleSearch} onImportPress={() => Alert.alert("Excel", "Xuất file")} />

            {/* Time Filter UI (Giữ nguyên) */}
            <View className="bg-white px-3 pt-2">
                <TouchableOpacity className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <View className="flex-row items-center">
                        <CalendarIcon />
                        <View className="ml-2"><Text className="text-xs text-gray-500">Thời gian:</Text><Text className="text-xs font-bold text-gray-800">Tất cả</Text></View>
                    </View>
                </TouchableOpacity>
                <View className="items-center py-2"><Text className="text-sm font-bold text-gray-700 uppercase">BÁO CÁO HÀNG XUẤT NHẬP</Text></View>
            </View>

            <View className="flex-1 bg-white px-3 pb-2">
                <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            {renderTableHeader()}
                            {loading ? <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} /> :
                                <FlatList data={reportData} renderItem={renderTableRow} keyExtractor={item => item.product_id.toString()} />
                            }
                            <View className="bg-gray-50 border-t border-gray-200 p-3">
                                <View className="flex-row justify-end mb-1"><Text className="text-sm text-red-600 font-bold mr-2">Tổng nhập: <Text className="text-black">{totals.import}</Text></Text></View>
                                <View className="flex-row justify-end"><Text className="text-sm text-red-600 font-bold mr-2">Tổng xuất: <Text className="text-black">{totals.export}</Text></Text></View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}