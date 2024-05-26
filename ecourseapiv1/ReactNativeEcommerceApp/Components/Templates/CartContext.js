import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyContext from './MyContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [user] = useContext(MyContext);

    useEffect(() => {
        const loadCart = async () => {
            if (user) {
                try {
                    const savedCart = await AsyncStorage.getItem(`cart_${user.username}`);
                    if (savedCart) {
                        setCartItems(JSON.parse(savedCart));
                    }
                } catch (error) {
                    console.error('Failed to load cart from storage:', error);
                }
            }
        };

        loadCart();
    }, [user]);

    useEffect(() => {
        const saveCart = async () => {
            if (user) {
                try {
                    await AsyncStorage.setItem(`cart_${user.username}`, JSON.stringify(cartItems));
                    console.info(`cart_${user.username}`)
                } catch (error) {
                    console.error('Failed to save cart to storage:', error);
                }
            }
        };

        saveCart();
    }, [cartItems, user]);

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
    };


    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, setCartItems, updateCartItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};