import axios from "axios";

const supportAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
});

export default supportAxios;