import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  Alert, 
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';

// 1. IMPORT CÁC COMPONENT DÙNG CHUNG
import Header from '../../../components/Header';
import ActionToolbar from '../../../components/ActionToolbar';
import { SortIcon, TrashIcon } from '../../../components/Icons';

// API
import userApi from '../../../api/userApi';

export default function UserScreen() {
  // --- STATE DATA ---
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  // Filter Data Sources (Dropdowns)
  const [userGroups, setUserGroups] = useState([]); // Danh sách nhóm
  const [rolesList, setRolesList] = useState([]);   // Danh sách vai trò

  // Filter Modal & Values
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterValues, setFilterValues] = useState({
      ma: '',
      ten: '',
      email: '',
      phone: '',
      group_id: null,
      roles: [] // Mảng ID các role được chọn
  });

  // --- EFFECT ---

  // 1. Load Group & Role khi vào màn hình
  useEffect(() => {
    fetchFilterData();
  }, []);

  // 2. Load User khi search/sort thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchUsers(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, sortDir]);

  // --- API FUNCTIONS ---

  const fetchFilterData = async () => {
      try {
          const [groupRes, roleRes] = await Promise.all([
              userApi.getGroups(),
              userApi.getRoles()
          ]);
          if (groupRes.data.success) setUserGroups(groupRes.data.data);
          if (roleRes.data.success) setRolesList(roleRes.data.data);
      } catch (error) {
          console.error("Lỗi lấy dữ liệu lọc:", error);
      }
  };

  const fetchUsers = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber === 1 && !isRefresh) setLoading(true);
    try {
        const params = {
            page: pageNumber,
            per_page: 20,
            search: searchText,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...filterValues // Spread filter values
        };

        const response = await userApi.getList(params);
        const result = response.data;

        if (result.success) {
            if (isRefresh || pageNumber === 1) {
                setUsers(result.data);
            } else {
                setUsers(prev => [...prev, ...result.data]);
            }
            setPage(result.pagination.current_page);
            setLastPage(result.pagination.last_page);
            setTotalUsers(result.total);
        }
    } catch (error) {
        console.error("Lỗi lấy danh sách nhân viên:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
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
            onPress: async () => {
                try {
                    const res = await userApi.delete(id);
                    if (res.data.success) {
                        Alert.alert("Thành công", "Đã xóa nhân viên");
                        fetchUsers(1, true); // Refresh list
                    }
                } catch (error) {
                    const msg = error.response?.data?.message || "Không thể xóa nhân viên";
                    Alert.alert("Lỗi", msg);
                }
            }
        }
      ]
    );
  };

  // --- HANDLERS ---
  const handleSort = (field) => {
    if (sortBy === field) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
        setSortBy(field);
        setSortDir('asc');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, true);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && page < lastPage) {
        setIsLoadingMore(true);
        fetchUsers(page + 1, false);
    }
  };

  const handleApplyFilter = () => {
    setFilterModalVisible(false);
    fetchUsers(1, true);
    Alert.alert("Thông báo", "Đã áp dụng bộ lọc");
  };

  const handleClearFilter = () => {
    setFilterValues({ ma: '', ten: '', email: '', phone: '', group_id: null, roles: [] });
    setFilterModalVisible(false);
    fetchUsers(1, true);
  };

  const handleRoleSelect = (roleId) => {
      // Toggle role selection
      const currentRoles = filterValues.roles;
      if (currentRoles.includes(roleId)) {
          setFilterValues({ ...filterValues, roles: currentRoles.filter(id => id !== roleId) });
      } else {
          setFilterValues({ ...filterValues, roles: [...currentRoles, roleId] });
      }
  };

  const getCurrentGroupName = () => {
      if (!filterValues.group_id) return "Chưa chọn nhóm (Tất cả)";
      const group = userGroups.find(g => g.id === filterValues.group_id);
      return group ? group.group_name : "Nhóm không xác định";
  };

  const handleSubMenuPress = (item) => {
    Alert.alert("Chuyển trang", item.name);
  };

  // --- RENDER HEADER ---
  const renderTableHeader = () => (
    <View className="flex-row bg-gray-100 border-b border-gray-200 py-3">
        <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('code')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'code' ? 'text-blue-600' : 'text-gray-700'}`}>Mã NV</Text>
            <SortIcon color={sortBy === 'code' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>
        <TouchableOpacity className="w-48 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('name')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}`}>Tên nhân viên</Text>
            <SortIcon color={sortBy === 'name' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>
        <TouchableOpacity className="w-28 px-4 flex-row items-center border-r border-gray-200" onPress={() => handleSort('role')}>
            <Text className={`text-xs font-bold mr-1 ${sortBy === 'role' ? 'text-blue-600' : 'text-gray-700'}`}>Chức vụ</Text>
            <SortIcon color={sortBy === 'role' ? '#2563EB' : '#9CA3AF'}/>
        </TouchableOpacity>
        <View className="w-40 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Địa chỉ</Text></View>
        <View className="w-32 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Điện thoại</Text></View>
        <View className="w-48 px-4 flex-row items-center border-r border-gray-200"><Text className="text-xs font-bold text-gray-700">Email</Text></View>
        <View className="w-16 px-2 flex-row items-center justify-center"><Text className="text-xs font-bold text-gray-700">Xóa</Text></View>
    </View>
  );

  // --- RENDER ROW ---
  const renderTableRow = ({ item }) => (
    <View className="flex-row border-b border-gray-100 py-3 bg-white items-center">
        <View className="w-28 px-4"><Text className="text-sm text-gray-800">{item.code}</Text></View>
        <View className="w-48 px-4"><Text className="text-sm font-medium text-purple-700">{item.name}</Text></View>
        
        {/* Role Badge */}
        <View className="w-28 px-4 items-start">
            <View className={`px-2 py-1 rounded ${
                item.role === 'Admin' ? 'bg-red-100' : 
                item.role === 'Kế toán' ? 'bg-green-100' : 'bg-cyan-100'
            }`}>
                <Text className={`text-xs font-bold ${
                    item.role === 'Admin' ? 'text-red-800' : 
                    item.role === 'Kế toán' ? 'text-green-800' : 'text-cyan-800'
                }`}>{item.role}</Text>
            </View>
        </View>

        <View className="w-40 px-4"><Text className="text-sm text-gray-600">{item.address}</Text></View>
        <View className="w-32 px-4"><Text className="text-sm text-gray-600">{item.phone}</Text></View>
        <View className="w-48 px-4"><Text className="text-sm text-gray-600" numberOfLines={1}>{item.email}</Text></View>
        
        <View className="w-16 px-2 items-center justify-center">
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 bg-gray-100 rounded-full">
                <TrashIcon />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header defaultActiveMenu="SETUP" activeSubMenu="Nhân viên" onSubMenuPress={handleSubMenuPress}/>
      <ActionToolbar 
        searchText={searchText} 
        setSearchText={setSearchText}
        onCreatePress={() => Alert.alert("Thông báo", "Chức năng tạo mới")}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      <View className="flex-1 bg-white px-3 py-2">
        <View className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
                <View>
                    <TouchableOpacity className="bg-white border-b border-gray-200 p-3" onPress={() => setFilterModalVisible(true)}>
                        <Text className="text-purple-700 font-medium text-sm">
                            Nhóm nhân viên: <Text className="font-bold">{getCurrentGroupName()}</Text>
                            <Text className="text-gray-400 text-xs ml-2"> (Nhấn để lọc)</Text>
                        </Text>
                    </TouchableOpacity>

                    {renderTableHeader()}

                    {loading && page === 1 ? (
                        <View className="p-10 w-screen items-center"><ActivityIndicator size="large" color="#2563EB" /></View>
                    ) : (
                        <FlatList 
                            data={users}
                            renderItem={renderTableRow}
                            keyExtractor={item => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={onLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0000ff" className="py-4"/> : null}
                            ListEmptyComponent={<View className="p-10 w-screen items-center"><Text className="text-gray-500 italic">Không có nhân viên nào</Text></View>}
                        />
                    )}
                    
                    <View className="bg-gray-50 border-t border-gray-200 p-3 flex-row justify-end items-center w-full">
                         <Text className="text-purple-700 text-sm">Có <Text className="font-bold">{totalUsers}</Text> nhân viên</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </View>

      {/* --- MODAL FILTER --- */}
      <Modal animationType="slide" transparent={true} visible={filterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
             <View className="bg-white rounded-t-xl p-4 h-5/6 w-full">
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mb-3">
                    <Text className="text-lg font-bold text-gray-800">Bộ lọc Nhân viên</Text>
                    <TouchableOpacity onPress={() => setFilterModalVisible(false)}><Text className="text-gray-500 font-bold">Đóng</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Basic Inputs */}
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Mã NV</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ma} onChangeText={(val) => setFilterValues({...filterValues, ma: val})} placeholder="Nhập mã nhân viên..." />
                    </View>
                    <View className="mb-4"><Text className="text-sm font-medium text-gray-700 mb-1">Tên nhân viên</Text>
                        <TextInput className="border border-gray-300 rounded-md p-3 bg-gray-50" value={filterValues.ten} onChangeText={(val) => setFilterValues({...filterValues, ten: val})} placeholder="Nhập tên nhân viên..." />
                    </View>

                    {/* Filter Group */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Nhóm nhân viên</Text>
                        <View className="flex-row flex-wrap">
                            <TouchableOpacity className={`px-3 py-2 rounded-full border mr-2 mb-2 ${filterValues.group_id === null ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'}`} onPress={() => setFilterValues({...filterValues, group_id: null})}>
                                <Text className={filterValues.group_id === null ? 'text-blue-700 font-bold' : 'text-gray-600'}>Tất cả</Text>
                            </TouchableOpacity>
                            {userGroups.map(group => (
                                <TouchableOpacity key={group.id} className={`px-3 py-2 rounded-full border mr-2 mb-2 ${filterValues.group_id === group.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'}`} onPress={() => setFilterValues({...filterValues, group_id: group.id})}>
                                    <Text className={filterValues.group_id === group.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>{group.group_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Filter Roles */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Chức vụ (Vai trò)</Text>
                        <View className="flex-row flex-wrap">
                             {rolesList.map(role => (
                                <TouchableOpacity key={role.id} 
                                    className={`px-3 py-2 rounded-md border mr-2 mb-2 ${filterValues.roles.includes(role.id) ? 'bg-purple-100 border-purple-500' : 'bg-gray-100 border-gray-300'}`} 
                                    onPress={() => handleRoleSelect(role.id)}>
                                    <Text className={filterValues.roles.includes(role.id) ? 'text-purple-700 font-bold' : 'text-gray-600'}>{role.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View className="mt-4 pt-3 border-t border-gray-200 flex-row">
                    <TouchableOpacity className="flex-1 bg-gray-200 p-3 rounded-md mr-2 items-center" onPress={handleClearFilter}><Text className="text-gray-700 font-bold">Đặt lại</Text></TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded-md items-center" onPress={handleApplyFilter}><Text className="text-white font-bold">Áp dụng</Text></TouchableOpacity>
                </View>
             </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}