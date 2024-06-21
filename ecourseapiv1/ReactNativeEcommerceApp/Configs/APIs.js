import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const BASE_URL = 'http://192.168.1.201:8000/';

export const endpoints = {
    'categories':'/categories/',
    'shops':'/shops/',
    'shop-details': (shopId) => `/shops/${shopId}/`,
    'products':'/products/',
    'product-details': (productId) => `/products/${productId}/`,
    'comments': (productId) => `/products/${productId}/comment/`,
    'add-comment': (productId) => `/products/${productId}/commentss/`,
    'review':  '/reviews/',
    'users':'/users/',
    'orders':'/orders/',
    'tags':'/tags/',
    'current-user': '/users/current-user/',
    'login': '/o/token/',
    'momo': '/momo/process/',
    'like-product': (productId) => `/products/${productId}/like/`
}


export const authAPI = (accessToken) => axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `bearer ${accessToken?accessToken:AsyncStorage.getItem("access-token")}`
    }
})

export default axios.create({
    baseURL: BASE_URL
});
