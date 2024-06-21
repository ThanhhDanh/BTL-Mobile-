import { Alert, Button, Dimensions, Image, Linking, SafeAreaView, TouchableOpacity } from "react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MyStyle from "../../Style/MyStyle";
import { useCallback, useContext, useEffect, useState } from "react";
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import MyContext from "../Templates/MyContext";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatPrice } from "../Utils/Utils";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default CheckoutScreen = ({ route, navigation }) => {
    const { productDetail, selectedCartItems } = route.params;
    const products = productDetail ? [productDetail] : selectedCartItems;
    const {user} = useContext(MyContext);
    const [previousScreen, setPreviousScreen] = useState(null);
    const [isListVisible, setIsListVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [percentages, setPercentages] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [isPaymentListVisible, setIsPaymentListVisible] = useState(false);
    const [quantities, setQuantities] = useState(products.map(product => ({ id: product.id, quantity: 1 })));
    const [waitConfirmationOrders, setWaitConfirmationOrders] = useState([]);
    const [waitShippingOrders, setWaitShippingnOrders] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);

    
    useFocusEffect(
        useCallback(() => {
            if (route.params && route.params.previousScreen) {
                setPreviousScreen(route.params.previousScreen);
            }
        }, [route])
    );

    const handleGoBack = () => {
        if (previousScreen) {
            navigation.navigate(previousScreen);
        } else {
            navigation.goBack();
        }
    };

    useEffect(() => {
        calculateTotalPrice();
    }, [products, percentages, quantities]);

    const calculateTotalPrice = () => {
        const total = products.reduce((sum, product) => {
            const productQuantity = quantities.find(q => q.id === product.id).quantity || 1;
            return sum + product.priceProduct * productQuantity;
        }, 0);
        const discount = total * (percentages / 100);
        setTotalPrice(total - discount);
    };


    const [tagList, setTagList] = useState([
        { id: 1, name: 'Rẻ hơn các loại rẻ', percentage: 80 },
        { id: 2, name: 'Dùng thử miễn phí 7 ngày', percentage: 50 },
        { id: 3, name: 'HSSV giảm thêm 500K', percentage: 80 },
        { id: 4, name: 'Tặng thêm 5 ưu đãi khác', percentage: 50 },
        { id: 6, name: 'Thu cũ đổi mới đến 2 triệu', percentage: 50 },
        { id: 7, name: 'Tặng thêm 2 triệu khi lên đời', percentage: 90 },
        { id: 8, name: 'Trả góp 0%', percentage: 60 },
        { id: 9, name: 'Giảm sập sàn', percentage: 70 },
        { id: 10, name: 'Voucher free ship', percentage: 85 },
        { id: 11, name: 'Voucher 50%', percentage: 95 },
    ]);
    
    const handleTagSelection = (tagId) => {
        const selectedTag = tagList.find(tag => tag.id === tagId);
        if (selectedTag) {
            setSelectedTag(selectedTag.id);
            setPercentages(selectedTag.percentage);
            setIsListVisible(false);
        }
    };

    const handleQuantityChange = (id, quantity) => {
        const updatedQuantities = quantities.map(q => {
            if (q.id === id) {
                return { ...q, quantity: quantity };
            }
            return q;
        });
        setQuantities(updatedQuantities);
        calculateTotalPrice();
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.priceProduct)}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, Math.max(1, quantities.find(q => q.id === item.id).quantity - 1))}>
                        <Icon name="minus" size={25} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantities.find(q => q.id === item.id).quantity}</Text>
                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, quantities.find(q => q.id === item.id).quantity + 1)}>
                        <Icon name="plus" size={25} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const handlePaymentMethodSelection = (method) => {
            setSelectedPaymentMethod(method);
            setIsPaymentListVisible(false);
    }

    const saveOrder = async (orderId, key, stateSetter, state) => {
        try {
            const newOrders = [...state, orderId];
            stateSetter(newOrders);
            await AsyncStorage.setItem(key, JSON.stringify(newOrders));
        } catch (error) {
            console.error(`Lỗi khi thêm vào trang "${key}":`, error.message);
        }
    };

    const saveToWaitConfirmation = async (orderId) => {
        const key = `waitingOrders_${user.username}_${user.id}`;
        await saveOrder(orderId, key, setWaitConfirmationOrders, waitConfirmationOrders);
    };

    const saveToWaitShipping = async (orderId) => {
        const key = `shippingOrders_${user.username}_${user.id}`;
        await saveOrder(orderId, key, setWaitShippingnOrders, waitShippingOrders);
    };


    const handleChooseAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync();
        if (!result.canceled) {
            setPaymentProof(result);
        }
    };
        
    const handlePayment = async () => {
        if (selectedPaymentMethod.key === "MOMO"){
            // Xử lý thanh toán qua Momo
            
            if (productDetail) {
                const payload = {
                    id: productDetail.id.toString(),
                    price: totalPrice.toString(),
                };
            }

            if (selectedCartItems) {
                selectedCartItems.forEach( item => {
                    const payload = {
                        id: item.id.toString(),
                        price: totalPrice.toString(),
                    };
                })
            }
            
            try {
                const inforPay = await APIs.post(endpoints['momo'], payload, {
                    withCredentials: true,
                    crossdomain: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log("lấy url" + inforPay.data.payUrl);
                const url = inforPay.data.payUrl;
                if (url) {
                    console.log("urllll " + url);
                    // Mở URL trong trình duyệt
                    Linking.openURL(url);
                }
            } catch (error) {
                console.error('Error fetching URL:', error);
            }

            console.log('Thanh toán qua Momo');
            // navigation.navigate('Momopay'); // Điều hướng đến màn hình thanh toán
        } else if (selectedPaymentMethod.key === 'COD') {
            if (!selectedPaymentMethod) {
                Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán!');
                return;
            }
            try {
                for (const product of products) {
                    console.log(product)
                    const quantityy = quantities.find(q => q.id === product.id).quantity || '';
                    const formData = new FormData();
                    formData.append('quantity', quantityy);
                    formData.append('totalPrice', totalPrice);
                    formData.append('discount', percentages);
                    formData.append('paymentMethod', 'COD');  
                    formData.append('statusPayment','DONE')
                    formData.append('orderStatus', selectedPaymentMethod.name=== 'Thanh toán khi nhận hàng' ? 'Chưa thanh toán' : 'Đã thanh toán');
                    formData.append('status', selectedPaymentMethod.name === 'Thanh toán khi nhận hàng' ? 'Chờ xác nhận' : 'Chờ giao hàng');
                    formData.append('tags', selectedTag);
                    formData.append('product_id', product.id);
                    formData.append('shop_id', product.shop_id);
                    formData.append('user_id', user.id);
                    formData.append('created_date', new Date().toISOString());
                    formData.append('updated_date', new Date().toISOString());
                   
    
                    const res = await APIs.post(endpoints['orders'], formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
    
                    if (res.data && res.data.id) {
                        // Nếu phương thức thanh toán là "Thanh toán khi nhận hàng", lưu hóa đơn vào trang "Chờ xác nhận"
                        if (selectedPaymentMethod.name === 'Thanh toán khi nhận hàng') {
                            await saveToWaitConfirmation(res.data.id);
                        }
                    }
                }
                Alert.alert('Thông báo', 'Thanh toán thành công!');
                navigation.navigate('Setting', { numberOfOrders: waitConfirmationOrders.length });
            } catch (ex) {
                console.log('Lỗi thanh toán:', ex.message);
            }
        }
    };
    
    return (
        <SafeAreaView style={MyStyle.setForm}>
            <TouchableOpacity onPress={handleGoBack}
                style={{ width: 40, height: 40, zIndex: 1, position: 'absolute', top: 35, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50 }}>
                <Icon style={{ fontSize: 15, color: '#fff' }} name="chevron-left" />
            </TouchableOpacity>
            <View style={{ marginTop: 40, flex: 1 }}>
                <Text style={{ fontSize: 20, textAlign: 'center' }}>Thông tin sản phẩm thanh toán</Text>
                <View style={{maxHeight: '40%'}}>
                    <FlatList
                        data={products}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
                <View style={{ height: '60%', width: windowWidth - 20, alignSelf: 'center' }}>
                    <TouchableOpacity onPress={() => setIsListVisible(!isListVisible)}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Voucher: {selectedTag ? (tagList.find(t => t.id === selectedTag)?.name || '') : ''}</Text>
                    </TouchableOpacity>
                    {isListVisible && (
                        <View style={[MyStyle.shadowMenuUser, { position: 'absolute', top: 20, right: 0, left: 0, zIndex: 1 }]}>
                            {tagList.map(t => (
                                <TouchableOpacity style={{ margin: 5 }} key={t.id} onPress={() => handleTagSelection(t.id)}>
                                    <Text style={{ fontSize: 16 }}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <View style={{ height: '20%', width: '100%', marginTop: 20 }}>
                        <TouchableOpacity onPress={() => setIsPaymentListVisible(!isPaymentListVisible)}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                                Phương thức thanh toán: {selectedPaymentMethod ? selectedPaymentMethod.name : ''}
                            </Text>
                        </TouchableOpacity>
                        {isPaymentListVisible && (
                            <View style={[MyStyle.shadowMenuUser, { position: 'absolute', top: 20, right: 0, left: 0 }]}>
                                {[
                                    { id: 1, name: 'Thanh toán khi nhận hàng', key: 'COD' },
                                    { id: 2, name: 'Ví điện tử Momo', key: 'MOMO' },
                                ].map(method => (
                                    <TouchableOpacity style={{ margin: 5 }} key={method.id} onPress={() => handlePaymentMethodSelection(method)}>
                                        <Text style={{ fontSize: 16 }}>{method.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                    {/* {selectedPaymentMethod && selectedPaymentMethod.name === 'Ví điện tử Momo' && (
                        <View style={styles.uploadProofContainer}>
                            <TouchableOpacity onPress={handleChooseAvatar}>
                                <Text>Tải ảnh chứng minh thanh toán</Text>
                            </TouchableOpacity>
                            {paymentProof && <Image source={{ uri: paymentProof.uri }} style={styles.proofImage} />}
                        </View>
                    )} */}
                </View>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTopWidth: 1, borderColor: '#ccc', justifyContent: 'space-around', alignItems: 'center' }}>
                    <View
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '80%', backgroundColor: 'rgb(233,71,139)', borderRadius: 50, margin: 5 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Tổng giá: {formatPrice(totalPrice)}</Text>
                    </View>
                    <TouchableOpacity onPress={handlePayment}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '80%', backgroundColor: 'rgb(233,71,139)', borderRadius: 50, margin: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Thanh Toán</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cartItem: {
        flexDirection: 'row-reverse',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderWidth: 5,
        backgroundColor: '#ccc',
        marginTop: 20
    },
    productImage: {
        width: 80,
        height: 80,
        resizeMode: 'center',
    },
    productDetails: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 14,
        color: '#f44777',
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
    rowBack: {
        alignItems: 'center',
        backgroundColor: 'red',
        flex: 1,
        width: 80,
        flexDirection: 'row',
        paddingRight: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        height: '100%',
    },
    quantityText: {
        marginHorizontal: 20,
        fontSize: 18,
        padding: 5,
        textAlign: 'center',
        borderRadius: 50,
        backgroundColor: '#fff',
        elevation: 5,
    },
    quantityContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#ddd',
        marginHorizontal: 5,
        borderRadius: 5
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    quantity: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    uploadProofContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    proofImage: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
});