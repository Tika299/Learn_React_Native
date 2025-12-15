import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {NotificationIcon,UserIcon} from './Icons';

// DATA MENU (Giữ nguyên)
const MENU_DATA = {
  SETUP: [
    { name: 'Nhóm đối tượng', link: '/groups' },
    { name: 'Khách hàng', link: '/customers' },
    { name: 'Nhà cung cấp', link: '/providers' },
    { name: 'Hàng hoá', link: '/products' },
    { name: 'Nhân viên', link: '/users' },
    { name: 'Kho', link: '/warehouses' },
  ],
  OPERATIONS: [
    { name: 'Phiếu nhập hàng', link: '/imports' },
    { name: 'Phiếu xuất hàng', link: '/exports' },
    { name: 'Tra cứu tồn kho', link: '/inventoryLookup' },
    { name: 'Tra cứu bảo hành', link: '/warrantyLookup' },
    { name: 'Phiếu tiếp nhận', link: '/receivings' },
    { name: 'Phiếu báo giá', link: '/quotations' },
    { name: 'Phiếu trả hàng', link: '/returnforms' },
    { name: 'Phiếu chuyển kho', link: '/transfers' },
  ],
  REPORTS: [
    { name: 'Tổng quát báo cáo', link: '/overview' },
    { name: 'Báo cáo xuất nhập', link: '/export-import' },
    { name: 'Báo cáo tiếp nhận - trả hàng', link: '/receipt-return' },
    { name: 'Báo cáo phiếu báo giá', link: '/report-quotation' },
  ]
};

// --- NHẬN THÊM PROP: activeSubMenu ---
export default function Header({ defaultActiveMenu = null, activeSubMenu = null, onSubMenuPress }) {
  const [activeMenu, setActiveMenu] = useState(defaultActiveMenu);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNotiTab, setActiveNotiTab] = useState('info');

  const toggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      // Nếu bấm lại menu đang mở thì đóng nó (hoặc giữ nguyên tùy logic bạn muốn)
      // Ở đây ta giữ nguyên để trải nghiệm tốt hơn
      return;
    } else {
      setActiveMenu(menuName);
      setShowNotifications(false);
      setShowUserMenu(false);
    }
  };

  return (
    <View className="z-50">
      {/* --- TOP BAR --- */}
      <View className="bg-slate-800 flex-row items-center justify-between px-3 py-2 h-16 shadow-md z-50">
        {/* LOGO */}
        <View className="mr-2">
          <Image
            source={{ uri: "http://localhost:8000/images/loto-tpp.png" }}
            className="w-24 h-10"
            resizeMode="contain"
          />
        </View>

        {/* MENU CHÍNH */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mx-2">
          {['SETUP', 'OPERATIONS', 'REPORTS'].map((menuKey) => {
            // Map tên hiển thị
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

        {/* RIGHT ICONS (Notification & User) - GIỮ NGUYÊN CODE CŨ */}
        <View className="flex-row items-center">
          <TouchableOpacity className="mx-2 relative" onPress={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); setActiveMenu(null); }}>
            <NotificationIcon />
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 justify-center items-center">
              <Text className="text-[10px] text-white font-bold">0</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="mx-2" onPress={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setActiveMenu(null); }}>
            <UserIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- SUB MENU BAR (MENU CON) --- */}
      {activeMenu && (
        <View className="bg-gray-200 border-b border-gray-300 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
            {MENU_DATA[activeMenu].map((item, index) => {
              // --- LOGIC ACTIVE Ở ĐÂY ---
              const isActive = item.name === activeSubMenu;

              return (
                <TouchableOpacity
                  key={index}
                  className={`border rounded px-3 py-2 mr-2 ${isActive
                    ? 'bg-white border-gray-400 shadow-sm' // Style khi Active
                    : 'bg-white border-transparent opacity-70 border-gray-300' // Style khi Inactive
                    }`}
                  onPress={() => onSubMenuPress && onSubMenuPress(item)}
                >
                  <Text className={`text-xs ${isActive
                    ? 'text-gray-900 font-bold' // Text khi Active
                    : 'text-gray-600 font-medium' // Text khi Inactive
                    }`}>
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