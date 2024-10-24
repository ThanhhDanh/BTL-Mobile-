import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyContext from './MyContext';
import { authAPI, endpoints } from '../../Configs/APIs';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingOrders, setShippingOrders] = useState([]);
    const [waitingOrders, setWaitingOrders] = useState([]);
    const [notificationOrders, setNotificationOrders] = useState([]);
    const [favoriteItems, setFavoriteItems] = useState([]);
    const {user} = useContext(MyContext);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        const loadCart = async () => {
            if (user) {
                try {
                    const savedCart = await AsyncStorage.getItem(`cart_${user.username}_${user.id}`);
                    // console.info(savedCart)
                    if (savedCart) {
                        setCartItems(JSON.parse(savedCart));
                    }

                    const savedShippingOrders = await AsyncStorage.getItem(`shippingOrders_${user.username}_${user.id}`);
                    // console.info(savedShippingOrders);
                    if (savedShippingOrders) {
                        setShippingOrders(JSON.parse(savedShippingOrders));
                    }

                    const savedWaitingOrders = await AsyncStorage.getItem(`waitingOrders_${user.username}_${user.id}`);
                    // console.info(savedWaitingOrders)
                    if (savedWaitingOrders) {
                        setWaitingOrders(JSON.parse(savedWaitingOrders));
                    }

                    const savedNotificationOrders = await AsyncStorage.getItem(`notifications_${user.username}_${user.id}`);
                    // console.info(savedWaitingOrders)
                    if (savedNotificationOrders) {
                        setNotificationOrders(JSON.parse(savedNotificationOrders));
                    }

                    const savedFavoriteItems = await AsyncStorage.getItem(`favorites_${user.username}_${user.id}`);
                    if (savedFavoriteItems) {
                        setFavoriteItems(JSON.parse(savedFavoriteItems));
                    }

                } catch (error) {
                    console.error('Failed to load data from storage:', error);
                }
            }
        };

        loadCart();
    }, [user]);

    const saveCartData = async () => {
        if (user) {
            try {
                await AsyncStorage.setItem(`cart_${user.username}_${user.id}`, JSON.stringify(cartItems));
                await AsyncStorage.setItem(`waitingOrders_${user.username}_${user.id}`, JSON.stringify(waitingOrders));
                await AsyncStorage.setItem(`shippingOrders_${user.username}_${user.id}`, JSON.stringify(shippingOrders));
                await AsyncStorage.setItem(`notifications_${user.username}_${user.id}`, JSON.stringify(notificationOrders));
                await AsyncStorage.setItem(`favorites_${user.username}_${user.id}`, JSON.stringify(favoriteItems));
            } catch (error) {
                console.error('Failed to save data to storage:', error);
            }
        }
    };

    useEffect(() => {
        saveCartData();
    }, [cartItems, waitingOrders, shippingOrders, favoriteItems, notificationOrders]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingProduct = prevItems.find(item => item.id === product.id);
            if (existingProduct) {
                return prevItems.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    // const updateCartItemQuantity = (productId, quantity) => {
    //     setCartItems(prevItems => {
    //         if (quantity <= 0) {
    //             return prevItems.filter(item => item.id !== productId);
    //         }
    //         return prevItems.map(item =>
    //             item.id === productId ? { ...item, quantity } : item
    //         );
    //     });
    // };
    const updateCartItemQuantity = (productId, quantity) => {
        const updatedCartItems = cartItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        setCartItems(updatedCartItems);
    };


    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
        setWaitingOrders([]);
        setShippingOrders([]);
    };



  const addSelectedProduct = (product) => {
    setSelectedProducts([...selectedProducts, product]);
  };

  const removeSelectedProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
  };

   // Add functions for favorites
   const addFavorite = (product) => {
    setFavoriteItems(prevItems => [...prevItems, { userId: user.id, username: user.username, productId: product.id }]);
};

const removeFavorite = async (productId) => {
    try {
        let accessToken = await AsyncStorage.getItem("access-token");
        // Gửi yêu cầu PATCH để cập nhật active thành false
        await authAPI(accessToken).patch(endpoints['like-product'](productId), { likes: [{ active: false }] });
        
        // Cập nhật lại state local
        setFavoriteItems(prevItems => prevItems.filter(item => item.productId !== productId));
        
        // Lưu lại vào AsyncStorage
        saveCartData();
    } catch (error) {
        console.error('Failed to remove favorite:', error);
    }
};

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems, updateCartItemQuantity, shippingOrders, setShippingOrders, waitingOrders, setWaitingOrders, addSelectedProduct, removeSelectedProduct, favoriteItems, addFavorite, removeFavorite }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};