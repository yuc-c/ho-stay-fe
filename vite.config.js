import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import fs from 'fs'

// 自定義插件：處理多入口的 history 模式路由
function historyApiFallback() {
  return {
    name: 'history-api-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''

        // 如果請求的是 HTML 檔案，直接通過
        if (url.endsWith('.html')) {
          return next()
        }

        // 如果請求的是靜態資源（js, css, 圖片等），直接通過
        if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
          return next()
        }

        // 如果請求的是 API 路徑，直接通過（會由 proxy 處理）
        if (url.startsWith('/api') || url.startsWith('/images')) {
          return next()
        }

        // /admin.html/... → 返回 admin.html
        if (url.startsWith('/admin.html')) {
          const filePath = resolve(__dirname, 'admin.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        // /user.html/... → 返回 user.html
        if (url.startsWith('/user.html')) {
          const filePath = resolve(__dirname, 'user.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        // /administrant.html/... → 返回 administrant.html
        if (url.startsWith('/administrant.html')) {
          const filePath = resolve(__dirname, 'administrant.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        // /owner.html/... → 返回 owner.html
        if (url.startsWith('/owner.html')) {
          const filePath = resolve(__dirname, 'owner.html')
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html')
            res.end(fs.readFileSync(filePath, 'utf-8'))
            return
          }
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    historyApiFallback(),
  ],


  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },


  // 多入口設定（新增）
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'admin.html'),
        user: resolve(__dirname, 'user.html'),
        administrant: resolve(__dirname, 'administrant.html'),
        owner: resolve(__dirname, 'owner.html'),
      },
    },
  },

  server: {
    host: "0.0.0.0",   // ⭐ 允許外部裝置連線
    open: "/user.html",
    proxy: {
      "/api": {

        target: "http://localhost:8080", // 本機後端

        changeOrigin: true,
        secure: false,
      },
      "/images": {
        target: "http://localhost:8080",// 本機後端
        changeOrigin: true,
      }
    },
    allowedHosts: ["resorptive-cristy-unaged.ngrok-free.dev", "pushy-frances-abrogable.ngrok-free.dev", "localhost"]
  },
})
