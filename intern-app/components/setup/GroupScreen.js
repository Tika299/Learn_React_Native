import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    FlatList,
    Alert,
    TouchableOpacity
} from 'react-native';

// Import component Header mới
import Header from '../Header';
import TabMenu from '../TabMenu';
import ActionToolbar from '../ActionToolbar';
import { SortIcon } from '../Icons';

// --- MOCK DATA ---
const MOCK_DATA = [
    { id: '1', code: 'KH001', name: 'Khách hàng VIP', type: 'Khách lẻ' },
    { id: '2', code: 'NCC01', name: 'Nhà cung cấp A', type: 'Đối tác' },
    { id: '3', code: 'NV001', name: 'Nhân viên Sale', type: 'Nội bộ' },
];

export default function GroupScreen() {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState(MOCK_DATA);

    // Xử lý khi nhấn vào menu con (Ví dụ nhấn vào "Khách hàng" trong dropdown)
    const handleSubMenuPress = (item) => {
        console.log("Navigating to:", item.name);
        Alert.alert("Chuyển trang", `Đi đến màn hình: ${item.name}`);
        // navigation.navigate(...) 
    };

    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <TouchableOpacity className="flex-1 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700 mr-1">Mã đối tượng</Text>
                <SortIcon />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700 mr-1">Tên nhóm</Text>
                <SortIcon />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 px-4 flex-row items-center">
                <Text className="text-xs font-bold text-gray-700 mr-1">Loại nhóm</Text>
                <SortIcon />
            </TouchableOpacity>
        </View>
    );

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
            <View className="flex-1 px-4"><Text className="text-sm text-gray-800 font-medium">{item.code}</Text></View>
            <View className="flex-1 px-4"><Text className="text-sm text-gray-600">{item.name}</Text></View>
            <View className="flex-1 px-4"><Text className="text-sm text-gray-600">{item.type}</Text></View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            {/* 
         Sử dụng Header mới.
         defaultActiveMenu="SETUP" để khi vào trang này, 
         menu THIẾT LẬP sẽ tự động mở và hiện các mục con.
      */}
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Nhóm đối tượng"
                onSubMenuPress={handleSubMenuPress}
            />


            {/* Toolbar và Danh sách dữ liệu giữ nguyên */}
            <ActionToolbar
                searchText={searchText}
                setSearchText={setSearchText}
                onCreatePress={() => Alert.alert("Thông báo", "Chức năng Tạo mới")}
            />

            <View className="flex-1 px-3 py-3">
                <View className="bg-white rounded-lg shadow overflow-hidden flex-1 border border-gray-200">
                    {renderTableHeader()}
                    <FlatList
                        data={data}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                    />
                </View>
            </View>

        </SafeAreaView>
    );
}