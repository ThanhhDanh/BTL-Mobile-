import { useCallback, useEffect, useState } from "react"
import APIs, { endpoints } from "../../Configs/APIs";
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyle from "../../Style/MyStyle";
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Order from "../Order/Order";
import { Tooltip } from "react-native-paper";
import Rating, { formatPrice } from "../Utils/Utils";



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const itemWidth = (windowWidth - 30) / 2; // Tính toán chiều rộng của mỗi mục



export default Product = ({previousScreen, categories,  onRatingCalculated, onSalesCalculated}) => {
    const route = useRoute();
    const [productPrice, setProductPrice] = useState([]);
    const[loading, setLoading] = useState(false);
    const navigation = useNavigation();
    

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await APIs.get(endpoints['products']);
            const filterByPrice = res.data.filter(p => p.priceProduct >= 50000000);
             // Lấy danh sách id của các danh mục từ danh sách sản phẩm đã lọc
            const categoryIds = filterByPrice.map(p => p.category_id);

            // Lấy danh sách danh mục từ API dựa trên id của các danh mục trong sản phẩm
            const categoryRequests = categoryIds.map(categoryId => APIs.get(endpoints['categories'] + `${categoryId}/`));
            const categoryResponses = await Promise.all(categoryRequests);

            // Tạo một mảng mới chứa các đối tượng sản phẩm với tên của danh mục được thêm vào
            const productsWithCategoryName = filterByPrice.map((p, index) => {
                return {
                    ...p,
                    categoryName: categoryResponses[index].data.name
                };
            });

            setProductPrice(productsWithCategoryName);
            }
        catch (err) {
            console.info("Lỗi: ", err.message)
        }finally {
            setLoading(false);
        }
    }
    

    useFocusEffect(
        useCallback(()=>{
            loadProduct();
        },[])
    )


    const truncatedText = (text, limit) => {
        if (text.length <= limit) return text;
        return `${text.substring(0, limit)}...`;
    };

    // Tính toán chiều cao của ScrollView dựa vào số lượng sản phẩm
    const scrollViewHeight = productPrice.length * 160; // Chiều cao của mỗi sản phẩm là 230


    return (
        <ScrollView style={{width: '100%', height: scrollViewHeight}}>
            {loading && <ActivityIndicator />}
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {productPrice.map(p =>
                    <TouchableOpacity key={p.id} onPress={()=>navigation.navigate("ProductDetails",{productId: p.id, previousScreen: "Trang chủ"})}
                        style={{width: itemWidth - 25, height: 230, marginVertical: 5, marginHorizontal: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, overflow: 'hidden'}}>
                        <View style={{position: 'absolute', top: 0, left: 0, backgroundColor: 'rgb(233,71,139)', zIndex: 1, width: 35, height: 25, borderBottomRightRadius: 10, borderTopLeftRadius: 5}}>
                            <Text style={{fontSize: 9,textAlign: 'center', fontWeight: '500', color: '#fff'}}>{p.categoryName}</Text>
                        </View>
                        <View style={{height: 185}}>
                            <Image style={{width: '100%', height: 100}} resizeMode="contain" source={{ uri: p.image }} />
                            <Tooltip
                                title={p.name} 
                            >
                                <Text style={{textAlign: 'center', padding: 5}}>{truncatedText(p.name,10)}</Text>
                            </Tooltip>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginLeft: 5, marginRight: 5}}>
                                <Text style={{fontSize: 14, marginRight: 10}}>{formatPrice(p.priceProduct)}</Text>
                                <View style={{flexDirection:'row', alignItems: 'center'}}>
                                    <View style={[MyStyle.triangle,{position: 'absolute',left: 0}]}></View>
                                    <Text style={{margin: 5, borderRadius:20, backgroundColor: '#f0799a', fontSize: 12, padding: 3, color: '#fff'}}>-20%</Text>
                                </View>
                            </View>
                            <Text style={{marginLeft: 5, textDecorationLine: 'line-through', opacity: 0.3}}>300.000.000<Text style={{fontSize: 10}}> đ</Text></Text>
                        </View>
                        <View style={{width: '100%', height: '10%'}}>
                            <Rating productId={p.id} onRatingCalculated={onRatingCalculated}/>
                        </View>
                        <View style={{width:'100%', height: '8%'}}>
                            <Order productId={p.id} onSalesCalculated={onSalesCalculated}/>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    )
}