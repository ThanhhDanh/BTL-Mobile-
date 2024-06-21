import { View, Text, SafeAreaView, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MyStyle from "../../Style/MyStyle";
import MyContext from "../Templates/MyContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome6';
import moment from 'moment';
import { formatPrice, getOrdersByStatus } from "../Utils/Utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";

export default WaitingConfirmationScreen = ({navigation, route, previousScreen}) => {
    const {user} = useContext(MyContext);
    const [waitingConfirmationOrders, setWaitingConfirmationOrders] = useState([]);
    const [numberOfConfirmationOrders, setNumberOfConfirmationOrders] = useState(0);
    const key = user ? `waitingOrders_${user.username}_${user.id}`:'';

    useFocusEffect(
        useCallback(() => {
            loadWaitingConfirmationOrders();
        }, [user])
    );


    const loadWaitingConfirmationOrders = async () => {
        if(user) {
            try {
                const savedOrders = await AsyncStorage.getItem(key);
                // console.info("Dữ liệu từ AsyncStorage:", savedOrders);
                let orders=[];
                if (savedOrders && savedOrders.length === 0) {
                    orders = JSON.parse(savedOrders);
                } else {
                    orders = await getOrdersByStatus("Chờ xác nhận");
                    // console.info("Dữ liệu từ cơ sở dữ liệu:", orders);
                    if (orders && orders.length > 0) {
                        await AsyncStorage.setItem(key, JSON.stringify(orders));
                    } else {
                        console.info("Không có đơn hàng chờ xác nhận.");
                    }
                }
                // Lọc các đơn hàng theo user ID
                const filteredOrders = orders.filter(order => order.user_id === user.id);
                setWaitingConfirmationOrders(filteredOrders);
                setNumberOfConfirmationOrders(filteredOrders.length);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng từ bộ nhớ:', error);
            }
        }
    };



    // const moveToShipping = async (orderId) => {
    //     try {
    //         // Gửi yêu cầu cập nhật trạng thái đơn hàng đến máy chủ
    //         await authAPI().patch(`${endpoints.orders}${orderId}/`, { status: "Chờ giao hàng" });
    
    //         // Cập nhật danh sách đơn hàng chờ xác nhận
    //         const updatedOrders = waitingConfirmationOrders.filter(order => order.id !== orderId);
    //         setWaitingConfirmationOrders(updatedOrders);
    //         setNumberOfConfirmationOrders(updatedOrders.length);

    //         // Lưu trạng thái mới vào AsyncStorage
    //         await AsyncStorage.setItem(key, JSON.stringify(updatedOrders));
            
    //         console.log(`Đơn hàng ${orderId} đã chuyển sang trạng thái Chờ giao hàng`);
    //     } catch (error) {
    //         console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, error.message);
    //     }
    // };

    const handleOrderPress = (orderId) => {
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'WaitConfirmation'});
    };


    const cancelOrder = async orderId => {
        try {
            // Gửi yêu cầu hủy đơn hàng đến máy chủ
            await authAPI().delete(`${endpoints.orders}${orderId}/`);

            // Xóa đơn hàng khỏi danh sách chờ xác nhận
            const updatedOrders = waitingConfirmationOrders.filter(order => order.id !== orderId);
            setWaitingConfirmationOrders(updatedOrders);
            setNumberOfConfirmationOrders(updatedOrders.length);
            
            // Lưu trạng thái mới vào AsyncStorage
            await AsyncStorage.setItem(key, JSON.stringify(updatedOrders));
            
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
                <Text style={styles.orderText}>Tổng tiền: {formatPrice(item.totalPrice)}</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelOrder(item.id)}>
                    <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={MyStyle.setForm}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate("Setting",{previousScreen: "WaitConfirmation",numberOfConfirmationOrders: numberOfConfirmationOrders})}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 30, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold', top: 5}}>Chờ xác nhận</Text>
            </View>
            {numberOfConfirmationOrders > 0 ? (
                <View style={{flex: 1}}>
                    <FlatList
                    data={waitingConfirmationOrders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                />
                </View>
            ): (
                <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Không có đơn hàng chờ xác nhận</Text>
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