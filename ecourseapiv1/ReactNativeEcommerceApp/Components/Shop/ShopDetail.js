import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import APIs, { endpoints } from '../../Configs/APIs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Rating, { formatPrice } from '../Utils/Utils';
import Order from '../Order/Order';
import { useCart } from '../Templates/CartContext';

const ShopDetail = ({ route, navigation }) => {
    const { shopId,onRatingCalculated,onSalesCalculated } = route.params;
    const [shop, setShop] = useState(null);
    const { cartItems, addSelectedProduct } = useCart();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadShopDetail = async () => {
            try {
                setLoading(true);
                let shopRes = await APIs.get(`${endpoints['shop-details'](shopId)}`);
                setShop(shopRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadShopDetail();
    }, [shopId]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                let productsRes = await APIs.get(`${endpoints['shop-details'](shopId)}products/?q=${searchQuery}`);
                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [shopId, searchQuery]);

    if (loading) {
        return <ActivityIndicator style={{flex: 1, justifyContent: 'center'}} size="large" />;
    }

    const renderShopHeader = () => (
        <View style={{ padding: 20, backgroundColor: '#121139', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
            {shop && (
                <>
                    <Image style={{ width: '100%', height: 200, borderRadius: 10 }} source={{ uri: shop.image }} />
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginVertical: 10 }}>{shop.name}</Text>
                    <Text style={{ fontSize: 16, color: '#fff', marginBottom: 20 }}>{shop.address}</Text>
                    <TouchableOpacity style={{position: 'absolute', right: 20, bottom: 90}} 
                        onPress={()=>navigation.navigate("Cart", {previousScreen: 'ShopDetails', shopId: shop.id})}>
                        <Icon style={{fontSize: 20, color: '#fff', margin: 10}} name='cart-shopping'/>
                        {cartItems.length > 0 && <View style={{position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{color: '#fff', fontSize: 12}}>{cartItems.length}</Text>
                        </View>}
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10 }}>
                        <Icon name="magnifying-glass" size={20} color="#000" />
                        <TextInput
                            style={{ flex: 1, height: 40, paddingHorizontal: 10 }}
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </>
            )}
        </View>
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity onPress={()=> navigation.navigate('ProductDetails',{productId: item.id, previousScreen: 'ShopDetails', shopId: item.shop_id})}
            style={{ marginBottom: 10, backgroundColor: '#fff', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <Image style={{ width: '100%', height: 150}} resizeMode= 'contain' source={{ uri: item.image }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}>{item.name}</Text>
            <Text>{formatPrice(item.priceProduct)}</Text>
            <Text>{item.reviews.comment_content}</Text>
            <View style={{width: '100%'}}>
                <Rating productId={item.id} onRatingCalculated={onRatingCalculated}/>
                <Order productId={item.id} onSalesCalculated={onSalesCalculated}/>
            </View>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {renderShopHeader()}
                    <FlatList
                        style={{ flex: 1, backgroundColor: '#f5f5f5' }}
                        data={filteredProducts}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderProductItem}
                        keyboardShouldPersistTaps='handled'
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default ShopDetail;