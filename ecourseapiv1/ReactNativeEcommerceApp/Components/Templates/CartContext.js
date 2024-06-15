import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyContext from './MyContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingOrders, setShippingOrders] = useState([]);
    const [waitingOrders, setWaitingOrders] = useState([]);
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
            } catch (error) {
                console.error('Failed to save data to storage:', error);
            }
        }
    };

    useEffect(() => {
        saveCartData();
    }, [cartItems, waitingOrders, shippingOrders]);

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


    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems, updateCartItemQuantity, shippingOrders, setShippingOrders, waitingOrders, setWaitingOrders, addSelectedProduct, removeSelectedProduct }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};