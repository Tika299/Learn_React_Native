import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../../components/Icons';

// --- MOCK DATA (Dựa trên HTML của bạn) ---
const MOCK_USERS = [
  { id: '10', code: '', name: 'Phan Thành Nhân', role: 'Bảo hành', address: '', phone: '0867 551 488', email: 'nhanpt@thienphattien.com' },
  { id: '9', code: '', name: 'Huỳnh Lê Thiên Phúc', role: 'Bảo hành', address: '', phone: '0983 468 473', email: 'phuc.huynh@thienphattien.com' },
  { id: '8', code: '', name: 'Phạm Lê Quốc Khởi', role: 'Quản lý kho', address: '', phone: '0386 068 693', email: 'khoi.pham@thienphattien.com' },
  { id: '6', code: '', name: 'Nguyễn Thị Xuân Hậu', role: 'Kế toán', address: '', phone: '0345 051 482', email: 'hauntx@thienphattien.com' },
  { id: '5', code: '', name: 'Trần Lê Thục Uyên', role: 'Admin', address: '', phone: '0906 146 426', email: 'thucuyen.tran@thienphattien.com' },
  { id: '1', code: '', name: 'Nguyễn Văn Thiên', role: 'Admin', address: '', phone: '0908 779 167', email: 'thiennv@thienphattien.com' },
];

export default function UserScreen() {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_USERS.filter(item => 
            item.name.toLowerCase().includes(text.toLowerCase()) || 
            item.email.toLowerCase().includes(text.toLowerCase())
        );
        setUsers(filtered);
    } else {
        setUsers(MOCK_USERS);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa nhân viên ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: () => {
                setUsers(users.filter(u => u.id !== id));
                Alert.alert("Thành công", "Đã xóa nhân viên");
            }
        }
      ]
    );
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  // --- TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã NV</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tên nhân viên</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Chức vụ</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Địa chỉ</Text><SortIcon/></View>
        <View className="w-32 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Điện thoại</Text><SortIcon/></View>
        <View className="w-48 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Email</Text><SortIcon/></View>
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
    </View>
  );

  // --- TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        {/* Mã NV */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-800">{item.code || '--'}</Text>
        </View>
        
        {/* Tên NV (Màu tím, link) */}
        <View className="w-48 px-2">
            <Text className="text-sm font-medium text-purple-700">{item.name}</Text>
        </View>
        
        {/* Chức vụ (Badge Style) */}
        <View className="w-28 px-2 items-start">
            <View className="bg-cyan-100 px-2 py-1 rounded">
                <Text className="text-cyan-800 text-xs font-bold">{item.role}</Text>
            </View>
        </View>

        {/* Địa chỉ */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-600">{item.address || '--'}</Text>
        </View>

        {/* Điện thoại */}
        <View className="w-32 px-2">
            <Text className="text-sm text-gray-600">{item.phone}</Text>
        </View>

        {/* Email */}
        <View className="w-48 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.email}</Text>
        </View>

        {/* Nút Xóa */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.name)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header: Chọn SETUP và Highlight 'Nhân viên' */}
      <Header 
        defaultActiveMenu="SETUP" 
        activeSubMenu="Nhân viên"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo mới nhân viên")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Hiện modal lọc nhân viên")}
        // Có thể thêm onImportPress nếu cần
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {/* Header Nhóm */}
                    <View className="bg-white border-b border-gray-200 p-3">
                        <Text className="text-purple-700 font-medium text-sm">
                            Nhóm nhân viên: Chưa chọn nhóm
                        </Text>
                    </View>

                    {/* Table */}
                    {renderTableHeader()}
                    <FlatList 
                        data={users}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có nhân viên nào</Text>
                            </View>
                        }
                    />

                    {/* Footer Count */}
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center">
                         <Text className="text-purple-700 text-sm">
                            Có <Text className="font-bold">{users.length}</Text> nhân viên
                         </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  );
}