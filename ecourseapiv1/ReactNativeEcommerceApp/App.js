import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Shop from './Components/Shop/Shop';
import Login from './Components/User/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Components/Templates/Home';
import setting from './Components/Templates/setting';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyStyle from './Style/MyStyle';
import Register from './Components/Templates/Register';
import MyContext from './Components/Templates/MyContext';
import MyUserReducer from './Reducers/MyUserReducer';
import Product from './Components/Product/Product';
import ProductDetails from './Components/Product/ProductDetails';
import Order from './Components/Order/Order';
import CartScreen from './Components/Progress/Cart';
import { CartProvider } from './Components/Templates/CartContext';
import { authAPI, endpoints } from './Configs/APIs';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Setting from './Components/Templates/setting';
import Logout from './Components/User/Logout';
import CheckoutScreen from './Components/Progress/CheckoutScreen';
import WaitConfirmationScreen from './Components/Templates/WaitConfirmation';
import OrderDetail from './Components/Templates/OrderDetail';
import NotificationScreen from './Components/Templates/NotificationScreen';
import ShippingScreen from './Components/Templates/WaitShipping';





const Stack = createNativeStackNavigator();

const MyStack = () => {
  // const [user, dispatch] = useContext(MyContext);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [role, setRole] = useState();
  const [user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole] = useContext(MyContext);

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      if (token !== null) {
        console.log('Token:', token);
        let user = await authAPI(token).get(endpoints['current-user']);
        console.log(user.data);
        dispatch({
          "type": "login",
          "payload": user.data
        });
        setIsAuthenticated(true);
        setRole(user.data.role);
      } else {
        console.log('Không tìm thấy token trong AsyncStorage');
      }
    } catch (ex) {
      console.log("Lỗi app: " + ex.message);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='Shop' component={Shop} options={{title: 'Cửa hàng'}} />
      <Stack.Screen name='Product' component={Product} options={{title: 'Sản phẩm'}} />
      <Stack.Screen name='ProductDetails' component={ProductDetails} options={{title: 'Chi tiết sản phẩm'}} />
      <Stack.Screen name='Orders' component={Order} options={{title: 'Đơn đặt hàng'}} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ Hàng' }} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: 'Thanh Toán' }} />
      <Stack.Screen name="WaitConfirmation" component={WaitConfirmationScreen} options={{ title: 'Chờ xác nhận' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Chi tiết hóa đơn' }} />
      <Stack.Screen name="WaitShipping" component={ShippingScreen} options={{ title: 'Chi tiết hóa đơn' }} />
    </Stack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

function MyTabs() {

  const [user] = useContext(MyContext); 

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Trang chủ" component={MyStack} 
          options={{tabBarIcon:()=>
              <Icon style={{fontSize:30}} name='house-user'/>}}
      />

      <Tab.Screen name='Thông báo' component={NotificationScreen} 
          options={{tabBarIcon: ()=>
            <Icon style={{fontSize: 30}} name='bell'/>
      }}/>
       
       <Tab.Screen 
          name={user? "Setting" : "Đăng nhập"} 
          component={user ? Setting : Login} 
          options={{ 
            tabBarIcon:()=>
              <Icon style={{fontSize:30}} name='user'/>,
            tabBarLabel: user ? user.username : "Đăng nhập" 
          }}
      />
      <Tab.Screen name="Cart" component={CartScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="CheckoutScreen" component={CheckoutScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="WaitConfirmation" component={WaitConfirmationScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="OrderDetail" component={OrderDetail} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ShippingScreen" component={ShippingScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
    </Tab.Navigator>
  );
}

export default function App() {

  // const [user, dispatch] = useReducer(MyUserReducer, null);
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access-token');
        if (token !== null) {
          console.log('Token:', token);
          let user = await authAPI(token).get(endpoints['current-user']);
          console.log(user.data);
          dispatch({
            "type": "login",
            "payload": user.data
          });
          setIsAuthenticated(true);
          setRole(user.data.role);
        } else {
          console.log('Không tìm thấy token trong AsyncStorage');
        }
      } catch (ex) {
        console.log("Lỗi app: " + ex.message);
      }
    };

    getAccessToken();
  }, []);

  return (
   <MyContext.Provider value={[user, dispatch, isAuthenticated,setIsAuthenticated,role,setRole]}>
      <NavigationContainer>
        <CartProvider>
            <MyTabs/>
        </CartProvider>
      </NavigationContainer>
   </MyContext.Provider>
  );
}

