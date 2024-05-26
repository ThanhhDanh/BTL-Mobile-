import { ActivityIndicator, KeyboardAvoidingView,Platform , SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import MyStyle from "../../Style/MyStyle";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../Configs/APIs";
import Shop from "../Shop/Shop";



export default Home =({navigation})=>{
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={MyStyle.setForm}>
                    <View style={MyStyle.container}>
                        <Shop/>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};