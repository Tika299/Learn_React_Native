import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Modal, 
  Pressable 
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// --- DATA CẤU HÌNH MENU ---
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
    { name: 'Phiếu báo giá', link: '/receivings' },
    { name: 'Phiếu trả hàng', link: '/receivings' },
    { name: 'Phiếu chuyển kho', link: '/receivings' },
  ],
  REPORTS: [
    { name: 'Tổng quát báo cáo', link: '/overview' },
    { name: 'Báo cáo xuất nhập', link: '/export-import' },
    { name: 'Báo cáo tiếp nhận -  trả hàng', link: '/export-import' },
    { name: 'Báo cáo phiếu báo giá', link: '/export-import' },
  ]
};

export default function HeaderDashboard() {
  // State quản lý việc mở các menu
  const [activeMenu, setActiveMenu] = useState(null); // 'SETUP', 'OPERATIONS', 'REPORTS' hoặc null
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNotiTab, setActiveNotiTab] = useState('info'); // 'info' hoặc 'history'

  // Hàm toggle menu chính
  const toggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
      setShowNotifications(false); // Đóng các menu khác
      setShowUserMenu(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* --- HEADER BAR (FIXED) --- */}
      <View className="bg-slate-800 flex-row items-center justify-between px-3 py-2 z-50 shadow-md h-16">
        
        {/* 1. LOGO */}
        <View className="mr-2">
          <Image
             // Thay localhost bằng IP nếu chạy thiết bị thật
            source={{ uri: "http://localhost:8000/images/loto-tpp.png" }} 
            className="w-24 h-10"
            resizeMode="contain"
          />
        </View>

        {/* 2. MENU ITEMS (Ẩn trên màn hình quá nhỏ, hiển thị dạng cuộn ngang) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mx-2" style={{position: 'relative',left:'50%', transform: [{ translateX: '-20%' }]}}>
          <TouchableOpacity onPress={() => toggleMenu('SETUP')} className="mx-2 justify-center">
            <Text className={`font-bold text-xs ${activeMenu === 'SETUP' ? 'text-yellow-400' : 'text-white'}`}>
              THIẾT LẬP
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => toggleMenu('OPERATIONS')} className="mx-2 justify-center">
            <Text className={`font-bold text-xs ${activeMenu === 'OPERATIONS' ? 'text-yellow-400' : 'text-white'}`}>
              NGHIỆP VỤ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleMenu('REPORTS')} className="mx-2 justify-center">
            <Text className={`font-bold text-xs ${activeMenu === 'REPORTS' ? 'text-yellow-400' : 'text-white'}`}>
              BÁO CÁO
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 3. RIGHT ICONS (Notification & User) */}
        <View className="flex-row items-center">
          
          {/* Notification Icon */}
          <TouchableOpacity 
            className="mx-2 relative" 
            onPress={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setActiveMenu(null);
            }}
          >
            <Svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <Path fillRule="evenodd" clipRule="evenodd" d="M15.4487 20.584C15.8913 20.584 16.25 20.934 16.25 21.3657V21.746C16.25 21.7459 16.25 21.746 16.25 21.746C16.2501 22.5868 15.9079 23.3935 15.2986 23.9882C14.6892 24.5829 13.8627 24.9171 13.0007 24.9173C12.1388 24.9175 11.312 24.5836 10.7024 23.9891C10.0928 23.3947 9.75019 22.5883 9.75 21.7474V21.3667C9.75 20.935 10.1087 20.585 10.5513 20.585C10.9938 20.585 11.3526 20.935 11.3526 21.3667V21.747C11.3526 21.747 11.3526 21.7471 11.3526 21.747C11.3527 22.1732 11.5264 22.5821 11.8353 22.8834C12.1444 23.1847 12.5634 23.354 13.0004 23.3539C13.4373 23.3538 13.8563 23.1844 14.1652 22.8829C14.4741 22.5814 14.6475 22.1726 14.6474 21.7463V21.3657C14.6474 20.934 15.0062 20.584 15.4487 20.584Z" fill="white"/>
              <Path fillRule="evenodd" clipRule="evenodd" d="M13.3309 1.08398C12.9779 1.08398 12.6283 1.14736 12.3021 1.27049C11.976 1.39363 11.6796 1.5741 11.43 1.80162C11.1804 2.02914 10.9824 2.29925 10.8473 2.59651C10.7122 2.89378 10.6426 3.21239 10.6426 3.53415V4.40495C10.6426 4.48385 10.6567 4.55976 10.6828 4.63069C10.333 4.71136 9.98902 4.81798 9.65408 4.95008C8.80508 5.28494 8.02748 5.77823 7.36807 6.40631C6.70845 7.03458 6.17972 7.78585 5.81713 8.6199C5.45448 9.45407 5.26647 10.3523 5.26661 11.2614L5.26647 13.9464L5.26646 14.225C5.26646 14.225 5.26581 14.2277 5.26454 14.2306C5.26212 14.2362 5.25559 14.248 5.24044 14.2624L4.52767 14.9413C3.72242 15.7081 3.25025 16.77 3.25 17.899C3.25 18.9974 3.70899 20.0301 4.49138 20.7753C5.27043 21.5173 6.30699 21.9181 7.36846 21.9181H19.2935C19.8211 21.9181 20.3456 21.8192 20.838 21.6249C21.3304 21.4307 21.784 21.1435 22.1706 20.7753C22.5574 20.4069 22.8697 19.9642 23.0847 19.4698C23.2998 18.9751 23.412 18.4412 23.412 17.8995C23.4117 16.7704 22.9398 15.7084 22.1345 14.9415L21.4215 14.2624C21.4064 14.248 21.3999 14.2362 21.3974 14.2306C21.3968 14.2292 21.3964 14.2279 21.3961 14.2269C21.3957 14.2258 21.3955 14.225 21.3955 14.225L21.3954 11.2614C21.3955 10.3523 21.2075 9.45407 20.8448 8.6199C20.4822 7.78585 19.9535 7.03458 19.2939 6.40631C18.6345 5.77823 17.8569 5.28494 17.0079 4.95008C16.6729 4.81796 16.3289 4.71133 15.9791 4.63066C16.0051 4.55974 16.0192 4.48384 16.0192 4.40495V3.53415C16.0192 3.21239 15.9496 2.89378 15.8145 2.59651C15.6794 2.29925 15.4814 2.02914 15.2318 1.80162C14.9822 1.5741 14.6858 1.39363 14.3597 1.27049C14.0335 1.14736 13.6839 1.08398 13.3309 1.08398ZM14.4593 4.44531C14.4585 4.43195 14.458 4.41849 14.458 4.40495V3.53415C14.458 3.39925 14.4289 3.26566 14.3722 3.14102C14.3156 3.01638 14.2326 2.90313 14.1279 2.80774C14.0232 2.71234 13.899 2.63667 13.7622 2.58505C13.6255 2.53342 13.4789 2.50685 13.3309 2.50685C13.1829 2.50685 13.0363 2.53342 12.8996 2.58505C12.7628 2.63667 12.6386 2.71234 12.5339 2.80774C12.4292 2.90313 12.3462 3.01638 12.2896 3.14102C12.2329 3.26566 12.2038 3.39925 12.2038 3.53415V4.40495C12.2038 4.4185 12.2034 4.43196 12.2025 4.44532C12.2426 4.44467 12.2826 4.44434 12.3227 4.44435H14.3393C14.3793 4.44434 14.4193 4.44466 14.4593 4.44531ZM7.2829 11.231C7.28284 11.241 7.28281 11.251 7.28281 11.2609V14.2242C7.28268 14.7862 7.04822 15.325 6.631 15.7223L5.91801 16.4014C5.50078 16.7987 5.26632 17.3376 5.2662 17.8995C5.2662 18.4305 5.48768 18.9399 5.88194 19.3154C6.27619 19.6909 6.8109 19.9019 7.36846 19.9019H19.2935C19.5696 19.9019 19.843 19.8501 20.098 19.7494C20.3531 19.6488 20.5848 19.5013 20.78 19.3154C20.9752 19.1294 21.1301 18.9087 21.2357 18.6658C21.3414 18.4228 21.3958 18.1624 21.3958 17.8995C21.3956 17.3376 21.1612 16.7987 20.744 16.4014L20.031 15.7223C19.6137 15.325 19.3793 14.7862 19.3792 14.2242V11.2609C19.3793 10.6305 19.249 10.0062 18.9958 9.42374C18.7426 8.84127 18.3714 8.31202 17.9033 7.86624C17.4353 7.42045 16.8797 7.06686 16.2681 6.82567C15.6566 6.58448 15.0012 6.46041 14.3393 6.46054H12.3227C11.7398 6.46042 11.162 6.55661 10.6148 6.74427C10.5405 6.76973 10.4669 6.79686 10.3938 6.82567C9.7823 7.06686 9.22665 7.42045 8.75863 7.86624C8.2906 8.31202 7.91938 8.84127 7.66615 9.42374C7.41693 9.997 7.28682 10.6108 7.2829 11.231Z" fill="white"/>
            </Svg>
            {/* Badge Count */}
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 justify-center items-center">
                <Text className="text-[10px] text-white font-bold">0</Text>
            </View>
          </TouchableOpacity>

          {/* User Settings Icon */}
          <TouchableOpacity 
            className="mx-2"
            onPress={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setActiveMenu(null);
            }}
          >
            <Svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <Path fillRule="evenodd" clipRule="evenodd" d="M13 24.375C16.0168 24.375 18.9101 23.1766 21.0433 21.0433C23.1766 18.9101 24.375 16.0168 24.375 13C24.375 9.98316 23.1766 7.08989 21.0433 4.95666C18.9101 2.82343 16.0168 1.625 13 1.625C9.98316 1.625 7.08989 2.82343 4.95666 4.95666C2.82343 7.08989 1.625 9.98316 1.625 13C1.625 16.0168 2.82343 18.9101 4.95666 21.0433C7.08989 23.1766 9.98316 24.375 13 24.375ZM8.32162 17.6784L6.68038 19.3196C5.4304 18.0697 4.57915 16.4772 4.23426 14.7435C3.88937 13.0098 4.06634 11.2127 4.74279 9.57958C5.41923 7.94644 6.56478 6.55057 8.03455 5.56848C9.50432 4.5864 11.2323 4.06222 13 4.06222C14.7677 4.06222 16.4957 4.5864 17.9655 5.56848C19.4352 6.55057 20.5808 7.94644 21.2572 9.57958C21.9337 11.2127 22.1106 13.0098 21.7657 14.7435C21.4209 16.4772 20.5696 18.0697 19.3196 19.3196L17.6784 17.6784C17.2256 17.2255 16.688 16.8662 16.0964 16.6211C15.5047 16.376 14.8705 16.2499 14.2301 16.25H11.7699C11.1295 16.2499 10.4953 16.376 9.90364 16.6211C9.31198 16.8662 8.7744 17.2255 8.32162 17.6784Z" fill="white"/>
              <Path d="M13 6.5C12.138 6.5 11.3114 6.84241 10.7019 7.4519C10.0924 8.0614 9.75 8.88805 9.75 9.75V10.5625C9.75 11.4245 10.0924 12.2511 10.7019 12.8606C11.3114 13.4701 12.138 13.8125 13 13.8125C13.862 13.8125 14.6886 13.4701 15.2981 12.8606C15.9076 12.2511 16.25 11.4245 16.25 10.5625V9.75C16.25 8.88805 15.9076 8.0614 15.2981 7.4519C14.6886 6.84241 13.862 6.5 13 6.5Z" fill="white"/>
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- SUB MENU BAR (Hiển thị khi chọn menu chính) --- */}
      {activeMenu && (
        <View className="bg-gray-200 border-b border-gray-300 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
            {MENU_DATA[activeMenu].map((item, index) => (
              <TouchableOpacity key={index} className="bg-white border border-gray-300 rounded px-3 py-2 mr-2">
                <Text className="text-gray-800 text-xs font-medium">{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- CONTENT DEMO --- */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Nội dung trang web hiển thị ở đây...</Text>
      </View>


      {/* --- MODAL: NOTIFICATIONS --- */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable className="flex-1" onPress={() => setShowNotifications(false)}>
            {/* Vị trí dropdown: Tính toán tương đối top-14 right-2 */}
            <View className="absolute top-14 right-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-2" onStartShouldSetResponder={() => true}>
                {/* Tabs */}
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
                
                {/* Content */}
                <View className="h-48 justify-center items-center">
                    <Text className="text-gray-400 text-xs">Không có thông báo mới</Text>
                    <TouchableOpacity className="mt-4 border border-green-500 rounded-full px-3 py-1">
                        <Text className="text-green-600 text-[10px] font-bold">Đánh dấu tất cả đã đọc</Text>
                    </TouchableOpacity>
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
            <View className="absolute top-14 right-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200" onStartShouldSetResponder={() => true}>
                <View className="p-3 border-b border-gray-200 bg-gray-50">
                    <Text className="text-xs text-gray-500">Đăng nhập bởi:</Text>
                    <Text className="text-sm font-bold text-gray-800">thiennv@thienphattien.com</Text>
                </View>
                
                <TouchableOpacity className="p-3 border-b border-gray-100 active:bg-gray-100">
                    <Text className="text-sm text-gray-700">Thông tin tài khoản</Text>
                </TouchableOpacity>

                <TouchableOpacity className="p-3 active:bg-gray-100">
                    <Text className="text-sm text-red-600">Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}