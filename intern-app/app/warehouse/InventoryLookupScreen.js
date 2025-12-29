import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, FlatList, Alert,
    TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, Pressable
} from 'react-native';

import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon } from '../../components/Icons';
import inventoryApi from '../../api/inventoryApi';

// Component Dropdown (Nếu bạn đã tạo ở bước trước, hãy import vào)
// import DropdownSelect from '../../components/DropdownSelect'; 
// Nếu chưa có, dùng ScrollView horizontal tạm thời như các màn hình khác.

export default function InventoryLookupScreen() {
    // --- STATE LIST ---
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');

    // --- STATE DROPDOWN DATA ---
    const [providers, setProviders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // --- FILTER STATE ---
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState({
        ma: '',       // Mã hàng
        ten: '',      // Tên hàng
        brand: '',    // Hãng
        sn: '',       // Serial
        provider: [], // Mảng ID nhà cung cấp
        status: [],   // Mảng trạng thái (1: Trong kho, 5: Đang mượn)
        date_from: '',
        date_to: ''
    });

    // --- EFFECT ---
    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInventory(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, sortBy, sortDir]);

    // --- API FUNCTIONS ---

    const fetchDropdowns = async () => {
        try {
            const [pRes, wRes] = await Promise.all([
                inventoryApi.getProviders(),
                inventoryApi.getWarehouses()
            ]);
            if (pRes.data.success) setProviders(pRes.data.data);
            if (wRes.data.success) setWarehouses(wRes.data.data);
        } catch (e) { console.error("Lỗi dropdown:", e); }
    };

    const fetchInventory = async (pageNumber = 1, isRefresh = false) => {
        if (pageNumber === 1 && !isRefresh) setLoading(true);
        try {
            const params = {
                page: pageNumber,
                limit: 20, // Backend dùng limit hoặc per_page đều được (Laravel paginate mặc định per_page)
                search: searchText,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...filterValues
            };

            const res = await inventoryApi.getList(params);
            if (res.data.success) {
                const data = res.data.data || [];
                if (isRefresh) {
                    setInventory(data);
                } else {
                    setInventory(prev => [...prev, ...data]);
                }
                // Cập nhật phân trang
                if (res.data.pagination) {
                    setPage(res.data.pagination.current_page);
                    setLastPage(res.data.pagination.last_page);
                    setTotalRecords(res.data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Lỗi lấy tồn kho:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- HANDLERS ---
    const handleSort = (field) => {
        if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInventory(1, true);
    };

    const onLoadMore = () => {
        if (!loading && page < lastPage) {
            fetchInventory(page + 1, false);
        }
    };

    const handleApplyFilter = () => {
        setFilterModalVisible(false);
        fetchInventory(1, true);
    };

    const handleClearFilter = () => {
        setFilterValues({ ma: '', ten: '', brand: '', sn: '', provider: [], status: [], date_from: '', date_to: '' });
        setFilterModalVisible(false);
        fetchInventory(1, true);
    };

    // Chọn NCC (Multi-select logic đơn giản)
    const toggleProvider = (id) => {
        let current = filterValues.provider || [];
        if (current.includes(id)) {
            setFilterValues({ ...filterValues, provider: current.filter(x => x !== id) });
        } else {
            setFilterValues({ ...filterValues, provider: [...current, id] });
        }
    };

    // Chọn Trạng thái
    const toggleStatus = (val) => {
        let current = filterValues.status || [];
        if (current.includes(val)) {
            setFilterValues({ ...filterValues, status: current.filter(x => x !== val) });
        } else {
            setFilterValues({ ...filterValues, status: [...current, val] });
        }
    };

    // --- RENDER TABLE ROW ---
    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="w-28 px-4"><Text className="text-sm font-medium text-gray-800">{item.code}</Text></View>
            <View className="w-48 px-4"><Text className="text-sm text-gray-800" numberOfLines={2}>{item.name}</Text></View>
            <View className="w-24 px-4"><Text className="text-sm text-gray-600">{item.brand}</Text></View>

            {/* Serial */}
            <View className="w-40 px-4">
                {item.serial && item.serial !== '--' ? (
                    <Text className="text-sm font-medium text-purple-700">{item.serial}</Text>
                ) : (
                    <Text className="text-sm text-gray-400">--</Text>
                )}
            </View>

            <View className="w-40 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.provider}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.import_date}</Text></View>
            <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.warehouse}</Text></View>

            {/* Tồn kho (Số lượng) */}
            <View className="w-24 px-4 items-center">
                <Text className="text-sm font-bold text-gray-800">{item.quantity}</Text>
            </View>

            {/* Trạng thái */}
            <View className="w-32 px-4">
                <Text className={`text-sm ${item.status === 'Tới hạn bảo trì' ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                    {item.status}
                </Text>
            </View>
        </View>
    );

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity onPress={() => handleSort('code')} className="w-28 px-4 border-r border-gray-200 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Mã hàng</Text><SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('name')} className="w-48 px-4 border-r border-gray-200 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Tên hàng</Text><SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
            <View className="w-24 px-4 border-r border-gray-200"><Text className="font-bold text-gray-700">Hãng</Text></View>
            <TouchableOpacity onPress={() => handleSort('serial')} className="w-40 px-4 border-r border-gray-200 flex-row items-center"><Text className="font-bold text-gray-700 mr-1">Serial</Text><SortIcon color={sortBy === 'serial' ? '#2563EB' : '#9CA3AF'} /></TouchableOpacity>
            <View className="w-40 px-4 border-r border-gray-200"><Text className="font-bold text-gray-700">Nhà cung cấp</Text></View>
            <View className="w-32 px-4 border-r border-gray-200"><Text className="font-bold text-gray-700">Ngày nhập</Text></View>
            <View className="w-32 px-4 border-r border-gray-200"><Text className="font-bold text-gray-700">Kho</Text></View>
            <View className="w-24 px-4 border-r border-gray-200 flex-row justify-center"><Text className="font-bold text-gray-700">SL Tồn</Text></View>
            <View className="w-32 px-4"><Text className="font-bold text-gray-700">Trạng thái</Text></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header defaultActiveMenu="OPERATIONS" activeSubMenu="Tra cứu tồn kho" />
            <ActionToolbar
                searchText={searchText} setSearchText={setSearchText}
                // Màn hình này thường chỉ để xem, không có nút tạo mới
                onFilterPress={() => setFilterModalVisible(true)}
                onImportPress={() => Alert.alert("Excel", "Xuất báo cáo tồn kho")}
            />

            <View className="flex-1 bg-white px-3 py-2">
                <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            {renderTableHeader()}
                            {loading && page === 1 ? <ActivityIndicator size="large" color="blue" className="mt-4" /> :
                                <FlatList
                                    data={inventory} renderItem={renderTableRow} keyExtractor={i => i.id.toString()}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                                    onEndReached={onLoadMore}
                                    ListEmptyComponent={<View className="p-10"><Text className="text-center text-gray-500">Không tìm thấy dữ liệu</Text></View>}
                                />}
                            <View className="bg-gray-50 border-t p-2 items-end"><Text>Tổng số: {totalRecords}</Text></View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* --- MODAL FILTER --- */}
            <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setFilterModalVisible(false)}>
                    <Pressable className="bg-white rounded-t-xl p-4 h-[85%] w-full" onPress={e => e.stopPropagation()}>
                        <Text className="text-lg font-bold mb-3 border-b pb-2">Bộ lọc Tồn kho</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Mã hàng</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.ma} onChangeText={t => setFilterValues({ ...filterValues, ma: t })} />
                            </View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Tên hàng</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.ten} onChangeText={t => setFilterValues({ ...filterValues, ten: t })} />
                            </View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Hãng</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.brand} onChangeText={t => setFilterValues({ ...filterValues, brand: t })} />
                            </View>
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Serial</Text>
                                <TextInput className="border p-2 rounded" value={filterValues.sn} onChangeText={t => setFilterValues({ ...filterValues, sn: t })} />
                            </View>

                            {/* Filter Provider (Multi Select) */}
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Nhà cung cấp</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {providers.map(p => (
                                        <TouchableOpacity key={p.id} onPress={() => toggleProvider(p.id)}
                                            className={`mr-2 px-3 py-1 border rounded ${filterValues.provider.includes(p.id) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}>
                                            <Text>{p.provider_name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Filter Status */}
                            <View className="mb-3"><Text className="mb-1 text-gray-600">Trạng thái</Text>
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => toggleStatus(1)} className={`mr-2 px-3 py-1 border rounded ${filterValues.status.includes(1) ? 'bg-green-100 border-green-500' : 'bg-gray-50'}`}><Text>Trong kho</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStatus(5)} className={`mr-2 px-3 py-1 border rounded ${filterValues.status.includes(5) ? 'bg-yellow-100 border-yellow-500' : 'bg-gray-50'}`}><Text>Đang mượn</Text></TouchableOpacity>
                                </View>
                            </View>

                            {/* Date Filter (Simple Text Input for demo) */}
                            <View className="flex-row justify-between">
                                <View className="w-[48%] mb-3"><Text className="mb-1 text-gray-600">Từ ngày</Text>
                                    <TextInput className="border p-2 rounded" value={filterValues.date_from} onChangeText={t => setFilterValues({ ...filterValues, date_from: t })} placeholder="YYYY-MM-DD" />
                                </View>
                                <View className="w-[48%] mb-3"><Text className="mb-1 text-gray-600">Đến ngày</Text>
                                    <TextInput className="border p-2 rounded" value={filterValues.date_to} onChangeText={t => setFilterValues({ ...filterValues, date_to: t })} placeholder="YYYY-MM-DD" />
                                </View>
                            </View>
                        </ScrollView>

                        <View className="mt-4 pt-3 border-t flex-row">
                            <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded mr-2 items-center" onPress={handleClearFilter}><Text>Đặt lại</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

        </SafeAreaView>
    );
}