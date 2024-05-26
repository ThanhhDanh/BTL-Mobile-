import React, {Component, useContext, useState} from "react";
import {
    SafeAreaView,
    View,Text,TouchableOpacity,
    ImageBackground, StatusBar,Dimensions, TextInput,
    ScrollView,
    Button,
    Image,
    Alert,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import MyStyle from "../../Style/MyStyle";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
// import * as ImagePicker from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import APIs, { authAPI, endpoints } from "../../Configs/APIs";
import MyContext from "../Templates/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../Templates/CartContext";


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const SIGN_IN = 'SIGN_IN';
const REGITSTER = 'REGITSTER';

export default Login =({navigation})=>{
    const [page, setPage] = useState(SIGN_IN);
    const [isRegister, setIsRegister] = useState(false);
    return (
        // <ImageBackground style={{height: '100%', width: '100%', backgroundColor:'rgba(0,0,0,.05'}} resizeMode="stretch">
        //     <StatusBar barStyle="Light-content"/>
        //     <SafeAreaView style={MyStyle.container}>
        //         {/* <View style={{marginTop: 0.1 * windowHeight, width: '100%', backgroundColor:'#6b52ae1a'}}>
        //             <Text style={{fontSize: 22,textAlign:'center',margin: 10}}>Chào mừng các bạn đến với Bamboo. Đăng nhập ngay!</Text>
        //         </View> */}
        //         <View style={MyStyle.setForm}>
        //             {/* username & password */}
        //             <View style={{width: '100%', height: '20%', marginTop: 0.3 * windowHeight}}>
        //                 <Text style={{textAlign: 'center', fontSize:20, marginBottom:30}}>Đăng nhập</Text>
        //                 <View style={MyStyle.input}>
        //                     <Text style={MyStyle.letterColor}>Username:</Text>
        //                     <TextInput textAlign="right" autoCapitalize="none" style={MyStyle.textInput}></TextInput>
        //                 </View>
        //                 <View style={[MyStyle.input,{marginTop: 10}]}>
        //                     <Text style={MyStyle.letterColor}>Password:</Text>
        //                     <TextInput textAlign="right" autoCapitalize="none" style={[MyStyle.textInput,{paddingRight: 30}]} secureTextEntry={visible ? false : true}></TextInput>
        //                     <TouchableOpacity 
        //                     style={{ position: 'absolute', right: 0}}
        //                     onPress={()=>{
        //                         setVisible(!visible);
        //                     }}
        //                     >
        //                         {visible ?
        //                         <Icon style={{marginLeft: 10, fontSize: 18}} name="eye"/>
        //                         :
        //                         <Icon style={{marginLeft: 10, fontSize: 18}} name="eye-slash"/>
        //                         }
        //                     </TouchableOpacity>
        //                 </View>
        //             </View>
        //             {/* Buttons */}
        //             <View style={MyStyle.btns}>
        //                 <TouchableOpacity 
        //                     style={[MyStyle.btn,{backgroundColor:"#000"}]}
        //                     onPress={()=>{
        //                         navigation.navigate('Home');
        //                     }}
        //                 >
        //                     <Text style={MyStyle.buttonText}>Đăng nhập</Text>  
        //                 </TouchableOpacity>
        //                 <TouchableOpacity style={[MyStyle.btn,{marginTop: 20, backgroundColor:"#9a9a9d"}]}
        //                     onPress={()=>{
        //                         navigation.navigate('Register');
        //                     }}
        //                 >
        //                     <Text style={MyStyle.buttonText}>Đăng ký</Text>
        //                 </TouchableOpacity>
        //             </View>
        //         </View>
        //     </SafeAreaView>
        // </ImageBackground>
        <View style={MyStyle.setForm}>
            <View style={{width: '100%',height:'25%'}}>
                <HeaderLogin page={page} setPage={setPage} isRegister={isRegister} setIsRegister={setIsRegister}/>
            </View>
            <ScrollView style={{height: '45%', width: '100%', backgroundColor: "#F5F5F5", marginTop: 50}}>
                {page === SIGN_IN ? <View><BodyLogin navigation={navigation}/><FooterLogin/></View>
                 : <FormRegister page={page} setPage={setPage} isRegister={isRegister} setIsRegister={setIsRegister}/>}
                
            </ScrollView>
            {/* <ScrollView style={{flex: 1 ,backgroundColor: "#F5F5F5"}}>
                {page == SIGN_IN ? <FooterLogin/> : null}
            </ScrollView> */}
        </View>
    );
};

const HeaderLogin = ({page, setPage, isRegister, setIsRegister, navigation}) => {
    return (
        <SafeAreaView style={MyStyle.container}>
            <StatusBar style={MyStyle.statusBar}/>
            <View style={{width: '100%',height:'80%',backgroundColor:'#121139', justifyContent:'center', alignItems:'center'}}>
                <Text style={{fontSize: 40, fontWeight:'600',color:'#fff'}}>Bamboo</Text>
            </View>
            <View style={{height: 50, flexDirection: 'row', backgroundColor: "#FFF"}}>
                <TouchableOpacity 
                    style={{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}
                    onPress={() =>{setPage(SIGN_IN)}} disabled={page === SIGN_IN ? true : false}
                >
                    <Text style={{fontSize: 20, color: '#121139'}}>Sign in</Text>
                    {page === SIGN_IN ? <View style={{position:'absolute', bottom: 0, height: 3, width: '100%', backgroundColor: '#121139'}}></View> : null}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}
                    onPress={() =>{
                        setPage(REGITSTER)
                    }} disabled={page === REGITSTER? true : false}
                >
                    <Text style={{fontSize: 20, color: '#121139'}}>Register</Text>
                    {page === REGITSTER ? <View style={{position:'absolute', bottom: 0, height: 3, width: '100%', backgroundColor: '#121139'}}></View> : null}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const BodyLogin = ({navigation})=>{
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [user, dispatch,isAuthenticated, setIsAuthenticated, role, setRole]= useContext(MyContext);
    const { setCartItems } = useCart()
    
    const formLogin = async () =>{
        try {
            let res = await APIs.post(endpoints['login'], {
                'username': username,
                'password': password,
                'client_id': "hGTgI136AQk94I8JuY4mkFKesDaFyohdf0Wm1rd4",
                'client_secret': "pagQY5E46yJDmmXXDzA1JdS9yd09aThE1otII6olTvvbBf1XG4mazubgPpZQHCOSJqZzR72xv7OoDPp4aT72pT9D9DbtS2diDYrnG9ZNZxIV94O4XigOIIx8zY2jOoYn",
                "grant_type": "password"
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
          

            await AsyncStorage.setItem('access-token', res.data.access_token)

            let user = await authAPI(res.data.access_token).get(endpoints['current-user']);
            dispatch({
                "type": "login",
                "payload": user.data
            });
            console.log(user.data.role);
            let user_role = user.data.role;
            setRole(user_role);
            setIsAuthenticated(true);

            // Tải giỏ hàng từ AsyncStorage với tên người dùng
            const savedCart = await AsyncStorage.setItem(`cart_${user.data.username}`, res.data.access_token);
            console.info(`cart_${user.data.username}`)
            console.info("saved cart: " + savedCart);
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }

            navigation.navigate("Trang chủ")
        } catch (ex) {
            console.error("Lỗi đăng nhập:"+ex.message);
        }
    }

    return (
        <View style={{justifyContent: 'center'}}>
            <Text style={{fontSize: 24, fontWeight: '600', marginLeft: 30, marginTop: 10}}>Login in your account.</Text>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user"/>
                <TextInput 
                    style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} placeholder="Username"
                    onChangeText={t => setUsername(t)} value={username}
                />
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="lock"/>
                <TextInput 
                    style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} placeholder="Password"
                    onChangeText={t => setPassword(t)} value={password}
                    secureTextEntry={visible ? false : true} 
                />
                <TouchableOpacity style={{height: '100%'}}
                    onPress={() => {
                        setVisible(!visible)
                    }}
                >
                    {visible &&<Icon style={{fontSize: 20, margin: 10}} name="eye"/>}
                    {!visible && <Icon style={{fontSize: 20, margin: 10}} name="eye-slash"/>}
                </TouchableOpacity>
            </View> 
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20}}>
                <TouchableOpacity style={{position: 'absolute', right: 0}}>
                    <Text style={{color: '#707070'}}>Forget password?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity 
                style={{height: 50, width: windowWidth - 60, justifyContent: 'center', alignItems: 'center', backgroundColor: "#121139", marginLeft: 30, marginTop: 20, borderRadius: 100}}
                onPress={formLogin}
            >
                <Text style={{color: '#fff', fontSize: 16}}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const FooterLogin = ()=>{
    return (
        <View style={MyStyle.setForm}>
            <View style={{marginLeft: 30,height: 30, width: windowWidth -60, flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{height: 1, width: '30%', backgroundColor: '#707070'}}></View>
                <Text>   Or connect with   </Text>
                <View style={{height: 1, width: '30%', backgroundColor: '#707070'}}></View>
            </View>
            <View style={{height: 50, width: windowWidth -60, marginLeft: 30, marginTop: 10, flexDirection: 'row'}}>
                <TouchableOpacity style={[MyStyle.setForm,{width: 0.5*(windowWidth - 60) - 3,flexDirection: 'row', alignItems: 'center', justifyContent: 'center',backgroundColor: '#fff', borderRadius: 50,marginRight: 3}]}>
                    <Icon style= {{fontSize: 15, color: 'red'}} name="google"/>
                    <Text style={{fontSize: 16, marginLeft: 10, fontWeight: '500'}}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[MyStyle.setForm,{width: 0.5*(windowWidth - 60) - 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',backgroundColor: '#fff', borderRadius: 50, marginLeft: 3}]}>
                    <Icon style= {{fontSize: 15, color: '#000'}} name="threads"/>
                    <Text style={{fontSize: 16, marginLeft: 10, fontWeight: '500'}}>Threads</Text>
                </TouchableOpacity>
            </View>
            <View style={{height: 50, width: windowWidth -60, marginLeft: 30, marginTop: 10, flexDirection: 'row'}}>
                <TouchableOpacity style={[MyStyle.setForm,{width: 0.5*(windowWidth - 60) - 3,flexDirection: 'row', alignItems: 'center', justifyContent: 'center',backgroundColor: '#fff', borderRadius: 50,marginRight: 3}]}>
                    <Icon style= {{fontSize: 15, color: 'lightblue'}} name="twitter"/>
                    <Text style={{fontSize: 16, marginLeft: 10, fontWeight: '500'}}>Twitter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[MyStyle.setForm,{width: 0.5*(windowWidth - 60) - 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',backgroundColor: '#fff', borderRadius: 50, marginLeft: 3}]}>
                    <Icon style= {{fontSize: 15, color: 'blue'}} name="facebook"/>
                    <Text style={{fontSize: 16, marginLeft: 10, fontWeight: '500'}}>Facebook</Text>
                </TouchableOpacity>
            </View>

            
        </View>
    );
};


const FormRegister = ({ page, setPage,isRegister,setIsRegister, navigation}) => {
    const [visible, setVisible] = useState(false);
    const [isValidEmail, setValidEmail] = useState(true);

    const [user, setUser] = useState({
        "first_name":"",
        "last_name": "",
        "email": "",
        "address":"",
        "username": "",
        "password": "",
        "avatar": ""
    });


    const handleRegister = async () => {
        const formData = new FormData();
        for (let key in user) {
            if (key === 'avatar') {
                formData.append(key, {
                    uri: user[key].uri,
                    name: user[key].fileName,
                    type: 'image/jpeg',
                })
            } else
                formData.append(key, user[key])
        }

        try {
            let res = await APIs.post(endpoints['users'], formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        
            console.info(res.data);
            setIsRegister(true);//Đăng ký thành công
        } catch (ex) {
            console.log("Lỗi!!");
        }
    };

    //Kiểm tra email
    const verifyEmail = (email) => {
        let regex = new RegExp(/([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])/);
        if(!email) return true;
        if(regex.test(email)){
            return true;
        }
        return false;
    };


    
    const handleChooseAvatar = async () => {
        const {status}  = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                change('avatar', result.assets[0]);
        }
    };
    
    const change = (field, value) => {
        setUser(current => {
            return {...current, [field]:value}
        })
    }

    const handleGoBackToRegister = () => {
        // Xóa dữ liệu trong form đăng ký
        // Ví dụ: Cập nhật lại state cho các trường là rỗng
        setUser({
            "first_name": "",
            "last_name": "",
            "email": "",
            "address": "",
            "username": "",
            "password": "",
            "avatar": ""
        });
        setIsRegister(false); // Cập nhật lại giá trị isRegister để hiển thị lại phần đăng ký
        setPage(REGITSTER); // Di chuyển đến trang đăng ký
    };

    return (
    <View>
        {isRegister ? (
        <View style={{width: '100%', flex: 1, justifyContent:'center', alignItems:'center',marginTop: 30}}>
            <Text style={{fontSize: 30, color: '#121139'}}>Đăng ký thành công</Text>
            <TouchableOpacity 
                style={{borderWidth: 1, marginTop: 30, backgroundColor: '#121139'}}
                onPress={handleGoBackToRegister}
            >
                <Text style={{fontSize: 20, margin: 10, color: '#fff'}}>Quay lại trang đăng ký</Text>
            </TouchableOpacity>
            <Icon style={{fontSize: 100, marginTop: windowWidth - 300, color: '#121139'}} name="circle-check"/>
        </View>
    ): (
        <View style={{justifyContent: 'center', width: windowWidth - 60}}>
            <Text style={{fontSize: 24, fontWeight: '600', marginLeft: 30, marginTop: 10}}>Register in your account.</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <View style={{width: '40%', height: 60, borderRadius: 50, backgroundColor: '#fff'}}>
                    <TouchableOpacity style={{height: '100%', marginLeft: 10, fontSize: 20, flexDirection: 'row',alignItems: 'center',justifyContent:'center'}} 
                        onPress={handleChooseAvatar}
                    >   
                    <Icon style={{fontSize: 20, marginRight: 10}} name="image"/>
                    <Text style={{fontSize: 20}}>Avatar</Text>
                    {/* <Image style={{width: 50, height: 50}} source={{uri: avatar}} /> */}
                    {/* {avatar?<Image style={{width: 40, height: 40}} source={{uri: avatar}} />:""} */}
                    </TouchableOpacity>
                </View>
                {/* Modal hiển thị ảnh */}
                <View style={{width: 100, height: 100, marginLeft: 30, marginTop: 20, borderRadius: 100, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    {/* <Image style={{ width: '100%', height: '100%' }} resizeMode="contain" source={{ uri: avatar }} /> */}
                    {user.avatar !== ' ' && user.avatar ?
                        (<Image style={{ width: '100%', height: '100%', borderRadius: 100 }} resizeMode="contain" source={{ uri: user.avatar.uri }} />) : 
                        (<Icon style={{fontSize: 60, color:'#c9c2c2'}} name="image"/>)}
                    {/* <Icon style={{fontSize: 60, color:'#c9c2c2'}} name="image"/> */}
                </View>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user-tag"/>
                <TextInput style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} 
                    onChangeText={t => change("first_name",t)} value={user.first_name}
                    placeholder="Enter your first name"/>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user-tag"/>
                <TextInput  autoCapitalize='words' style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} 
                    onChangeText={t => change("last_name",t)} value={user.last_name}
                    placeholder="Enter your last name"/>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user-tag"/>
                <TextInput autoCapitalize="none" style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} 
                    onChangeText={(t) => {change("email",t);
                    const isValid = verifyEmail(t);
                    {isValid ? setValidEmail(true) : setValidEmail(false)}
                    }} value={user.email}
                    placeholder="Enter your email"/>
                <Text style={{marginRight: 5,fontSize: 20, color: 'red'}}>{isValidEmail ? ' ' : 'Email is inValid'}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user-tag"/>
                <TextInput autoCapitalize="none" style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} 
                    onChangeText={t => change("address",t)} value={user.address}
                    placeholder="Enter your address"/>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="user"/>
                <TextInput autoCapitalize="none" style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} 
                    onChangeText={t => change("username",t)} value={user.username}
                    placeholder="Username"/>
            </View>
            <View style={{flexDirection: 'row', alignItems:'center',width: windowWidth - 60, marginLeft: 30, marginTop: 20, height: 40, backgroundColor: '#fff'}}>
                <Icon style={{fontSize: 20, marginLeft: 10}} name="lock"/>
                <TextInput 
                    style={{height: '100%', flex: 1, marginLeft: 10, fontSize: 20}} autoCapitalize="none"
                        placeholder="Password"
                        onChangeText={t => change("password",t)} value={user.password}
                        secureTextEntry={visible ? false : true} 
                />
                <TouchableOpacity style={{height: '100%'}}
                    onPress={() => {
                        setVisible(!visible)
                    }}
                >
                    {visible &&<Icon style={{fontSize: 20, margin: 10}} name="eye"/>}
                    {!visible && <Icon style={{fontSize: 20, margin: 10}} name="eye-slash"/>}
                </TouchableOpacity>
            </View> 
            <TouchableOpacity 
                style={{height: 50, width: windowWidth - 60, justifyContent: 'center', alignItems: 'center', backgroundColor: "#121139", marginLeft: 30, marginTop: 20, borderRadius: 100}}
                onPress={handleRegister}
            >
                <Text style={{color: '#fff', fontSize: 18}}>Register</Text>
            </TouchableOpacity>
        </View>
        )}
    </View>
    );
};
