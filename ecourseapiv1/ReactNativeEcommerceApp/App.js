import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Shop from './Components/Shop/Shop';
import Login from './Components/User/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
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
import APIs, { authAPI, endpoints } from './Configs/APIs';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Setting from './Components/Templates/setting';
import Logout from './Components/User/Logout';
import CheckoutScreen from './Components/Progress/CheckoutScreen';
import WaitConfirmationScreen from './Components/Templates/WaitConfirmation';
import OrderDetail from './Components/Templates/OrderDetail';
import NotificationScreen from './Components/Templates/NotificationScreen';
import ShippingScreen from './Components/Templates/WaitShipping';
import ReviewScreen from './Components/Review/Review';
import ReviewDetailScreen from './Components/Review/ReviewDetail';
import CategoryDetails from './Components/Categories/CategoriesDetail';
import ShopDetail from './Components/Shop/ShopDetail';
import CompareScreen from './Components/Templates/CompareScreen';
import ShopItemByName from './Components/Shop/ShopItem';
import { onAuthStateChanged } from 'firebase/auth';
import Chat from './Components/Chat/Chat';
import ChatList from './Components/Chat/ChatList';
import CreateShop from './Components/Shop/CreateShop';
import AddProduct from './Components/Product/AddProduct';
import ShopOwner from './Components/Shop/ShopOwner';
import ProductManagement from './Components/Product/ProductManagement';
import WaitConfirmationShop from './Components/Templates/WaitConfirmationShop';
import WaitShippingShop from './Components/Templates/WaitShippingShop';
import WaitDeliveredShop from './Components/Templates/WaitDeliveredShop';
import FavoritesScreen from './Components/Templates/FavoritesScreen ';




const Stack = createNativeStackNavigator();

const MyStack = () => {
  const {user, dispatch, isAuthenticated, setIsAuthenticated, role, setRole} = useContext(MyContext);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='Shop' component={Shop} options={{title: 'Cửa hàng'}} />
      <Stack.Screen name='Product' component={Product} options={{title: 'Sản phẩm'}} />
      <Stack.Screen name='Orders' component={Order} options={{title: 'Đơn đặt hàng'}} />
    </Stack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

function MyTabs() {

  const {user, notificationCount} = useContext(MyContext); 

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Trang chủ" component={MyStack} 
          options={{tabBarIcon:()=>
              <Icon style={{fontSize:30}} name='house-user'/>}}
      />

      <Tab.Screen name='Thông báo' component={NotificationScreen} 
          options={{tabBarIcon: ()=>
            <Icon style={{fontSize: 30}} name='bell'/>,
            tabBarBadge: notificationCount > 0 ? notificationCount : null
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
      <Tab.Screen name="WaitShipping" component={ShippingScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="Review" component={ReviewScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ReviewDetail" component={ReviewDetailScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="CategoryDetail" component={CategoryDetails} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ProductDetails" component={ProductDetails} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ShopDetails" component={ShopDetail} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="CompareScreen" component={CompareScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ShopItemByName" component={ShopItemByName} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="Chat" component={Chat} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="CreateShop" component={CreateShop} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="AddProduct" component={AddProduct} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ChatList" component={ChatList} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ShopOwner" component={ShopOwner} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="ProductManagement" component={ProductManagement} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="WaitConfirmationShop" component={WaitConfirmationShop} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="WaitShippingShop" component={WaitShippingShop} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="WaitDeliveredShop" component={WaitDeliveredShop} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
      <Tab.Screen name="FavoritesScreen" component={FavoritesScreen} options={{tabBarIconStyle: {display: 'none'}, tabBarLabelStyle: {display: 'none'}, tabBarItemStyle:{position: 'absolute'} }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState();
  const [notificationCount, setNotificationCount] = useState(0);
  
  useEffect(() => {
    const fetchNotificationCount = async () => {
        if (user) {
            const notificationKey = `notifications_${user.username}_${user.id}`;
            const notifications = JSON.parse(await AsyncStorage.getItem(notificationKey)) || [];
            setNotificationCount(notifications.length);
        }
    };

    fetchNotificationCount();
}, [user]);

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
   <MyContext.Provider value={{user, dispatch, isAuthenticated,setIsAuthenticated,role,setRole, notificationCount,setNotificationCount}}>
      <NavigationContainer>
        <CartProvider>
            <MyTabs/>
        </CartProvider>
      </NavigationContainer>
   </MyContext.Provider>
  );
}

