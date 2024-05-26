import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../Configs/APIs";
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyle from "../../Style/MyStyle";
import { useNavigation } from '@react-navigation/native';
import Order from "../Order/Order";
import { Tooltip } from "react-native-paper";
import Rating from "../Utils/Utils";



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const itemWidth = (windowWidth - 30) / 2; // Tính toán chiều rộng của mỗi mục



export default Product = () => {
    const [productPrice, setProductPrice] = useState([]);
    const[loading, setLoading] = useState(false);
    const navigation = useNavigation();
    

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await APIs.get(endpoints['products']);
            const filterByPrice = res.data.filter(p => p.priceProduct >= 90.00);
            setProductPrice(filterByPrice);
        }
        catch (err) {
            console.info("Lỗi: ", err.message)
        }finally {
            setLoading(false);
        }
    }

    useEffect (()=>{
        loadProduct();
    },[])


    const truncatedText = (text, limit) => {
        if (text.length <= limit) return text;
        return `${text.substring(0, limit)}...`;
    };


    return (
        <View style={{width: '100%', height: '100%'}}>
            {loading && <ActivityIndicator />}
            <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                {productPrice.map(p =>
                    <TouchableOpacity key={p.id} onPress={()=>navigation.navigate("ProductDetails",{productId: p.id})}
                        style={{width: itemWidth - 80, marginVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, overflow: 'hidden'}}>
                        <View style={{height: 180}}>
                            <Image style={{width: '100%', height: 100}} resizeMode="contain" source={{ uri: p.image }} />
                            <Tooltip
                                title={p.name}
                            >
                                <Text style={{textAlign: 'center', padding: 5}}>{truncatedText(p.name,10)}</Text>
                            </Tooltip>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 5, marginRight: 5}}>
                                <Text>{p.priceProduct}<Text> đ</Text></Text>
                                <View style={{flexDirection:'row', alignItems: 'center'}}>
                                    <View style={[MyStyle.triangle,{position: 'absolute',left: 0}]}></View>
                                    <Text style={{margin: 5, borderRadius:20, backgroundColor: '#f0799a', fontSize: 10}}>-20%</Text>
                                </View>
                            </View>
                            <Text style={{marginLeft: 5, textDecorationLine: 'line-through', opacity: 0.3}}>3.000.000<Text style={{fontSize: 8}}> đ</Text></Text>
                        </View>
                        <View style={{width: '100%', height: '12%'}}>
                            <Rating productId={p.id}/>
                        </View>
                        <View style={{width:'100%', height: '10%'}}>
                            <Order productId={p.id}/>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}