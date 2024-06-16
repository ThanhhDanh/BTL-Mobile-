import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TouchableWithoutFeedback, Alert } from 'react-native';
import APIs, { endpoints } from '../../Configs/APIs';
import { useRoute } from '@react-navigation/native';
import { List } from 'react-native-paper';
import MyStyle from '../../Style/MyStyle';
import { HeaderApp } from '../Shop/Shop';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Rating, { formatPrice } from '../Utils/Utils';
import MyContext from '../Templates/MyContext';
import { useCart } from '../Templates/CartContext';
import Order from '../Order/Order'; 

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CategoryDetails = ({navigation, route, previousScreen}) => {
  console.info("route: " +JSON.stringify(route.params, null, 2))
  const {user, dispatch} = useContext(MyContext);
  const { cartItems, addSelectedProduct } = useCart();
  const { categoryId} = route.params || {};
  const [shops, setShops] = useState([]);
  const [cate, setCate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [sortBy, setSortBy] = useState(''); // 'name' or 'price'
  const [sortOrder, setSortOrder] = useState(''); // 'asc' or 'desc'
  const [showSortOptions, setShowSortOptions] = useState(false); // State to control the visibility of sort options
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleProductSelection = (product) => {
    if (selectedProducts.includes(product) && selectedProducts.length <= 2) {
      setSelectedProducts(selectedProducts.filter(p => p !== product));
    } else if (selectedProducts.length < 2) {
      setSelectedProducts([...selectedProducts, product]);
    } else {
      // Nếu đã chọn đủ 2 sản phẩm, hiển thị thông báo
      Alert.alert("Thông báo", "Bạn chỉ có thể chọn tối đa 2 sản phẩm.");
    }
  };

  useEffect(() => {
    if (route.params.selectedProductsFromRoute) {
      setSelectedProducts(route.params.selectedProductsFromRoute);
    }
  }, [route.params]);


  useEffect(() => {
    if (route.params && route.params.categoryId) {
      const { categoryId } = route.params;
      setSelectedShopId(null);
      loadShopsByCategory(categoryId);
    }
  }, [route]);

  const loadShopsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const res = await APIs.get(`${endpoints['categories']}${categoryId}/`);
      setShops(res.data.shops);
      setCate(res.data.name);
    } catch (ex) {
      console.error("Lỗi category " + ex.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleProductRemovedFromComparison = (productId) => {
    const newSelectedProducts = selectedProducts.filter(product => product.id !== productId);
    setSelectedProducts(newSelectedProducts);
  };
  
  useEffect(() => {
    if (categoryId) {
      loadShopsByCategory(categoryId);
  }
  }, [categoryId]);

  const handleSelectProduct = () => {
    navigation.navigate('CompareScreen', {
      selectedProducts,
      previousScreen: 'CategoryDetail',
      cate,
      onProductRemovedFromComparison: handleProductRemovedFromComparison
    });
  };

  

  const renderShopNames = () => {
    return (
      <View>
          <TouchableOpacity onPress={() => setShowSortOptions(!showSortOptions)}
            style={{position: 'absolute', left: 0, zIndex: 100, bottom: 0, height: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1}}>
            <Text style={[styles.shopNameText,{marginLeft: 5}]}>Sắp xếp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSelectProduct}
            style={{position: 'absolute', right: 0, zIndex: 100, bottom: 0, height: '100%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, }}>
            <Text style={[styles.shopNameText,{marginLeft: 5}]}>So sánh</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginLeft: 60, marginRight: 60}}>
          <View style={styles.shopNamesContainer}>
            <TouchableOpacity
              style={[styles.shopName, selectedShopId === null && styles.selectedShop]}
              onPress={() => setSelectedShopId(null)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'center'}}>
                {selectedShopId === null && <Icon style={{marginRight: 10, color:'rgb(233,71,139)', shadowOpacity: 1}} name='check'/>}
                <Text style={styles.shopNameText}>Tất cả</Text>
              </View>
            </TouchableOpacity>
            {shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={[styles.shopName, shop.id === selectedShopId && styles.selectedShop]}
                onPress={() => setSelectedShopId(shop.id)}
              >
                <View style={{flexDirection: 'row', alignItems: 'center',justifyContent: 'center'}}>
                  {shop.id === selectedShopId && <Icon style={{marginRight: 10, color:'rgb(233,71,139)', shadowOpacity: 1}} name='check'/>}
                  <Text style={styles.shopNameText}>{shop.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {showSortOptions && (
          <TouchableWithoutFeedback onPress={() => setShowSortOptions(false)}>
            <View style={styles.sortButtonsContainer}>
              <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('name')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {sortBy === 'name' && <Icon style={{ marginRight: 5, color: 'rgb(233,71,139)' }} name='check' />}
                  <Text style={styles.sortButtonText}>Sắp xếp theo tên</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('price')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {sortBy === 'price' && <Icon style={{ marginRight: 5, color: 'rgb(233,71,139)' }} name='check' />}
                  <Text style={styles.sortButtonText}>Sắp xếp theo giá</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  };

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      // If the same button is clicked, reset sort
      setSortBy(null);
      setSortOrder(null);
    } else {
      // Otherwise, set the sort criteria and toggle the sort order
      setSortBy(criteria);
      setSortOrder('asc');
    }
    setShowSortOptions(false); // Hide sort options after selection
  };


  const renderProducts = () => {
    let allProducts = [];
    shops.forEach((shop) => {
      if (!selectedShopId || shop.id === selectedShopId) {
        allProducts = [...allProducts, ...shop.products];
      }
    });

    allProducts.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.priceProduct - b.priceProduct : b.priceProduct - a.priceProduct;
      }
    });

    const handleSalesCalculated = (quantity) => {
      return quantity;
    };
  
    const handleRatingCalculated = (rating) => {
      return rating;
    };


  
    return (
      <FlatList
        data={allProducts}
        keyExtractor={(product) => product.id.toString()}
        numColumns={3} // Set the number of columns here
        horizontal={false}
        contentContainerStyle={styles.productsContainer}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => navigation.navigate("ProductDetails",{productId: product.id, previousScreen: "CategoryDetail", categoryId })}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={{position: 'absolute',right: 2, top: 0, zIndex: 1}}
              onPress={() => toggleProductSelection(product)}>
              <Icon name={selectedProducts.includes(product) ? 'check-square' : 'square'} size={18} color="rgb(233,71,139)" />
            </TouchableOpacity>
            <View style={{position: 'absolute', top: 0, left: 0, backgroundColor: 'rgb(233,71,139)', zIndex: 1, width: 35, height: 25, borderBottomRightRadius: 10, borderTopLeftRadius: 5}}>
              <Text style={{fontSize: 9,textAlign: 'center', fontWeight: '500', color: '#fff'}}>{cate}</Text>
            </View>
            <Image style={styles.productImage} source={{ uri: product.image }} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{`${formatPrice(product.priceProduct)}`}</Text>
            </View>
            <View style={{marginBottom: 10}}>
              <Rating productId={product.id} onRatingCalculated={handleRatingCalculated}/>
            </View>
            <View style={{position: 'absolute', bottom: 5, right: 5}}>
              <Order productId={product.id} onSalesCalculated={handleSalesCalculated}/>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };
  

  return (
    <View style={MyStyle.setForm}>
        <View style={{width: '100%', height: '20%'}}>
            <View style={{backgroundColor: "#121139", flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <TouchableOpacity onPress={()=>navigation.navigate("Trang chủ",{previousScreen: "Trang chủ"})}
                style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderRadius: 50}}>
                <Icon style={{fontSize: 20, color: '#fff'}} name="chevron-left"/>
              </TouchableOpacity>
              <Text style={{fontSize: 30, color: "#fff"}}>Bamboo</Text>
              {user ? (
                <TouchableOpacity onPress={()=>navigation.navigate("Cart", {previousScreen: 'CategoryDetail'})}
                style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderRadius: 50}}>
                <Icon style={{fontSize: 20, color: '#fff', margin: 10}} name='cart-shopping'/>
                {cartItems.length > 0 && <View style={{position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{color: '#fff', fontSize: 12}}>{cartItems.length}</Text>
                </View>}
              </TouchableOpacity>
              ): 
              (
                <TouchableOpacity
                  style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderRadius: 50}}>
                  {/* <Icon style={{fontSize: 20, color: '#fff', margin: 10}} name='cart-shopping'/>
                  {cartItems.length > 0 && <View style={{position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{color: '#fff', fontSize: 12}}>{cartItems.length}</Text>
                  </View>} */}
                </TouchableOpacity>
              )}
            </View>
        </View>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
                {renderShopNames()}
                {renderProducts()}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shopNamesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
    borderBottomWidth: 1,
  },
  shopName: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#cccc',
    backgroundColor: '#f0f0f0',
  },
  selectedShop: {
    backgroundColor: '#cccc',
    borderColor: '#6e6e6e',
  },
  shopNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  productCard: {
    // flex: 1,
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    margin: 5,
    maxWidth: '35%', // Set maximum width for each item
    width: 132,
    minHeight: 210,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'center',
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginTop: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  sortButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    // marginVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    position:'absolute',
    top: 58,
    zIndex: 1
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#cccc',
    backgroundColor: '#f0f0f0',
  },
  sortButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CategoryDetails;