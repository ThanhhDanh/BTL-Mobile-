import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, Text, View, Image } from 'react-native';
import { collection, getDocs, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../../Configs/firebase';
import MyContext from '../Templates/MyContext';
import Icon from 'react-native-vector-icons/FontAwesome6';

const ChatList = () => {
    const [users, setUsers] = useState([]);
    const { user } = useContext(MyContext);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUsers = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const usersData = []; // Danh sách tạm thời
            const unsubscribe = onSnapshot(collection(database, 'users'), (snapshot) => {
                snapshot.docs.forEach(doc => {
                    if (doc.id !== currentUser.uid) {
                        usersData.push({ id: doc.id, ...doc.data() });
                    }
                });
                // Cập nhật danh sách người dùng sau khi lấy dữ liệu hoàn tất
                setUsers(usersData);
            });

            return () => unsubscribe(); // Clean up listener when component unmounts
        };

        fetchUsers();
    }, [users]);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Kiểm tra xem tài liệu người dùng đã tồn tại trong collection 'users' chưa
        const userDocRef = doc(database, 'users', currentUser.uid);
        getDoc(userDocRef).then((docSnapshot) => {
            if (!docSnapshot.exists()) {
                // Nếu không tồn tại, tạo mới tài liệu người dùng với thông tin cơ bản từ Firebase Authentication
                const userData = {
                    username: currentUser.displayName || 'Anonymous',
                    avatar: currentUser.photoURL || 'default_avatar_url',
                    email: currentUser.email || '',
                    createdAt: new Date(),
                    // Thêm các thông tin khác nếu cần
                };

                setDoc(userDocRef, userData)
                    .then(() => {
                        console.log('Document successfully written!');
                         // Cập nhật danh sách người dùng sau khi thêm tài liệu mới
                        setUsers(prevUsers => [...prevUsers, { id: currentUser.uid, ...userData }]);
                    })
                    .catch((error) => {
                        console.error('Error writing document: ', error);
                    });
            }
        });
    }, [users]);

    const handleUserPress = (selectedUser) => {
        navigation.navigate('Chat', { selectedUser, previousScreen: 'ChatList'});
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Setting')}
                    style={{ width: 40, height: 40, zIndex: 1, position: 'absolute', top: 25, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.06)', borderRadius: 50 }}>
                    <Icon style={{ fontSize: 15, color: '#000' }} name="chevron-left" />
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Danh sách chat</Text>
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleUserPress(item)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                        <Text style={{ marginLeft: 10 }}>{item.username}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

export default ChatList;