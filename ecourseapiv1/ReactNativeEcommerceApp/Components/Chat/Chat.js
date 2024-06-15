import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { addDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useCallback, useContext, useLayoutEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity } from "react-native";
import { colors } from "react-native-elements";
import { GiftedChat } from "react-native-gifted-chat";
import { auth, database } from "../../Configs/firebase";
import MyContext from "../Templates/MyContext";
import { View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();
    const {user} = useContext(MyContext)

    // console.log('auth: ' + JSON.stringify(auth));

    const onSignOut = () => {
        signOut(auth).catch(error => console.log(error));
    };


    useLayoutEffect(() => {
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        // console.info('Query:', JSON.stringify(q, null, 2));

        const unsubscribe = onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                return;
            }

            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                // console.log('Document data:', data);
                return {
                    _id: doc.id,
                    createdAt: data.createdAt.toDate(),
                    text: data.text,
                    user: data.user
                };
            });

            // console.log('New messages from Firestore:', newMessages);
            setMessages(newMessages);
        }, error => {
            console.log('Error getting documents: ', error);
        });

        return () => unsubscribe();
    }, []);

    // console.log('Messages state:', messages);

    const onSend = useCallback((messages = []) => {
        // console.log('onSend called with:', messages);
    
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    
        const { _id, createdAt, text } = messages[0];
    
        // Sử dụng thông tin người dùng đăng nhập từ Firebase Authentication
        const currentUser = auth.currentUser;
        if (_id && createdAt && text && currentUser) {
            addDoc(collection(database, 'chats'), {
                _id,
                createdAt,
                text,
                user: {
                    _id: currentUser.uid, // Sử dụng UID của người dùng đăng nhập
                    avatar: user.avatar, // Avatar của người dùng đăng nhập (nếu có)
                },
            }).catch(error => console.log('Error adding document:', error));
        } else {
            console.error("Invalid message data:", { _id, createdAt, text, currentUser });
        }
    }, []);

    return (
        <SafeAreaView style={{width: '100%', height: '100%'}}>
            <View style={{height: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc'}}>
                <TouchableOpacity
                            style={{width: 40, height: 40, zIndex: 1, position: 'absolute', top: 25, left: 15, alignItems: 'center', justifyContent: 'center', borderColor: '#ccc', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 50}}>
                    <Icon style={{fontSize: 15, color: '#fff'}} name="chevron-left"/>
                </TouchableOpacity>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Tin nhắn</Text>
            </View>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: auth.currentUser.uid, // Sử dụng uid hoặc một giá trị mặc định
                    avatar: user?.avatar , // Sử dụng avatar hoặc một giá trị mặc định
                }}
                messagesContainerStyle={{
                    backgroundColor: '#fff'
                }}
            />
        </SafeAreaView>
    );
}