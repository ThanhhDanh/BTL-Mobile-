import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MyStyle from "../../Style/MyStyle";
import MyContext from "../Templates/MyContext";
import { useContext, useEffect, useState } from "react";
import { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome6';
import moment from 'moment';
import { getOrdersByStatus } from "../Utils/Utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default WaitingConfirmationScreen = ({navigation, route, previousScreen}) => {
    const [user] = useContext(MyContext);
    const [waitingConfirmationOrders, setWaitingConfirmationOrders] = useState([]);
    const [numberOfOrders, setNumberOfOrders] = useState(0);

    useEffect(() => {
        loadWaitingConfirmationOrders();
    }, [user]);

    useEffect(() => {
        const timers = waitingConfirmationOrders.map(order => 
            setTimeout(() => moveToShipping(order.id), 60000)
        );
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [waitingConfirmationOrders]);

    const loadWaitingConfirmationOrders = async () => {
        if(user) {
            try {
                const savedOrders = await AsyncStorage.getItem(`waitingOrders_${user.username}`);
                if(savedOrders){
                    setWaitingConfirmationOrders(JSON.parse(savedOrders));
                }else{
                    const orders = await getOrdersByStatus("Chờ xác nhận");
                    setWaitingConfirmationOrders(orders);
                    setNumberOfOrders(orders.length); // Cập nhật số lượng đơn hàng
                }
            } catch (error) {
                console.error('Failed to load orders from storage:', error);
            }
        }
    };

    const moveToShipping = async (orderId) => {
        try {
            // Gửi yêu cầu cập nhật trạng thái đơn hàng đến máy chủ
            await authAPI().patch(`${endpoints.orders}${orderId}/`, { status: "Chờ giao hàng" });
    
            // Cập nhật danh sách đơn hàng chờ xác nhận
            setWaitingConfirmationOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            
            setNumberOfOrders(prevCount => prevCount - 1); // Giảm số lượng đơn hàng
            //Lấy hóa đơn của tài khoản đó 
            await AsyncStorage.setItem(`waitingOrders_${user.username}`, JSON.stringify(waitingConfirmationOrders));
            
            console.log(`Đơn hàng ${orderId} đã chuyển sang trạng thái Chờ giao hàng`);
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, error.message);
        }
    };

    const handleOrderPress = (orderId) => {
        // Navigate to the order detail screen with orderId and previousScreen parameters
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'WaitingConfirmation' });
    };

    const cancelOrder = async orderId => {
        try {
            // Gửi yêu cầu hủy đơn hàng đến máy chủ
            await authAPI().delete(`${endpoints.orders}${orderId}/`);

            // Xóa đơn hàng khỏi danh sách chờ xác nhận
            setWaitingConfirmationOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            
            // setNumberOfOrders(prevCount => prevCount - 1); // Giảm số lượng đơn hàng
            
            await AsyncStorage.setItem(`waitingOrders_${user.username}`, JSON.stringify(waitingConfirmationOrders));
            
            Alert.alert('Thành công', 'Đã hủy đơn hàng thành công.');
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error.message);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.');
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
            <View style={styles.orderContainer}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                <Text style={styles.orderText}>Ngày đặt: {moment(item.created_date).format('DD/MM/YYYY HH:mm')}</Text>
                <Text style={styles.orderText}>Tổng tiền: {item.totalPrice} đ</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelOrder(item.id)}>
                    <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={MyStyle.setForm}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate("Setting",{previousScreen: "WaitConfirmation"})}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 20, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Chờ xác nhận</Text>
            </View>
            {numberOfOrders === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
                </View>
            ): (
                <View style={{flex: 1}}>
                    <FlatList
                    data={waitingConfirmationOrders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            )}
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
    cancelButton: {
        backgroundColor: '#FF5733',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    cancelButtonText: {
        color: '#fff',
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