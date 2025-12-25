import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Bạn có thể thay bằng thư viện icon khác nếu muốn, ví dụ @expo/vector-icons
import { IconSymbol } from '@/components/ui/icon-symbol'; // Giả sử bạn dùng template mặc định
// Hoặc dùng: import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' }, // Hiệu ứng mờ trên iOS
          default: {},
        }),
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          // Nếu dùng Ionicons:
          // tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Chức năng',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          // Nếu dùng Ionicons:
          // tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}