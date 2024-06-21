import React, { useContext } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import MyContext from "../Templates/MyContext";
import MyStyle from "../../Style/MyStyle";
import { useCart } from "../Templates/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Logout({ navigation }) {
    const {user, dispatch, setIsAuthenticated,setRole} = useContext(MyContext);
    const { clearCart } = useCart();
    

    const handleLogout = async () => {
        try {
            // Ensure user exists before attempting to logout
            if (user && user.username) {
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('access-token');
                // await AsyncStorage.removeItem('replies');
                // await AsyncStorage.removeItem(`shippingOrders_${user.username}_${user.id}`);
                // await AsyncStorage.removeItem(`notifications_${user.username}_${user.id}`);
                

                // Clear user context
                dispatch({ type: "logout" });

                // Clear cart context
                clearCart();

                // Reset authentication and role
                // setIsAuthenticated(false);
                setRole(null);

                // Navigate to the home screen
                navigation.navigate('Trang chủ');
            } else {
                console.error('Lỗi khi đăng xuất: User is not defined');
            }
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