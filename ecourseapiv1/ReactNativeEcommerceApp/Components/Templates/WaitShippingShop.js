import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import MyContext from '../Templates/MyContext';
import { formatPrice, getOrdersByStatus } from '../Utils/Utils';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome6';

const WaitShippingShop = ({ navigation }) => {
    const { user } = useContext(MyContext);
    const [waitingShippingOrders, setWaitingShippingOrders] = useState([]);

    useEffect(() => {
        loadWaitingShippingOrders();
    }, []);

    const loadWaitingShippingOrders = async () => {
        try {
            const orders = await getOrdersByStatus('Chờ lấy hàng');
            setWaitingShippingOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            // Handle error loading orders
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.orderContainer}>
            <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
            <Text style={styles.orderText}>Ngày đặt: {moment(item.created_date).format('DD/MM/YYYY HH:mm')}</Text>
            <Text style={styles.orderText}>Tổng tiền: {formatPrice(item.totalPrice)} đ</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("ShopOwner")}
                >
                    <Icon style={styles.icon} name="chevron-left" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Chờ lấy hàng</Text>
            </View>
            <View style={styles.container}>
                <FlatList
                    data={waitingShippingOrders}
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

export default WaitShippingShop;