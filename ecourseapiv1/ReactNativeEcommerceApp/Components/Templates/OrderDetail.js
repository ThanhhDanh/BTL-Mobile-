import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { authAPI, endpoints } from '../../Configs/APIs';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyStyle from '../../Style/MyStyle';
import { useFocusEffect } from '@react-navigation/native';
import { formatPrice } from '../Utils/Utils';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const OrderDetail = ({ route, navigation }) => {
    const { orderId, previousScreen, shopId } = route.params;
    const [orderDetail, setOrderDetail] = useState({});
    const [productDetail, setProductDetail] = useState({});

    const handleBackPress = () => {
        navigation.navigate(previousScreen, {shopId});
    };

    useEffect(() => {
        return () => {
            setOrderDetail({});
            setProductDetail({});
        };
    }, []);
    
    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const res = await authAPI().get(`${endpoints.orders}${orderId}/`);
                setOrderDetail(res.data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error.message);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    useEffect(() => {
        if (orderDetail && orderDetail.product_id) {
            const fetchProductDetail = async () => {
                try {
                    const res = await authAPI().get(`${endpoints.products}${orderDetail.product_id}/`);
                    setProductDetail(res.data);
                } catch (error) {
                    console.error("Lỗi khi tải chi tiết sản phẩm:", error.message);
                }
            };

            fetchProductDetail();
        }
    }, [orderDetail]);

    
    if (!orderDetail || !productDetail || !productDetail.priceProduct) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={MyStyle.setForm}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={handleBackPress}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 35, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold', top: 10}}>Chi tiết sản phẩm</Text>
            </View>
            <ScrollView style={{flex: 1}}>
                <View style={styles.container}>
                    <Text style={styles.label}>Mã đơn hàng: 
                        <Text style={{fontWeight: 'normal', fontSize: 16}}> {orderDetail.id}</Text>
                    </Text>
                    <Text style={styles.label}>Discount: 
                        <Text style={{fontWeight: 'normal', fontSize: 16}}> {orderDetail.discount}%</Text>
                    </Text>

                    <Text style={styles.label}>Ngày đặt: 
                        <Text style={{fontWeight: 'normal', fontSize: 16}}> {moment(orderDetail.created_date).format('DD/MM/YYYY HH:mm')}</Text>
                    </Text>

                    <Text style={styles.label}>Tổng tiền: 
                        <Text style={{fontWeight: 'normal', fontSize: 16}}> {formatPrice(orderDetail.totalPrice)} đ</Text>
                    </Text>
                    

                    {/* Hiển thị các thông tin khác của đơn hàng */}

                    <Text style={styles.label}>Danh sách sản phẩm:</Text>
                    <View style={styles.productContainer}>
                        <Image style={styles.image} source={{ uri: productDetail.image }} />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>Tên: {productDetail.name}</Text>
                            <Text style={styles.productPrice}>Giá gốc: {formatPrice(productDetail.priceProduct)} đ</Text>
                            {/* Hiển thị thông tin khác của sản phẩm */}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 16
    },
    image: {
        width: '100%',
        height: '80%',
        marginRight: 10,
        resizeMode: 'contain'
    },
    productInfo: {
        flex: 1,
        marginTop: 20
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    productPrice: {
        fontSize: 16
    },
    productContainer: {
        height: windowWidth,
        alignItems: 'center'
    }
});

export default OrderDetail;