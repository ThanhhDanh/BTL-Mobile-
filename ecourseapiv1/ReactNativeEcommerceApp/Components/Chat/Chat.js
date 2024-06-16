import React, { useContext, useState, useCallback, useLayoutEffect } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../../Configs/firebase';
import MyContext from '../Templates/MyContext';
import Icon from 'react-native-vector-icons/FontAwesome6';

export default function Chat() {
    const navigation = useNavigation();
    const [previousScreen, setPreviousScreen] = useState(null);
    const route = useRoute();
    const [messages, setMessages] = useState([]);
    const [chatMessages, setChatMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const { user } = useContext(MyContext);
    const { selectedUser, categoryId, productId } = route.params;

    useFocusEffect(
        useCallback(() => {
            if (route.params && route.params.previousScreen) {
                setPreviousScreen(route.params.previousScreen);
            }
        }, [route])
    );

    const handleGoBack = () => {
        if (previousScreen) {
            navigation.navigate(previousScreen, { categoryId, productId });
        } else {
            navigation.goBack();
        }
    };

    const onSignOut = () => {
        signOut(auth).catch(error => console.log(error));
    };

    useLayoutEffect(() => {
        if (!selectedUser) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const chatPairId = [currentUser.uid, selectedUser.id].sort().join('_');

        const collectionRef = collection(database, 'chats');
        const q = query(
            collectionRef,
            where('chatPairId', '==', chatPairId),
            orderBy('createdAt', 'desc')
        );

        setLoading(true); // Bắt đầu tải

        const unsubscribe = onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                setChatMessages(prevState => ({ ...prevState, [chatPairId]: [] }));
                setLoading(false); // Kết thúc tải
                return;
            }

            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    createdAt: data.createdAt.toDate(),
                    text: data.text,
                    user: data.user,
                    receiverId: data.receiverId,
                };
            });

            // Thêm độ trễ ở đây
            setTimeout(() => {
                setChatMessages(prevState => ({ ...prevState, [chatPairId]: newMessages }));
                setMessages(newMessages);
                setLoading(false); // Kết thúc tải sau khi tải xong
            }, 1000); // Độ trễ 1 giây
        }, error => {
            console.log('Error getting documents: ', error);
            setLoading(false); // Kết thúc tải nếu có lỗi
        });

        return () => unsubscribe();
    }, [selectedUser, user]);

    const onSend = useCallback((messages = []) => {
        setTimeout(() => {
            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

            const { _id, createdAt, text } = messages[0];

            const currentUser = auth.currentUser;
            const chatPairId = [currentUser.uid, selectedUser.id].sort().join('_'); //lưu tin nhắn giữa 2 ngừi

            if (_id && createdAt && text && currentUser) {
                addDoc(collection(database, 'chats'), {
                    _id,
                    createdAt,
                    text,
                    user: {
                        _id: currentUser.uid,
                        avatar: user.avatar,
                    },
                    receiverId: selectedUser.id,
                    chatPairId: chatPairId
                }).catch(error => console.log('Error adding document:', error));
            } else {
                console.error("Invalid message data:", { _id, createdAt, text, currentUser });
            }
        }, 1000);
    }, [selectedUser, user]);

    return (
        <SafeAreaView style={{ width: '100%', height: '100%' }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
            <View style={{ position: 'absolute', top: 0, width: '100%', zIndex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                <TouchableOpacity onPress={handleGoBack}
                    style={{ width: 40, height: 40, zIndex: 1, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.06)', borderRadius: 50 }}>
                    <Icon style={{ fontSize: 15, color: '#000' }} name="chevron-left" />
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontWeight: 'bold', left: 135 }}>Chat</Text>
            </View>
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#ccc" style={{ marginTop: 60 }} />
                ) : (
                    <GiftedChat
                        messages={messages}
                        onSend={messages => onSend(messages)}
                        user={{
                            _id: auth.currentUser.uid,
                            avatar: user?.avatar,
                        }}
                        messagesContainerStyle={{ backgroundColor: '#fff' }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}