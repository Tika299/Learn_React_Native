import React, { useState, useEffect, useContext } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../app/(tabs)/AuthContext';

export default function Sidebar({ isExpanded = false, onToggle, onNavigate }) {
    const { logout } = useContext(AuthContext);
    const [expandedMenu, setExpandedMenu] = useState(null);

    useEffect(() => {
        if (!isExpanded) setExpandedMenu(null);
    }, [isExpanded]);

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đồng ý", onPress: () => logout() }
        ]);
    };

    const toggleSubMenu = (key) => {
        if (!isExpanded) {
            onToggle();
            setExpandedMenu(key);
            return;
        }
        setExpandedMenu(expandedMenu === key ? null : key);
    };

    return (
        <LinearGradient colors={['#1a365d', '#0f2942']} className="flex-1">
            {/* Header */}
            <View className={`flex-row items-center justify-between p-4 border-b border-white/10 mb-2 h-[60px] ${!isExpanded && 'justify-center px-0'}`}>
                <View className="flex-row items-center flex-1 overflow-hidden">
                    <FontAwesome5 name="warehouse" size={24} color="#fff" />
                    {isExpanded && <Text className="text-white text-lg font-bold ml-3">SGL WMS</Text>}
                </View>
                <TouchableOpacity onPress={onToggle} className="p-1">
                    <FontAwesome5 name={isExpanded ? "times" : "bars"} size={20} color="#a0aec0" />
                </TouchableOpacity>
            </View>

            {/* Menu List */}
            <ScrollView className="flex-1 px-1" showsVerticalScrollIndicator={false}>
                <MenuItem icon="tachometer-alt" title="Tổng Quan" isExpanded={isExpanded} onPress={() => onNavigate('Dashboard')} />

                <CollapsibleMenu 
                    icon="cog" title="Thiết lập" 
                    isExpanded={isExpanded} 
                    isOpen={expandedMenu === 'masterData'} 
                    onToggle={() => toggleSubMenu('masterData')}
                >
                    <SubMenuItem title="Khách Hàng" onPress={() => onNavigate('Customers')} />
                    <SubMenuItem title="Vật Tư" onPress={() => onNavigate('Materials')} />
                </CollapsibleMenu>

                <MenuItem icon="search" title="Tìm Bảo Hành" isExpanded={isExpanded} onPress={() => onNavigate('FindGuarantee')} />
                <MenuItem icon="list" title="Danh Sách Yêu Cầu" isExpanded={isExpanded} onPress={() => onNavigate('ListRequest')} />
                
                <MenuItem icon="sign-out-alt" title="Đăng Xuất" isExpanded={isExpanded} onPress={handleLogout} />
                <MenuItem icon="sign-out-alt" title="Đăng Xuất" isExpanded={isExpanded} onPress={logout} />
                <View className="h-12" />
            </ScrollView>
        </LinearGradient>
    );
}

// Components con
const MenuItem = ({ icon, title, onPress, isExpanded }) => (
    <TouchableOpacity 
        className={`flex-row items-center justify-between py-3 px-4 rounded-lg mb-1 ${!isExpanded ? 'justify-center px-0' : ''}`}
        onPress={onPress}
    >
        <View className="flex-row items-center">
            <View className="w-[30px] items-center">
                <FontAwesome5 name={icon} size={20} color="#e2e8f0" />
            </View>
            {isExpanded && <Text className="text-slate-200 text-[15px] font-medium ml-3" numberOfLines={1}>{title}</Text>}
        </View>
    </TouchableOpacity>
);

const CollapsibleMenu = ({ icon, title, isOpen, onToggle, children, isExpanded }) => (
    <View>
        <TouchableOpacity 
            className={`flex-row items-center justify-between py-3 px-4 rounded-lg mb-1 ${isOpen ? 'bg-white/10' : ''} ${!isExpanded ? 'justify-center px-0' : ''}`}
            onPress={onToggle}
        >
            <View className="flex-row items-center">
                <View className="w-[30px] items-center">
                    <FontAwesome5 name={icon} size={20} color="#e2e8f0" />
                </View>
                {isExpanded && <Text className="text-slate-200 text-[15px] font-medium ml-3" numberOfLines={1}>{title}</Text>}
            </View>
            {isExpanded && (
                <FontAwesome5 name={isOpen ? "chevron-up" : "chevron-down"} size={12} color="#a0aec0" />
            )}
        </TouchableOpacity>

        {isOpen && isExpanded && (
            <View className="ml-3 pl-3 border-l border-white/20 mb-1 bg-black/10">
                {children}
            </View>
        )}
    </View>
);

const SubMenuItem = ({ title, onPress }) => (
    <TouchableOpacity className="py-2.5 px-2.5 rounded-md" onPress={onPress}>
        <Text className="text-slate-300 text-sm" numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
);