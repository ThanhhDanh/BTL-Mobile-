import React, { useContext } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import MyContext from "../Templates/MyContext";
import MyStyle from "../../Style/MyStyle";
import { useCart } from "../Templates/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Logout({ navigation }) {
    const [, dispatch] = useContext(MyContext);
    const { clearCart } = useCart();
    
    const handleLogout = async () => {
        try {
            // Xóa thông tin người dùng khỏi AsyncStorage
            await AsyncStorage.removeItem('user');
            // Dispatch hành động logout để cập nhật trạng thái đăng xuất trong context
            dispatch({
                type: "logout"
            });
            // Xóa giỏ hàng
            clearCart();
            // Điều hướng người dùng về trang chủ
            navigation.navigate('Trang chủ');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    return (
        <View style={{borderWidth: 1, marginLeft: 15, borderRadius: 20,overflow: 'hidden'}}>
            <TouchableOpacity
                        style={{backgroundColor: '#4D8D6E'}}
                        onPress={handleLogout}
            >
                <Text style={[MyStyle.letterFont,{textAlign: 'center', margin: 10, color: '#fff'}]}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}