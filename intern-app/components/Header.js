import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { router } from 'expo-router'; // 1. Import router từ Expo
import { NotificationIcon, UserIcon } from './Icons'; // Đảm bảo đường dẫn đúng

// 2. CẬP NHẬT LINK ROUTE CHO KHỚP VỚI CẤU TRÚC FILE EXPO CỦA BẠN
const MENU_DATA = {
  SETUP: [
    { name: 'Nhân viên', route: '/setup/UserScreen' },
    { name: 'Khách hàng', route: '/setup/CustomerScreen' },
    { name: 'Nhà cung cấp', route: '/setup/ProviderScreen' },
    { name: 'Hàng hoá', route: '/setup/ProductScreen' },
    { name: 'Nhóm đối tượng', route: '/setup/GroupScreen' },
    { name: 'Kho', route: '/setup/WarehouseScreen' },
  ],
  OPERATIONS: [
    { name: 'Phiếu nhập hàng', route: '/warehouse/ImportScreen' },
    { name: 'Phiếu xuất hàng', route: '/warehouse/ExportScreen' },
    { name: 'Tra cứu tồn kho', route: '/warehouse/InventoryLookupScreen' },
    { name: 'Tra cứu bảo hành', route: '/warehouse/WarrantyLookupScreen' },
    { name: 'Phiếu tiếp nhận', route: '/warehouse/ReceivingScreen' },
    { name: 'Phiếu báo giá', route: '/warehouse/QuotationScreen' },
    { name: 'Phiếu trả hàng', route: '/warehouse/ReturnFormScreen' },
    { name: 'Phiếu chuyển kho', route: '/warehouse/WarehouseTransferScreen' },
  ],
  REPORTS: [
    { name: 'Tổng quát báo cáo', route: '/report/ReportOverviewScreen' },
    { name: 'Báo cáo xuất nhập', route: '/report/ReportExportImportScreen' },
    { name: 'Báo cáo tiếp nhận - trả hàng', route: '/report/ReportReceiptReturnScreen' },
    { name: 'Báo cáo phiếu báo giá', route: '/report/ReportQuotationScreen' },
  ]
};

export default function Header({ defaultActiveMenu = null, activeSubMenu = null }) {
  const [activeMenu, setActiveMenu] = useState(defaultActiveMenu);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNotiTab, setActiveNotiTab] = useState('info');

  const toggleMenu = (menuName) => {
    setActiveMenu(menuName);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  // 3. HÀM XỬ LÝ CHUYỂN TRANG
  const handleNavigate = (item) => {
    if (item.route) {
      console.log("Navigating to:", item.route);
      router.push(item.route); // Chuyển trang bằng Expo Router
    } else {
      console.warn("Chưa cấu hình route cho:", item.name);
    }
  };

  return (
    <View className="z-50 bg-white">
      {/* --- TOP BAR --- */}
      <View className="bg-slate-800 flex-row items-center justify-between px-3 py-2 h-16 shadow-md z-50">
        <TouchableOpacity onPress={() => router.push('/')} className="mr-2">
          {/* LOGO (Sửa lại uri nếu cần) */}
          <Image
            source={{ uri: "https://placehold.co/100x40/png" }}
            className="w-24 h-10"
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* MENU CHÍNH */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mx-2">
          {['SETUP', 'OPERATIONS', 'REPORTS'].map((menuKey) => {
            const menuLabel = { SETUP: 'THIẾT LẬP', OPERATIONS: 'NGHIỆP VỤ', REPORTS: 'BÁO CÁO' };
            const isActive = activeMenu === menuKey;
            return (
              <TouchableOpacity key={menuKey} onPress={() => toggleMenu(menuKey)} className="mx-2 justify-center">
                <Text className={`font-bold text-xs ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                  {menuLabel[menuKey]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* RIGHT ICONS */}
        <View className="flex-row items-center">
          <TouchableOpacity className="mx-2 relative" onPress={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
            <NotificationIcon />
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 justify-center items-center">
              <Text className="text-[10px] text-white font-bold">0</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="mx-2" onPress={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
            <UserIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- SUB MENU BAR (MENU CON) --- */}
      {activeMenu && (
        <View className="bg-gray-200 border-b border-gray-300 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={true} className="px-2">
            {MENU_DATA[activeMenu].map((item, index) => {
              const isActive = item.name === activeSubMenu;
              return (
                <TouchableOpacity
                  key={index}
                  className={`border rounded px-3 py-2 mr-2 ${isActive ? 'bg-white border-gray-400 shadow-sm' : 'bg-white border-transparent opacity-70 border-gray-300'}`}
                  onPress={() => handleNavigate(item)}
                >
                  <Text className={`text-xs ${isActive ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {/* --- MODAL: NOTIFICATIONS --- */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable className="flex-1" onPress={() => setShowNotifications(false)}>
          <View className="absolute top-14 right-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <View className="flex-row border-b border-gray-200 mb-2">
              <TouchableOpacity
                onPress={() => setActiveNotiTab('info')}
                className={`flex-1 p-2 items-center ${activeNotiTab === 'info' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${activeNotiTab === 'info' ? 'text-indigo-600' : 'text-gray-500'}`}>Tra cứu tồn kho</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveNotiTab('history')}
                className={`flex-1 p-2 items-center ${activeNotiTab === 'history' ? 'border-b-2 border-indigo-500' : ''}`}
              >
                <Text className={`text-xs font-bold ${activeNotiTab === 'history' ? 'text-indigo-600' : 'text-gray-500'}`}>Phiếu tiếp nhận</Text>
              </TouchableOpacity>
            </View>
            <View className="h-48 justify-center items-center">
              <Text className="text-gray-400 text-xs">Không có thông báo mới</Text>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* --- MODAL: USER MENU --- */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable className="flex-1" onPress={() => setShowUserMenu(false)}>
          <View className="absolute top-14 right-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
            <View className="p-3 border-b border-gray-200 bg-gray-50">
              <Text className="text-xs text-gray-500">Đăng nhập bởi:</Text>
              <Text className="text-sm font-bold text-gray-800">thiennv@thienphattien.com</Text>
            </View>
            <TouchableOpacity className="p-3 border-b border-gray-100"><Text className="text-sm">Thông tin</Text></TouchableOpacity>
            <TouchableOpacity className="p-3"><Text className="text-sm text-red-600">Đăng xuất</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}