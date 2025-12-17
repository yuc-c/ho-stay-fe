<template>
  <div>
    <!-- 頁面標題 -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <ChartBarIcon class="w-8 h-8 text-foreground" />
        <h1 class="text-3xl font-bold text-foreground">營運分析</h1>
      </div>
      <p class="text-muted-foreground">平台營運數據總覽與趨勢分析</p>
    </div>

    <!-- 今日概況 -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <h2 class="text-xl font-bold text-foreground">今日概況：{{ todayDateStr }}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="今日新增用戶"
          :value="otherMetrics.newUsers"
          :icon="UsersIcon"
          iconColor="success"
        />
        <StatCard
          title="今日新增飯店"
          :value="otherMetrics.newHotels"
          :icon="BuildingOfficeIcon"
          iconColor="info"
        />
        <StatCard
          title="今日新增評論"
          :value="otherMetrics.newReviews"
          :icon="ChatBubbleLeftRightIcon"
          iconColor="warning"
        />
        <StatCard
          title="今日客服案件"
          :value="otherMetrics.supportCases"
          :icon="EyeIcon"
          iconColor="accent"
        />
      </div>
    </div>

    <!-- 歷史概況和圖表區域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 歷史概況（左邊） -->
      <div class="bg-card rounded-lg border border-border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-foreground">歷史概況</h2>
        </div>
        <!-- 日期選擇器 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-foreground mb-2">選擇日期：</label>
          <div class="flex items-center gap-2">
            <input
              v-model="selectedDate"
              type="date"
              :max="maxDate"
              @change="handleDateChange"
              class="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground"
            />
            <button
              @click="loadYesterdayData"
              class="px-5 py-2.5 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-all whitespace-nowrap font-semibold shadow-md hover:shadow-lg active:shadow-sm border-2 border-orange-300/50 hover:border-orange-200"
            >
              昨日
            </button>
          </div>
        </div>
        
        <!-- 無數據提示 -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-muted-foreground">載入中...</p>
        </div>
        <div v-else-if="!historicalData" class="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
          <p class="text-warning text-sm">⚠️ 選擇的日期 ({{ selectedDate }}) 沒有資料</p>
        </div>
        
        <!-- 歷史概況卡片（2x2） -->
        <div class="grid grid-cols-2 gap-6">
          <StatCard
            title="當日總用戶數"
            :value="historicalData?.dailyUsers || 0"
            :icon="UsersIcon"
            iconColor="primary"
          />
          <StatCard
            title="當日總飯店數"
            :value="historicalData?.dailyHotels || 0"
            :icon="BuildingOfficeIcon"
            iconColor="info"
          />
          <StatCard
            title="當日總訂單數"
            :value="historicalData?.dailyOrders || 0"
            :icon="ShoppingCartIcon"
            iconColor="warning"
          />
          <StatCard
            title="當日總成交額"
            :value="formatGmv(historicalData?.dailyGmv)"
            unit="TWD"
            :icon="CurrencyYenIcon"
            iconColor="accent"
          />
        </div>
      </div>

      <!-- 訂單與成交額概況 -->
      <div class="lg:col-span-2 bg-card rounded-lg border border-border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-foreground">訂單與成交額概況</h2>
          <!-- 時間區間選擇器和匯出按鈕 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-foreground whitespace-nowrap">開始日期：</label>
            <input
              v-model="orderRevenueStartDate"
              type="date"
              :max="orderRevenueEndDate"
              @change="handleOrderRevenueStartDateChange"
              @input="handleOrderRevenueStartDateChange"
              class="px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm"
            />
            <label class="text-sm font-medium text-foreground whitespace-nowrap">結束日期：</label>
            <input
              v-model="orderRevenueEndDate"
              type="date"
              :max="maxDate"
              @change="handleOrderRevenueEndDateChange"
              @input="handleOrderRevenueEndDateInput"
              class="px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm"
            />
            <button
              @click="exportData"
              class="px-5 py-2.5 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-all whitespace-nowrap font-semibold shadow-md hover:shadow-lg active:shadow-sm border-2 border-orange-300/50 hover:border-orange-200 flex items-center gap-2"
              title="匯出 Excel"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              匯出
            </button>
          </div>
        </div>
        <div style="width: 100%; height: 320px;">
          <v-chart
            style="width: 100%; height: 100%;"
            :option="orderRevenueOption"
            autoresize
          />
        </div>
      </div>
    </div>

    <!-- 平台規模成長趨勢 -->
    <div class="bg-card rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-foreground">平台規模成長趨勢</h2>
        <select 
          v-model="timeRange"
          @change="updateChartData"
          class="ho-status-filter-select px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors"
        >
          <option value="day">日趨勢</option>
          <option value="month">月趨勢</option>
          <option value="quarter">季趨勢</option>
        </select>
      </div>
      <div style="width: 100%; height: 320px;">
        <v-chart
          style="width: 100%; height: 100%;"
          :option="platformGrowthOption"
          autoresize
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

import StatCard from '@/administrant/components/StatCard.vue'
import {
  UsersIcon,
  ShoppingCartIcon,
  CurrencyYenIcon,
  CurrencyTwdIcon,
  BuildingOfficeIcon,
  TicketIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@/administrant/components/icons'
import { getAllAnalytics, getAnalyticsByDate, getTodayNewUsers, getTodayNewReviews, getTodayNewHotels, getTodaySupportCases, getHistoricalData, getOrderRevenueData, getMonthlyAggregate, getQuarterlyAggregate } from '@/administrant/api/analytics'
import ExcelJS from 'exceljs'

// 註冊 ECharts 組件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 深色模式檢測
const isDarkMode = ref(document.documentElement.getAttribute('data-theme') === 'dark')

// 監聽主題變化
const checkDarkMode = () => {
  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

// 使用 MutationObserver 監聽 data-theme 屬性變化
let themeObserver = null
onMounted(() => {
  themeObserver = new MutationObserver(checkDarkMode)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect()
  }
})

// 圖例文字顏色（根據深色模式調整）
const legendTextColor = computed(() => {
  return isDarkMode.value ? '#FFFFFF' : '#000000'
})

// 軸顏色配置（根據深色模式調整）
const axisColor = computed(() => {
  return isDarkMode.value ? '#FFFFFF' : '#000000'
})

// 數據狀態
const analyticsData = ref([])
const selectedDate = ref('')
const historicalData = ref(null)
const loading = ref(false)
const timeRange = ref('day') // 預設顯示日趨勢
const orderRevenueData = ref([]) // 訂單與成交額數據
const chartData = ref([]) // 圖表數據（使用與歷史概況相同的即時查詢邏輯）

// 訂單與成交額時間區間（預設：昨天往前推6天，總共7天）
const orderRevenueStartDate = ref('')
const orderRevenueEndDate = ref('')
let endDateValidationTimer = null

// 其他指標數據（今日概況）
const otherMetrics = ref({
  newUsers: 0,
  newReviews: 0,
  newHotels: 0,
  supportCases: 0
})

// 今日日期字符串
const todayDateStr = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

// 最大可選日期（昨天）
const maxDate = computed(() => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  // 使用本地時間格式化，避免時區問題
  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// 生成連續日期數組
const generateDateRange = (startDate, endDate) => {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }
  
  return dates
}

// 獲取季度字符串（例如：2025-Q1）
const getQuarterString = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const quarter = Math.floor((month - 1) / 3) + 1
  return `${year}-Q${quarter}`
}

// 獲取季度的顯示格式（例如：2025-Q4）
const getQuarterDisplay = (quarterStr) => {
  // 直接返回季度格式，例如：2025-Q4
  return quarterStr
}

// 獲取圖表數據（日趨勢使用即時查詢，與歷史概況相同邏輯）
const fetchChartData = async () => {
  // 以今日為基準
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (timeRange.value === 'day') {
    // 日趨勢：最右邊是昨天，往左推6天，總共7天（與歷史概況一致）
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const endDate = yesterday
    const startDate = new Date(yesterday)
    startDate.setDate(startDate.getDate() - 6) // 往回推6天，總共7天
    
    const dateRange = generateDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
    
    // 日趨勢：查詢當天的數字，若未有當天數字則為0
    const promises = dateRange.map(date => getHistoricalData(date, false))
    const results = await Promise.all(promises)
    
    console.log('日趨勢 - 獲取的數據:', results)
    
    chartData.value = results.map((data, index) => {
      // 處理不同的響應格式
      let processedData = data
      if (data && typeof data === 'object' && data.data) {
        processedData = data.data
      }
      
      if (processedData && typeof processedData === 'object') {
        // 標準化欄位名稱
        const normalized = normalizeAnalyticsData(processedData)
        if (normalized) {
          const result = {
            date: dateRange[index],
            totalUsers: normalized.dailyUsers || 0,
            totalHotels: normalized.dailyHotels || 0,
            totalOrders: normalized.dailyOrders || 0,
            gmvAmount: normalized.dailyGmv || 0
          }
          console.log(`日期 ${dateRange[index]} 的數據:`, result)
          return result
        }
      }
      console.warn(`日期 ${dateRange[index]} 沒有數據，響應:`, data)
      return {
        date: dateRange[index],
        totalUsers: 0,
        totalHotels: 0,
        totalOrders: 0,
        gmvAmount: 0
      }
    })
    
    console.log('日趨勢 - 處理後的 chartData:', chartData.value)
  } else if (timeRange.value === 'month') {
    // 月趨勢：最右邊是當月，往左推12個月（含當月）
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // 1-12
    
    // 生成最近12個月的月份列表（從最左邊到最右邊）
    const monthList = []
    const monthQueries = [] // 存儲每個月的查詢參數 {year, month}
    
    for (let i = 11; i >= 0; i--) {
      let year = currentYear
      let month = currentMonth - i
      
      // 處理跨年情況
      while (month <= 0) {
        month += 12
        year -= 1
      }
      while (month > 12) {
        month -= 12
        year += 1
      }
      
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      monthList.push(monthStr)
      monthQueries.push({ year, month })
    }
    
    // 月趨勢：查詢該月份所有資料的總和 / 當月資料筆數，取平均值
    // 例如12月有三筆資料，就是12月資料相加後除以3
    const promises = monthQueries.map(({ year, month }) => getMonthlyAggregate(year, month))
    const results = await Promise.all(promises)
    
    console.log('月趨勢 - 獲取的數據:', results)
    
    chartData.value = results.map((data, index) => {
      // 處理不同的響應格式
      let processedData = data
      if (data && typeof data === 'object' && data.data) {
        processedData = data.data
      }
      
      if (processedData && typeof processedData === 'object') {
        // 標準化欄位名稱
        const normalized = normalizeAnalyticsData(processedData)
        if (normalized) {
          const result = {
            date: monthList[index],
            totalUsers: normalized.dailyUsers || 0,
            totalHotels: normalized.dailyHotels || 0,
            totalOrders: normalized.dailyOrders || 0,
            gmvAmount: normalized.dailyGmv || 0
          }
          console.log(`月份 ${monthList[index]} 的聚合數據:`, result)
          return result
        }
      }
      console.warn(`月份 ${monthList[index]} 沒有數據，響應:`, data)
      return {
        date: monthList[index],
        totalUsers: 0,
        totalHotels: 0,
        totalOrders: 0,
        gmvAmount: 0
      }
    })
    
    console.log('月趨勢 - 處理後的 chartData:', chartData.value)
  } else if (timeRange.value === 'quarter') {
    // 季趨勢：最右邊是當季，往左推5季（含當季）
    const currentQuarter = getQuarterString(today)
    
    // 生成最近5季的季度列表
    const quarterList = []
    const quarterQueries = [] // 存儲每個季度的查詢參數 {year, quarter}
    
    for (let i = 4; i >= 0; i--) {
      const quarterDate = new Date(today)
      quarterDate.setMonth(quarterDate.getMonth() - (i * 3))
      const quarterKey = getQuarterString(quarterDate)
      quarterList.push(quarterKey)
      
      // 計算該季度的年份和季度數字
      const quarterYear = quarterDate.getFullYear()
      const quarterMonth = quarterDate.getMonth() + 1 // 1-12
      const quarterNum = Math.floor((quarterMonth - 1) / 3) + 1 // 1-4
      
      quarterQueries.push({ year: quarterYear, quarter: quarterNum })
    }
    
    // 季趨勢：查詢該季度三個月份的數據相加 / 3，取整數
    // 例如 2024-Q4 則是 2024-10 + 2024-11 + 2024-12 相加後 / 3
    const promises = quarterQueries.map(({ year, quarter }) => getQuarterlyAggregate(year, quarter))
    const results = await Promise.all(promises)
    
    console.log('季趨勢 - 獲取的數據:', results)
    
    chartData.value = results.map((data, index) => {
      // 處理不同的響應格式
      let processedData = data
      if (data && typeof data === 'object' && data.data) {
        processedData = data.data
      }
      
      if (processedData && typeof processedData === 'object') {
        // 標準化欄位名稱
        const normalized = normalizeAnalyticsData(processedData)
        if (normalized) {
          const result = {
            date: quarterList[index],
            totalUsers: normalized.dailyUsers || 0,
            totalHotels: normalized.dailyHotels || 0,
            totalOrders: normalized.dailyOrders || 0,
            gmvAmount: normalized.dailyGmv || 0
          }
          console.log(`季度 ${quarterList[index]} 的聚合數據:`, result)
          return result
        }
      }
      console.warn(`季度 ${quarterList[index]} 沒有數據，響應:`, data)
      return {
        date: quarterList[index],
        totalUsers: 0,
        totalHotels: 0,
        totalOrders: 0,
        gmvAmount: 0
      }
    })
    
    console.log('季趨勢 - 處理後的 chartData:', chartData.value)
  }
}

// 根據時間範圍獲取數據（保留用於其他用途）
const getDataByTimeRange = computed(() => {
  return chartData.value
})

// 獲取所有營運分析數據
const fetchAllAnalyticsData = async () => {
  try {
    const response = await getAllAnalytics()
    console.log('Analytics API Response:', response)
    
    // axios 攔截器已經返回了 response.data，所以這裡直接使用 response
    // 處理不同的數據格式
    if (Array.isArray(response)) {
      // 直接是數組
      analyticsData.value = response
    } else if (response && typeof response === 'object') {
      // 如果是對象，檢查是否有 content 或 data 屬性
      if (Array.isArray(response.content)) {
        analyticsData.value = response.content
      } else if (Array.isArray(response.data)) {
        analyticsData.value = response.data
      } else {
        analyticsData.value = []
        console.warn('API 返回的數據格式不符合預期:', response)
      }
    } else {
      analyticsData.value = []
    }
    
    // 按日期排序
    analyticsData.value.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0)
      const dateB = b.date ? new Date(b.date) : new Date(0)
      return dateA - dateB
    })
    console.log('All Analytics Data:', analyticsData.value)
  } catch (error) {
    console.error('獲取營運分析數據失敗:', error)
    analyticsData.value = []
  }
}

// 將後端欄位名稱轉換為前端期望的格式
const normalizeAnalyticsData = (data) => {
  if (!data || typeof data !== 'object') {
    console.warn('normalizeAnalyticsData: 數據為空或不是對象', data)
    return null
  }
  
  console.log('normalizeAnalyticsData 輸入數據:', data)
  console.log('數據欄位:', Object.keys(data))
  
  // 處理多種可能的欄位名稱格式
  // 後端可能返回：
  // 1. camelCase: totalUsers, totalHotels, totalOrders, gmvAmount (DTO 格式)
  // 2. snake_case: total_users, total_hotels, total_orders, gmv_amount (資料庫格式)
  // 3. 前端期望格式: dailyUsers, dailyHotels, dailyOrders, dailyGmv
  const result = {
    dailyUsers: data.dailyUsers !== undefined ? data.dailyUsers : 
                (data.totalUsers !== undefined ? data.totalUsers : 
                (data.total_users !== undefined ? data.total_users : 0)),
    dailyHotels: data.dailyHotels !== undefined ? data.dailyHotels : 
                 (data.totalHotels !== undefined ? data.totalHotels : 
                 (data.total_hotels !== undefined ? data.total_hotels : 0)),
    dailyOrders: data.dailyOrders !== undefined ? data.dailyOrders : 
                 (data.totalOrders !== undefined ? data.totalOrders : 
                 (data.total_orders !== undefined ? data.total_orders : 0)),
    dailyGmv: data.dailyGmv !== undefined ? data.dailyGmv : 
              (data.gmvAmount !== undefined ? data.gmvAmount : 
              (data.gmv_amount !== undefined ? data.gmv_amount : 0))
  }
  
  console.log('normalizeAnalyticsData 輸出結果:', result)
  return result
}

// 根據日期獲取歷史概況數據
const fetchHistoricalData = async (date) => {
  loading.value = true
  try {
    console.log('正在獲取歷史概況數據:', date)
    const response = await getHistoricalData(date)
    console.log('API 原始響應:', response)
    console.log('響應類型:', typeof response)
    console.log('響應是否為 null:', response === null)
    console.log('響應是否為 undefined:', response === undefined)
    
    // 處理不同的響應格式
    let rawData = null
    
    // 如果響應為 null 或 undefined，表示沒有數據
    if (response === null || response === undefined) {
      console.warn('API 返回 null，表示指定日期沒有數據')
      historicalData.value = null
      return
    }
    
    if (typeof response === 'object') {
      // 檢查是否有嵌套的 data
      if (response.data !== undefined) {
        if (response.data === null) {
          console.warn('API 返回 data 為 null，表示指定日期沒有數據')
          historicalData.value = null
          return
        }
        rawData = response.data
      } else {
        rawData = response
      }
    } else {
      console.warn('API 返回的數據格式不符合預期:', response)
      historicalData.value = null
      return
    }
    
    console.log('處理後的原始數據:', rawData)
    
    if (rawData && typeof rawData === 'object') {
      // 標準化欄位名稱
      const normalized = normalizeAnalyticsData(rawData)
      if (normalized) {
        historicalData.value = normalized
        console.log('標準化後的歷史概況數據:', historicalData.value)
      } else {
        console.warn('數據標準化失敗')
        historicalData.value = null
      }
    } else {
      console.warn('API 返回的數據為空或格式不符合預期:', rawData)
      historicalData.value = null
    }
  } catch (error) {
    console.error('獲取歷史概況數據失敗:', error)
    console.error('錯誤詳情:', error.response?.data || error.message)
    historicalData.value = null
  } finally {
    loading.value = false
  }
}

// 格式化成交額
const formatGmv = (gmv) => {
  if (!gmv) return '$0'
  return `$${Number(gmv).toLocaleString()}`
}

// 日期改變事件
const handleDateChange = () => {
  if (selectedDate.value) {
    fetchHistoricalData(selectedDate.value)
  }
}

// 載入昨日數據
const loadYesterdayData = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  selectedDate.value = yesterdayStr
  fetchHistoricalData(yesterdayStr)
}

// 獲取今日新增用戶數
const fetchTodayNewUsers = async () => {
  try {
    const response = await getTodayNewUsers()
    if (response && response.count !== undefined) {
      otherMetrics.value.newUsers = response.count
    }
  } catch (error) {
    console.error('獲取今日新增用戶數失敗:', error)
  }
}

// 獲取今日新增評論數
const fetchTodayNewReviews = async () => {
  try {
    const response = await getTodayNewReviews()
    if (response && response.count !== undefined) {
      otherMetrics.value.newReviews = response.count
    }
  } catch (error) {
    console.error('獲取今日新增評論數失敗:', error)
  }
}

// 獲取今日新增飯店數
const fetchTodayNewHotels = async () => {
  try {
    const response = await getTodayNewHotels()
    if (response && response.count !== undefined) {
      otherMetrics.value.newHotels = response.count
    }
  } catch (error) {
    console.error('獲取今日新增飯店數失敗:', error)
  }
}

// 獲取今日客服案件數
const fetchTodaySupportCases = async () => {
  try {
    const response = await getTodaySupportCases()
    if (response && response.count !== undefined) {
      otherMetrics.value.supportCases = response.count
    }
  } catch (error) {
    console.error('獲取今日客服案件數失敗:', error)
  }
}

// 獲取訂單與成交額數據
const fetchOrderRevenueData = async () => {
  if (!orderRevenueStartDate.value || !orderRevenueEndDate.value) {
    console.warn('訂單與成交額：缺少開始或結束日期')
    return
  }
  
  try {
    console.log('正在獲取訂單與成交額數據:', {
      startDate: orderRevenueStartDate.value,
      endDate: orderRevenueEndDate.value
    })
    const response = await getOrderRevenueData(orderRevenueStartDate.value, orderRevenueEndDate.value)
    console.log('訂單與成交額 API 原始響應:', response)
    console.log('響應類型:', typeof response)
    console.log('是否為數組:', Array.isArray(response))
    
    // 處理不同的響應格式
    let data = null
    if (Array.isArray(response)) {
      data = response
    } else if (response && typeof response === 'object') {
      // 檢查是否有嵌套的 data
      if (Array.isArray(response.data)) {
        data = response.data
      } else if (Array.isArray(response.content)) {
        data = response.content
      } else {
        console.warn('訂單與成交額：響應格式不符合預期:', response)
        data = []
      }
    } else {
      console.warn('訂單與成交額：響應不是數組或對象:', response)
      data = []
    }
    
    orderRevenueData.value = data || []
    console.log('處理後的訂單與成交額數據:', orderRevenueData.value)
    console.log('數據筆數:', orderRevenueData.value.length)
    if (orderRevenueData.value.length > 0) {
      console.log('第一筆數據範例:', orderRevenueData.value[0])
    }
  } catch (error) {
    console.error('獲取訂單與成交額數據失敗:', error)
    console.error('錯誤詳情:', error.response?.data || error.message)
    orderRevenueData.value = []
  }
}

// 處理開始日期變更
const handleOrderRevenueStartDateChange = () => {
  if (!orderRevenueStartDate.value) return
  
  // 確保開始日期不超過結束日期
  if (orderRevenueEndDate.value && orderRevenueStartDate.value > orderRevenueEndDate.value) {
    orderRevenueStartDate.value = orderRevenueEndDate.value
  }
  
  fetchOrderRevenueData()
}

// 處理結束日期輸入（使用防抖，允許完整輸入）
const handleOrderRevenueEndDateInput = () => {
  // 清除之前的計時器
  if (endDateValidationTimer) {
    clearTimeout(endDateValidationTimer)
  }
  
  // 設置新的計時器，500ms 後驗證
  endDateValidationTimer = setTimeout(() => {
    validateAndUpdateEndDate()
  }, 500)
}

// 處理結束日期變更（用戶選擇日期或按 Enter）
const handleOrderRevenueEndDateChange = () => {
  // 清除輸入計時器
  if (endDateValidationTimer) {
    clearTimeout(endDateValidationTimer)
  }
  
  // 立即驗證
  validateAndUpdateEndDate()
}

// 驗證並更新結束日期
const validateAndUpdateEndDate = () => {
  // 如果值為空，不進行驗證
  if (!orderRevenueEndDate.value) {
    return
  }
  
  // 驗證日期格式是否有效
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(orderRevenueEndDate.value)) {
    return
  }
  
  // 確保結束日期不超過昨天
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  // 使用本地時間格式化
  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')
  const yesterdayStr = `${year}-${month}-${day}`
  
  try {
    const endDate = new Date(orderRevenueEndDate.value + 'T00:00:00')
    const yesterdayDate = new Date(yesterdayStr + 'T00:00:00')
    
    // 檢查日期是否有效
    if (isNaN(endDate.getTime())) {
      return
    }
    
    if (endDate > yesterdayDate) {
      orderRevenueEndDate.value = yesterdayStr
    }
    
    // 確保結束日期不早於開始日期
    if (orderRevenueStartDate.value && orderRevenueEndDate.value < orderRevenueStartDate.value) {
      orderRevenueEndDate.value = orderRevenueStartDate.value
    }
    
    fetchOrderRevenueData()
  } catch (error) {
    console.error('日期驗證錯誤:', error)
  }
}

// 獲取匯出資料（包含總用戶數和總飯店數）
const getExportData = async () => {
  if (!orderRevenueStartDate.value || !orderRevenueEndDate.value) {
    throw new Error('請先選擇開始日期和結束日期')
  }
  
  // 生成日期範圍
  const dateRange = generateDateRange(
    orderRevenueStartDate.value,
    orderRevenueEndDate.value
  )
  
  // 創建訂單與成交額數據映射
  const orderRevenueMap = new Map()
  orderRevenueData.value.forEach(item => {
    orderRevenueMap.set(item.date, item)
  })
  
  // 為每個日期獲取歷史資料（包含總用戶數和總飯店數）
  const historicalDataPromises = dateRange.map(date => getHistoricalData(date, false))
  const historicalDataResults = await Promise.all(historicalDataPromises)
  
  // 準備匯出資料
  const exportData = dateRange.map((date, index) => {
    const orderRevenueItem = orderRevenueMap.get(date)
    const historicalItemRaw = historicalDataResults[index]
    
    // 處理不同的響應格式
    let historicalItem = historicalItemRaw
    if (historicalItemRaw && typeof historicalItemRaw === 'object' && historicalItemRaw.data) {
      historicalItem = historicalItemRaw.data
    }
    
    // 標準化欄位名稱
    const normalized = historicalItem ? normalizeAnalyticsData(historicalItem) : null
    
    return {
      '日期': date,
      '總用戶數': normalized ? (normalized.dailyUsers || 0) : 0,
      '總飯店數': normalized ? (normalized.dailyHotels || 0) : 0,
      '訂單數': orderRevenueItem ? (orderRevenueItem.orders || 0) : 0,
      '成交額(TWD)': orderRevenueItem ? (Number(orderRevenueItem.gmv) || 0) : 0
    }
  })
  
  return exportData
}

// 匯出 Excel
const exportData = async () => {
  try {
    const data = await getExportData()
    
    if (!data || data.length === 0) {
      alert('沒有可匯出的資料')
      return
    }
    
    const fileName = `營運分析資料_${orderRevenueStartDate.value}_${orderRevenueEndDate.value}`
    
    // 使用 exceljs 匯出 Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('營運分析資料')
    
    // 設置欄位寬度
    worksheet.columns = [
      { width: 12 }, // 日期
      { width: 12 }, // 總用戶數
      { width: 12 }, // 總飯店數
      { width: 10 }, // 訂單數
      { width: 15 }  // 成交額
    ]
    
    // 添加標題行（使用數據的第一個物件的鍵作為標題）
    if (data.length > 0) {
      const headers = Object.keys(data[0])
      worksheet.addRow(headers)
      
      // 添加數據行
      data.forEach(row => {
        worksheet.addRow(Object.values(row))
      })
    }
    
    // 生成 Excel 文件並下載
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    console.log('Excel 匯出成功')
  } catch (error) {
    console.error('匯出 Excel 失敗:', error)
    alert(`匯出 Excel 失敗：${error.message || '請稍後再試'}`)
  }
}

// 定時器變數
let newUsersInterval = null
let newReviewsInterval = null
let newHotelsInterval = null
let supportCasesInterval = null

// 初始化
onMounted(async () => {
  await fetchAllAnalyticsData()
  // 載入昨日數據作為預設
  loadYesterdayData()
  
  // 初始化訂單與成交額時間區間（昨天往前推6天，總共7天）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const startDate = new Date(yesterday)
  startDate.setDate(startDate.getDate() - 6) // 往回推6天，總共7天
  
  // 使用本地時間格式化，避免時區問題
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  orderRevenueEndDate.value = formatDate(yesterday)
  orderRevenueStartDate.value = formatDate(startDate)
  
  // 獲取訂單與成交額數據
  await fetchOrderRevenueData()
  // 獲取圖表數據（日趨勢使用即時查詢，與歷史概況相同邏輯）
  await fetchChartData()
  // 立即獲取一次所有今日指標
  await fetchTodayNewUsers()
  await fetchTodayNewReviews()
  await fetchTodayNewHotels()
  await fetchTodaySupportCases()
  // 設置每五秒自動更新
  newUsersInterval = setInterval(fetchTodayNewUsers, 5000)
  newReviewsInterval = setInterval(fetchTodayNewReviews, 5000)
  newHotelsInterval = setInterval(fetchTodayNewHotels, 5000)
  supportCasesInterval = setInterval(fetchTodaySupportCases, 5000)
})

// 組件卸載時清除定時器
onBeforeUnmount(() => {
  if (newUsersInterval) {
    clearInterval(newUsersInterval)
    newUsersInterval = null
  }
  if (newReviewsInterval) {
    clearInterval(newReviewsInterval)
    newReviewsInterval = null
  }
  if (newHotelsInterval) {
    clearInterval(newHotelsInterval)
    newHotelsInterval = null
  }
  if (supportCasesInterval) {
    clearInterval(supportCasesInterval)
    supportCasesInterval = null
  }
})

// 平台規模成長趨勢圖表配置
const platformGrowthOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { 
    data: ['總用戶數', '總飯店數'], 
    bottom: 0,
    textStyle: { color: legendTextColor.value }
  },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: [
    {
      type: 'value',
      name: '總用戶數',
      position: 'left',
      axisLabel: { formatter: '{value}' }
    },
    {
      type: 'value',
      name: '總飯店數',
      position: 'right',
      axisLabel: { formatter: '{value}' }
    }
  ],
  series: [
    { name: '總用戶數', type: 'line', data: [], yAxisIndex: 0 },
    { name: '總飯店數', type: 'line', data: [], yAxisIndex: 1 }
  ]
})

// 監聽深色模式變化，更新圖表顏色
watch([legendTextColor, axisColor], () => {
  nextTick(() => {
    // 更新平台規模成長趨勢圖表
    if (platformGrowthOption.value.legend) {
      platformGrowthOption.value.legend.textStyle = { color: legendTextColor.value }
    }
    if (platformGrowthOption.value.xAxis) {
      if (platformGrowthOption.value.xAxis.axisLine) {
        platformGrowthOption.value.xAxis.axisLine.lineStyle = { color: axisColor.value }
      }
      if (platformGrowthOption.value.xAxis.axisLabel) {
        platformGrowthOption.value.xAxis.axisLabel.color = axisColor.value
      }
    }
    if (platformGrowthOption.value.yAxis && Array.isArray(platformGrowthOption.value.yAxis)) {
      platformGrowthOption.value.yAxis.forEach(axis => {
        if (axis.axisLine) {
          axis.axisLine.lineStyle = { color: axisColor.value }
        }
        if (axis.axisLabel) {
          axis.axisLabel.color = axisColor.value
        }
        if (axis.nameTextStyle) {
          axis.nameTextStyle.color = axisColor.value
        }
        if (axis.splitLine && axis.splitLine.show) {
          axis.splitLine.lineStyle = { 
            color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
          }
        }
      })
    }
    // 更新訂單與成交額圖表（通過重新計算 computed）
    // orderRevenueOption 是 computed，會自動更新
  })
})

// 監聽數據變化，更新圖表配置
watch([chartData, timeRange], () => {
  nextTick(() => {
    const data = chartData.value
    
    if (data.length === 0) {
      platformGrowthOption.value = {
        tooltip: { trigger: 'axis' },
        legend: { 
          data: ['總用戶數', '總飯店數'], 
          bottom: 0,
          textStyle: { color: legendTextColor.value }
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { 
          type: 'category', 
          boundaryGap: false, 
          data: [],
          axisLine: { lineStyle: { color: axisColor.value } },
          axisLabel: { color: axisColor.value }
        },
        yAxis: [
          {
            type: 'value',
            name: '總用戶數',
            position: 'left',
            axisLine: { lineStyle: { color: axisColor.value } },
            axisLabel: { 
              formatter: '{value}',
              color: axisColor.value
            },
            nameTextStyle: { color: axisColor.value }
          },
          {
            type: 'value',
            name: '總飯店數',
            position: 'right',
            axisLine: { lineStyle: { color: axisColor.value } },
            axisLabel: { 
              formatter: '{value}',
              color: axisColor.value
            },
            nameTextStyle: { color: axisColor.value }
          }
        ],
        series: [
          { name: '總用戶數', type: 'line', data: [], yAxisIndex: 0 },
          { name: '總飯店數', type: 'line', data: [], yAxisIndex: 1 }
        ]
      }
      return
    }
    
    // 提取日期和數據
    const dates = data.map(item => item.date)
    const totalUsers = data.map(item => item.totalUsers || 0)
    const totalHotels = data.map(item => item.totalHotels || 0)
    
    console.log('圖表配置 - dates:', dates)
    console.log('圖表配置 - totalUsers:', totalUsers)
    console.log('圖表配置 - totalHotels:', totalHotels)
    
    // 計算每個軸的最大值（軸最大值 = 最大資料值 × 緩衝值）
    const maxUsers = Math.max(...totalUsers, 0)
    const maxHotels = Math.max(...totalHotels, 0)
    
    console.log('圖表配置 - maxUsers:', maxUsers, 'maxHotels:', maxHotels)
    // 左軸（用戶）：max = maxUser * 1.15
    const usersAxisMax = maxUsers > 0 ? Math.ceil(maxUsers * 1.15) : undefined
    // 右軸（業者）：max = maxMerchant * 1.4
    const hotelsAxisMax = maxHotels > 0 ? Math.ceil(maxHotels * 1.4) : undefined
    
    platformGrowthOption.value = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `${params[0].axisValue}<br/>`
          params.forEach(param => {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['總用戶數', '總飯店數'],
        bottom: 0,
        textStyle: { color: legendTextColor.value }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: axisColor.value } },
        axisLabel: {
          rotate: 0,
          interval: timeRange.value === 'day' ? 'auto' : 0,
          color: axisColor.value
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '總用戶數',
          position: 'left',
          max: usersAxisMax,
          splitNumber: 5, // 固定分割段數，讓刻度間隔一致
          axisLine: { lineStyle: { color: axisColor.value } },
          splitLine: {
            show: true, // 顯示網格線
            lineStyle: { color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
          },
          axisLabel: {
            formatter: '{value}',
            color: axisColor.value
          },
          nameTextStyle: { color: axisColor.value },
          scale: false // 不使用等比縮放
        },
        {
          type: 'value',
          name: '總飯店數',
          position: 'right',
          max: hotelsAxisMax,
          splitNumber: 5, // 固定分割段數，與左軸一致
          axisLine: { lineStyle: { color: axisColor.value } },
          splitLine: {
            show: false // 右軸不顯示網格線，避免重疊
          },
          axisLabel: {
            formatter: '{value}',
            color: axisColor.value
          },
          nameTextStyle: { color: axisColor.value },
          scale: false // 不使用等比縮放
        }
      ],
      series: [
        {
          name: '總用戶數',
          type: 'line',
          data: totalUsers,
          smooth: true,
          itemStyle: { color: 'hsl(162, 60%, 55%)' }, // 主線點更亮
          lineStyle: { 
            width: 3, // 主線 3px
            color: 'hsl(162, 60%, 40%)' // 深色薄荷綠
          },
          yAxisIndex: 0,
          areaStyle: {
            color: 'rgba(43, 183, 161, 0.15)' // 非常淡的薄荷綠，不壓低折線
          }
        },
        {
          name: '總飯店數',
          type: 'line',
          data: totalHotels,
          smooth: true,
          itemStyle: { color: 'hsl(180, 50%, 55%)' }, // 副線點稍暗
          lineStyle: { 
            width: 2, // 副線 2px
            color: 'hsl(180, 50%, 65%)' // 淺色藍綠
          },
          yAxisIndex: 1
          // 副線不使用 areaStyle（不填滿）
        }
      ]
    }
  })
}, { immediate: true })

// 更新圖表數據
const updateChartData = async () => {
  await fetchChartData()
  const rangeNames = {
    day: '日趨勢',
    month: '月趨勢',
    quarter: '季趨勢'
  }
  console.log(`切換到顯示 ${rangeNames[timeRange.value] || timeRange.value} 數據`)
}

// 獲取週數（從開始日期算起）
const getWeekNumber = (date, startDate) => {
  const d = new Date(date)
  const start = new Date(startDate)
  const diffTime = d - start
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

// 獲取月份顯示格式（例如：11月 或 2025年11月）
const getMonthDisplay = (dateStr, showYear = false) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  if (showYear) {
    return `${date.getFullYear()}年${month}月`
  }
  return `${month}月`
}

// 訂單與成交額圖表配置（根據選擇的時間區間動態計算）
const orderRevenueOption = computed(() => {
  // 使用選擇的日期範圍
  if (!orderRevenueStartDate.value || !orderRevenueEndDate.value) {
    return {
      tooltip: { trigger: 'axis' },
      legend: { 
        data: ['訂單數', '成交額(TWD)'], 
        bottom: 0,
        textStyle: { color: legendTextColor.value }
      },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: [],
        axisLine: { lineStyle: { color: axisColor.value } },
        axisLabel: { color: axisColor.value }
      },
      yAxis: [
        {
          type: 'value',
          name: '訂單數',
          position: 'left',
          min: 1, // 最小值為 1
          // 不設置 max，讓它自動計算
          axisLine: { lineStyle: { color: axisColor.value } },
          splitLine: {
            show: true, // 顯示網格線
            lineStyle: { color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
          },
          axisLabel: {
            formatter: (value) => {
              // 訂單數只顯示整數，不顯示小數點
              return Math.floor(value).toString()
            },
            color: axisColor.value
          },
          nameTextStyle: { color: axisColor.value }
        },
        {
          type: 'value',
          name: '成交額',
          position: 'right',
          axisLine: { lineStyle: { color: axisColor.value } },
          splitLine: {
            show: false // 右軸不顯示網格線，避免重疊
          },
          axisLabel: { color: axisColor.value },
          nameTextStyle: { color: axisColor.value }
        }
      ],
      series: [
        { name: '訂單數', type: 'bar', data: [], itemStyle: { color: 'hsl(20, 80%, 65%)' }, yAxisIndex: 0 },
        { name: '成交額(TWD)', type: 'bar', data: [], itemStyle: { color: 'hsl(38, 90%, 55%)' }, yAxisIndex: 1 }
      ]
    }
  }
  
  // 計算日期範圍天數
  const startDate = new Date(orderRevenueStartDate.value)
  const endDate = new Date(orderRevenueEndDate.value)
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
  
  // 生成日期範圍
  const dateRange = generateDateRange(
    orderRevenueStartDate.value,
    orderRevenueEndDate.value
  )
  
  // 創建數據映射
  const dataMap = new Map()
  console.log('訂單與成交額圖表 - orderRevenueData.value:', orderRevenueData.value)
  console.log('訂單與成交額圖表 - orderRevenueData.value.length:', orderRevenueData.value.length)
  
  orderRevenueData.value.forEach(item => {
    console.log('訂單與成交額圖表 - 映射數據:', item)
    // 確保 date 格式一致（可能是 Date 對象或字符串）
    const dateKey = typeof item.date === 'string' ? item.date : item.date?.toString()
    if (dateKey) {
      dataMap.set(dateKey, item)
    }
  })
  
  console.log('訂單與成交額圖表 - dataMap:', Array.from(dataMap.entries()))
  console.log('訂單與成交額圖表 - dateRange:', dateRange)
  
  let xAxisLabels = []
  let orders = []
  let gmv = []
  
  // 根據天數決定顯示方式
  if (daysDiff <= 30) {
    // 30天以內：顯示日期
    xAxisLabels = dateRange
    orders = dateRange.map(date => {
      const item = dataMap.get(date)
      const value = item ? (item.orders || 0) : 0
      console.log(`訂單與成交額圖表 - 日期 ${date}: orders=${value}`)
      return value
    })
    gmv = dateRange.map(date => {
      const item = dataMap.get(date)
      const value = item ? (Number(item.gmv) || 0) : 0
      console.log(`訂單與成交額圖表 - 日期 ${date}: gmv=${value}`)
      return value
    })
    
    console.log('訂單與成交額圖表 - orders 數組:', orders)
    console.log('訂單與成交額圖表 - gmv 數組:', gmv)
  } else if (daysDiff <= 90) {
    // 31-90天：按週聚合
    const weekData = new Map()
    
    dateRange.forEach(date => {
      const weekNum = getWeekNumber(date, orderRevenueStartDate.value)
      const weekKey = `Week ${weekNum}`
      
      if (!weekData.has(weekKey)) {
        weekData.set(weekKey, { orders: 0, gmv: 0 })
      }
      
      const item = dataMap.get(date)
      if (item) {
        weekData.get(weekKey).orders += (item.orders || 0)
        weekData.get(weekKey).gmv += (Number(item.gmv) || 0)
      }
    })
    
    // 按週數排序
    const sortedWeeks = Array.from(weekData.keys()).sort((a, b) => {
      const numA = parseInt(a.replace('Week ', ''))
      const numB = parseInt(b.replace('Week ', ''))
      return numA - numB
    })
    
    xAxisLabels = sortedWeeks
    orders = sortedWeeks.map(week => weekData.get(week).orders)
    gmv = sortedWeeks.map(week => weekData.get(week).gmv)
  } else {
    // 90天以上：按月聚合
    const monthData = new Map()
    
    // 檢查是否跨年
    const startYear = new Date(orderRevenueStartDate.value).getFullYear()
    const endYear = new Date(orderRevenueEndDate.value).getFullYear()
    const crossYear = startYear !== endYear
    
    dateRange.forEach(date => {
      const monthKey = date.substring(0, 7) // YYYY-MM
      const monthDisplay = getMonthDisplay(date, crossYear)
      
      if (!monthData.has(monthKey)) {
        monthData.set(monthKey, { display: monthDisplay, orders: 0, gmv: 0 })
      }
      
      const item = dataMap.get(date)
      if (item) {
        monthData.get(monthKey).orders += (item.orders || 0)
        monthData.get(monthKey).gmv += (Number(item.gmv) || 0)
      }
    })
    
    // 按月份排序
    const sortedMonths = Array.from(monthData.keys()).sort()
    
    xAxisLabels = sortedMonths.map(monthKey => monthData.get(monthKey).display)
    orders = sortedMonths.map(monthKey => monthData.get(monthKey).orders)
    gmv = sortedMonths.map(monthKey => monthData.get(monthKey).gmv)
  }
  
  // 如果X軸標籤超過7個，使用均分顯示
  let xAxisInterval = 0
  if (xAxisLabels.length > 7) {
    xAxisInterval = Math.ceil(xAxisLabels.length / 7) - 1
  }
  
  // 計算訂單數的最大值，用於設置 Y 軸範圍
  const maxOrders = Math.max(...orders, 0)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach(param => {
          if (param.seriesName === '成交額(TWD)') {
            result += `${param.marker}${param.seriesName}: $${Number(param.value).toLocaleString()}<br/>`
          } else {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['訂單數', '成交額(TWD)'],
      bottom: 0,
      textStyle: { color: legendTextColor.value }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisLabels,
      axisLine: { lineStyle: { color: axisColor.value } },
      axisLabel: {
        rotate: 0,
        interval: xAxisInterval > 0 ? xAxisInterval : 0,
        color: axisColor.value
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '訂單數',
        position: 'left',
        axisLine: { lineStyle: { color: axisColor.value } },
        min: 0, // 最小值為 0
        // 不設置 max，讓它自動計算
        splitLine: {
          show: true, // 顯示網格線
          lineStyle: { color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
        },
        axisLabel: {
          formatter: (value) => {
            // 訂單數只顯示整數，不顯示小數點（0, 1, 2, 3, 4, 5, 6...）
            const intValue = Math.floor(value)
            return intValue >= 0 ? intValue.toString() : ''
          },
          color: axisColor.value
        },
        nameTextStyle: { color: axisColor.value }
      },
      {
        type: 'value',
        name: '成交額',
        position: 'right',
        axisLine: { lineStyle: { color: axisColor.value } },
        splitLine: {
          show: false // 右軸不顯示網格線，避免重疊
        },
        axisLabel: { color: axisColor.value },
        nameTextStyle: { color: axisColor.value }
      }
    ],
    series: [
      {
        name: '訂單數',
        type: 'bar',
        data: orders,
        itemStyle: { color: 'hsl(20, 80%, 65%)' },
        yAxisIndex: 0
      },
      {
        name: '成交額(TWD)',
        type: 'bar',
        data: gmv,
        itemStyle: { color: 'hsl(38, 90%, 55%)' },
        yAxisIndex: 1
      }
    ]
  }
})

</script>

