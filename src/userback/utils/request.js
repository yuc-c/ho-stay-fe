// src/utils/request.js
import axios from 'axios'

// 建立 axios 實例
const request = axios.create({
    baseURL: 'http://localhost:8080', // 你的後端 API 網址
    timeout: 10000 // 請求逾時時間
})

// 請求攔截器
request.interceptors.request.use(
    config => {
        // 可以在這裡加入 token
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers['Authorization'] = 'Bearer ' + token
        // }
        return config
    },
    error => {
        console.error('請求錯誤:', error)
        return Promise.reject(error)
    }
)

// 回應攔截器
request.interceptors.response.use(
    response => {
        return response
    },
    error => {
        console.error('回應錯誤:', error)
        return Promise.reject(error)
    }
)

export default request