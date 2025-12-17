/**
 * Axios 實例配置
 * 統一管理 API 請求配置和攔截器
 */
import axios from 'axios'
import { API_BASE_URL, IS_DEV } from './config'

// 創建 Axios 實例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 秒超時
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 從 localStorage 或 sessionStorage 獲取 token
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || 
                  localStorage.getItem('token') || sessionStorage.getItem('token')

    // 如果有 token，添加到請求頭
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 開發環境下打印請求信息
    if (IS_DEV) {
      console.log('🚀 發送請求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error) => {
    // 請求錯誤處理
    if (IS_DEV) {
      console.error('❌ 請求錯誤:', error)
    }
    return Promise.reject(error)
  }
)

// 響應攔截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 開發環境下打印響應信息
    if (IS_DEV) {
      console.log('✅ 收到響應:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    // 如果後端返回的數據結構是 { code, data, message }，可以在這裡統一處理
    const { data } = response

    // 如果後端使用標準的 { code, data, message } 格式
    if (data && typeof data === 'object' && 'code' in data) {
      // 根據後端的業務狀態碼處理
      if (data.code === 200 || data.code === 0) {
        return data.data !== undefined ? data.data : data
      } else {
        // 業務錯誤
        const error = new Error(data.message || '請求失敗')
        error.code = data.code
        return Promise.reject(error)
      }
    }

    // 直接返回數據
    return data
  },
  (error) => {
    // 響應錯誤處理
    if (IS_DEV) {
      console.error('❌ 響應錯誤:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
    }

    // HTTP 狀態碼錯誤處理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授權，清除 token 並跳轉到登錄頁
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUserName')
          localStorage.removeItem('adminRole')
          sessionStorage.removeItem('adminToken')
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          // 可以在這裡觸發登錄跳轉
          // router.push('/login')
          break
        case 403:
          // 禁止訪問
          console.error('無權限訪問')
          break
        case 404:
          // 資源不存在
          console.error('請求的資源不存在')
          break
        case 500:
          // 服務器錯誤
          console.error('服務器內部錯誤')
          break
        default:
          break
      }

      // 返回後端的錯誤信息
      const errorMessage = data?.message || data?.error || `請求失敗 (${status})`
      const customError = new Error(errorMessage)
      customError.status = status
      customError.data = data
      return Promise.reject(customError)
    }

    // 網絡錯誤或其他錯誤
    if (error.request) {
      const networkError = new Error('網絡連接失敗，請檢查網絡設置')
      networkError.type = 'network'
      return Promise.reject(networkError)
    }

    // 其他錯誤
    return Promise.reject(error)
  }
)

export default axiosInstance

