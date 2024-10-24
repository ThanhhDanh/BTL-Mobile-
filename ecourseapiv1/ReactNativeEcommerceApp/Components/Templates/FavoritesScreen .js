import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCart } from './CartContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, endpoints } from '../../Configs/APIs';
import RenderHTML from 'react-native-render-html';
import { formatPrice } from '../Utils/Utils';
import { useWindowDimensions } from 'react-native';

const FavoritesScreen = ({ route }) => {
    const { favoriteItems, removeFavorite } = useCart();
    const [previousScreen, setPreviousScreen] = useState(null);
    const [productDetails, setProductDetails] = useState([]); // State để lưu thông tin chi tiết sản phẩm
    const navigation = useNavigation();
    const { width } = useWindowDimensions();


    useFocusEffect(
        useCallback(() => {
            if (route.params && route.params.previousScreen) {
                setPreviousScreen(route.params.previousScreen);
            }
        }, [route])
    );

    useEffect(() => {
        loadProductFavorites();
    }, [favoriteItems]);

    const handleGoBack = () => {
        if (previousScreen) {
            navigation.navigate(previousScreen);
        } else {
            navigation.goBack();
        }
    };

    const loadProductFavorites = async () => {
        try {
            let accessToken = await AsyncStorage.getItem("access-token");
            // Lặp qua từng sản phẩm yêu thích để lấy thông tin chi tiết
            const productDetailsPromises = favoriteItems.map(async (item) => {
                const res = await authAPI(accessToken).get(endpoints['product-details'](item.productId));
                return res.data;
            });
            // Chờ tất cả các promise thực hiện xong
            const products = await Promise.all(productDetailsPromises);
            // Lưu thông tin chi tiết sản phẩm vào state
            setProductDetails(products);
        } catch (err) {
            console.info("Lỗi sản phẩm yêu thích: " + err.message);
        }
    };

    if (!productDetails) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Icon style={styles.backIcon} name="chevron-left" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mục yêu thích</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Hiển thị danh sách các sản phẩm yêu thích */}
                {productDetails.map((product, index) => (
                    <View style={{borderBottomWidth: 1, borderColor: "#ccc"}} key={index}>
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                        <Text style={styles.productDescriptionTitle}>Tên: {product.name}</Text>
                        <Text style={styles.productDescriptionTitle}>Giá: {formatPrice(product.priceProduct)}</Text>
                        <TouchableOpacity onPress={() => removeFavorite(product.id)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                        <RenderHTML contentWidth={width} style={styles.productDescription} source={{ html: product.content }} />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        top: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    backIcon: {
        fontSize: 15,
        color: '#000',
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 20,
        left: 60,
    },
    content: {
        flexGrow: 1,
        padding: 15,
        marginTop: 20,
    },
    productImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        resizeMode: 'contain',
        borderRadius: 10,
    },
    productDescriptionTitle: {
        fontSize: 16,
        marginTop: 10,
    },
    productDescription: {
        fontSize: 16,
        marginTop: 5,
        lineHeight: 22,
    },
    removeButton: {
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        position: 'absolute',
        top: '30%',
        right: 20
    },
    removeButtonText: {
        color: 'rgb(233,71,139)',
        padding: 5,
    },
    loadingText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
    },
});

export default FavoritesScreen;