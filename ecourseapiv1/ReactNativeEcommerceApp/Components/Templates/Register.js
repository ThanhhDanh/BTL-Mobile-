import { useState } from "react";
import { SafeAreaView, Text, TextInput } from "react-native";
import MyStyle from "../../Style/MyStyle";



export default Register = ({navigation})=>{
    const [email,onChangeEmail] = useState('');
    const [isValidEmail, setValidEmail] = useState(true);
    const [phoneNumber,onChangePhone] = useState('');
    const [isValidPhone, setValidPhone] = useState(true);

    const verifyEmail = (email) => {
        let regex = new RegExp(/([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])/);
        if(!email) return true;
        if(regex.test(email)){
            return true;
        }
        return false;
    };

    const verifyPhone = (phoneNumber) => {
        let regex = new RegExp(/([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/);
        if(!phoneNumber) return true;
        if(regex.test(phoneNumber)){
            return true;
        }
        return false;
    };

    return (
        <SafeAreaView style={MyStyle.container}>
            <Text style={{padding: 10, fontSize: 20}}>Email</Text>
            <TextInput style={{height: 40,margin: 12,borderWidth: 1, padding: 10}}
                onChangeText={(email)=>{
                    onChangeEmail(email);
                    const isValid = verifyEmail(email);
                    {isValid ? setValidEmail(true) : setValidEmail(false)}

                }}  
                value={email}
            />
            <Text style={{padding: 10, fontSize: 20, color: 'red'}}>{isValidEmail ? ' ' : 'Email is inValid'}</Text>

            <Text style={{padding: 10, fontSize: 20}}>Phone Number</Text>
            <TextInput style={{height: 40,margin: 12,borderWidth: 1, padding: 10}}
                onChangeText={(phoneNumber)=>{
                    onChangePhone(phoneNumber);
                    const isValid = verifyPhone(phoneNumber);
                    {isValid ? setValidPhone(true) : setValidPhone(false)}
                }}  
                value={phoneNumber}
                keyboardType="numeric"
            />
            <Text style={{padding: 10, fontSize: 20, color: 'red'}}>{isValidPhone ? '' : 'Phone Number is inValid'}</Text>
        </SafeAreaView>
    );
};