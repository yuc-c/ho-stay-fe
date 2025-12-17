// src/user/api/axios.js
import axios from 'axios'
import useUserStore from '@/user/stores/user.js'

const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        const envURL = import.meta.env.VITE_API_BASE_URL
        return envURL.endsWith('/api') ? envURL : (envURL.endsWith('/') ? envURL + 'api' : envURL + '/api')
    }
    return import.meta.env.DEV ? '/api' : 'http://192.168.25.152:8080/api'
}

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    withCredentials: true
})

// 請求攔截器
api.interceptors.request.use(
    (config) => {
        // 獲取 token
        const userStore = useUserStore()
        const token = userStore.token || localStorage.getItem('token')
        
        // 獲取 userId
        let userId = localStorage.getItem('userId')
        
        // 如果沒有 userId，嘗試從 Pinia store 獲取
        if (!userId) {
            try {
                const piniaUserData = sessionStorage.getItem('hoUser')
                if (piniaUserData) {
                    const parsed = JSON.parse(piniaUserData)
                    if (parsed?.state?.userId) {
                        userId = parsed.state.userId.toString()
                        localStorage.setItem('userId', userId)
                    } else if (parsed?.state?.id) {
                        userId = parsed.state.id.toString()
                        localStorage.setItem('userId', userId)
                    }
                }
            } catch (e) {
                if (import.meta.env.DEV) console.warn('無法從 Pinia store 讀取 userId:', e)
            }
        }
        
        // 附加 token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // 附加 userId（如果需要）
        if (userId && config.url && (config.url.includes('/reviews') || config.method === 'post' || config.method === 'put')) {
            // 如果 URL 中沒有 userId query parameter，則添加到 header
            if (!config.url.includes('userId=')) {
                config.headers.userId = userId
            }
        }
        
        if (import.meta.env.DEV) {
            console.log('🔄 Review API 請求:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                headers: {
                    Authorization: token ? 'Bearer ***' : '(無)',
                    userId: userId || '(無)'
                }
            })
        }
        
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 回應攔截器
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // 統一錯誤處理
        if (error.response?.status === 401) {
            console.log('未授權，請重新登入')
            // 可以在這裡導向登入頁
            // window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api