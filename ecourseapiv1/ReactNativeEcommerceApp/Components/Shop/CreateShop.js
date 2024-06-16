import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import APIs, { endpoints } from '../../Configs/APIs';
import MyContext from '../Templates/MyContext';

const CreateShop = ({ navigation }) => {
  const { user } = useContext(MyContext);
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateShop = async () => {
    if (!shopName || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await APIs.post(endpoints['shops'], {
        name: shopName,
        description,
        owner: user.id,
      });
      Alert.alert('Success', 'Shop created successfully');
      navigation.navigate('ShopDetails', { shopId: response.data.id }); // Chuyển hướng đến màn hình chi tiết cửa hàng sau khi tạo thành công
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Create Shop" onPress={handleCreateShop} disabled={loading} />
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

export default CreateShop;