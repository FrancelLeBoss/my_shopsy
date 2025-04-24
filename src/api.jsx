import axios from 'axios';

const API = axios.create({
    baseURL: "http://127.0.0.1:5173/api/",
});

export default API;
