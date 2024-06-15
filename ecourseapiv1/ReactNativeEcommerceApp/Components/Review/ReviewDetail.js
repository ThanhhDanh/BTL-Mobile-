import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import APIs, { authAPI, endpoints } from '../../Configs/APIs';
import MyContext from '../Templates/MyContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyStyle from '../../Style/MyStyle';

const windowHeight = Dimensions.get('window').height;

const ReviewDetailScreen = () => {
    const { user } = useContext(MyContext);
    const navigation = useNavigation();
    const route = useRoute();
    const [productInfo, setProductInfo] = useState(null);
    const [review, setReview] = useState(null);

    const { productId } = route.params;

    useEffect(() => {
        const fetchProductInfo = async () => {
            if(productId){
                try {
                    const productRes = await authAPI().get(`${endpoints.products}${productId}/`);
                    setProductInfo(productRes.data);
                } catch (error) {
                    console.error("Error fetching product info:", error.message);
                }
            }
        };

        const fetchReview = async () => {
            if(user && productId){
                 try {
                     const reviewRes = await APIs.get(`${endpoints.review}?ordering=-created_date&product_id=${productId}&user_id=${user.id}`);
                     console.info(reviewRes.data);
                     if (reviewRes.data && reviewRes.data.length > 0) {
                         setReview(reviewRes.data[0]); // Lấy đánh giá mới nhất
                     }
                 } catch (error) {
                     console.error("Error fetching review:", error.message);
                 }
            }
         };
 
         fetchProductInfo();
         fetchReview();
     }, [productId, user]);

    return (
        <View style={MyStyle.setForm}>
            <View style={{height: '12%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity onPress={() => navigation.navigate("Setting")}
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 25, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={styles.title}>Chi tiết đánh giá</Text>
            </View>
            <ScrollView style={styles.container}>
                {productInfo && (
                    <View style={styles.productContainer}>
                        <Image style={styles.image} source={{ uri: productInfo.image }} />
                        <Text style={styles.productName}>{productInfo.name}</Text>
                        <Text style={styles.productPrice}>Giá sản phẩm: {productInfo.priceProduct}</Text>
                    </View>
                )}
                {review ? (
                    <View style={styles.reviewContainer}>
                        <Text style={styles.reviewTitle}>Đánh giá của bạn:</Text>
                        <Text style={styles.reviewRating}>Số sao: {review.rating}</Text>
                        <Text style={styles.reviewComment}>Nội dung: {review.comment_content}</Text>
                    </View>
                ) : (
                    <Text style={styles.noReviewText}>Không có đánh giá nào</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        height: '10%',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    productContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: windowHeight * 0.3,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 16,
        marginBottom: 10,
    },
    reviewContainer: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    reviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewRating: {
        fontSize: 16,
        marginBottom: 10,
    },
    reviewComment: {
        fontSize: 16,
    },
    noReviewText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default ReviewDetailScreen;