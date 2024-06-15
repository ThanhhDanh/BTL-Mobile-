import { SafeAreaView, FlatList, View, Text, TouchableOpacity, Button, Image } from 'react-native';
import { useCallback, useState } from 'react';
import MyStyle from "../../Style/MyStyle";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useCart } from "../Templates/CartContext";
import { StyleSheet } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';

export default function CartScreen({ navigation, route }) {
    const { cartItems, removeFromCart } = useCart();
    const [selectedItems, setSelectedItems] = useState([]);
    const [previousScreen, setPreviousScreen] = useState(null);

    const toggleSelection = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const renderCartItem = ({ item }) => (
        <TouchableOpacity onPress={() => toggleSelection(item)}>
            <View style={[styles.cartItem, selectedItems.includes(item) && styles.selectedItem]}>
                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.priceProduct} đ</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteButton}>
                    <Icon name="xmark" style={{padding: 5}} size={24} color="#ccc" />
                </TouchableOpacity>
                <Image source={{ uri: item.image }} style={styles.productImage} />
            </View>
        </TouchableOpacity>
    );


    const handleCheckout = () => {
        if (selectedItems.length > 0) {
            navigation.navigate('CheckoutScreen', { selectedCartItems: selectedItems });
        } else {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán');
        }
    };

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
   
    return (
        <SafeAreaView style={MyStyle.setForm}>
             <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={handleGoBack}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 20, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Giỏ hàng</Text>
            </View>
            {cartItems.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={cartItems}
                            renderItem={renderCartItem}
                            keyExtractor={(item) => item.id.toString()}
                        />
                        <Button color='rgb(233,71,139)' title="Thanh Toán" onPress={handleCheckout} />
                    </View>
                )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cartItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginTop: 20,
        backgroundColor: '#fff',
    },
    selectedItem: {
        backgroundColor: '#aaaaaa',
    },
    productImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
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
    backRightBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 75,
        height: '100%',
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: 'red',
        flex: 1,
        width: 80,
        flexDirection: 'row',
        paddingRight: 15,
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
    deleteButton: {
        position: 'absolute',
        left: 10,
    }
});