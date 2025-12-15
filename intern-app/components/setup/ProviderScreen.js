import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    FlatList,
    Modal,
    Alert,
    TouchableOpacity,
    TextInput,
    Platform
} from 'react-native';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../Header';
import TabMenu from '../TabMenu';
import ActionToolbar from '../ActionToolbar';
import { SortIcon } from '../Icons';

// --- DỮ LIỆU MẪU NHÀ CUNG CẤP ---
const MOCK_PROVIDERS = [
    { id: '1', code: 'NCC001', name: 'Công ty TNHH Nhựa Duy Tân', address: 'Hồ Chí Minh', phone: '02838762222', email: 'info@duytan.com', note: 'Cung cấp bao bì' },
    { id: '2', code: 'NCC002', name: 'Công ty CP Sữa Việt Nam', address: 'Hồ Chí Minh', phone: '02854155555', email: 'vinamilk@vinamilk.com.vn', note: 'Nguyên liệu sữa' },
    { id: '3', code: 'NCC003', name: 'Tập đoàn Hòa Phát', address: 'Hà Nội', phone: '02462848666', email: 'prm@hoaphat.com.vn', note: 'Sắt thép' },
    { id: '4', code: 'NCC004', name: 'Công ty FPT Trading', address: 'Đà Nẵng', phone: '02363567888', email: 'trading@fpt.com.vn', note: 'Linh kiện điện tử' },
    { id: '5', code: 'NCC005', name: 'Logistics Viettel', address: 'Hà Nội', phone: '19008095', email: 'cskh@viettelpost.com.vn', note: 'Vận chuyển' },
];

export default function ProviderScreen() {
    const [searchText, setSearchText] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [providers, setProviders] = useState(MOCK_PROVIDERS);

    // --- XỬ LÝ SỰ KIỆN ---
    const handleSearch = (text) => {
        setSearchText(text);
        if (text) {
            const filtered = MOCK_PROVIDERS.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase()) ||
                item.code.toLowerCase().includes(text.toLowerCase())
            );
            setProviders(filtered);
        } else {
            setProviders(MOCK_PROVIDERS);
        }
    };

    const handleSubMenuPress = (item) => {
        console.log("Chuyển đến:", item.name);
        // navigation.navigate(...)
    };

    // --- RENDER TABLE HEADER (Tiêu đề cột) ---
    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            {/* Điều chỉnh độ rộng w-... cho phù hợp nội dung */}
            <View className="w-32 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Mã NCC</Text><SortIcon /></View>
            <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Tên nhà cung cấp</Text><SortIcon /></View>
            <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Địa chỉ</Text><SortIcon /></View>
            <View className="w-32 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Điện thoại</Text><SortIcon /></View>
            <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Email</Text><SortIcon /></View>
            <View className="w-40 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Ghi chú</Text><SortIcon /></View>
        </View>
    );

    // --- RENDER TABLE ROW (Dòng dữ liệu) ---
    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white">
            <View className="w-32 px-2"><Text className="text-sm text-gray-800 font-medium">{item.code}</Text></View>
            <View className="w-48 px-2"><Text className="text-sm text-gray-800 font-medium">{item.name}</Text></View>
            <View className="w-48 px-2"><Text className="text-sm text-gray-600">{item.address}</Text></View>
            <View className="w-32 px-2"><Text className="text-sm text-gray-600">{item.phone}</Text></View>
            <View className="w-48 px-2"><Text className="text-sm text-gray-600">{item.email}</Text></View>
            <View className="w-40 px-2"><Text className="text-sm text-gray-600">{item.note}</Text></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            {/* 1. Header dùng chung */}
            {/* Mặc định mở tab SETUP vì Nhà cung cấp nằm trong Thiết lập */}
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Nhà cung cấp"
                onSubMenuPress={handleSubMenuPress}
            />


            {/* 2. Action Toolbar dùng chung */}
            {/* Truyền đủ 3 hàm để hiển thị full nút: Filter, Import, Create */}
            <ActionToolbar
                searchText={searchText}
                setSearchText={handleSearch}
                onFilterPress={() => setFilterModalVisible(true)}
                onImportPress={() => Alert.alert("Thông báo", "Chức năng Nhập Excel Nhà Cung Cấp")}
                onCreatePress={() => Alert.alert("Thông báo", "Mở form Tạo mới Nhà Cung Cấp")}
            />

            {/* 3. Table Content */}
            <View className="flex-1 bg-white px-3 py-2">
                <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            {/* Render Header */}
                            {renderTableHeader()}

                            {/* Render List */}
                            {providers.length > 0 ? (
                                <FlatList
                                    data={providers}
                                    renderItem={renderTableRow}
                                    keyExtractor={item => item.id}
                                />
                            ) : (
                                <View className="p-10 w-screen items-center justify-center">
                                    <Text className="text-gray-500 italic">Không tìm thấy nhà cung cấp nào</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* --- MODAL BỘ LỌC (Giống CustomerScreen) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-4 h-3/4">
                        <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                            <Text className="text-lg font-bold text-gray-800">Bộ lọc Nhà cung cấp</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Text className="text-red-500 font-bold">Đóng</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {['Mã NCC', 'Tên nhà cung cấp', 'Địa chỉ', 'Điện thoại', 'Email', 'Ghi chú'].map((label, idx) => (
                                <View key={idx} className="mb-4">
                                    <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded-md p-3 bg-gray-50 text-gray-800"
                                        placeholder={`Nhập ${label.toLowerCase()}...`}
                                        // Xử lý lỗi border/focus
                                        underlineColorAndroid="transparent"
                                        style={Platform.OS === 'web' ? { outline: 'none' } : {}}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center"
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Text className="text-gray-700 font-bold">Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-600 p-3 rounded-md items-center"
                                onPress={() => {
                                    setFilterModalVisible(false);
                                    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
                                }}
                            >
                                <Text className="text-white font-bold">Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}