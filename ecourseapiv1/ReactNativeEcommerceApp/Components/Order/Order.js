import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../Configs/APIs";
import { Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';



export default Order = ({route, productId}) =>{
    const [order, setOrder] = useState([]);
    const [soldQuantity, setSoldQuantity] = useState([]);


    const calculateSales = (orders) => {
        let totalQuantity = 0;
        orders.forEach(o => {
            if (o.product_id == productId) {
                if(o.orderStatus === "Đã Thanh Toán")
                    totalQuantity +=o.quantity;
            }
        });

        setSoldQuantity(totalQuantity);
    };

    const loadOrder = async()=>{
        try {
            let res = await APIs.get(endpoints['orders']);
            setOrder(res.data);
            calculateSales(res.data)
        }catch(err){
            console.info("Lỗi: ", err.message);
        }
    }

    useEffect(()=>{
        loadOrder();
    },[productId]);

    

    return(
        <View style={{flex: 1}}>
            <View style={{position: 'absolute', bottom: 0, right: 5}}>
                {soldQuantity > 3 ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon style={{color: '#ea2222', marginRight: 3}} name="fire"/>
                        <Text style={{fontSize: 12}}>Bán chạy</Text>
                    </View>
                ) : (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {soldQuantity === 0 ? '':<Icon style={{color: '#ea2222', marginRight: 3}} name="fire"/>}
                        <Text style={{fontSize: 12}}>{soldQuantity} lượt bán</Text>
                    </View>
                )}
            </View>
        </View>
    )
}