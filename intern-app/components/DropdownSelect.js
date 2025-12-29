import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const DropdownSelect = ({
    data,           // Mảng dữ liệu: [{id: 1, name: 'A'}, ...]
    value,          // Giá trị đang chọn (ID)
    onChange,       // Hàm callback khi chọn
    labelField,     // Tên trường hiển thị (VD: 'customer_name', 'name')
    valueField,     // Tên trường giá trị (VD: 'id')
    placeholder = "Chọn...",
    search = true,   // Bật/tắt tìm kiếm
    iconColor = "gray"
}) => {
    const [isFocus, setIsFocus] = useState(false);

    return (
        <View style={styles.container}>
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#2563EB' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search={search} // Bật tính năng tìm kiếm
                maxHeight={300} // Chiều cao tối đa của danh sách
                labelField={labelField}
                valueField={valueField}
                placeholder={!isFocus ? placeholder : '...'}
                searchPlaceholder="Tìm kiếm..."
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    onChange(item[valueField]); // Trả về ID
                    setIsFocus(false);
                }}
                // Custom màu sắc icon
                iconColor={isFocus ? '#2563EB' : iconColor}
            />
        </View>
    );
};

export default DropdownSelect;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingVertical: 5,
    },
    dropdown: {
        height: 50,
        borderColor: '#D1D5DB', // gray-300
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#F9FAFB', // gray-50
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500'
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
});