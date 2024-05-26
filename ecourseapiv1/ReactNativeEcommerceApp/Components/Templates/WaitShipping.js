import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MyStyle from "../../Style/MyStyle";
import MyContext from "../Templates/MyContext";
import { useContext, useEffect, useState } from "react";
import { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome6';
import moment from 'moment';
import { getOrdersByStatus } from "../Utils/Utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShippingScreen = ({navigation,route, previousScreen}) => {
    const [user] = useContext(MyContext);
    const [shippingOrders, setShippingOrders] = useState([]);


    useEffect(() => {
        loadShippingOrders();
    }, [user]);

    const loadShippingOrders = async () => {
        if(user){
            try {
                const savedOrders = await AsyncStorage.getItem(`shippingOrders_${user.username}`);
                if(savedOrders){
                    setShippingOrders(JSON.parse(savedOrders));
                } else {
                    const orders = await getOrdersByStatus("Chờ giao hàng");
                    setShippingOrders(orders);
                    await AsyncStorage.setItem(`shippingOrders_${user.username}`, JSON.stringify(orders));
                }
            }catch(err){
                console.error('Failed to load orders from storage:', err);
            }
        }
    };

    const handleOrderPress = (orderId) => {
        // Navigate to the order detail screen with orderId and previousScreen parameters
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'ShippingScreen' });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
            <View style={styles.orderContainer}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                <Text style={styles.orderText}>Ngày đặt: {moment(item.created_date).format('DD/MM/YYYY HH:mm')}</Text>
                <Text style={styles.orderText}>Tổng tiền: {item.totalPrice} đ</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={MyStyle.setForm}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate('Setting',{previousScreen: "ShippingScreen"})}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 20, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Chờ giao hàng</Text>
            </View>
            <View style={{height: '100%'}}>
                {shippingOrders.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
                    </View>
                ): (
                    <View style={{flex: 1}}>
                        <FlatList
                            data={shippingOrders}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    orderContainer: {
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    orderText: {
        fontSize: 16,
        marginVertical: 5,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCartText: {
        fontSize: 18,
        color: '#888',
    },
});

export default ShippingScreen;