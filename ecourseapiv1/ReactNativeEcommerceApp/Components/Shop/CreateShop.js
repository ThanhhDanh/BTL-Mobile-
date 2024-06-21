import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import APIs, { authAPI, endpoints } from '../../Configs/APIs';
import MyContext from '../Templates/MyContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { Image } from 'react-native-elements';
import MyStyle from '../../Style/MyStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateShop = ({ navigation }) => {
    const { user } = useContext(MyContext);
    const [shopName, setShopName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState(user ? user.address: '');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const shopNameRef = useRef(null);
    const descriptionRef = useRef(null);
    const imageRef = useRef(null);
    const categoryRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        firstName: user ? user.first_name : '',
        lastName: user ? user.last_name : '',
        email: user ? user.email : '',
        address: user ? user.address : '',
    });

    const [category, setCategory] = useState([
        {id: 1, name:'Global Store'},
        {id: 2, name:'Local Store'},
        {id: 3, name:'Shopee Mall'},
    ])

    useEffect(() => {
        // Nếu user không tồn tại (đã đăng xuất), hãy thực hiện các hành động cần thiết ở đây
        if (!user) {
            // Ví dụ: chuyển hướng đến màn hình đăng nhập hoặc thực hiện các xử lý khác
            navigation.navigate('Đăng nhập'); // Ví dụ: chuyển hướng đến màn hình đăng nhập
        }
    }, [user, navigation]);

    const validateFields = () => {
        const newErrors = {};
        if (!shopName) {
            newErrors.shopName = 'Tên Shop là bắt buộc';
            shopNameRef.current.shake();
        }
        if (!description) {
            newErrors.description = 'Số điện thoại là bắt buộc';
            descriptionRef.current.shake();
        }
        if (!image) {
            newErrors.image = 'Ảnh đại diện là bắt buộc';
            imageRef.current.shake();
        } 
        if (!selectedCategory) {
            newErrors.selectedCategory = 'Loại cửa hàng là bắt buộc'
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateShop = async () => {
        if (!validateFields()) return;

        const formData = new FormData();
        formData.append('name', shopName);
        formData.append('description', description);
        formData.append('address', address);
        if (user) {
            formData.append('owner', user.id);
        }
        formData.append('category', selectedCategory.id);
        if (image) {
            formData.append('image', {
                uri: image.uri,
                name: image.fileName,
                type: 'image/jpeg',
            });
        }

        try {
            setLoading(true);
            const response = await APIs.post(endpoints['shops'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user role to "seller"
            let accessToken = await AsyncStorage.getItem("access-token")
            const updatedUser = await authAPI(accessToken).patch(endpoints['current-user'], { role: 'seller' },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                
            );

            // Cập nhật bối cảnh với vai trò người dùng mới
            // setUser((prevUser) => ({ ...prevUser, role: 'seller' }));

            Alert.alert('Thành công', 'Tạo cửa hàng thành công!');
            navigation.navigate('ShopOwner', { shopId: response.data.id });
        } catch (error) {
            console.error('Lỗi tạo shop: ' + error.message);
            Alert.alert('Error', 'Failed to create shop');
        } finally {
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

    const deleteImage = () =>{
        if (image) {
            setImage(null);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedUser = {
                first_name: editedUser.firstName,
                last_name: editedUser.lastName,
                email: editedUser.email,
                address: editedUser.address,
            };
    
            let accessToken = await AsyncStorage.getItem("access-token");
            const response = await authAPI(accessToken).patch(`${endpoints['current-user']}`, updatedUser, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            // Cập nhật thông tin người dùng trong context hoặc bất kỳ trạng thái cần thiết nào
            setIsEditing(false);
            Alert.alert('Thành công', 'Thông tin người dùng đã được cập nhật');
        } catch (error) {
            console.error('Lỗi cập nhật người dùng: ' + error.message);
            Alert.alert('Error', 'Failed to update user');
        }
    };

    const handleSelectCategory = (categoryId) => {
        const selectedCate = category.find(c => c.id === categoryId);
        if (selectedCate) {
            setSelectedCategory(selectedCate);
            setErrors({ ...errors, selectedCategory: null });
            setModalVisible(false);
        }
    };

    if (!user) {
        return null; // Tùy chọn, hiển thị vòng quay đang tải hoặc chế độ xem trống
    }


    return (
        <SafeAreaView style={{ width: '100%', height: '100%' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
            <View style={{ position: 'absolute', top: 40, width: '100%', zIndex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                <TouchableOpacity
                    style={{ width: 40, height: 40, zIndex: 1, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.06)', borderRadius: 50 }}
                    onPress={() => navigation.navigate("Setting")}>
                    <Icon style={{ fontSize: 15, color: '#000' }} name="chevron-left" />
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontWeight: 'bold', left: 45 }}>Thông tin đăng ký Shop</Text>
            </View>
            <ScrollView style={styles.container}>
                <Animatable.View ref={shopNameRef}>
                    <TextInput
                        style={[styles.input, errors.shopName && { borderColor: 'red' }]}
                        placeholder="Tên Shop"
                        value={shopName}
                        onChangeText={(text) => { setShopName(text); setErrors({ ...errors, shopName: null }) }}
                    />
                </Animatable.View>
                {errors.shopName && <Animatable.Text animation="shake" style={styles.errorText}>{errors.shopName}</Animatable.Text>}
                <Animatable.View ref={descriptionRef}>
                    <TextInput
                        style={[styles.input, errors.description && { borderColor: 'red' }]}
                        placeholder="Số điện thoại"
                        value={description}
                        onChangeText={(text) => { setDescription(text); setErrors({ ...errors, description: null }) }}
                    />
                </Animatable.View>
                {errors.description && <Animatable.Text animation="shake" style={styles.errorText}>{errors.description}</Animatable.Text>}
                <Animatable.View ref={imageRef}>
                    <TextInput
                        style={styles.input}
                        readOnly={true}
                        placeholder="Address"
                        value={address}
                        onChangeText={setAddress}
                    />
                </Animatable.View>
                <Animatable.View ref={imageRef}>
                    {image && <TouchableOpacity onPress={deleteImage}
                        style={{position: 'absolute', right: 100, top: 30}}>
                        <Text style={{ color: '#fff', fontSize: 16, backgroundColor: 'rgb(233,71,139)', padding: 10, borderRadius: 20}}>Bỏ ảnh</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity onPress={handleChooseAvatar} style={styles.imagePicker}>
                        <Text style={{ color: 'rgb(97, 109, 138)', position: 'absolute', top: 40, left: 50, zIndex: 1}}>Ảnh Shop</Text>
                        <View style={{width: 100, height: 100, marginLeft: 30, borderRadius: 100}}>
                            {image !== ' ' && image ?
                                (<Image style={{ width: '100%', height: '100%', borderRadius: 100}} resizeMode= 'cover' source={{ uri: image.uri }} />) : 
                                (<Icon style={{fontSize: 60, color:'#c9c2c2', position: 'absolute', top: 20, left: 20}} name="image"/>)}
                        </View>
                    </TouchableOpacity>
                </Animatable.View>
                {errors.image && <Animatable.Text animation="shake" style={styles.errorText}>{errors.image}</Animatable.Text>}
                <Animatable.View ref={categoryRef}>
                    <View style={{flexDirection: 'row', alignItems: 'center',height: 40}}>
                        <TextInput
                            style={[styles.input, errors.selectedCategory && { borderColor: 'red' }, {marginTop: 10, width: '100%'}]}
                            placeholder="Loại sản phẩm"
                            editable={false}
                            value={selectedCategory ? selectedCategory.name : ''}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(true)} 
                            style={{padding: 8, borderWidth: 1, width: 110, height: 38, borderRadius: 20, borderColor: '#ccc', backgroundColor: '#fff', position: 'absolute', top: 0, right: 30}}>
                            <Text style={{ color: 'rgb(97, 109, 138)' }}>Loại sản phẩm</Text>
                        </TouchableOpacity>
                    </View>
                    {modalVisible && (
                        <View style={[MyStyle.shadowMenuUser, { position: 'absolute', top: 35, right: 0, left: 0, zIndex: 1 }]}>
                            {category.map(c => (
                                <TouchableOpacity style={{ margin: 5 }} key={c.id} onPress={() => handleSelectCategory(c.id)}>
                                    <Text style={{ fontSize: 16 }}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Animatable.View>
                {errors.selectedCategory && <Animatable.Text animation="shake" style={styles.errorText}>{errors.selectedCategory}</Animatable.Text>}
                <TouchableOpacity onPress={handleEditToggle}
                    style={{width: '15%', alignSelf: 'flex-end', padding: 10, zIndex: -1}}>
                    <Icon style={{fontSize: 15, padding: 5}} name='pen'/>
                </TouchableOpacity>
                <View style={{ width: '100%', maxHeight: '50%', backgroundColor: '#fff',zIndex: -1}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ccc' }}>
                        <Text style={styles.userInfo}>Tên chủ Shop</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.editableField]}
                                value={editedUser.lastName + ' ' + editedUser.firstName}
                                onChangeText={(text) => {
                                    const [lastName, firstName] = text.split(' ');
                                    setEditedUser({ ...editedUser, lastName, firstName });
                                }}
                            />
                        ) : (
                            <Text style={[styles.userInfo, styles.color]}>
                                {user.last_name} {user.first_name}
                            </Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ccc' }}>
                        <Text style={styles.userInfo}>Địa chỉ lấy hàng</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.editableField]}
                                value={editedUser.address}
                                onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
                            />
                        ) : (
                            <Text style={[styles.userInfo, styles.color]}>
                                {user.address}
                            </Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ccc' }}>
                        <Text style={styles.userInfo}>Email</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.editableField]}
                                value={editedUser.email}
                                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                            />
                        ) : (
                            <Text style={[styles.userInfo, styles.color]}>
                                {user.email}
                            </Text>
                        )}
                    </View>
                </View>
                {isEditing && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <TouchableOpacity style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff', backgroundColor: 'rgb(233,71,139)', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                onPress={handleCreateShop} disabled={loading} >
                <Icon style={{ fontSize: 20, color: '#fff' }} name='shop' />
                <Text style={[styles.userInfo, { color: '#fff', fontWeight: 'bold', fontSize: 20 }]}>{loading ? 'Đang tạo...' : 'Tạo shop'}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 120,
    },
    input: {
        height: 40,
        borderColor: 'rgb(97, 109, 138)',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 8,
        backgroundColor: '#fff',
        color: '#000',
    },
    userInfo: {
        padding: 15,
        fontSize: 16,
    },
    color: {
        color: 'rgb(97, 109, 138)',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ffc0c0',
    },
    imagePicker: {
        width: '50%',
        marginBottom: 15
    },
    editableField: {
        flex: 1,
        borderColor: 'rgb(97, 109, 138)',
        borderWidth: 1,
        backgroundColor: '#fff',
        height: '80%', 
        marginTop: 12,
    },
    saveButton: {
        backgroundColor: 'rgb(233,71,139)',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        margin: 15,
    },
});

export default CreateShop;