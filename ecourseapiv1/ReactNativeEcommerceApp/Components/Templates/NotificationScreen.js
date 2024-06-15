import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyContext from './MyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const NotificationScreen = ({navigation, route }) => {
    const { user, notificationCount, setNotificationCount } = useContext(MyContext);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        if (user) {
            try {
                const key = `notifications_${user.username}_${user.id}`;
                const savedNotifications = JSON.parse(await AsyncStorage.getItem(key)) || [];
                const validNotifications = savedNotifications.filter(notification => notification && notification.orderId);
                setNotifications(validNotifications);
                setNotificationCount(validNotifications.length)
            } catch (error) {
                console.error('Error in loadNotifications:', error);
            }
        } else {
            navigation.navigate("Đăng nhập");
        }
    };

    const handleConfirm = async (orderId) => {
        if (user) {
            try {
                const key = `notifications_${user.username}_${user.id}`;
                const savedNotifications = JSON.parse(await AsyncStorage.getItem(key)) || [];
                const updatedNotifications = savedNotifications.filter(notification => notification.orderId !== orderId);
                await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
                setNotifications(updatedNotifications);
                setNotificationCount(updatedNotifications.length);
            } catch (error) {
                console.error('Error in handleConfirm:', error);
            }
        } else {
            console.error('User is null');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [user])
    );


    const removeNotification = async (orderId) => {
        if (user) {
            try {
                const key = `notifications_${user.username}_${user.id}`;
                const savedNotifications = JSON.parse(await AsyncStorage.getItem(key)) || [];
                const updatedNotifications = savedNotifications.filter(notification => notification.orderId !== orderId);
                await AsyncStorage.setItem(key, JSON.stringify(updatedNotifications));
                setNotifications(updatedNotifications);
                setNotificationCount(updatedNotifications.length);
            } catch (error) {
                console.error('Error in removeNotification:', error);
            }
        } else {
            console.error('User is null');
        }
    };


    const handleOrderPress = (orderId) => {
        // Navigate to the order detail screen with orderId and previousScreen parameters
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'Thông báo' });
    };

    const handleReviewPress = (orderId, productId, removeNotification) => {
        navigation.navigate('Review', { orderId: orderId, productId: productId, removeNotification:removeNotification });
    };



    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.notificationContainer} onPress={()=>handleOrderPress(item.orderId)}>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.orderInfoText}>Mã đơn hàng: {item.orderId}</Text>
            <Text style={styles.orderInfoText}>Ngày giao hàng: {item.deliveryDate}</Text>
            <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => handleConfirm(item.orderId)}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
            {/* {item && (
                    <TouchableOpacity 
                        style={styles.reviewButton} 
                        onPress={() => handleReviewPress(item.orderId)}>
                        <Text style={styles.reviewButtonText}>Đánh giá</Text>
                    </TouchableOpacity>
            )} */}
            <TouchableOpacity 
                style={styles.reviewButton} 
                onPress={() => handleReviewPress(item.orderId, item.productId)}>
                <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Thông báo</Text>
            </View>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.orderId ? item.orderId.toString() : Math.random().toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có thông báo</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    notificationContainer: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    messageText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    orderInfoText: {
        fontSize: 16,
        marginBottom: 5,
    },
    confirmButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    reviewButton: {
        padding: 10,
        backgroundColor: '#FFA500',
        borderRadius: 5,
        alignItems: 'center',
    },
    reviewButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default NotificationScreen;