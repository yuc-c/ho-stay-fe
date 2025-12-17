<template>
  <div>
    <!-- 頁面標題 -->
    <div class="mb-12">
      <div class="flex items-center gap-3 mb-3">
        <ClockIcon class="w-8 h-8 text-foreground" />
        <h1 class="text-3xl font-bold text-foreground">系統操作紀錄</h1>
      </div>
      <p class="text-muted-foreground">平台所有操作與變更的完整記錄</p>
    </div>

    <!-- 篩選器 -->
    <div class="rounded-lg border border-border p-6 mb-6" style="background-color: var(--color-search-area, var(--color-card));">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="flex flex-col">
          <label class="block text-sm font-semibold text-foreground mb-2">操作類型</label>
          <select 
            v-model="filters.actionType"
            class="audit-filter-select w-full px-3 py-2 border-2 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
          >
            <option value="">全部</option>
            <option value="insert">新增</option>
            <option value="update">更新</option>
            <option value="delete">刪除</option>
          </select>
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-semibold text-foreground mb-2">操作人員ID</label>
          <input
            v-model="filters.actorUserId"
            type="text"
            placeholder="請輸入操作人員ID"
            class="audit-filter-input w-full px-3 py-2 border-2 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
          />
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-semibold text-foreground mb-2">開始日期</label>
          <input
            v-model="filters.from"
            type="date"
            :max="maxDate"
            class="audit-filter-input w-full px-3 py-2 border-2 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
          />
        </div>
        <div class="flex flex-col">
          <label class="block text-sm font-semibold text-foreground mb-2">結束日期</label>
          <input
            v-model="filters.to"
            type="date"
            :max="maxDate"
            class="audit-filter-input w-full px-3 py-2 border-2 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
          />
        </div>
      </div>
      <div class="mt-6 flex items-center gap-3">
        <button 
          @click="handleSearch"
          class="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm hover:shadow-md"
        >
          搜尋
        </button>
        <button 
          @click="handleReset"
          class="px-6 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 日誌列表 -->
    <div class="bg-card rounded-lg border border-border p-6">
      <h2 class="text-xl font-bold text-foreground mb-6">操作日誌</h2>

      <div v-if="loading" class="text-center py-8">
        <p class="text-muted-foreground">載入中...</p>
      </div>
      <div v-else-if="logs.length === 0" class="text-center py-8">
        <p class="text-muted-foreground">目前沒有審計日誌</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border ho-table-header">
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">日誌ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">操作者ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">操作類型</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">目標資料表</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">目標ID</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">操作</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">來源IP</th>
              <th class="px-4 py-3 text-left text-sm text-foreground" style="font-weight: 600;">操作時間</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="border-b border-border ho-table-row transition-colors"
            >
              <td class="px-4 py-4 text-foreground font-medium">#{{ log.id }}</td>
              <td class="px-4 py-4 text-foreground">{{ log.actorUserId || 'N/A' }}</td>
              <td class="px-4 py-4">
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getActionTypeClass(log.actionType)"
                >
                  {{ getActionTypeLabel(log.actionType) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span
                  v-if="log.targetTable"
                  class="px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground"
                >
                  {{ log.targetTable }}
                </span>
                <span v-else class="text-muted-foreground">-</span>
              </td>
              <td class="px-4 py-4 text-foreground">{{ log.targetId || '-' }}</td>
              <td class="px-4 py-4">
                <button
                  @click="openDiffModal(log.id)"
                  class="px-4 py-2 text-sm font-semibold border-2 border-primary/80 text-primary bg-background hover:bg-primary hover:text-primary-foreground rounded-lg transition-all shadow-md hover:shadow-lg active:shadow-sm hover:border-primary"
                >
                  查看
                </button>
              </td>
              <td class="px-4 py-4 text-foreground text-sm">{{ log.ipAddress || '-' }}</td>
              <td class="px-4 py-4 text-muted-foreground text-sm">
                {{ formatDateTime(log.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div v-if="logs.length > 0" class="mt-6 flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          顯示第 {{ currentPage * pageSize + 1 }}-{{ Math.min((currentPage + 1) * pageSize, totalElements) }} 筆，共 {{ totalElements }} 筆記錄
        </p>
        <div class="flex gap-2">
          <button 
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 0"
            class="px-3 py-1 border border-border rounded-lg bg-background text-foreground hover:bg-muted hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button 
            v-for="page in getPageNumbers()" 
            :key="page"
            @click="handlePageChange(page - 1)"
            class="px-3 py-1 rounded-lg transition-colors min-w-[2.5rem]"
            :class="currentPage === page - 1 
              ? 'bg-primary text-primary-foreground' 
              : 'border border-border bg-background text-foreground hover:bg-muted hover:border-primary'"
          >
            {{ page }}
          </button>
          <button 
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="px-3 py-1 border border-border rounded-lg bg-background text-foreground hover:bg-muted hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Diff 彈窗 -->
    <div
      v-if="showDiffModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeDiffModal"
    >
      <div
        class="rounded-lg border border-border p-5 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        @click.stop
        style="background-color: var(--color-card); overflow-x: hidden;"
      >
        <!-- 彈窗標題 -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-bold text-foreground">變更內容</h3>
          <button
            @click="closeDiffModal"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 彈窗內容 -->
        <div>
          <div v-if="diffLoading" class="text-center py-8">
            <p class="text-muted-foreground">載入中...</p>
          </div>
          <div v-else-if="diffChanges.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">沒有變更記錄</p>
          </div>
          <div v-else>
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b-2 border-border">
                  <th class="px-4 py-3 text-left text-sm font-semibold text-foreground" style="font-weight: 600;">字段名稱</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-foreground" style="font-weight: 600;">舊值</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-foreground" style="font-weight: 600; width: 40px;">→</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-foreground" style="font-weight: 600;">新值</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(change, index) in diffChanges"
                  :key="index"
                  class="border-b border-border"
                >
                  <td class="px-4 py-3 text-sm text-foreground font-medium">{{ change.fieldName }}</td>
                  <td class="px-4 py-3 text-sm text-muted-foreground">
                    <span v-if="change.oldValue === null || change.oldValue === ''">-</span>
                    <span v-else>{{ formatFieldValue(change.oldValue) }}</span>
                  </td>
                  <td class="px-4 py-3 text-center text-sm text-muted-foreground">→</td>
                  <td class="px-4 py-3 text-sm text-foreground">
                    <span v-if="change.newValue === null || change.newValue === ''">-</span>
                    <span v-else>{{ formatFieldValue(change.newValue) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 彈窗底部 -->
        <div class="flex justify-end pt-3 mt-3">
          <button
            @click="closeDiffModal"
            class="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { searchAuditLogs, getAuditLogById } from '@/administrant/api/auditLogs'
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@/administrant/components/icons'

const logs = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const pageSize = ref(10)

// 計算今天的日期（YYYY-MM-DD 格式），用於限制日期選擇器的最大值
const maxDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Diff 彈窗相關
const showDiffModal = ref(false)
const diffLoading = ref(false)
const diffChanges = ref([])

// 篩選參數
const filters = ref({
  actionType: '',
  targetTable: '',
  actorUserId: '',
  from: '',
  to: '',
  keyword: ''
})

// 獲取審計日誌
const fetchAuditLogs = async (page = 0) => {
  loading.value = true
  try {
    // 只傳遞有值的篩選參數，排除空字符串
    const params = {
      page,
      size: pageSize.value
    }
    
    // 只添加非空的篩選參數
    if (filters.value.actionType !== null && filters.value.actionType !== undefined && filters.value.actionType !== '') {
      const actionType = String(filters.value.actionType).trim()
      if (actionType) {
        params.actionType = actionType
      }
    }
    if (filters.value.targetTable && filters.value.targetTable.trim()) {
      params.targetTable = filters.value.targetTable.trim()
    }
    if (filters.value.actorUserId && filters.value.actorUserId.toString().trim()) {
      params.actorUserId = filters.value.actorUserId.toString().trim()
    }
    if (filters.value.from && filters.value.from.trim()) {
      params.from = filters.value.from.trim()
    }
    if (filters.value.to && filters.value.to.trim()) {
      params.to = filters.value.to.trim()
    }
    if (filters.value.keyword && filters.value.keyword.trim()) {
      params.keyword = filters.value.keyword.trim()
    }
    
    console.log('篩選參數:', params)
    console.log('操作類型篩選值:', filters.value.actionType)
    
    const response = await searchAuditLogs(params)
    
    // axios 攔截器已經返回了 response.data，所以這裡直接使用 response
    console.log('API Response:', response)
    
    // 處理分頁數據
    if (response) {
      // 如果返回的是分頁格式 { content: [], totalPages: 0, totalElements: 0 }
      if (response.content && Array.isArray(response.content)) {
        logs.value = response.content
        totalPages.value = response.totalPages || 0
        totalElements.value = response.totalElements || 0
      } 
      // 如果直接返回數組
      else if (Array.isArray(response)) {
        logs.value = response
        totalPages.value = 1
        totalElements.value = response.length
      }
      // 如果返回的是對象但沒有 content
      else if (response.data && Array.isArray(response.data)) {
        logs.value = response.data
        totalPages.value = response.totalPages || 1
        totalElements.value = response.totalElements || response.data.length
      }
      // 其他情況
      else {
        logs.value = []
        totalPages.value = 0
        totalElements.value = 0
        console.warn('API 返回的數據格式不符合預期:', response)
      }
      currentPage.value = page
    } else {
      logs.value = []
      totalPages.value = 0
      totalElements.value = 0
    }
    console.log('Audit Logs:', logs.value)
    console.log('Total Elements:', totalElements.value)
  } catch (error) {
    console.error('獲取審計日誌失敗:', error)
    logs.value = []
    totalPages.value = 0
    totalElements.value = 0
  } finally {
    loading.value = false
  }
}

// 搜尋
const handleSearch = () => {
  console.log('點擊搜尋按鈕，當前篩選條件:', filters.value)
  currentPage.value = 0
  fetchAuditLogs(0)
}

// 重置篩選
const handleReset = () => {
  filters.value = {
    actionType: '',
    targetTable: '',
    actorUserId: '',
    from: '',
    to: '',
    keyword: ''
  }
  fetchAuditLogs(0)
}

// 換頁
const handlePageChange = (page) => {
  fetchAuditLogs(page)
}

// 計算要顯示的頁碼（固定顯示5個按鈕，確保位置一致）
const getPageNumbers = () => {
  const maxPages = 5 // 最多顯示 5 個頁碼按鈕
  const current = currentPage.value + 1 // 轉換為 1-based
  const total = totalPages.value
  
  if (total <= maxPages) {
    // 如果總頁數少於等於 5，顯示所有頁碼
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  // 固定顯示 5 個按鈕，根據當前頁面智能選擇範圍
  let start, end
  
  if (current <= 3) {
    // 在前3頁時，固定顯示 1-5
    start = 1
    end = 5
  } else if (current >= total - 2) {
    // 在最後3頁時，固定顯示最後5頁
    start = total - 4
    end = total
  } else {
    // 在中間頁面時，當前頁在中間，前後各2頁
    start = current - 2
    end = current + 2
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

// 獲取動作類型的中文標籤
const getActionTypeLabel = (type) => {
  if (!type) return type
  const lowerType = type.toLowerCase()
  const labels = {
    'create': '新增',
    'insert': '新增',
    'update': '更新',
    'delete': '刪除',
    'read': '讀取'
  }
  return labels[lowerType] || type
}

// 獲取動作類型的樣式類別
const getActionTypeClass = (type) => {
  if (!type) return 'ho-tag-update'
  const lowerType = type.toLowerCase()
  const classes = {
    'create': 'ho-tag-create',
    'insert': 'ho-tag-create',
    'update': 'ho-tag-update',
    'delete': 'ho-tag-delete',
    'read': 'ho-tag-update'
  }
  return classes[lowerType] || 'ho-tag-update'
}

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化欄位值（處理 JSON 字串和特殊值）
const formatFieldValue = (value) => {
  if (!value) return '-'
  
  // 如果是 JSON 字串，嘗試解析
  if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      // 解析失敗，返回原值
      return value
    }
  }
  
  // 處理密碼等敏感欄位
  if (typeof value === 'string' && (value.includes('password') || value.includes('Password'))) {
    return '****'
  }
  
  return value
}

// 打開 Diff 彈窗
const openDiffModal = async (logId) => {
  showDiffModal.value = true
  diffLoading.value = true
  diffChanges.value = []
  
  try {
    const response = await getAuditLogById(logId)
    // axios 攔截器已經返回了 response.data，所以這裡直接使用 response
    if (Array.isArray(response)) {
      diffChanges.value = response
    } else if (response && response.data) {
      diffChanges.value = response.data
    }
  } catch (error) {
    console.error('獲取變更記錄失敗:', error)
    diffChanges.value = []
  } finally {
    diffLoading.value = false
  }
}

// 關閉 Diff 彈窗
const closeDiffModal = () => {
  showDiffModal.value = false
  diffChanges.value = []
}

onMounted(() => {
  fetchAuditLogs()
})
</script>

