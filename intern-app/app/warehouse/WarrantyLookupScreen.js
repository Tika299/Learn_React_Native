import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Modal, Alert,
    TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Pressable
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

import warrantyApi from '../../api/warrantyApi';
// Import DropdownSelect nếu có (để chọn Khách hàng)
// import DropdownSelect from '../../components/DropdownSelect'; 

export default function WarrantyLookupScreen() {
    // --- STATE DATA ---
    const [warranties, setWarranties] = useState([]);
    const [customers, setCustomers] = useState([]); // List khách hàng cho dropdown
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- FILTER STATE ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '',       // Mã hàng
        brand: '',    // Hãng
        sn: '',       // Serial
        customer: [], // Mảng ID khách hàng
        status: []    // Trạng thái
    });

    // --- EFFECT ---
    useEffect(() => { fetchCustomers(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fetchWarranties(1, true); }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API CALLS ---
    const fetchCustomers = async () => {
        try {
            const res = await warrantyApi.getCustomers();
            if (res.data.success) setCustomers(res.data.data);
        } catch (e) { console.error(e); }
    };

    const fetchWarranties = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber, limit: 20,
                search: searchText,
                sort_by: sortBy, sort_dir: sortDir,
                ...filterValues
            };
            const res = await warrantyApi.getList(params);
            if (res.data.success) {
                const data = res.data.data;
                if (isRefresh || pageNumber === 1) {
                    setWarranties(data);
                } else {
                    setWarranties(prev => [...prev, ...data]);
                }

                // Cập nhật phân trang
                if (res.data.pagination) {
                    setPage(res.data.pagination.current_page);
                    setLastPage(res.data.pagination.last_page);
                    setTotalRecords(res.data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Lỗi tải bảo hành:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- HANDLERS ---
    const handleDelete = (id, sn) => {
        Alert.alert("Xác nhận", `Xóa bảo hành Serial: ${sn}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        const res = await warrantyApi.delete(id);
                        if (res.data.success) {
                            Alert.alert("Thành công", "Đã xóa");
                            fetchWarranties(1, true);
                        } else {
                            Alert.alert("Lỗi", res.data.message);
                        }
                    } catch (e) { Alert.alert("Lỗi", "Không thể xóa"); }
                }
            }
        ]);
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const toggleCustomerFilter = (id) => {
        let current = filterValues.customer || [];
        if (current.includes(id)) {
            setFilterValues({ ...filterValues, customer: current.filter(x => x !== id) });
        } else {
            setFilterValues({ ...filterValues, customer: [...current, id] });
        }
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchWarranties(1, true);
    };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', brand: '', sn: '', customer: [], status: [] });
        setFilterModalVisible(false);
        fetchWarranties(1, true);
    };

    // --- RENDER ---
    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-4"><Text className="text-sm font-medium text-gray-800">{item.code}</Text></View>
            <View className="w-24 px-4"><Text className="text-sm text-gray-600">{item.brand}</Text></View>
            <View className="w-40 px-4">
                <TouchableOpacity onPress={() => Alert.alert("Chi tiết", `Serial: ${item.serial}\nBảo hành: ${item.warranty_info}`)}>
                    <Text className="text-sm font-bold text-purple-700">{item.serial}</Text>
                </TouchableOpacity>
            </View>
            <View className="w-40 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.customer}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.sell_date}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={2}>{item.warranty_info}</Text></View>
            <View className="w-40 px-4">
                <Text className={`text-sm font-bold ${item.is_expired ? 'text-red-500' : 'text-green-600'}`}>
                    {item.expiry_status}
                </Text>
            </View>
            <View className="w-16 px-2 items-center">
                <TouchableOpacity onPress={() => handleDelete(item.id, item.serial)} className="p-2 bg-gray-100 rounded-full">
                    <TrashIcon />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Tra cứu bảo hành" />
            <ActionToolbar searchText={searchText} setSearchText={setSearchText} onFilterPress={() => setFilterModalVisible(true)} />
            {/* Không có nút Tạo mới ở đây vì bảo hành thường sinh ra từ Phiếu xuất */}

            <View className="flex-1 bg-white px-3 py-2">
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
                            <TouchableOpacity onPress={() => handleSort('code')} className="w-28 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('brand')} className="w-24 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Hãng</Text><SortIcon color={sortBy === 'brand' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('serial')} className="w-40 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Serial</Text><SortIcon color={sortBy === 'serial' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('customer')} className="w-40 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon color={sortBy === 'customer' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSort('sell_date')} className="w-32 px-4 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Ngày bán</Text><SortIcon color={sortBy === 'sell_date' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
                            <View className="w-48 px-4"><Text className="font-bold text-gray-700">Thông tin BH</Text></View>
                            <View className="w-40 px-4"><Text className="font-bold text-gray-700">Hạn BH</Text></View>
                            <View className="w-16 px-2 text-center"><Text className="font-bold text-gray-700">Xóa</Text></View>
                        </View>

                        {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                            <FlatList
                                data={warranties} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWarranties(1, true)} />}
                                onEndReached={() => { if (!loading && page < lastPage) fetchWarranties(page + 1); }}
                                ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không tìm thấy dữ liệu</Text></View>}
                            />}
                        <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
                    </View>
                </ScrollView>
            </View>

            {/* MODAL FILTER */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[80%] w-full" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc Bảo hành</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Mã hàng</Text><TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} /></View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Hãng</Text><TextInput className="border p-2 rounded" value={filterValues.brand} onChangeText={t => setFilterValues({ ...filterValues, brand: t })} /></View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Serial Number</Text><TextInput className="border p-2 rounded" value={filterValues.sn} onChangeText={t => setFilterValues({ ...filterValues, sn: t })} /></View>

                            <View className="mb-3"><Text className="mb-1 text-gray-600">Khách hàng</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {customers.map(c => (
                                        <TouchableOpacity key={c.id} onPress={() => toggleCustomerFilter(c.id)}
                                            className={`mr-2 px-3 py-1 border rounded ${filterValues.customer.includes(c.id) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}>
                                            <Text>{c.customer_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
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