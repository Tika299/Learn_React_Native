import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../components/Header';
import ActionToolbar from '../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../components/Icons';

const MoreIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2">
        <Path d="M12 12h.01M12 6h.01M12 18h.01" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

// --- MOCK DATA ---
const MOCK_RECEIVINGS = [
  { 
    id: '2', 
    code: 'PN000002', 
    customer: 'Vũ Thị Hương', 
    dateCreated: '09/12/2025', 
    dateClosed: '11/12/2025', 
    type: 'Dịch vụ',
    status: 'Xử lý',
    state: 'Chưa xử lý',
    note: 'Cập nhật ghi chú mới lúc 10h'
  },
  { 
    id: '1', 
    code: 'PN000001', 
    customer: 'Nguyễn Văn An', 
    dateCreated: '11/12/2025', 
    dateClosed: '', 
    type: 'Bảo hành',
    status: 'Tiếp nhận',
    state: 'Chưa xử lý',
    note: 'Máy bị vỡ màn hình'
  },
];

export default function ReceivingScreen() {
  const [searchText, setSearchText] = useState('');
  const [receivings, setReceivings] = useState(MOCK_RECEIVINGS);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- HÀM XỬ LÝ ---
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
        const filtered = MOCK_RECEIVINGS.filter(item => 
            item.code.toLowerCase().includes(text.toLowerCase()) || 
            item.customer.toLowerCase().includes(text.toLowerCase())
        );
        setReceivings(filtered);
    } else {
        setReceivings(MOCK_RECEIVINGS);
    }
  };

  const handleSubMenuPress = (item) => {
    console.log("Navigating to:", item.name);
  };

  const handleDelete = (id, code) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu tiếp nhận ${code}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
            text: "Xóa", 
            style: "destructive",
            onPress: () => {
                setReceivings(receivings.filter(i => i.id !== id));
                Alert.alert("Thành công", "Đã xóa phiếu");
            }
        }
      ]
    );
  };

  // Mở modal tác vụ
  const openActionModal = (item) => {
      setSelectedItem(item);
      setActionModalVisible(true);
  }

  // --- RENDER TABLE HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Mã phiếu</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Khách hàng</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày lập</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ngày đóng</Text><SortIcon/></View>
        <View className="w-24 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Loại phiếu</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Tình trạng</Text><SortIcon/></View>
        <View className="w-28 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Trạng thái</Text><SortIcon/></View>
        <View className="w-40 px-2 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700 mr-1">Ghi chú</Text><SortIcon/></View>
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700"></Text></View>
    </View>
  );

  // --- RENDER TABLE ROW ---
  const renderTableRow = ({ item }) => (
    <TouchableOpacity 
        // Khi bấm vào dòng sẽ mở Modal tác vụ (thay cho Option Button hover trên web)
        onPress={() => openActionModal(item)}
        className="flex-row border-b border-gray-100 py-3 bg-white items-center active:bg-gray-50"
    >
        {/* Mã phiếu */}
        <View className="w-28 px-2">
            <Text className="text-sm font-medium text-purple-700">{item.code}</Text>
        </View>
        
        {/* Khách hàng */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-800" numberOfLines={1}>{item.customer}</Text>
        </View>
        
        {/* Ngày lập */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.dateCreated}</Text>
        </View>

        {/* Ngày đóng */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.dateClosed || '--'}</Text>
        </View>

        {/* Loại phiếu */}
        <View className="w-24 px-2">
            <Text className="text-sm text-gray-600">{item.type}</Text>
        </View>

        {/* Tình trạng */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.status}</Text>
        </View>

        {/* Trạng thái */}
        <View className="w-28 px-2">
            <Text className="text-sm text-gray-600">{item.state}</Text>
        </View>

        {/* Ghi chú */}
        <View className="w-40 px-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>{item.note}</Text>
        </View>

        {/* Nút Xóa (Xử lý riêng để không kích hoạt modal) */}
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity 
                onPress={() => handleDelete(item.id, item.code)}
                className="p-2 bg-gray-100 rounded-full"
            >
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* 1. Header */}
      <Header 
        defaultActiveMenu="OPERATIONS" 
        activeSubMenu="Phiếu tiếp nhận"
        onSubMenuPress={handleSubMenuPress}
      />

      {/* 2. Toolbar */}
      <ActionToolbar 
        searchText={searchText}
        setSearchText={handleSearch}
        onCreatePress={() => Alert.alert("Thông báo", "Tạo phiếu tiếp nhận mới")}
        onFilterPress={() => Alert.alert("Bộ lọc", "Lọc phiếu tiếp nhận")}
      />

      {/* 3. Content Table */}
      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    {renderTableHeader()}
                    <FlatList 
                        data={receivings}
                        renderItem={renderTableRow}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={
                            <View className="p-10 items-center">
                                <Text className="text-gray-500">Không có phiếu nào</Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL TÁC VỤ (Option Buttons) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable className="flex-1 bg-black/50 justify-center items-center p-4" onPress={() => setActionModalVisible(false)}>
            <View className="bg-white w-full max-w-sm rounded-lg shadow-lg p-4" onStartShouldSetResponder={() => true}>
                <View className="mb-4 border-b border-gray-200 pb-2">
                    <Text className="text-lg font-bold text-gray-800">Tác vụ: {selectedItem?.code}</Text>
                </View>
                
                {/* Danh sách nút chức năng */}
                <TouchableOpacity 
                    className="py-3 border-b border-gray-100"
                    onPress={() => {
                        setActionModalVisible(false);
                        Alert.alert("Chức năng", "Chuyển tình trạng");
                    }}
                >
                    <Text className="text-base text-gray-700 text-center">Chuyển tình trạng</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="py-3 border-b border-gray-100"
                    onPress={() => {
                        setActionModalVisible(false);
                        Alert.alert("Chức năng", "Tạo phiếu trả hàng");
                    }}
                >
                    <Text className="text-base text-blue-600 text-center">Tạo phiếu trả hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="py-3"
                    onPress={() => {
                        setActionModalVisible(false);
                        Alert.alert("Chức năng", "Tạo phiếu báo giá");
                    }}
                >
                    <Text className="text-base text-green-600 text-center">Tạo phiếu báo giá</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="mt-4 bg-gray-200 p-3 rounded-lg"
                    onPress={() => setActionModalVisible(false)}
                >
                    <Text className="text-center font-bold text-gray-700">Đóng</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}