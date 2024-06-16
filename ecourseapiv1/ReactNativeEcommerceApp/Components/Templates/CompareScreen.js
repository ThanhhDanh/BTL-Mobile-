import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Rating, { formatPrice } from '../Utils/Utils'; 
import Order from '../Order/Order'; 
import PropTypes from 'prop-types';
import { useCart } from './CartContext';

const CompareScreen = ({ route, navigation }) => {
    const { selectedProducts: selectedProductsFromRoute, cate, onProductRemovedFromComparison, shopId } = route.params;
  const [previousScreen, setPreviousScreen] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [productSales, setProductSales] = useState({});
  const [productReviews, setProductReviews] = useState({});
  const { addSelectedProduct, removeSelectedProduct } = useCart();
  const [selectedProducts, setSelectedProducts] = useState(selectedProductsFromRoute);

  useEffect(() => {
    setSelectedProducts(selectedProductsFromRoute);
  }, [selectedProductsFromRoute]);

  // Kiểm tra số lượng sản phẩm đã chọn khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (route.params && route.params.previousScreen) {
        setPreviousScreen(route.params.previousScreen);
      }
    }, [route])
  );


  useEffect(() => {
    // Đếm số lượng đánh giá cho từng sản phẩm
    const reviewsCount = {};
    selectedProductsFromRoute.forEach(product => {
      reviewsCount[product.id] = product.reviews.length;
    });
    setProductReviews(reviewsCount);
  }, [selectedProductsFromRoute]);

  const handleGoBack = () => {
    if (previousScreen) {
      navigation.navigate(previousScreen, { selectedProductsFromRoute: selectedProductsFromRoute, shopId});
    } else {
      navigation.goBack();
    }
  };

  const handleRatingCalculated = (productId, rating) => {
    setProductRatings(prevRatings => ({
      ...prevRatings,
      [productId]: rating
    }));
  };

  const handleSalesCalculated = (productId, sales) => {
    setProductSales(prevSales => ({
      ...prevSales,
      [productId]: sales
    }));
  };

  const handleRemoveProduct = (productId) => {
    removeSelectedProduct(productId); // Xóa sản phẩm trong giỏ hàng hoặc logic của bạn
    const newSelectedProducts = selectedProducts.filter(product => product.id !== productId);
    setSelectedProducts(newSelectedProducts);

    // Cập nhật lại tham số trong route.params
    navigation.setParams({
      ...route.params,
      selectedProducts: newSelectedProducts,
      selectedProductsFromRoute: newSelectedProducts,
    });

    // Gọi hàm callback để thông báo rằng sản phẩm đã được xóa khỏi danh sách so sánh
    if (onProductRemovedFromComparison) {
      onProductRemovedFromComparison(productId);
    }
  };

  const handleAddProduct = () => {
    // Kiểm tra số lượng sản phẩm đã chọn
    if (selectedProducts.length < 2) {
      // Nếu chưa đạt tối đa, chuyển đến màn hình CategoryDetail để chọn thêm sản phẩm
      navigation.navigate('CategoryDetail', { selectedProductsFromRoute });
    } else {
      // Nếu đã đạt tối đa, thông báo cho người dùng
      Alert.alert("Thông báo","Bạn chỉ có thể chọn tối đa 2 sản phẩm.");
    }
  };

  const getBetterProduct = () => {
    if (selectedProductsFromRoute.length >= 2) {
      const [productA, productB] = selectedProductsFromRoute;
      const priceA = parseFloat(productA.priceProduct);
      const priceB = parseFloat(productB.priceProduct);
      const ratingA = productRatings[productA.id] || 0;
      const ratingB = productRatings[productB.id] || 0;
      const salesA = productSales[productA.id] || 0;
      const salesB = productSales[productB.id] || 0;
      // const reviewsA = productReviews[productA.reviews.length > 0 ? reviewsA : "Chưa có đánh giá nào!"];
      // const reviewsB = productReviews[productB.reviews.length > 0 ? reviewsB : "Chưa có đánh giá nào!"];


      // Custom logic to decide the better product
      if (ratingA !== ratingB) {
        return ratingA > ratingB ? productA : productB;
      } else if (ratingA === ratingB) {
        if (salesA !== salesB) {
          return salesA > salesB ? productA : productB;
        } else if (salesA === salesB) {
          if (priceA !== priceB) {
            return priceA > priceB ? productB : productA;
          }
        }
      }
    }
  
    // If selectedProducts doesn't have enough items, return null or handle it accordingly
    return null;
  };

  const betterProduct = getBetterProduct();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon style={styles.backIcon} name="chevron-left" />
        </TouchableOpacity>
        <Text style={styles.title}>Sản phẩm so sánh</Text>
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.compareContainer}>
          {selectedProductsFromRoute.map((product, index) => (
            <View key={index} style={styles.product}>
              <TouchableOpacity onPress={() => handleRemoveProduct(product.id)} style={styles.deleteButton}>
                <Icon name="times-circle" size={22} color="rgb(233,71,139)" />
              </TouchableOpacity>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{cate}</Text>
              </View>
              <Image style={styles.productImage} source={{ uri: product.image }} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(product.priceProduct)}</Text>
              <View style={styles.ratingContainer}>
                <Rating productId={product.id} onRatingCalculated={(rating) => handleRatingCalculated(product.id, rating)} />
              </View>
              <View style={styles.orderContainer}>
                <Order productId={product.id} onSalesCalculated={(sales) => handleSalesCalculated(product.id, sales)} />
              </View>
            </View>
          ))}
        </View>
        {selectedProductsFromRoute.length > 0 && betterProduct && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Sản phẩm nên mua</Text>
            {betterProduct && (
              <>
                <Image style={styles.productImage} source={{ uri: betterProduct.image }} />
                <Text style={styles.productName}>{betterProduct.name}</Text>
                <Text style={styles.productPrice}>{formatPrice(betterProduct.priceProduct)}</Text>
                <Text style={styles.productDescription}>{productReviews[betterProduct.id] > 0 ? productReviews[betterProduct.id] : 0} đánh giá</Text>
                <Text style={styles.productSales}>Lượt bán: {productSales[betterProduct.id] > 0 ? productSales[betterProduct.id] : 0 }</Text>
              </>
            )}
            {!betterProduct && (
              <Text style={styles.noBetterProduct}>Không có sản phẩm nào được chọn.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

CompareScreen.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    zIndex: 1,
    position: 'absolute',
    top: 40,
    left: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
  },
  backIcon: {
    fontSize: 15,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  product: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  categoryBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgb(233,71,139)',
    zIndex: 1,
    width: 35,
    height: 25,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  categoryText: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    color: '#fff',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  productSales: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: 10,
  },
  orderContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center'
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    zIndex: 1,
    position: 'absolute',
    top: 40,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
  },
  addButtonText: {
    fontSize: 15,
    color: '#fff',
  },
});

export default CompareScreen;