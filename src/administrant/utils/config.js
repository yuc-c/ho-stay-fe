/**
 * 應用配置
 * 從環境變數中讀取配置值
 */

// API 基礎 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 應用環境
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'

// 應用標題
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || '後台管理系統'

// 是否為開發環境
export const IS_DEV = APP_ENV === 'development'

// 是否為生產環境
export const IS_PROD = APP_ENV === 'production'

// 配置對象
export default {
  API_BASE_URL,
  APP_ENV,
  APP_TITLE,
  IS_DEV,
  IS_PROD,
}

