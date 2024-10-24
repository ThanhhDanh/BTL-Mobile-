import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Image } from 'react-native';
import APIs, { authAPI, endpoints } from '../../Configs/APIs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyContext from '../Templates/MyContext';
import { getOrdersByStatus } from '../Utils/Utils';
import { useFocusEffect } from '@react-navigation/native';

const windowHeight = Dimensions.get('window').height;

const ShopOwner = ({ route, navigation }) => {
    const { user } = useContext(MyContext)
    const { shopId } = route.params || {};
    const [currentShopId, setCurrentShopId] = useState(shopId);
    const [shop, setShop] = useState(null);
    const [waitingConfirmationCount, setWaitingConfirmationCount] = useState(0);
    const [waitingShippingCount, setWaitingShippingCount] = useState(0);
    const [waitingDeliveredCount, setWaitingDeliveredCount] = useState(0);

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                if(!shopId) {
                    const response = await APIs.get(endpoints['shops']);
                    // Lọc và lấy thông tin của shop có owner là user hiện tại
                    const ownerShop = response.data.find((s) => s.owner.id === user.id);
                    if(ownerShop) { 
                        setCurrentShopId(ownerShop.id); 
                        const response = await APIs.get(endpoints['shop-details'](ownerShop.id));
                        setShop(response.data);
                    }
                } else {
                    const response = await APIs.get(endpoints['shop-details'](currentShopId));
                    setShop(response.data);
                }
            } catch (error) {
                console.info('Failed to fetch shop details: ' + error.message);
            }
        };

        fetchShopDetails();
    }, [shopId,currentShopId, user]);

    const countOrders = async (shopId) => {
        try {
            const response1 = await getOrdersByStatus('Chờ xác nhận');
            const confirmationShop = response1.filter( res => res.shop_id === currentShopId);
            const response2 = await getOrdersByStatus('Chờ lấy hàng');
            const shippingShop = response2.filter( res => res.shop_id === currentShopId);
            const response3 = await getOrdersByStatus('Đã giao hàng');
            const deliveredShop = response3.filter( res => res.shop_id === currentShopId);
            if (Array.isArray(confirmationShop)) {
                setWaitingConfirmationCount(confirmationShop.length);
            } else {
                console.error('Invalid response1 data:', confirmationShop);
            }
    
            if (Array.isArray(shippingShop)) {
                setWaitingShippingCount(shippingShop.length);
            } else {
                console.error('Invalid response2 data:', shippingShop);
            }

            if (Array.isArray(deliveredShop)) {
                setWaitingDeliveredCount(deliveredShop.length);
            } else {
                console.error('Invalid response2 data:', deliveredShop);
            }
        } catch (error) {
            console.error('Error counting orders:', error);
        }
    };

    useFocusEffect(
        useCallback(()=>{
            countOrders()
        },[shopId, currentShopId])
    );

    const handleOrderConfirmation = () => {
        countOrders(); // Refresh counts when an order is confirmed
    };

    if (!shop) {
        return (
            <View style={styles.container}>
                <Text style={{fontSize: 16, textAlign:'center', marginTop: '100%'}}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <View style={{width: 80, height: 80, borderRadius: 50}}>
                        <Image style={{width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 50}} source={{uri: shop.image}}/>
                    </View>
                    {user && <Text style={{fontSize: 16, fontStyle: 'italic', textDecorationLine: 'underline'}}>{user.last_name + user.first_name}</Text> } 
                </View>     
                <View style={{width: '60%'}}>
                    <Text style={[styles.title, {textAlign: 'center'}]}>{shop.name}</Text>
                </View>
                <TouchableOpacity
                    onPress={()=>navigation.navigate("ChatList",{previousScreen: 'ShopOwner'})}>
                    <Icon style={{fontSize: 25, color: '#000', margin: 10}} name='comment'/>
                </TouchableOpacity>
            </View>

            <View style={{width: '100%', backgroundColor: '#fff', marginTop: 10, marginBottom: 10}}>
                <View style={{width: '100%'}}>
                    <Text style={{fontSize: 16, paddingLeft: 20, paddingTop: 15}}>Đơn hàng</Text>
                </View>
                <View style={styles.orderSection}>
                    <TouchableOpacity onPress={() => navigation.navigate('WaitConfirmationShop', {onConfirmOrder: handleOrderConfirmation()})}
                        style={styles.orderStatus}>
                        <Text style={styles.orderText}>{waitingConfirmationCount}</Text>
                        <Text style={styles.orderLabel}>Chờ xác nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('WaitShippingShop')}
                        style={styles.orderStatus}>
                        <Text style={styles.orderText}>{waitingShippingCount}</Text>
                        <Text style={styles.orderLabel}>Chờ lấy hàng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('WaitDeliveredShop', {shopId: currentShopId})}
                        style={styles.orderStatus}>
                        <Text style={styles.orderText}>{waitingDeliveredCount}</Text>
                        <Text style={styles.orderLabel}>Đã giao</Text>
                    </TouchableOpacity>
                    <View style={styles.orderStatus}>
                        <Text style={styles.orderText}>0</Text>
                        <Text style={styles.orderLabel}>Đã hủy</Text>
                    </View>
                </View>
            </View>

            <View style={styles.managementSection}>
                <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('AddProduct', { shopId: currentShopId })}>
                    <Icon name="circle-plus" size={30} color="rgb(233,71,139)" />
                    <Text style={styles.managementLabel}>Thêm sản phẩm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("ProductManagement", { shopId: currentShopId })}
                    style={styles.managementItem}>
                    <Icon name="pencil" size={30} color="rgb(233,71,139)" />
                    <Text style={styles.managementLabel}>Quản lý sản phẩm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.managementItem}>
                    <Icon name="chart-bar" size={30} color="rgb(233,71,139)" />
                    <Text style={styles.managementLabel}>Khám Marketing</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.managementItem}>
                    <Icon name="gear" size={30} color="rgb(233,71,139)" />
                    <Text style={styles.managementLabel}>Điều chỉnh Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.managementItem}>
                    <Icon name="circle-info" size={30} color="rgb(233,71,139)" />
                    <Text style={styles.managementLabel}>Trung tâm hỗ trợ</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        height: '30%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    orderSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        marginBottom: 10,
    },
    orderStatus: {
        alignItems: 'center',
    },
    orderText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    orderLabel: {
        fontSize: 14,
        color: '#666',
    },
    managementSection: {
        padding: 10,
        backgroundColor: '#fff',
        height: 300
    },
    managementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    managementLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: 'rgb(97, 109, 138)',
    },
});

export default ShopOwner;