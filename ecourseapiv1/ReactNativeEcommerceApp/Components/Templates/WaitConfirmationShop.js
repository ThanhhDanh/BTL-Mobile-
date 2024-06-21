import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import MyContext from '../Templates/MyContext';
import { authAPI, endpoints } from '../../Configs/APIs';
import moment from 'moment';
import { getOrdersByStatus } from '../Utils/Utils';
import Icon from 'react-native-vector-icons/FontAwesome6';


const WaitConfirmationShop = ({ navigation, route }) => {
    const { user } = useContext(MyContext);
    const { onConfirmOrder } = route.params || {};
    const [waitingConfirmationOrders, setWaitingConfirmationOrders] = useState([]);

    useEffect(() => {
        loadWaitingConfirmationOrders();
    }, []);

    const loadWaitingConfirmationOrders = async () => {
        try {
            const orders = await getOrdersByStatus('Chờ xác nhận'); // Sử dụng hàm getOrdersByStatus với status là 'Chờ xác nhận'
            setWaitingConfirmationOrders(orders);
        } catch (error) {
            console.info('Error loading orders:', error);
            Alert.alert('Error', 'Failed to load waiting confirmation orders');
        }
    };

    const confirmOrder = async (orderId) => {
        try {
            await authAPI().patch(`${endpoints.orders}${orderId}/`, { status: 'Chờ lấy hàng' });
            const updatedOrders = waitingConfirmationOrders.filter(order => order.id !== orderId);
            setWaitingConfirmationOrders(updatedOrders);
            if (onConfirmOrder) onConfirmOrder();
            Alert.alert('Xác nhận', 'Xác nhận thành công!!');
        } catch (error) {
            console.error('Error confirming order:', error);
            Alert.alert('Error', 'Failed to confirm order');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => confirmOrder(item.id)}>
            <View style={styles.orderContainer}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                <Text style={styles.orderText}>Ngày đặt: {moment(item.created_date).format('DD/MM/YYYY HH:mm')}</Text>
                <Text style={styles.orderText}>Tổng tiền: {item.totalPrice} đ</Text>
                <TouchableOpacity style={styles.confirmButton} onPress={() => confirmOrder(item.id)}>
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
           <SafeAreaView style={{width: '100%', height: '100%'}}>
                <View style={styles.header}>
                    <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("ShopOwner")}
                    >
                    <Icon style={styles.icon} name="chevron-left" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Chờ xác nhận</Text>
                </View>
                <View style={styles.container}>
                    <FlatList
                        data={waitingConfirmationOrders}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
           </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
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
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    confirmButtonText: {
        color: '#fff',
    },
    header: {
        height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f2f2f2',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        top: 20,
      },
      backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 50,
      },
      icon: {
        fontSize: 15,
        color: '#000',
      },
      headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 85,
      },
});

export default WaitConfirmationShop;