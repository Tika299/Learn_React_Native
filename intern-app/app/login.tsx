import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Hàm xử lý đăng nhập
  const handleLogin = () => {
    console.log({ email, password, rememberMe });
    // Thêm logic gọi API login tại đây
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6 py-6">
            
            {/* --- LOGO SECTION --- */}
            <View className="mb-8">
                {/* Lưu ý: Thay localhost bằng 10.0.2.2 nếu chạy máy ảo Android */}
                <Image
                    source={{ uri: "http://localhost:8000/images/Logo_ThienPhatTien_Final-01.png" }}
                    className="w-48 h-24" 
                    resizeMode="contain"
                />
            </View>

            {/* --- FORM CARD --- */}
            <View className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                
                {/* Email Input */}
                <View>
                    <Text className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </Text>
                    <TextInput 
                        className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md p-3 text-base text-gray-900"
                        placeholder="example@email.com"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password Input */}
                <View className="mt-4">
                    <Text className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Password
                    </Text>
                    <TextInput 
                        className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md p-3 text-base text-gray-900"
                        placeholder="********"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* Remember Me Checkbox (Custom UI) */}
                <View className="flex-row items-center mt-4">
                    <TouchableOpacity 
                        onPress={() => setRememberMe(!rememberMe)}
                        className="flex-row items-center"
                    >
                        {/* Hình vuông Checkbox giả lập */}
                        <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${
                            rememberMe 
                                ? 'bg-indigo-600 border-indigo-600' 
                                : 'bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700'
                        }`}>
                            {rememberMe && (
                                <View className="w-2.5 h-2.5 bg-white rounded-sm" />
                            )}
                        </View>
                        
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Actions */}
                <View className="flex-row items-center justify-end mt-6">
                    <TouchableOpacity>
                        <Text className="text-sm text-gray-600 dark:text-gray-400 underline mr-4">
                            Forgot your password?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleLogin}
                        className="bg-gray-800 dark:bg-gray-200 px-4 py-2 rounded-md items-center"
                    >
                        <Text className="text-white dark:text-gray-800 font-semibold text-xs uppercase tracking-widest">
                            Log in
                        </Text>
                    </TouchableOpacity>
                </View>

            </View> 
            {/* End Form Card */}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}