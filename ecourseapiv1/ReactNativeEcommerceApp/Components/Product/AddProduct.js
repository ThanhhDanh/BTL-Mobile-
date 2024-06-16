import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import APIs, { endpoints } from '../../Configs/APIs';
import MyContext from '../Templates/MyContext';

const AddProduct = ({ navigation, route }) => {
  const { shopId } = route.params;
  const { user } = useContext(MyContext);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!productName || !description || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await APIs.post(endpoints['addProduct'], {
        name: productName,
        description,
        price: parseFloat(price),
        shop: shopId,
        owner: user.id,
      });
      Alert.alert('Success', 'Product added successfully');
      navigation.goBack(); // Quay trở lại màn hình trước sau khi thêm sản phẩm thành công
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        keyboardType="numeric"
        onChangeText={setPrice}
      />
      <Button title="Add Product" onPress={handleAddProduct} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default AddProduct;