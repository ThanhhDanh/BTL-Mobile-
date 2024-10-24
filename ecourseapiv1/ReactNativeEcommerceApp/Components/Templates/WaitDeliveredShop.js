import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import MyContext from '../Templates/MyContext';
import { formatPrice, getOrdersByStatus } from '../Utils/Utils';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome6';
import APIs, { endpoints } from '../../Configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WaitDeliveredShop = ({ navigation, route }) => {
    const { user } = useContext(MyContext);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [replyContent, setReplyContent] = useState({});
    const [showReplyInput, setShowReplyInput] = useState({});
    const [replyInputText, setReplyInputText] = useState({});
    const { shopId } = route.params;


    // Define callback function to update shop replies in ProductDetails
    const updateShopRepliesInProductDetails = useCallback(async (updatedReplies) => {
        try {
            await AsyncStorage.setItem('replies', JSON.stringify(updatedReplies));
        } catch (error) {
            console.error('Error updating shop replies in ProductDetails:', error);
        }
    }, []);

    useEffect(() => {
        loadDeliveredOrders();
        loadReviews();
        loadStoredReplies(); // Load stored replies when component mounts or shopId changes
    }, [shopId]);

    const loadDeliveredOrders = async () => {
        try {
            const orders = await getOrdersByStatus('Đã giao hàng');
            const ownerShop = orders.filter(order => order.shop_id === shopId);
            setDeliveredOrders(ownerShop);
        } catch (error) {
            console.error('Error loading delivered orders:', error);
        }
    };

    const loadReviews = async () => {
        try {
            const response = await APIs.get(endpoints['review']);
            setReviews(response.data);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const loadStoredReplies = async () => {
        try {
            const storedReplies = await AsyncStorage.getItem('replies');
            if (storedReplies) {
                const parsedReplies = JSON.parse(storedReplies);
                setReplyContent(parsedReplies);
            }
        } catch (error) {
            console.error('Error loading stored replies:', error);
        }
    };

    const getReviewsForProduct = (productId) => {
        return reviews.filter(review => review.product_id === productId);
    };

    const handleReplyChange = (shopId, reviewId, text) => {
        setReplyInputText(prevReplyInputText => ({
            ...prevReplyInputText,
            [reviewId]: text
        }));
    };

    const handleReplySubmit = async (shopId, reviewId) => {
        try {
            const updatedReply = {
                content : replyInputText[reviewId] || '',
                avatar : user.avatar ||'',
                timestamp : new Date().toISOString(),
            }

            console.log(updatedReply);

            // Update reviews state with the new reply
            const newReviews = reviews.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        reply: updatedReply,
                    };
                }
                return review;
            });

            // Update state with new reviews and clear reply content
            setReviews(newReviews);

            // Save the entire updated replyContent to AsyncStorage
            const updatedReplies = {
                ...replyContent,
                [shopId]: {
                    ...replyContent[shopId],
                    [reviewId]: updatedReply
                }
            };
            await storeReplies(updatedReplies);

            // Save the entire updated replyContent to AsyncStorage
            await AsyncStorage.setItem('replies', JSON.stringify({ ...replyContent, [shopId]: updatedReplies }));


            // Clear input text after successful submit
            setReplyInputText(prevReplyInputText => ({
                ...prevReplyInputText,
                [reviewId]: ''
            }));

            // Tải lại câu trả lời của cửa hàng trong ProductDetails nếu shopId khớp với shopId hiện tại
            if (shopId === route.params.shopId) {
                updateShopRepliesInProductDetails(updatedReplies[shopId] || {});
            }

        } catch (error) {
            console.error('Error handling reply submission:', error);
        }
    };
    // console.log(replyContent)

    const storeReplies = async (replies) => {
        try {
            await AsyncStorage.setItem('replies', JSON.stringify(replies));
        } catch (error) {
            console.error('Error storing replies:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.orderContainer}>
            <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
                <Text style={styles.orderText}>Mã đơn hàng: {item.id}</Text>
                <Text style={styles.orderText}>Ngày giao hàng: {moment(item.updated_date).format('DD/MM/YYYY HH:mm')}</Text>
                <Text style={styles.orderText}>Tổng tiền: {formatPrice(item.totalPrice)}</Text>
            </TouchableOpacity>
            {getReviewsForProduct(item.product_id).length > 0 && (
                <View style={styles.reviewsContainer}>
                    {getReviewsForProduct(item.product_id).map((review) => (
                        <View key={review.id} style={styles.reviewContainer}>
                            <Text style={{ fontSize: 15 }}>Đánh giá của khách hàng:</Text>
                            <Text style={styles.reviewText}>- {review.comment_content}</Text>
                            {getShopReply(shopId, review.id)}
                            <TouchableOpacity
                                style={styles.replyButton}
                                onPress={() => setShowReplyInput({ ...showReplyInput, [review.id]: !showReplyInput[review.id] })}
                            >
                                <Text style={styles.replyButtonText}>Trả lời</Text>
                            </TouchableOpacity>
                            {showReplyInput[review.id] && (
                                <View style={styles.replyInputContainer}>
                                    <TextInput
                                        style={styles.replyInput}
                                        value={replyInputText[review.id] || ''}
                                        onChangeText={(text) => handleReplyChange(shopId, review.id, text)}
                                        placeholder="Nhập phản hồi của bạn"
                                    />
                                    <TouchableOpacity
                                        style={styles.submitReplyButton}
                                        onPress={() => handleReplySubmit(shopId, review.id)}
                                    >
                                        <Text style={styles.submitReplyButtonText}>Gửi</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );



    const getShopReply = (shopId, reviewId) => {
        // Kiểm tra nếu reviewId tồn tại trong replyContent
        if (replyContent[reviewId]) {
            // Nếu replyContent[reviewId] có cấu trúc phản hồi của shop
            const { content, avatar, timestamp } = replyContent[reviewId];
            return (
                <View style={styles.replyContainer}>
                    <Text style={{ textAlign: 'right' }}>Phản hồi của shop: </Text>
                    <View style={styles.replyContentContainer}>
                        <Text style={styles.replyText}>{content}</Text>
                        <Image source={{ uri: avatar }} style={styles.replyAvatar} />
                    </View>
                    <Text style={styles.replyTimestamp}>{moment(timestamp).format('DD/MM/YYYY HH:mm')}</Text>
                </View>
            );
        }
    
        // Nếu không có phản hồi nào thỏa mãn, trả về null
        return null;
    };

    const handleOrderPress = (orderId) => {
        navigation.navigate('OrderDetail', { orderId: orderId, previousScreen: 'WaitDeliveredShop', shopId: shopId });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("ShopOwner")}
                >
                    <Icon style={styles.icon} name="chevron-left" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Đã giao hàng</Text>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
            <View style={styles.ordersContainer}>
                {deliveredOrders.length > 0 ? (
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={deliveredOrders}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có đơn hàng đã giao hàng</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 15,
        paddingHorizontal: 10,
        top: 25,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 50,
    },
    icon: {
        fontSize: 15,
        color: '#000',
    },
    headerText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 85,
    },
    ordersContainer: {
        flex: 1,
        padding: 30,
    },
    orderContainer: {
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    orderText: {
        fontSize: 16,
        marginVertical: 5,
    },
    reviewsContainer: {
        marginTop: 5,
        padding: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    reviewContainer: {
        marginBottom: 10,
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
    },
    replyButton: {
        marginTop: 5,
        backgroundColor: '#007bff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    replyButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    replyInputContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    submitReplyButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    submitReplyButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    replyContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#e9f7ef',
        borderRadius: 5,
    },
    replyText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
    },
    replyContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    replyTimestamp: {
        marginLeft: 'auto',
        fontSize: 12,
        color: '#888',
    },
    replyAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 10,
    },
});

export default WaitDeliveredShop;