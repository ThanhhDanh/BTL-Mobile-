import { View, Text, ActivityIndicator } from "react-native"
import MyStyle from "../../Style/MyStyle"
import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../Configs/APIs";
import { Chip } from "react-native-paper";

const Shop = ()=>{
    const[categories, setCategories] = useState(null);

    const loadCates = async()=>{
        try{
            let res = await APIs.get(endpoints['categories']);
            setCategories(res.data);
        }catch(ex){
            console.error(ex);
        }
    }

    useEffect(()=>{
        loadCates();
    },[]);//gọi 1 lần

    return (
        <View style={MyStyle.container}>
            <Text style={MyStyle.labels}>Các danh mục cửa hàng</Text>
            {
                categories ===null?<ActivityIndicator/>:<>
                {categories.map(c=><Chip key={c.id} icon="shape">{c.name}</Chip>)}
                </>
            }
        </View>
    )
}

export default Shop