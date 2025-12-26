import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';

const MENU_ITEMS = [
  'Nhóm đối tượng', 'Khách hàng', 'Nhà cung cấp', 'Hàng hoá', 'Nhân viên', 'Kho'
];

export default function TabMenu({ activeTab, onTabPress }) {
  return (
    <View className="bg-gray-200 border-b border-gray-300 py-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
         {MENU_ITEMS.map((item, index) => {
           const isActive = item === activeTab;
           return (
             <TouchableOpacity 
                key={index}
                onPress={() => onTabPress && onTabPress(item)}
                className={`border rounded px-4 py-2 mr-2 ${isActive ? 'bg-white border-gray-400 shadow-sm' : 'bg-transparent border-transparent opacity-70'}`}
             >
               <Text className={`text-xs ${isActive ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                 {item}
               </Text>
             </TouchableOpacity>
           );
         })}
      </ScrollView>
    </View>
  );
}