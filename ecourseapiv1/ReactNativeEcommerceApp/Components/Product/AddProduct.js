import React, { useState, useContext, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, Image, TouchableOpacity, Text, Modal, FlatList, TouchableWithoutFeedback, SafeAreaView, Dimensions, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import APIs, { authAPI, endpoints } from '../../Configs/APIs';
import MyContext from '../Templates/MyContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowHeight = Dimensions.get('window').height;

const AddProduct = ({ navigation, route }) => {
  const { shopId } = route.params;
  const { user } = useContext(MyContext);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [gender, setGender] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [errors, setErrors] = useState({}); // State for input validation errors

  const shopNameRef = useRef(null);
  const descriptionRef = useRef(null);
  const imageRef = useRef(null);

  const handleAddProduct = async () => {
    const isValid = validateFields();
    if (!isValid) {
      return;
    }
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('content', description);
    formData.append('priceProduct', parseFloat(price));
    formData.append('gender', gender);
    formData.append('category_id', selectedCategory.id); 
    formData.append('shop_id', shopId);
    formData.append('seller_id', user.id);
    formData.append('created_date', new Date().toISOString());
    formData.append('updated_date', new Date().toISOString());
    formData.append('image', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });

    try {
      setLoading(true);
      console.log(formData);
      const token = await AsyncStorage.getItem('access-token');
      const res = await authAPI(token).post(endpoints['products'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(res.data)
      navigation.navigate('ProductManagement', { shopId });
    }catch(err) {
      console.error("Lỗi thêm sản phẩm: ", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
    }finally {
      setLoading(false);
    }

  };

  const handleChooseAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert("Permissions denied!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setImage(result.assets[0]);
        setErrors({ ...errors, image: null });
      }
    }
  };

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Unisex', value: 'unisex' },
  ];

  const categoryOptions = [
    { id: 1, name: 'Global Store' },
    { id: 2, name: 'Local Store' },
    { id: 3, name: 'Shopee Mall' },
  ];

  const validateFields = () => {
    const newErrors = {};
    if (!productName) {
      newErrors.productName = 'Tên sản phẩm là bắt buộc';
      if (shopNameRef.current) {
        shopNameRef.current.shake();
      }
    }
    if (!description) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
      if (descriptionRef.current) {
        descriptionRef.current.shake();
      }
    }
    if (!price) {
      newErrors.price = 'Giá sản phẩm là bắt buộc';
    }
    if (!selectedCategory) {
      newErrors.selectedCategory = 'Loại sản phẩm là bắt buộc';
    }
    if (!image) {
      newErrors.image = 'Ảnh đại diện là bắt buộc';
      if (imageRef.current) {
        imageRef.current.shake();
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCategory = (categoryId) => {
    const selectedCate = categoryOptions.find(c => c.id === categoryId);
    if (selectedCate) {
      setSelectedCategory(selectedCate);
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={{ width: '100%', height: '100%' }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("ShopOwner")}
        >
          <Icon style={styles.icon} name="chevron-left" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thêm sản phẩm</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
      <ScrollView style={styles.container}>
        <View style={{height: windowHeight}}>
          <View style={styles.imagePickerContainer}>
            <Text style={styles.label}>Hình ảnh sản phẩm:</Text>
            <TouchableOpacity onPress={handleChooseAvatar}>
              <View style={styles.imagePlaceholder}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholderText}>
                    <Text>Chọn ảnh</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên sản phẩm:</Text>
            <TextInput
              ref={shopNameRef}
              style={styles.input}
              placeholder="Nhập tên sản phẩm"
              value={productName}
              onChangeText={setProductName}
            />
            {errors.productName && <Text style={styles.errorText}>{errors.productName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mô tả sản phẩm:</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.input, { height: 100 }]} // Tăng chiều cao lên 100 (hoặc bất kỳ giá trị nào bạn muốn)
              placeholder="Mô tả"
              multiline={true} // Cho phép nhập nhiều dòng
              numberOfLines={4} // Số dòng hiển thị khi không focus
              value={description}
              onChangeText={setDescription}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Giá sản phẩm (VNĐ):</Text>
            <TextInput
              style={styles.input}
              placeholder="Giá"
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setGenderModalVisible(true)}
          >
            <Text style={styles.label}>Giới tính (không bắt buộc): {gender ? gender : '...'}</Text>
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={isGenderModalVisible}
            onRequestClose={() => setGenderModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <FlatList
                data={genderOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setGender(item.label);
                      setGenderModalVisible(false);
                    }}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.label}>Loại sản phẩm: {selectedCategory ? selectedCategory.name : '...'}</Text>
              {errors.selectedCategory && <Text style={styles.errorText}>{errors.selectedCategory}</Text>}
            </TouchableOpacity>

            {modalVisible && (
              <View style={styles.categoryModal}>
                {categoryOptions.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => handleSelectCategory(category.id)}
                  >
                    <Text>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

        </View>
      </ScrollView>
      <TouchableOpacity style={{position: 'absolute', bottom: 0, width: '100%',backgroundColor: 'rgb(233,71,139)', borderTopLeftRadius: 20, borderTopRightRadius: 20}}  onPress={handleAddProduct} disabled={loading}>
        <Text style={{fontSize: 18, fontWeight: '500', padding: 20, textAlign: 'center', color: '#fff'}}>Thêm 1 sản phẩm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    top: 30,
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
    marginLeft: 70,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    width: '100%',
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePlaceholderText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 50,
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    padding: 10,
  },
  categoryModal: {
    position: 'absolute',
    bottom: 190,
    right: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    zIndex: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  categoryOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AddProduct;