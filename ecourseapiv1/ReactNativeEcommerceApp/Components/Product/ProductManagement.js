import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Image, Alert } from 'react-native';
import APIs, { endpoints } from '../../Configs/APIs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { formatPrice } from '../Utils/Utils';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const ProductManagement = ({ navigation, route }) => {
  const { shopId } = route.params; // Lấy shopId từ route.params
  const [products, setProducts] = useState([]);
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  const fetchProducts = async () => {
    try {
      const response = await APIs.get(`${endpoints['products']}?shop_id=${shopId}`);
      if (response.status === 200) {
        setProducts(response.data); // Assuming response.data is an array of products
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  const handleEditProduct = async (productId, editedName, editedPrice, setEditing) => {
    try {
      const response = await APIs.patch(`${endpoints['products']}${productId}/`, {
        name: editedName,
        priceProduct: parseInt(editedPrice),
      });
      if (response.status === 200) {
        fetchProducts();
        setEditing(false); // Kết thúc chế độ chỉnh sửa
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error(error);
      // Xử lý lỗi
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa sản phẩm này?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {
            try {
              const response = await APIs.delete(`${endpoints['products']}/${productId}`);
              if (response.status === 204) {
                fetchProducts();
              } else {
                throw new Error('Failed to delete product');
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const ProductItem = ({ item }) => {
    const [editing, setEditing] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
    const [editedPrice, setEditedPrice] = useState(item.priceProduct.toString());

    return (
      <View style={styles.productItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 80, height: 80 }}>
            <Image style={{ width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover' }} source={{ uri: item.image }} />
          </View>
          <View style={{ width: '60%', alignItems: 'center' }}>
            {editing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                />
                <TextInput
                  style={styles.input}
                  value={editedPrice}
                  onChangeText={setEditedPrice}
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Giá: {formatPrice(item.priceProduct)}</Text>
              </>
            )}
          </View>
        </View>
        <View>
          <RenderHTML contentWidth={width} source={{ html: item.content }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          {editing ? (
            <TouchableOpacity
              style={{ backgroundColor: 'rgb(233,71,139)', borderRadius: 10, marginRight: 20 }}
              onPress={() => handleEditProduct(item.id, editedName, editedPrice, setEditing)}
            >
              <Text style={styles.editButton}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: 'rgb(233,71,139)', borderRadius: 10, marginRight: 20 }}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ backgroundColor: 'rgb(233,71,139)', borderRadius: 10 }}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => <ProductItem item={item} />;

  return (
    <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 30, width: '100%', zIndex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={() => navigation.navigate("ShopOwner")}
          style={{ width: 40, height: 40, zIndex: 1, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.06)', borderRadius: 50 }}>
          <Icon style={{ fontSize: 15, color: '#000' }} name="chevron-left" />
        </TouchableOpacity>
        <Text style={{ fontSize: 25, fontWeight: 'bold', left: 65 }}>Quản lý sản phẩm</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 90,
  },
  productItem: {
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    padding: 20,
    borderRadius: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    color: '#fff',
    padding: 10,
  },
  deleteButton: {
    color: '#fff',
    padding: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    marginLeft: 20,
  },
});

export default ProductManagement;