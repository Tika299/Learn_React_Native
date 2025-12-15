import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { SearchIcon, FilterIcon, PlusIcon } from './Icons';

export default function ActionToolbar({ 
  searchText, 
  setSearchText, 
  onFilterPress, 
  onCreatePress, 
  onImportPress 
}) {
  return (
    <View className="px-3 py-3 bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between mb-3">
          {/* Search Box */}
          <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-300 rounded-md px-3 h-10 mr-2">
              <TextInput 
                  className="flex-1 text-sm text-gray-800 outline-none" 
                  placeholder="Tìm kiếm..."
                  value={searchText}
                  onChangeText={setSearchText}
                  underlineColorAndroid="transparent"
                  style={Platform.OS === 'web' ? { outline: 'none' } : {}}
              />
              <TouchableOpacity>
                  <SearchIcon />
              </TouchableOpacity>
          </View>

          {/* Filter Button */}
          {onFilterPress && (
            <TouchableOpacity 
                className="flex-row items-center justify-center bg-gray-100 border border-gray-300 rounded-md h-10 px-3"
                onPress={onFilterPress}
            >
                <FilterIcon />
                <Text className="text-gray-600 text-xs ml-1 font-medium">Bộ lọc</Text>
            </TouchableOpacity>
          )}
      </View>
      
      {/* Action Buttons Row */}
      <View className="flex-row justify-end items-center">
          {/* Import Button (Optional) */}
          {onImportPress && (
            <TouchableOpacity onPress={onImportPress} className="mr-3 border border-blue-500 rounded px-3 py-1.5 bg-white">
                <Text className="text-blue-600 text-xs font-medium">Nhập Excel</Text>
            </TouchableOpacity>
          )}

          {/* Create Button */}
          <TouchableOpacity 
              className="bg-sky-600 flex-row items-center px-4 py-1.5 rounded-md shadow-sm"
              onPress={onCreatePress}
          >
              <PlusIcon />
              <Text className="text-white text-xs font-bold ml-2 uppercase">Tạo mới</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}