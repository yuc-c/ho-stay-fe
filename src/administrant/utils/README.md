# API 工具使用說明

## 配置文件

### `config.js`
提供應用配置常量，從環境變數中讀取。

```javascript
import { API_BASE_URL, APP_ENV, IS_DEV } from '@/utils/config'

console.log(API_BASE_URL) // http://localhost:8000/api
console.log(APP_ENV)      // development
console.log(IS_DEV)       // true
```

### `axios.js`
Axios 實例配置，包含請求/響應攔截器，自動處理 token 和錯誤。

> **注意**：API 請求封裝已移至 `src/api/` 目錄，請使用 `@/api/request` 或具體的 API 服務模塊。

## 使用範例

> **注意**：API 請求方法已移至 `src/api/` 目錄，請參考 `src/api/README.md` 獲取最新的使用說明。

### 使用 Axios (推薦)

#### 基本 GET 請求

```javascript
import { get } from '@/api/request'

// 獲取用戶列表（帶查詢參數）
const users = await get('users', { page: 1, limit: 10 })
```

#### POST 請求

```javascript
import { post } from '@/api/request'

// 創建新用戶
const newUser = await post('users', {
  name: 'John Doe',
  email: 'john@example.com'
})
```

#### PUT 請求

```javascript
import { put } from '@/api/request'

// 更新用戶
const updatedUser = await put('users/1', {
  name: 'Jane Doe'
})
```

#### PATCH 請求

```javascript
import { patch } from '@/api/request'

// 部分更新用戶
const updatedUser = await patch('users/1', {
  name: 'Jane Doe'
})
```

#### DELETE 請求

```javascript
import { del } from '@/api/request'

// 刪除用戶
await del('users/1')
```

#### 文件上傳

```javascript
import { upload } from '@/api/request'

const formData = new FormData()
formData.append('file', file)
formData.append('name', 'avatar')

const result = await upload('upload', formData, {
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
    console.log(`上傳進度: ${percentCompleted}%`)
  }
})
```

#### 文件下載

```javascript
import { download } from '@/api/request'

await download('export/users', { format: 'excel' }, 'users.xlsx')
```

#### 在 Vue 組件中使用

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { get, post } from '@/api/request'

const users = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    users.value = await get('users', { page: 1 })
  } catch (error) {
    console.error('獲取用戶失敗:', error.message)
    // 錯誤已經在攔截器中處理，這裡可以顯示用戶友好的提示
  } finally {
    loading.value = false
  }
})

async function createUser(userData) {
  try {
    const newUser = await post('users', userData)
    users.value.push(newUser)
    return newUser
  } catch (error) {
    console.error('創建用戶失敗:', error.message)
    throw error
  }
}
</script>
```

#### 直接使用 Axios 實例

如果需要更細粒度的控制，可以直接使用 axios 實例：

```javascript
import { axiosInstance } from '@/api/request'

// 自定義請求
const response = await axiosInstance({
  method: 'POST',
  url: 'custom-endpoint',
  data: { custom: 'data' },
  headers: { 'Custom-Header': 'value' }
})
```


## 環境變數配置

在 `.env.development` 文件中配置：

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
VITE_APP_TITLE=後台管理系統
```

## API 代理

開發環境下，所有 `/api/*` 請求會自動代理到後端服務器（配置在 `vite.config.js` 中）。

例如：
- 前端請求：`/api/users`
- 實際請求：`http://localhost:8000/api/users`

