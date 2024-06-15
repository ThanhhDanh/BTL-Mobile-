    import { View, Text, ActivityIndicator, Image, ScrollView, FlatList, Button, SafeAreaView, Dimensions, RefreshControl, TouchableOpacity, ImageBackground } from "react-native"
    import MyStyle from "../../Style/MyStyle"
    import { useCallback, useEffect, useState } from "react"
    import APIs, { endpoints } from "../../Configs/APIs";
    import { Chip, List, Searchbar } from "react-native-paper";
    import "moment/locale/vi"
    import Icon from 'react-native-vector-icons/FontAwesome6';
    import { Animated } from "react-native";
    import { useRef } from "react";
    import PictureList from "../Templates/Picture-list";
    import Product from "../Product/Product";
    import { useFocusEffect } from "@react-navigation/native";


    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const Shop = ({navigation, route})=>{
        const[categories, setCategories] = useState(null);
        const[loading, setLoading] = useState(false);
        const[shops, setShops] = useState([]);
        const [products, setProducts] = useState([]);
        const [searchVisible, setSearchVisible] = useState(false); // Thêm biến trạng thái để kiểm soát việc hiển thị ô tìm kiếm
        const[page, setPage] = useState(1);
        const [q, setQ] = useState("");
        const [showNavBar, setShowNavBar] = useState(false);
        const slideAnim = useRef(new Animated.Value(-windowWidth)).current; // Giá trị ban đầu của slideAnim là -windowWidth

    

        const loadCates = async()=>{
            try{
                let res = await APIs.get(endpoints['categories']);
                setCategories(res.data);
            }catch(ex){
                console.error(ex);
            }
        }

        // console.info(cate)


        const loadShopsAndProduct = async()=>{
            if(page > 0){
                let url = `${endpoints['shops']}?q=${q}&page=${page}`;
                let productUrl = `${endpoints['products']}?q=${q}&page=${page}`;
                try{
                    setLoading(true);
                    let res = await APIs.get(url);
                    let productRes = await APIs.get(productUrl);
                    setShops(res.data); //setShops(res.result.data) là có phân trang trong shops   
                    setProducts(productRes.data);
                }catch(ex){
                    console.error(ex);
                }finally{
                    setLoading(false);
                }
            }
        }


        useEffect(()=>{
            loadShopsAndProduct();
        },[q]);//gọi 1 lần
        
        useEffect(()=>{
            loadCates();
        },[]);//gọi 1 lần
        
        const search = (value, callback) => {
            setPage(1)//Nếu tìm kiếm thì phải trở về trang đầu tiên 
            callback(value);
        }

        const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
            const paddingToBottom = 20;
            return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
        };

        const loadMore = ({nativeEvent}) => {
            if (loading===false && isCloseToBottom(nativeEvent)) {
                setPage(page + 1);
            }
        }

        
        const show = () => {
            setShowNavBar(!showNavBar);
            Animated.timing(slideAnim, {
                toValue: showNavBar ? -windowWidth : 0, // Điều chỉnh giá trị để ẩn hoặc hiện
                duration: 300,
                useNativeDriver: true,
            }).start();
        };


        useFocusEffect(
            useCallback(() => {
                setShowNavBar(false);
                Animated.timing(slideAnim, {
                    toValue: -windowWidth,
                    duration: 0,
                    useNativeDriver: true,
                }).start();
            }, [])
        );



        // Làm hiệu ứng chữ
            const animatedValue = useRef(new Animated.Value(0)).current;
        
            useEffect(() => {
            Animated.loop(
                Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }),
                ])
            ).start();
            }, [animatedValue]);
        
            const textColor = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['red', 'yellow']
            });

        // Define the callbacks
        const handleRatingCalculated = (rating) => {
            return rating;
        }

        const handleSalesCalculated = (sales) => {
            return sales;
        }   

        const handleShopSelect = (shopId) => {
            navigation.navigate('ShopDetails', { shopId: shopId}, {onRatingCalculated: handleRatingCalculated, 
                onSalesCalculated: handleSalesCalculated});
        };

        const handleProductSelect = (productId) => {
            navigation.navigate('ProductDetails', { productId });
        };

        const handleShopByNameSelect = (shopId) => {
            console.info(shopId)
            navigation.navigate('ShopItemByName', {shopId: shopId}, {onRatingCalculated: handleRatingCalculated, 
                onSalesCalculated: handleSalesCalculated});
        };


        const handleCategorySelect = (categoryId) => {
            if (categoryId === 2) {
                loadShopsAndProduct(categoryId); // Gọi hàm loadShopsAndProduct với categoryId
            } else {
                // Xử lý cho các danh mục khác nếu cần
                navigation.navigate('CategoryDetail', { categoryId}, { previousScreen: 'Trang chủ',onRatingCalculated: handleRatingCalculated, 
                    onSalesCalculated: handleSalesCalculated }
                );
            }
            show();
        }

        return (
                <View style={{width: '100%', height: windowHeight}}>
                    {/* <Text style={[MyStyle.labels]}>Các danh mục cửa hàng</Text> */}
                    <View style={{width: '100%', height: '20%'}}>
                            <HeaderApp show={show} showNavBar={showNavBar} setShowNavBar={setShowNavBar} q={q} setQ={setQ} page={page} setPage={setPage} loading={loading} setLoading={setLoading} search={search} shops={shops} setShops={setShops} slideAnim={slideAnim}/>
                    </View>

                    {/* Show menu search */}
                    {q.length > 0 && (
                            <ScrollView scrollEventThrottle={16} style={[MyStyle.shadowMenuUser,MyStyle.searchResults]} 
                                onScroll={loadMore}>
                                <RefreshControl onRefresh={() => loadShopsAndProduct()} />
                                <View> 
                                    {/* {loading && <ActivityIndicator/>}
                                    {shops.map(c=> 
                                    <TouchableOpacity key={c.id} onPress={()=>handleShopSelect(c.id)}>
                                        <List.Item style={{width: windowWidth - 60, margin: 5}} title={c.name} 
                                        description={c.address}
                                        left={() => <Image style={MyStyle.img} source={{ uri: c.image }} />}
                                    />
                                    </TouchableOpacity>
                                    )}
                                    {loading && page > 1 && <ActivityIndicator />} */}
                                    {loading && <ActivityIndicator />}
                                    {shops.length > 0 && (
                                        <>
                                            <Text style={{ margin: 10, fontWeight: 'bold' }}>Cửa hàng</Text>
                                            {shops.map(c =>
                                                <TouchableOpacity key={c.id} onPress={() => handleShopSelect(c.id)}>
                                                    <List.Item style={{ width: windowWidth - 60, margin: 5 }} title={c.name}
                                                        description={c.address}
                                                        left={() => <Image style={MyStyle.img} source={{ uri: c.image }} />}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                    {products.length > 0 && (
                                        <>
                                            <Text style={{ margin: 10, fontWeight: 'bold' }}>Sản phẩm</Text>
                                            {products.map(p =>
                                                <TouchableOpacity key={p.id} onPress={() => handleProductSelect (p.id)}>
                                                    <List.Item style={{ width: windowWidth - 60, margin: 5 }} title={p.name}
                                                        description={p.description}
                                                        left={() => <Image style={MyStyle.img} source={{ uri: p.image }} />}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                    {loading && page > 1 && <ActivityIndicator />}
                                </View>
                            </ScrollView>
                    )}
                    {/* Nội dụng */}
                    <ScrollView style={{width: '100%', height: windowHeight}}>
                            {/* Nội dung trang chính của bạn  */}
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <View style={{width: windowWidth - 60, height: windowWidth - 190, flexDirection: 'row', flexWrap: "wrap", justifyContent: 'space-between', marginTop: 30}}>
                                    <TouchableOpacity onPress={() => handleCategorySelect(1)}
                                    style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <View style={{height: 50, width: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10}}>
                                            <Icon style={{fontSize: 30, color: 'rgb(108,219,100)'}} name="earth-asia"/>
                                        </View>
                                        <Text style={{marginTop: 5}}>Hàng quốc tế</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() =>handleShopByNameSelect(2)}
                                        style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <View style={{height: 50, width: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10}}>
                                            <Icon style={{fontSize: 30, color: 'rgb(233,71,139)'}} name="vest"/>
                                        </View>
                                        <Text style={{marginTop: 5}} >Thời trang</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <Image style={{width: 50, height: 50}} resizeMode="cover" source={{uri: 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/51/assets/src/react-native-logo.2e38e3ef2dc9c7aafd21c14df3a1cdb8.png'}}/>
                                        <Text style={{marginTop: 5}}>Đồng hồ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <Image style={{width: 50, height: 50}} resizeMode="cover" source={{uri: 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/51/assets/src/react-native-logo.2e38e3ef2dc9c7aafd21c14df3a1cdb8.png'}}/>
                                        <Text style={{marginTop: 5}} >Deal giảm sốc</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <Image style={{width: 50, height: 50}} resizeMode="cover" source={{uri: 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/51/assets/src/react-native-logo.2e38e3ef2dc9c7aafd21c14df3a1cdb8.png'}}/>
                                        <Text style={{marginTop: 5}} >Deal giảm sốc</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{width: 100, height: 100, alignItems: 'center'}}>
                                        <Image style={{width: 50, height: 50}} resizeMode="cover" source={{uri: 'https://snack-web-player.s3.us-west-1.amazonaws.com/v2/51/assets/src/react-native-logo.2e38e3ef2dc9c7aafd21c14df3a1cdb8.png'}}/>
                                        <Text style={{marginTop: 5}} >Deal giảm sốc</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{backgroundColor: '#121139', borderTopRightRadius: 20, borderTopLeftRadius: 20}}>
                                    <View style={{width: windowWidth, marginTop: 15, marginBottom: 40}}>
                                        <PictureList/>
                                    </View>
                                </View>
                                <View style={{width: '100%', height: '100%', borderWidth: 1, backgroundColor: '#fff', alignItems: 'center'}}>
                                    <View style={{width: '100%', height: '10%',backgroundColor: '#fff', position: 'absolute', top: -40, borderTopLeftRadius: 20,borderTopRightRadius: 20}}></View>
                                    <View style={{width: windowWidth - 60 , flex: 1}}>
                                        <Text style={{fontSize: 16}}>Sản phẩm <View></View>    
                                            <Animated.Text style={[MyStyle.hotText, {color: textColor}]}>
                                                HOT
                                            </Animated.Text>
                                        </Text>
                                        <View style={{flex: 1}}>
                                            <Product categories={categories} previousScreen="Trang chủ" onRatingCalculated={handleRatingCalculated} onSalesCalculated={handleSalesCalculated}/>
                                        </View>
                                    </View>
                                </View>
                            </View>
                    </ScrollView>
                                
                    {/* Show bars */}
                    <Animated.View style={[MyStyle.navBar,{transform: [{ translateX: slideAnim }]}]}>
                            <View style={{width: windowWidth, height: '100%', backgroundColor: 'rgba(52, 52, 52, 0.3)'}}>
                                <TouchableOpacity onPress={show}
                                    style={{height: '15%', width: 60, left:'45%'}}>
                                    <Icon style={{fontSize: 30, color: '#fff', padding: 20, textAlign: 'center'}} name="xmark"/>
                                </TouchableOpacity>
                                <View style={{width: '50%', height: '50%', alignItems: 'center', marginLeft: 20}}>
                                    <Text style={{color:'#fff', fontSize: 30, textAlign: 'center'}}>Danh mục</Text>
                                    <ScrollView>
                                        <View style={{margin: 10}}>
                                                {/* <TouchableOpacity style={MyStyle.cateItem}>
                                                    <Icon style={{color: "#121139", fontSize: 18,marginRight: 10}} name="store"/>
                                                    <Text style={{color: '#fff', fontSize: 18}}>Tất cả</Text>
                                                </TouchableOpacity> */}
                                            {
                                                categories ===null?<ActivityIndicator/>:<>
                                                {categories.map(c=>
                                                <TouchableOpacity onPress={() => handleCategorySelect(c.id)}
                                                    style={MyStyle.cateItem} key={c.id}>
                                                    <Icon style={{color: "#121139", fontSize: 18,marginRight: 10}} name="store"/>
                                                    <Text style={{color: '#fff', fontSize: 18}}>{c.name}</Text>
                                                </TouchableOpacity>)}
                                                </>
                                            }
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                    </Animated.View>
                </View>
        )
    }


    export const HeaderApp = ({shops, setShops,q,setQ, page, setPage, loading, setLoading, search, showNavBar, setShowNavBar, slideAnim, show})=>{
    
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={{width: '100%',backgroundColor:'#121139', height: '100%', flexDirection: 'row', alignItems: 'center'}}>
                    <Searchbar
                                style={{ width: '75%', borderWidth: 1, marginLeft: 10}}
                                placeholder="Search"
                                onChangeText={t => search(t, setQ)}
                                value={q}
                        />
                        
                        <View style={{ width: windowWidth - 60, flexDirection: 'row', alignItems: 'center', height: 80 }}>
                            <TouchableOpacity onPress={show}>
                                <Icon style={{ fontSize: 30, color: '#fff', margin: 10, marginLeft: 30 }} name="bars" />
                            </TouchableOpacity>
                            {/* <Text style={{ fontSize: 30, color: '#fff'}}>Bamboo</Text> */}
                            {/* <TouchableOpacity>
                                <Icon style={{ fontSize: 25, color: '#fff',margin: 10 }} name="bell" />
                            </TouchableOpacity> */}
                        </View>
                </View> 
            </SafeAreaView>
        );
    }



    export default Shop