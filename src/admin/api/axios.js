import axios from 'axios'

// 若未提供環境變數，預設改為本機後端
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
})

export default api
