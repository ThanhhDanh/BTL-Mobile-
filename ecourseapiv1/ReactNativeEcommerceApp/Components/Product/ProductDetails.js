import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

import React, { useCallback, useContext, useEffect, useState } from "react";

import { Card, List } from "react-native-paper";

import moment from "moment";
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import RenderHTML from "react-native-render-html";
import MyStyle from "../../Style/MyStyle";
import { color } from "react-native-elements/dist/helpers";
import Icon from 'react-native-vector-icons/FontAwesome6';
import Rating, { formatPrice } from "../Utils/Utils";
import Order from "../Order/Order";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../Templates/CartContext";
import MyContext from "../Templates/MyContext";
import { Alert } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const {width: windowWidth} = Dimensions.get('window')
const {height: windowHeight} = Dimensions.get('window')

const ProductDetails = ({ route, navigation}) => {
    const [productDetail, setProductDetail] = useState(null);
    const [comment, setComment] = useState(null);
    const [content, setContent] = useState();
    const productId = route.params?.productId;
    const {categoryId, shopId} = route.params;
    const {addToCart,cartItems} = useCart();
    const { width } = useWindowDimensions();
    const {user} = useContext(MyContext);
    const [previousScreen, setPreviousScreen] = useState(null);

    // console.info(productDetail)

    const loadProductDetail = async () => {
        try {
            let res = await APIs.get(endpoints['product-details'](productId));
            setProductDetail(res.data);
        } catch (ex) {
            console.error(ex);
        }
    }

    const loadComment = async () => {
        try {
            let res = await APIs.get(endpoints['comments'](productId));
            setComment(res.data.results);
        } catch (ex) {
            setComment([])
            console.error('Lỗi: '+ ex.message);
        }
    }


    useEffect(() => {
        loadProductDetail();
    }, [productId]);

    useEffect(()=>{
        loadComment();
    },[productId]);

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
    };

    const loadMoreInfo = ({nativeEvent}) => {
        if (!comment && isCloseToBottom(nativeEvent)) {
            loadComment();
        }
    }

    const addComment = async () => {
        if(user){
            try {
                let accessToken = await AsyncStorage.getItem("access-token")
                let res = await authAPI(accessToken).post(endpoints['add-comment'](productId), {
                    'content': content
                });
                //Thêm bình luận mới vào danh sách
                setComment(current => [res.data, ...current])
                // Xóa nội dung TextInput sau khi thêm bình luận
                setContent('');
            } catch (ex) {
                console.error(ex);
            }
        }else{
            setContent('');
            Alert.alert(title="Thông báo",'Bạn chưa đăng nhập!!!');
            navigation.navigate("Đăng nhập")
        }

    }

    const handleAddToCart = () => {
        if (user) {
            if (productDetail) {
                addToCart(productDetail);
            } else {
                console.info('Product detail is null');
            }
        } else {
            Alert.alert(title="Thông báo",'Bạn chưa đăng nhập!!!');
            navigation.navigate('Đăng nhập');
        }
    };

    const handleCheckout = () => {
        if (productDetail ) {
            navigation.navigate('CheckoutScreen', { productDetail: productDetail });
        } else {
            Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống');
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
        // console.info(categoryId)
        // console.info(productDetail.category_id)
        if (previousScreen) {
            navigation.navigate(previousScreen,{ categoryId: categoryId, shopId:shopId, productId: productId});
        } else {
            navigation.goBack();
        }
    };

    const handleSalesCalculated = (quantity) => {
        return quantity;
      };
    
    const handleRatingCalculated = (rating) => {
        return rating;
    };


     // Tính tổng số lượng đánh giá
     const totalReviews = productDetail?.reviews.length || 0;

     // Tính số lượng và phần trăm đánh giá cho từng mức đánh giá
     const ratingCounts = Array.from({ length: 5 }, (_, index) => {
         const rating = 5 - index;
         const ratingCount = productDetail?.reviews.filter(review => review.rating === rating).length || 0;
         const percentage = totalReviews > 0 ? (ratingCount / totalReviews) * 100 : 0;
         return {
             rating: rating,
             count: ratingCount,
             percentage: percentage,
         };
     });


    return (
            <View style={{width: '100%', height: '100%'}}>
                 <TouchableOpacity onPress={handleGoBack}
                            style={{width: 40, height: 40,zIndex: 1, position: 'absolute',top: 40, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                            <Icon style={{fontSize: 20, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                {user && <TouchableOpacity onPress={() => navigation.navigate("Chat",{previousScreen: "ProductDetails",
                    categoryId: categoryId, productId: productId, selectedUser: user
                })}
                    style={{width: 40, height: 40,zIndex: 1, position: 'absolute',top: 40, right: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 20, color: '#fff'}} name="comment"/>
                </TouchableOpacity>}
                {user && <TouchableOpacity onPress={() =>navigation.navigate('Cart', {'productDetail': productDetail },{ previousScreen: 'ProductDetail' })}
                            style={{width: 40, height: 40,zIndex: 1, position: 'absolute',top:20, right: 90, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                            <Icon style={{fontSize: 20, color: '#fff'}} name="cart-shopping"/>
                            {cartItems.length > 0 && <View style={{position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={{color: '#fff', fontSize: 12}}>{cartItems.length}</Text>
                            </View>}
                        </TouchableOpacity>}
                <ScrollView style={{flex: 1}}>
                        {productDetail===null?<ActivityIndicator/>:<>
                        <Card key={productDetail.id} style={{ borderWidth: 1}}>
                            <Card.Cover style={{height: '25%'}} resizeMode="contain" source={{ uri: productDetail.image }} />
                            <Card.Content>
                                <Text style={{fontSize: 30, fontWeight: 'bold', color: '#f44777', marginTop: 15}}>{formatPrice(productDetail.priceProduct)}</Text>
                            </Card.Content>
                            <Card.Title titleStyle={{fontSize: 20}} title={productDetail.name}/>
                            <View style={{marginLeft: 10}}>
                                <Rating productId={productId} onRatingCalculated = {handleRatingCalculated}/>
                                <View style={{position: 'absolute', bottom: 6, right: 150}}>
                                    <Order productId={productId} onSalesCalculated={handleSalesCalculated}/>
                                </View>
                            </View>
                            
                            <Card.Content>
                                <RenderHTML contentWidth={width} source={{html: productDetail.content}} />
                            </Card.Content>

                            <View style={{flex: 1, width: windowWidth - 30, borderWidth: 1, borderRadius: 10, borderColor: '#ccc', alignSelf: 'center', marginBottom: 35, padding: 10}}>
                                {/* Hiển thị danh sách đánh giá */}
                                {ratingCounts.map(({ rating, count, percentage }) => (
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: 5}} key={rating}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}>
                                            <Text style={{fontSize: 14, marginRight: 5}}>{rating}</Text>
                                            <Icon name='star' size={14} color="#FFD700"/>
                                        </View>
                                        {/* Hiển thị thanh cột và số phần trăm */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: '70%', height: 10, backgroundColor: '#ccc', borderRadius: 5, marginRight: 10 }}>
                                                <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#f44777', borderRadius: 5 }} />
                                            </View>
                                            <Text>{percentage.toFixed(2)}%</Text>
                                        </View>
                                    </View>
                                ))}
                                {/* Hiển thị phần còn lại của component */}
                            </View>

                            <View style={{width: windowWidth - 30, height: windowHeight, alignSelf: 'center'}}>
                                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}></KeyboardAvoidingView>
                                {comment===null?<ActivityIndicator />: <>
                                <ScrollView onScroll={loadMoreInfo} >
                                    <View style={{justifyContent: "center", alignItems: "center", flexDirection: 'row'}}>
                                        <TextInput value={content} onChangeText={t => setContent(t)} style={MyStyle.textInput} placeholder="Nội dung bình luận..." />
                                        <TouchableOpacity onPress={addComment}>
                                            <Text style={MyStyle.button}>Bình luận</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {comment.map(c => <>
                                        <View key={c.id}>
                                            <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,borderColor: '#ccc'}}>
                                                <Image source={{uri: c.user.avatar}} style={[MyStyle.imgComment]} />
                                                <View style={{marginLeft: 20}}>
                                                    <Text>{c.content}</Text>
                                                    <Text>{moment(c.created_date).fromNow()}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </>)}
                                    
                                </ScrollView>
                                </>}
                            </View>
                        </Card>
                        </>}
                </ScrollView>
                <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTopWidth: 1, borderColor: '#ccc', justifyContent: 'space-around', alignItems: 'center'}}>
                    <TouchableOpacity onPress={handleAddToCart}
                        style={{flex: 1, alignItems: 'center', justifyContent: 'center', height: '80%', backgroundColor: 'rgb(233,71,139)', borderRadius: 50, margin: 5}}>
                        <Icon style={{color:'#fff', fontSize: 20}} name="cart-plus"/>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>Thêm vào giỏ hàng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCheckout}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '80%', backgroundColor: 'rgb(233,71,139)', borderRadius: 50, margin: 5}}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>Thanh Toán</Text>
                    </TouchableOpacity>
                </View>
            </View>
    );
}

export default ProductDetails;