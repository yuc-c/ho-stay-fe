import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/owner-theme.css'
import { initTheme } from './utils/theme'

// 初始化主題（在應用啟動時）
initTheme()

createApp(App).use(router).mount('#app')

