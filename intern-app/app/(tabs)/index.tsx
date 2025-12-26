// app/(tabs)/index.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { router } from 'expo-router';

// Import Header của bạn nếu cần
// import HeaderDashboard from "../../components/HeaderDashboard";

export default function HomeScreen() {

  // Hàm điều hướng
  const navigateTo = (route: "/setup/UserScreen" | "/setup/CustomerScreen" | "/setup/GroupScreen" | "/setup/ProductScreen" | "/warehouse/ImportScreen" | "/warehouse/InventoryLookupScreen" | "/warehouse/ExportScreen" | "/report/ReportOverviewScreen") => {
    // router.push sẽ tự động tìm file tương ứng trong thư mục app
    router.push(route);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Nếu bạn có HeaderDashboard component, đặt nó ở đây */}
      {/* <HeaderDashboard /> */}
      
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>Dashboard</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* SECTION: THIẾT LẬP */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#4b5563' }}>THIẾT LẬP (Setup)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigateTo('/setup/UserScreen')}
              style={{ backgroundColor: '#e0e7ff', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#3730a3'}}>Nhân viên</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo('/setup/CustomerScreen')}
              style={{ backgroundColor: '#e0e7ff', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#3730a3'}}>Khách hàng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigateTo('/setup/GroupScreen')}
              style={{ backgroundColor: '#e0e7ff', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#3730a3'}}>Nhóm đối tượng</Text>
            </TouchableOpacity>

             <TouchableOpacity
              onPress={() => navigateTo('/setup/ProductScreen')}
              style={{ backgroundColor: '#e0e7ff', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#3730a3'}}>Hàng hóa</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION: KHO */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#4b5563' }}>KHO (Warehouse)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigateTo('/warehouse/ImportScreen')}
              style={{ backgroundColor: '#dcfce7', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#166534'}}>Nhập hàng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigateTo('/warehouse/InventoryLookupScreen')}
              style={{ backgroundColor: '#dcfce7', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#166534'}}>Tra cứu tồn kho</Text>
            </TouchableOpacity>

             <TouchableOpacity
              onPress={() => navigateTo('/warehouse/ExportScreen')}
              style={{ backgroundColor: '#dcfce7', padding: 20, borderRadius: 10, width: '48%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#166534'}}>Xuất hàng</Text>
            </TouchableOpacity>
          </View>

           {/* SECTION: BÁO CÁO */}
           <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#4b5563' }}>BÁO CÁO (Reports)</Text>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigateTo('/report/ReportOverviewScreen')}
              style={{ backgroundColor: '#fef9c3', padding: 20, borderRadius: 10, width: '100%', marginBottom: 10 }}
            >
              <Text style={{fontWeight: '600', color: '#854d0e', textAlign: 'center'}}>Tổng quan báo cáo</Text>
            </TouchableOpacity>
           </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}