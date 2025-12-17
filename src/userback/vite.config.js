import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },

    // 開發伺服器設定
    server: {
        port: 5173,

        // API 代理設定（重要！）
        proxy: {
            '/api': {
                target: 'http://192.168.25.152:8080',  // 後端 API 位址
                changeOrigin: true,
                secure: false
            }
        }
    }
})