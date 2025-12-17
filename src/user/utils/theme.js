/**
 * 主題管理工具
 * 用於管理深色模式和淺色模式的切換
 */

const THEME_KEY = 'hotel_theme'
const DARK_CLASS = 'dark'

/**
 * 獲取當前主題
 * @returns {'dark' | 'light'}
 */
export function getTheme() {
  if (typeof window === 'undefined') return 'light'
  
  // 優先從 localStorage 讀取
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }
  
  // 如果沒有保存的主題，檢查系統偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'
}

/**
 * 設置主題
 * @param {'dark' | 'light'} theme
 */
export function setTheme(theme) {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add(DARK_CLASS)
  } else {
    root.classList.remove(DARK_CLASS)
  }
  
  localStorage.setItem(THEME_KEY, theme)
}

/**
 * 切換主題
 * @returns {'dark' | 'light'} 新的主題
 */
export function toggleTheme() {
  const currentTheme = getTheme()
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  return newTheme
}

/**
 * 初始化主題（在應用啟動時調用）
 */
export function initTheme() {
  const theme = getTheme()
  setTheme(theme)
}

