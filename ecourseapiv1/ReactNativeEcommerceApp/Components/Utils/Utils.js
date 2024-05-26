import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome';

const Rating = ({ productId }) => {
  const [soldQuantity, setSoldQuantity] = useState(0);
  const [starRating, setStarRating] = useState(0);

  const loadOrders = async () => {
    try {
      let res = await APIs.get(endpoints['orders']);
      const orders = res.data.filter(order => order.orderStatus === "Đã Thanh Toán" && order.product_id === productId);
      const quantity = orders.reduce((total, order) => total + order.quantity, 0);
      setSoldQuantity(quantity);
      calculateStarRating(quantity);
    } catch (err) {
      console.info("Lỗi: ", err.message);
    }
  };

  const calculateStarRating = (quantity) => {
    let rating;
    if (quantity >= 3) {
      rating = 5;
    } else if (quantity == 2) {
      rating = 3;
    } else if (quantity == 1) {
      rating = 1;
    } else {
      rating = 0;
    }
    setStarRating(rating);
  };

  useEffect(() => {
    loadOrders();
  }, [productId]);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= starRating ? 'star' : 'star-o'}
          size={12}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      <Text style={styles.ratingText}>{starRating}/5</Text>
      {/* <Text>Product ID: {productId} - Sold Quantity: {soldQuantity}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
});

export default Rating;


export const getOrdersByStatus = async (status) => {
  try {
      const res = await authAPI().get(endpoints.orders);
      return res.data.filter((order) => order.status === status);
  } catch (error) {
      console.error(`Lỗi khi tải đơn hàng ${status}:`, error.message);
      return [];
  }
};