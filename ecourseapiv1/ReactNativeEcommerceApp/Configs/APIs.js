import axios from "axios";


const BASE_URL = 'https://thanhdanh.pythonanywhere.com/';

export const endpoints = {
    'categories':'/categories/'
}

export default axios.create({
    baseURL: BASE_URL
});
