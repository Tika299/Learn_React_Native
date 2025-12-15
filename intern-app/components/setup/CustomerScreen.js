import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, Modal, Alert, TouchableOpacity, TextInput } from 'react-native';

// IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../Header';
import ActionToolbar from '../ActionToolbar';
import { SortIcon } from '../Icons';

export default function CustomerScreen() {
    const [searchText, setSearchText] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [customers, setCustomers] = useState([]); // Data

    // Xử lý khi nhấn vào menu con (Ví dụ nhấn vào "Khách hàng" trong dropdown)
    const handleSubMenuPress = (item) => {
        console.log("Navigating to:", item.name);
        Alert.alert("Chuyển trang", `Đi đến màn hình: ${item.name}`);
        // navigation.navigate(...) 
    };

    // --- RENDER TABLE (Phần này vẫn giữ ở screen vì cấu trúc cột khác nhau) ---
    const renderTableHeader = () => (
        <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
            <View className="w-32 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Mã KH</Text><SortIcon /></View>
            <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Tên khách hàng</Text><SortIcon /></View>
            <View className="w-48 px-2 flex-row items-center"><Text className="text-xs font-bold text-gray-700 mr-1">Địa chỉ</Text><SortIcon /></View>
            {/* ... thêm các cột khác */}
        </View>
    );

    const renderTableRow = ({ item }) => (
        <View className="flex-row border-b border-gray-100 py-3 bg-white">
            <View className="w-32 px-2"><Text className="text-sm text-gray-800">{item.code}</Text></View>
            <View className="w-48 px-2"><Text className="text-sm text-gray-800">{item.name}</Text></View>
            <View className="w-48 px-2"><Text className="text-sm text-gray-600">{item.address}</Text></View>
            {/* ... thêm các cột khác */}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            {/* 1. Header dùng chung */}
            <Header
                defaultActiveMenu="SETUP"
                activeSubMenu="Khách hàng"
                onSubMenuPress={handleSubMenuPress}
            />


            {/* 3. Toolbar dùng chung */}
            <ActionToolbar
                searchText={searchText}
                setSearchText={setSearchText}
                onFilterPress={() => setFilterModalVisible(true)}
                onCreatePress={() => Alert.alert("Tạo mới")}
                onImportPress={() => Alert.alert("Nhập Excel")} // GroupScreen thì không truyền prop này
            />

            {/* 4. Table Content (Riêng biệt cho từng màn hình) */}
            <View className="flex-1 bg-white">
                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                    <View>
                        {renderTableHeader()}
                        {customers.length > 0 ? (
                            <FlatList data={customers} renderItem={renderTableRow} keyExtractor={item => item.id} />
                        ) : (
                            <View className="p-4 w-screen items-center justify-center">
                                <Text className="text-gray-500 text-sm mt-4 italic">Không có dữ liệu</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Modal Filter (Có thể tách thành component nếu filter logic giống nhau) */}
            <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
                {/* ... Code Modal ... */}
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-4 h-2/3">
                        <Text>Nội dung bộ lọc...</Text>
                        <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text>Đóng</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}