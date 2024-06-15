import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

const Rating = ({ productId, onRatingCalculated}) => {
  const [soldQuantity, setSoldQuantity] = useState(0);
  const [starRating, setStarRating] = useState(0);

  const loadOrders = async () => {
    try {
      let res = await APIs.get(endpoints['orders']);
      const orders = res.data.filter(o => {
          let totalQuantity = 0;        
          if(o.orderStatus === 'Đã thanh toán'){
            if(o.product_id == productId){
                  totalQuantity += o.quantity;
            }
          }
        return totalQuantity;
      });
      const quantity = orders.reduce((total, order) => total + order.quantity, 0);
      setSoldQuantity(quantity);
      calculateStarRating(quantity);
    } catch (err) {
      console.info("Lỗi rating: ", err.message);
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
    onRatingCalculated(rating);
  };

  // useEffect(() => {
  //   loadOrders();
  // }, [productId]);
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [productId])
  )

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


export const getOrdersByStatus = async (statuss) => {
  try {
      const res = await authAPI().get(endpoints.orders);
      let result = res.data.filter((order) => order.status === statuss);
      return result;
  } catch (error) {
      console.error(`Lỗi khi tải đơn hàng ${statuss}:`, error.message);
      return [];
  }
};


export const formatPrice = (price) => {
  // Chuyển số thành chuỗi
  const priceString = price.toString();
  // Tạo mảng chứa các ký tự
  const characters = priceString.split('');
  // Chèn dấu chấm sau mỗi 3 số từ phía sau
  for (let i = characters.length - 3; i > 0; i -= 3) {
      characters.splice(i, 0,'.');
  }
  // Nối lại thành chuỗi và thêm '000 đ' ở cuối
  return characters.join('')+ ` đ`;
};