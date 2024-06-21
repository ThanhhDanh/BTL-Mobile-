import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions } from "react-native";
import MyStyle from "../../Style/MyStyle";
import MyContext from "../Templates/MyContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome6';
import moment from 'moment';
import { formatPrice, getOrdersByStatus } from "../Utils/Utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ShippingScreen = ({navigation,route, previousScreen}) => {
    const {user} = useContext(MyContext);
    const [shippingOrders, setShippingOrders] = useState([]);
    const [numberOfShippingOrders, setNumberOfShippingOrders] = useState(0);
    const key = user ? `shippingOrders_${user.username}_${user.id}` : '';


    useFocusEffect(
        useCallback(() => {
            loadShippingOrders();
        }, [user])
    );

    const loadShippingOrders = async () => {
        if (user) {
            try {
                const savedOrders = await AsyncStorage.getItem(key);
                let orders = [];
                if (savedOrders && savedOrders.length === 0) {
                    orders = JSON.parse(savedOrders);
                } else {
                    orders = await getOrdersByStatus("Chờ lấy hàng");
                    if (orders && orders.length > 0) {
                        await AsyncStorage.setItem(key, JSON.stringify(orders));
                    }
                }
                const filteredOrders = orders.filter(order => order.user_id === user.id);
                setShippingOrders(filteredOrders);
                setNumberOfShippingOrders(filteredOrders.length);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng từ bộ nhớ:', error);
            }
        } else {
            console.error('User is null');
        }
    };


    const updateOrderStatus = async (orderId) => {
        try {
            // Fetch the current order data
            const response = await authAPI().get(`${endpoints.orders}${orderId}/`);
            const currentOrder = response.data;
    
            // Determine the payload for updating the order
            let updatePayload = {};
            if (currentOrder.orderStatus === "Chưa thanh toán" && currentOrder.status === "Chờ lấy hàng") {
                updatePayload = {
                    status: 'Đã giao hàng',
                    orderStatus: 'Đã thanh toán',
                };
            } else if (currentOrder.orderStatus === "Đã thanh toán" && currentOrder.status === "Chờ lấy hàng") {
                updatePayload = {
                    status: 'Đã giao hàng',
                };
            }
    
            // Update the order if there are changes to be made
            if (Object.keys(updatePayload).length > 0) {
                const updatedResponse = await authAPI().patch(`${endpoints.orders}${orderId}/`, updatePayload);
                return updatedResponse.data;
            } else {
                return currentOrder;
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            return null;
        }
    };

    const moveToNotification = async (order) => {
        if (user) {
            try {
                const updatedOrder = await updateOrderStatus(order.id);
                if (updatedOrder) {
                    const deliveryDate = moment().format('DD/MM/YYYY HH:mm');
                    const message = `Đơn hàng của bạn đã được giao tới.`;

                    const notificationKey = `notifications_${user.username}_${user.id}`;
                    let notifications = JSON.parse(await AsyncStorage.getItem(notificationKey)) || [];

                    // Check if the order is already in the notifications list
                    const existingNotification = notifications.find(n => n.orderId === order.id);
                    if (existingNotification) {
                        return;
                    }

                    notifications.push({
                        orderId: order.id,
                        message: message,
                        deliveryDate: deliveryDate,
                        productId: order.product_id // Truyền productId từ đơn hàng
                    });
                    await AsyncStorage.setItem(notificationKey, JSON.stringify(notifications));

                    // setNotificationCount(notifications.length); // Update the notification count

                    // Remove the order from the shippingOrders list
                    const updatedOrders = shippingOrders.filter(o => o.id !== order.id);
                    setShippingOrders(updatedOrders);
                    setNumberOfShippingOrders(updatedOrders.length);
                    await AsyncStorage.setItem(key, JSON.stringify(updatedOrders));
                }
            } catch (error) {
                console.error('Error in moveToNotification:', error);
            }
        } else {
            console.error('User is null');
        }
    };

    useEffect(() => {
        const timers = shippingOrders.map(order => 
            setTimeout(() => moveToNotification(order), 60000) // Chuyển sau 2 phút
        );
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [shippingOrders]);


    const handleOrderPress = (orderId) => {
        // Navigate to the order detail screen with orderId and previousScreen parameters
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'WaitShipping' });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
            <View style={styles.orderContainer}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                <Text style={styles.orderText}>Ngày đặt: {moment(item.created_date).format('DD/MM/YYYY HH:mm')}</Text>
                <Text style={styles.orderText}>Tổng tiền: {formatPrice(item.totalPrice)} đ</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={MyStyle.setForm}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate("Setting",{previousScreen: "WaitShipping"})}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 30, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold', top: 5}}>Chờ giao hàng</Text>
            </View>
            <View style={{height:  windowHeight}}>
                {numberOfShippingOrders > 0 ? (
                    <View style={{flex: 1}}>
                        <FlatList
                            data={shippingOrders}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </View>
                ):(
                    <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Không có đơn hàng chờ giao hàng</Text>
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