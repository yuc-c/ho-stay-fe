# API 服務使用說明

## 目錄結構

```
src/
├── api/                    # API 服務層
│   ├── index.js           # 統一導出入口
│   ├── request.js         # API 請求封裝（get, post, put, delete 等）
│   ├── user.js            # 用戶相關 API（示例）
│   └── ...                # 其他業務模塊 API
└── utils/                 # 工具層
    ├── axios.js           # Axios 實例配置
    └── config.js          # 應用配置
```

## 使用方式

### 方式一：使用封裝的請求方法（推薦）

```javascript
import { get, post, put, del } from '@/api/request'

// GET 請求
const users = await get('users', { page: 1, limit: 10 })

// POST 請求
const newUser = await post('users', { name: 'John', email: 'john@example.com' })

// PUT 請求
const updatedUser = await put('users/1', { name: 'Jane' })

// DELETE 請求
await del('users/1')
```

### 方式二：使用具體的 API 服務模塊（推薦）

創建具體的 API 服務文件，例如 `src/api/user.js`：

```javascript
// src/api/user.js
import { get, post, put, del } from './request'

export function getUserList(params) {
  return get('users', params)
}

export function getUserById(id) {
  return get(`users/${id}`)
}

export function createUser(data) {
  return post('users', data)
}

export function updateUser(id, data) {
  return put(`users/${id}`, data)
}

export function deleteUser(id) {
  return del(`users/${id}`)
}
```

在組件中使用：

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { getUserList, createUser } from '@/api/user'

const users = ref([])

onMounted(async () => {
  try {
    users.value = await getUserList({ page: 1 })
  } catch (error) {
    console.error('獲取用戶失敗:', error.message)
  }
})

async function handleCreateUser(userData) {
  try {
    const newUser = await createUser(userData)
    users.value.push(newUser)
  } catch (error) {
    console.error('創建用戶失敗:', error.message)
  }
}
</script>
```

### 方式三：統一導出（可選）

在 `src/api/index.js` 中統一導出所有 API：

```javascript
// src/api/index.js
export * from './request'
export * from './user'
// export * from './auth'
// export * from './product'
```

使用時：

```javascript
import { getUserList, createUser, get, post } from '@/api'
```

## 文件上傳

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

## 文件下載

```javascript
import { download } from '@/api/request'

await download('export/users', { format: 'excel' }, 'users.xlsx')
```

## 直接使用 Axios 實例

如果需要更細粒度的控制：

```javascript
import { axiosInstance } from '@/api/request'

const response = await axiosInstance({
  method: 'POST',
  url: 'custom-endpoint',
  data: { custom: 'data' },
  headers: { 'Custom-Header': 'value' }
})
```

## 最佳實踐

1. **按業務模塊組織 API**：將相關的 API 放在同一個文件中（如 `user.js`, `auth.js`, `product.js`）
2. **使用具體的 API 函數**：不要直接使用 `get/post`，而是封裝成具體的業務函數
3. **統一錯誤處理**：錯誤已在攔截器中處理，組件中只需處理業務邏輯
4. **類型提示**：建議使用 TypeScript 或 JSDoc 註釋提供類型提示

