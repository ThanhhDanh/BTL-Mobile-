import { Image, SafeAreaView, Text, TouchableOpacity, View, Dimensions, ImageBackground, ScrollView, Button, StyleSheet } from "react-native";
import MyStyle from "../../Style/MyStyle";
import { useCallback, useContext, useEffect, useState } from "react";
import MyContext from "./MyContext";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Divider, Menu, PaperProvider } from "react-native-paper";
import { useCart } from "./CartContext";
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import Logout from "../User/Logout";
import { authAPI, endpoints } from "../../Configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrdersByStatus } from "../Utils/Utils";
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


const Setting = ({navigation, route, previousScreen})=>{
    console.info("route: " +JSON.stringify(route.params, null, 2))
    const {user, dispatch} = useContext(MyContext);
    const { cartItems } = useCart();
    const [numberOfWaitingConfirmationOrders, setNumberOfWaitingConfirmationOrders] = useState(0);
    const [numberOfShippingOrders, setNumberOfShippingOrders] = useState(0);
    const { productId, updatedOrders  } = route.params || {};
    const keyWaitingConfirmation = `waitingOrders_${user.username}_${user.id}`;
    const keyShippingOrders = `shippingOrders_${user.username}_${user.id}`;

    //Menu
    const [showInfo, setShowInfo] = useState(false);
    const toggleInfo = () => {
        setShowInfo(!showInfo);
    };

    useEffect(() => {
        if (route.params && route.params.productId) {
            const { productId, updatedOrders  } = route.params;
            // Thực hiện các thao tác cần thiết với productId
        }
    }, [route.params]);


        
    const loadOrders = async () => {
        if (user) {
            try {
                const savedWaitingOrders = await AsyncStorage.getItem(keyWaitingConfirmation);
                const savedShippingOrders = await AsyncStorage.getItem(keyShippingOrders);

                let waitingOrders = [];
                let shippingOrders = [];

                if (savedWaitingOrders && savedWaitingOrders.length === 0) {
                    waitingOrders = JSON.parse(savedWaitingOrders);
                } else {
                    waitingOrders = await getOrdersByStatus("Chờ xác nhận");
                    if (waitingOrders && waitingOrders.length === 0) {
                        await AsyncStorage.setItem(keyWaitingConfirmation, JSON.stringify(waitingOrders));
                    }
                }

                if (savedShippingOrders && savedShippingOrders.length === 0) {
                    shippingOrders = JSON.parse(savedShippingOrders);
                } else {
                    shippingOrders = await getOrdersByStatus("Chờ giao hàng");
                    if (shippingOrders && shippingOrders.length === 0) {
                        await AsyncStorage.setItem(keyShippingOrders, JSON.stringify(shippingOrders));
                    }
                }

                const filteredWaitingOrders = waitingOrders.filter(order => order.user_id === user.id);
                const filteredShippingOrders = shippingOrders.filter(order => order.user_id === user.id);

                setNumberOfWaitingConfirmationOrders(waitingOrders.length);
                setNumberOfShippingOrders(shippingOrders.length);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng từ bộ nhớ:', error);
            }
        }
    };

    useFocusEffect(
        useCallback(()=>{
            loadOrders();
        },[user])
    )
    


    return (
        <SafeAreaView style={{flex: 1}}>
                <View style={{width: '100%', height: '25%'}}>
                    <ImageBackground source={{uri: 'https://images.fpt.shop/unsafe/filters:quality(90)/fptshop.com.vn/uploads/images/tin-tuc/167206/Originals/hinh-nen-mau-xanh-la-cay%20(33).jpg'}} 
                        style={[{width: '100%', height: '100%', justifyContent: 'center'}]} resizeMode="cover">
                        {/* <Image style={{width: '100%', height: '100%'}} source={{uri: 'https://i.pinimg.com/564x/c2/e9/02/c2e902e031e1d9d932411dd0b8ab5eef.jpg'}}/> */}

                        {user ? (
                            <View style={[MyStyle.shadowProp,{flexDirection: 'row', position: 'absolute', bottom: 10, left: 15, alignItems: 'center'}]}>
                                <Image style={[MyStyle.img,{margin: 10}]} source={{uri: user.avatar}}/>
                                <Text style={{fontSize: 25, color: '#fff', fontWeight: 'bold', margin: 10}}>{user.username}</Text>
                            </View>
                        ):''}

                        <View style={{flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 35, right: 15}}>
                            <TouchableOpacity>
                                <Icon style={{fontSize: 25, color: '#fff', margin: 10}} name="gears"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>navigation.navigate("Cart", {previousScreen: 'Setting'})}>
                                <Icon style={{fontSize: 25, color: '#fff', margin: 10}} name='cart-shopping'/>
                                {cartItems.length > 0 && <View style={{position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color: '#fff', fontSize: 12}}>{cartItems.length}</Text>
                                </View>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>navigation.navigate("Chat")}>
                                <Icon style={{fontSize: 25, color: '#fff', margin: 10}} name='comment'/>
                            </TouchableOpacity>
                        </View>          
                    </ImageBackground>
                </View>
                <View style={{height: '25%', width: '100%'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'center', marginTop: 50}}>
                        <TouchableOpacity onPress={()=> navigation.navigate('WaitConfirmation')}
                            tyle={{alignItems: 'center', margin: 20}}>
                            <Icon style={{fontSize: 25 , color: '#4D8D6E', textAlign: 'center'}} name="wallet"/>
                            <Text style={{marginTop: 10}}>Chờ xác nhận</Text>
                            {numberOfWaitingConfirmationOrders > 0 && <View style={{position: 'absolute', top: -8, right: 10, backgroundColor: '#4D8D6E', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color: '#fff', fontSize: 14}}>{numberOfWaitingConfirmationOrders}</Text>
                                </View>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>navigation.navigate("WaitShipping")}
                            style={{alignItems: 'center', margin: 20}}>
                            <Icon style={{fontSize: 25, color: '#4D8D6E', textAlign: 'center'}} name="truck-fast"/>
                            <Text style={{marginTop: 10}}>Chờ giao hàng</Text>
                            {numberOfShippingOrders > 0 && <View style={{position: 'absolute', top: -8, right: 10, backgroundColor: '#4D8D6E', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color: '#fff', fontSize: 14}}>{numberOfShippingOrders}</Text>
                                </View>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("ReviewDetail", { productId: productId })}
                            style={{alignItems: 'center', margin: 20}}>
                            <Icon style={{fontSize: 25, color: '#4D8D6E', textAlign: 'center' }} name="face-kiss-wink-heart"/>
                            <Text style={{marginTop: 10}}>Đánh giá</Text>
                            {/* {notificationCount > 0 && <View style={{position: 'absolute', top: -8, right: 10, backgroundColor: '#4D8D6E', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color: '#fff', fontSize: 14}}>{notificationCount}</Text>
                                </View>} */}
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{width: '100%', height: '25%'}}>
                    <TouchableOpacity onPress={toggleInfo}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}>
                            <Icon style={{fontSize: 30 , color: '#4D8D6E'}} name="id-card"/>
                            <Text style={{marginLeft: 10, fontSize: 18, fontWeight: '500'}}>Thông tin cá nhân</Text>
                        </View>
                    </TouchableOpacity>
                    {showInfo && (
                        <View style={[MyStyle.shadowMenuUser,{paddingLeft: 20, marginTop: 10}]}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon style={{color: '#4D8D6E', fontSize: 15}} name="clipboard-user"/>
                                <Text style={{fontSize: 16, marginLeft: 10}}>{user.username}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon style={{color: '#4D8D6E', fontSize: 15}} name="at"/>
                                <Text style={{fontSize: 16, marginLeft: 10}}>{user.email}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon style={{color: '#4D8D6E', fontSize: 15}} name="address-card"/>
                                <Text style={{fontSize: 16, marginLeft: 10}}>{user.address}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon style={{color: '#4D8D6E', fontSize: 15}} name="ranking-star"/>
                                <Text style={{fontSize: 16, marginLeft: 10}}></Text>
                            </View>

                            {/* Thêm các trường thông tin khác */}
                        </View>
                    )}
                </View>
                <View style={{width: '40%',height: '15%'}}>
                    <Logout navigation={navigation} />
                </View>
        </SafeAreaView>
    );
};

export default Setting;