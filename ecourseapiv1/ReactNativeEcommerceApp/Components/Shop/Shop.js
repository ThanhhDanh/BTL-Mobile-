import { View, Text, ActivityIndicator, Image, ScrollView } from "react-native"
import MyStyle from "../../Style/MyStyle"
import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../Configs/APIs";
import { Chip, List } from "react-native-paper";
import "moment/locale/vi"


const Shop = ()=>{
    const[categories, setCategories] = useState(null);
    const[shops, setShops] = useState([]);
    const[loading, setLoading] = useState(false);


    const loadCates = async()=>{
        try{
            let res = await APIs.get(endpoints['categories']);
            setCategories(res.data);
        }catch(ex){
            console.error(ex);
        }
    }

    const loadShops = async()=>{
        try{
            setLoading(true);
            let res = await APIs.get(endpoints['shops']);
            setShops(res.data); //setShops(res.result.data) là có phân trang trong shops
        }catch(ex){
            console.error(ex);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        loadCates();
    },[]);//gọi 1 lần

    useEffect(()=>{
        loadShops();
    },[]);//gọi 1 lần

    return (
        <View style={MyStyle.container}>
            <Text style={[MyStyle.labels]}>Các danh mục cửa hàng</Text>
            <View style={[MyStyle.row,MyStyle.justifyConCenter]}>
                {
                    categories ===null?<ActivityIndicator/>:<>
                    {categories.map(c=><Chip style={MyStyle.margin5} key={c.id} icon="shape">{c.name}</Chip>)}
                    </>
                }
            </View>
            <ScrollView>
                {shops.map(c=><List.Item key={c.id} title={['Shop: ',c.name]} description={['Địa chỉ: '+c.address+'\n'+'Chủ Shop: '+c.owner]}
                left={()=><Image style={MyStyle.image} source={{uri: c.image}} />}
                />)}
                {loading && <ActivityIndicator/>}
            </ScrollView>
        </View>
    )
}

export default Shop