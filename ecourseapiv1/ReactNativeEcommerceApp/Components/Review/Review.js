import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import MyStyle from '../../Style/MyStyle';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Alert } from 'react-native';
import { useContext } from 'react';
import MyContext from '../Templates/MyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const ReviewScreen = ({ route, navigation }) => {
    const {user} = useContext(MyContext);
    const { orderId, productId, setNewReview, removeNotification  } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState();
    const [productInfo, setProductInfo] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchProductInfo = async () => {
            try {
                // Lấy thông tin sản phẩm từ API bằng productId
                const productRes = await authAPI().get(`${endpoints.products}${productId}/`);
                setProductInfo(productRes.data);
            } catch (error) {
                console.error("Lỗi khi tải thông tin sản phẩm:", error.message);
            }
        };
        fetchProductInfo();
    }, [productId]);

    const submitReview = async () => {
        if(user){
            try {
                let accessToken = await AsyncStorage.getItem("access-token")
                // Gửi yêu cầu API để tạo một comment mới
                const commentResponse = await authAPI(accessToken).post(endpoints['add-comment'](productId), {
                    'content': comment,
                }
            );

                // Lấy ID của comment từ phản hồi của yêu cầu API
                const commentId = commentResponse.data.id;
                console.info(commentResponse)

                const response = await APIs.post(endpoints['review'], {
                    rating,
                    comment_id: commentId,
                    user_id: user.id,  // Giả sử bạn có thông tin người dùng từ context hoặc props
                    product_id: productId,
                });
                console.info(response.data)
        
                if (response.status === 201) {
                    Alert.alert("Đánh giá thành công", "Cảm ơn bạn đã đánh giá sản phẩm!");
                    const newReview = response.data;
                    if (setNewReview) {
                        setNewReview(newReview);
                    }
                    if(removeNotification){
                        removeNotification(orderId);
                    }
                    // const updatedOrders = orders.filter(order => order.id !== orderId);
                    navigation.navigate("Setting",{productId: productId});
                } else {
                    Alert.alert("Đánh giá thất bại", "Vui lòng thử lại sau.");
                }
            } catch (error) {
                console.error("Lỗi khi gửi đánh giá:", error.message);
                Alert.alert("Đánh giá thất bại", "Vui lòng thử lại sau.");
            }
        }
    };

    return (
        <View style={MyStyle.setForm}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}></KeyboardAvoidingView>
            <View style={{height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate("Thông báo")}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 20, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Đánh giá</Text>
            </View>
            <ScrollView style={{flex: 1}}>
                <View style={styles.container}>
                    {productInfo && (
                            <View style={{height: '50%', marginBottom: 20}}>
                                <Image style={styles.image} source={{ uri: productInfo.image }} />
                                <Text style={styles.label}>Tên sản phẩm: {productInfo.name}</Text>
                                <Text style={styles.label}>Giá sản phẩm: {productInfo.priceProduct}</Text>
                                {/* Hiển thị thông tin sản phẩm khác cần thiết */}
                            </View>
                        )}
                            <TextInput
                                    style={styles.input}
                                    placeholder="Nhập đánh giá của bạn"
                                    value={comment}
                                    onChangeText={t=>setComment(t)}
                                />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số sao (1-5)"
                                value={rating.toString()}
                                onChangeText={(text) => setRating(Number(text))}
                                keyboardType="numeric"
                            />
                        <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
                            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                        </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: windowHeight,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 15,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    image: {
        width: '100%',
        height:'80%',
        marginRight: 10,
        resizeMode: 'contain',
    },
    label: {
        textAlign: 'center', 
        fontSize: 16, 
        margin: 8
    }
});

export default ReviewScreen;