<template>
  <div class="relative" ref="pickerRef">
    <!-- 顯示選中的日期時間 -->
    <div
      @click="togglePicker"
      class="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground cursor-pointer flex items-center justify-between"
      :class="{ 'border-primary ring-2 ring-primary': showPicker }"
    >
      <span :class="{ 'text-muted-foreground': !displayDateTime }">
        {{ displayDateTime || placeholder || '請選擇日期時間' }}
      </span>
      <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 日期時間選擇器彈出層 -->
    <Teleport to="body">
      <div
        v-if="showPicker"
        ref="pickerPopupRef"
        :data-picker-id="pickerId"
        class="fixed z-[100] border border-border rounded-xl shadow-2xl p-4 datetime-picker-popup"
        :style="{ ...pickerStyle, backgroundColor: 'var(--color-card)', background: 'var(--color-card)' }"
        @click.stop
      >
      <!-- 上半部分：日曆 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <button
            @click="previousMonth"
            class="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 hover:bg-muted datetime-picker-nav-btn"
            title="上一個月"
          >
            <svg class="w-5 h-5 text-foreground datetime-picker-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <select
              v-model.number="currentYear"
              @change="updateCalendar"
              class="px-3 py-1.5 border-2 border-input rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all datetime-picker-year-select"
            >
              <option v-for="year in years" :key="year" :value="year">{{ year }}年</option>
            </select>
            <select
              v-model.number="currentMonth"
              @change="updateCalendar"
              class="px-3 py-1.5 border-2 border-input rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all datetime-picker-month-select"
            >
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
          <button
            @click="nextMonth"
            class="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 hover:bg-muted datetime-picker-nav-btn"
            title="下一個月"
          >
            <svg class="w-5 h-5 text-foreground datetime-picker-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- 星期標題 -->
        <div class="grid grid-cols-7 gap-1.5 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-xs font-semibold text-foreground py-1.5 datetime-picker-weekday"
          >
            {{ day }}
          </div>
        </div>

        <!-- 日期網格 -->
        <div class="grid grid-cols-7 gap-1.5">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            @click="selectDate(date)"
            class="text-center py-2 rounded-lg transition-all text-sm font-medium datetime-picker-date"
            :class="{
              'text-muted-foreground': !date.isCurrentMonth || isDateDisabled(date),
              'bg-primary text-primary-foreground font-semibold shadow-md scale-105 datetime-picker-selected': date.isSelected,
              'hover:bg-muted cursor-pointer hover:scale-105 active:scale-95': !date.isSelected && date.isCurrentMonth && !isDateDisabled(date),
              'bg-muted/50 font-semibold': date.isToday && !date.isSelected,
              'cursor-not-allowed opacity-50': isDateDisabled(date)
            }"
          >
            {{ date.day }}
          </div>
        </div>
      </div>

      <!-- 分隔線 -->
      <div class="border-t border-border my-4"></div>

      <!-- 下半部分：時間選擇器 -->
      <div class="space-y-3">
        <div class="text-sm font-semibold text-foreground datetime-picker-time-label">選擇時間</div>
        <div class="flex gap-3">
          <!-- 小時選擇 -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-foreground mb-2 datetime-picker-time-input-label">時</label>
            <select
              v-model.number="selectedHour"
              @change="updateDateTime"
              class="w-full px-3 py-2 border-2 border-input rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm hover:shadow-md datetime-picker-hour-select datetime-picker-time-select"
            >
              <option v-for="h in hours" :key="h" :value="h">
                {{ String(h).padStart(2, '0') }}
              </option>
            </select>
          </div>

          <!-- 分鐘選擇 -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-foreground mb-2 datetime-picker-time-input-label">分</label>
            <select
              v-model.number="selectedMinute"
              @change="updateDateTime"
              class="w-full px-3 py-2 border-2 border-input rounded-lg bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm hover:shadow-md datetime-picker-minute-select datetime-picker-time-select"
            >
              <option v-for="m in minutes" :key="m" :value="m">
                {{ String(m).padStart(2, '0') }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
        <button
          @click="clearDateTime"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all hover:bg-muted"
          v-if="!required"
        >
          清除
        </button>
        <button
          @click="closePicker"
          class="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl active:shadow-md datetime-picker-close-btn"
        >
          關閉
        </button>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted, inject, provide } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  min: {
    type: String,
    default: ''
  },
  pickerId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 使用 provide/inject 來管理多個選擇器的打開狀態
const pickerManager = inject('pickerManager', null)
const pickerId = props.pickerId || `picker-${Math.random().toString(36).substr(2, 9)}`

const showPicker = ref(false)
const pickerRef = ref(null)
const pickerPopupRef = ref(null)
const pickerStyle = ref({})

// 計算選擇器位置
const calculatePosition = () => {
  if (!pickerRef.value || !showPicker.value) return
  
  nextTick(() => {
    const rect = pickerRef.value.getBoundingClientRect()
    const pickerWidth = 340
    const pickerHeight = 500 // 估算高度
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let left = rect.left
    let top = rect.bottom + 4 // 4px 間距
    
    // 如果右側超出視窗，調整到左側
    if (left + pickerWidth > viewportWidth - 16) {
      left = viewportWidth - pickerWidth - 16
    }
    
    // 如果左側超出視窗，調整到右側
    if (left < 16) {
      left = 16
    }
    
    // 如果下方空間不足，顯示在上方
    if (top + pickerHeight > viewportHeight - 16) {
      top = rect.top - pickerHeight - 4
      // 如果上方也不夠，則限制高度並允許滾動
      if (top < 16) {
        top = 16
      }
    }
    
    pickerStyle.value = {
      width: `${pickerWidth}px`,
      maxWidth: `calc(100vw - 2rem)`,
      maxHeight: `calc(100vh - ${top + 16}px)`,
      left: `${left}px`,
      top: `${top}px`,
      overflowY: 'auto',
      backgroundColor: 'var(--color-card)'
    }
  })
}

// 星期標題
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 當前顯示的年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 選中的日期
const selectedDate = ref(null)
const selectedHour = ref(0)
const selectedMinute = ref(0)

// 小時選項：00-23
const hours = Array.from({ length: 24 }, (_, i) => i)

// 分鐘選項：00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

// 年份選項（當前年份前後各10年）
const years = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 21 }, (_, i) => current - 10 + i)
})

// 日曆天數
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  // 上個月的日期
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
      date: new Date(currentYear.value, currentMonth.value - 2, prevMonthLastDay - i)
    })
  }

  // 當月的日期
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, i)
    const isSelected = selectedDate.value && 
      date.getFullYear() === selectedDate.value.getFullYear() &&
      date.getMonth() === selectedDate.value.getMonth() &&
      date.getDate() === selectedDate.value.getDate()
    const isToday = date.toDateString() === today.toDateString()
    
    days.push({
      day: i,
      isCurrentMonth: true,
      isSelected,
      isToday,
      date
    })
  }

  // 下個月的日期（填滿42個格子）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
      date: new Date(currentYear.value, currentMonth.value, i)
    })
  }

  return days
})

// 顯示的日期時間格式
const displayDateTime = computed(() => {
  if (!props.modelValue) return ''
  // 解析 ISO 格式：2025-11-17T03:50:00
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}`
})

// 切換選擇器顯示
const togglePicker = () => {
  const willShow = !showPicker.value
  
  if (willShow) {
    // 關閉其他選擇器
    if (pickerManager) {
      pickerManager.closeAll(pickerId)
    }
    
    showPicker.value = true
    
    // 解析當前值
    if (props.modelValue) {
      const date = new Date(props.modelValue)
      if (!isNaN(date.getTime())) {
        selectedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        currentYear.value = date.getFullYear()
        currentMonth.value = date.getMonth() + 1
        selectedHour.value = date.getHours()
        selectedMinute.value = Math.floor(date.getMinutes() / 5) * 5
      }
    } else {
      const today = new Date()
      selectedDate.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      currentYear.value = today.getFullYear()
      currentMonth.value = today.getMonth() + 1
    }
    // 計算位置
    calculatePosition()
  } else {
    showPicker.value = false
  }
}

// 關閉選擇器（供外部調用）
const closePicker = () => {
  showPicker.value = false
}

// 暴露關閉方法供管理器調用
defineExpose({
  closePicker,
  pickerId
})

// 更新日曆
const updateCalendar = () => {
  // 日曆會自動更新
}

// 上一個月
const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下一個月
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 選擇日期
const selectDate = (dateInfo) => {
  if (dateInfo.isCurrentMonth) {
    const selected = new Date(dateInfo.date)
    // 檢查最小日期限制
    if (props.min) {
      const minDate = new Date(props.min)
      if (selected < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
        return // 不能選擇早於最小日期的日期
      }
    }
    selectedDate.value = selected
    // 自動更新值
    updateDateTime()
  } else {
    // 點擊非當月日期，切換月份
    if (dateInfo.date < new Date(currentYear.value, currentMonth.value - 1, 1)) {
      previousMonth()
    } else {
      nextMonth()
    }
    nextTick(() => {
      const selected = new Date(dateInfo.date)
      // 檢查最小日期限制
      if (props.min) {
        const minDate = new Date(props.min)
        if (selected >= new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
          selectedDate.value = selected
          // 自動更新值
          updateDateTime()
        }
      } else {
        selectedDate.value = selected
        // 自動更新值
        updateDateTime()
      }
    })
  }
}


// 檢查日期是否被禁用
const isDateDisabled = (dateInfo) => {
  if (!props.min || !dateInfo.isCurrentMonth) return false
  const minDate = new Date(props.min)
  const checkDate = new Date(dateInfo.date)
  return checkDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
}

// 更新日期時間（自動確認）
const updateDateTime = () => {
  if (!selectedDate.value) {
    // 如果沒有選擇日期，使用今天
    selectedDate.value = new Date()
  }
  
  const date = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth(),
    selectedDate.value.getDate(),
    selectedHour.value,
    selectedMinute.value
  )
  
  // 檢查最小日期時間限制
  if (props.min) {
    const minDate = new Date(props.min)
    if (date < minDate) {
      // 如果選擇的時間早於最小時間，使用最小時間
      emit('update:modelValue', minDate.toISOString())
    } else {
      emit('update:modelValue', date.toISOString())
    }
  } else {
    emit('update:modelValue', date.toISOString())
  }
}

// 確認選擇（保留用於關閉選擇器）
const confirmDateTime = () => {
  updateDateTime()
  closePicker()
}

// 清除日期時間
const clearDateTime = () => {
  emit('update:modelValue', '')
  closePicker()
}

// 點擊外部關閉
const handleClickOutside = (event) => {
  if (!showPicker.value) return
  
  const target = event.target
  
  // 檢查點擊是否在輸入框內
  const isClickInsideInput = pickerRef.value && pickerRef.value.contains(target)
  
  // 檢查點擊是否在選擇器彈出層內
  let isClickInsidePopup = false
  
  // 方法1: 通過 ref 檢查
  if (pickerPopupRef.value) {
    isClickInsidePopup = pickerPopupRef.value.contains(target)
  }
  
  // 方法2: 通過 data-picker-id 查找（備用方案）
  if (!isClickInsidePopup) {
    const popup = document.querySelector(`[data-picker-id="${pickerId}"]`)
    if (popup && popup.contains(target)) {
      isClickInsidePopup = true
    }
  }
  
  // 方法3: 檢查所有 datetime-picker-popup 元素（最後備用）
  if (!isClickInsidePopup) {
    const allPopups = document.querySelectorAll('.datetime-picker-popup')
    for (const popup of allPopups) {
      if (popup.contains(target)) {
        isClickInsidePopup = true
        break
      }
    }
  }
  
  // 只有在真正點擊外部時才關閉（不在輸入框、不在彈出層）
  // 點擊表單內其他空白位置也會關閉選擇器
  if (!isClickInsideInput && !isClickInsidePopup) {
    // 點擊外部時，先確認選擇再關閉
    updateDateTime()
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
  
  // 註冊到管理器
  if (pickerManager) {
    pickerManager.register(pickerId, { closePicker, pickerId })
  }
  
  // 初始化時解析當前值
  if (props.modelValue) {
    const date = new Date(props.modelValue)
    if (!isNaN(date.getTime())) {
      selectedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth() + 1
      selectedHour.value = date.getHours()
      selectedMinute.value = Math.floor(date.getMinutes() / 5) * 5
    }
  } else {
    const today = new Date()
    selectedDate.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth() + 1
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
  
  // 從管理器取消註冊
  if (pickerManager) {
    pickerManager.unregister(pickerId)
  }
})

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    if (!isNaN(date.getTime())) {
      selectedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth() + 1
      selectedHour.value = date.getHours()
      selectedMinute.value = Math.floor(date.getMinutes() / 5) * 5
    }
  }
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(209, 213, 219);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(156, 163, 175);
}
</style>

<style>
/* 確保日期選擇器彈窗背景不透明（使用全局樣式，因為彈窗通過 Teleport 傳送到 body） */
.datetime-picker-popup {
  background-color: var(--color-card) !important;
  background: var(--color-card) !important;
  opacity: 1 !important;
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

/* 淺色模式 */
.datetime-picker-popup {
  background-color: hsl(0 0% 100%) !important;
  background: hsl(0 0% 100%) !important;
}

/* 深色模式 */
[data-theme="dark"] .datetime-picker-popup {
  background-color: hsl(0 0% 10%) !important;
  background: hsl(0 0% 10%) !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3) !important;
}

/* 深色模式下選中日期的顏色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-selected {
  background-color: hsl(174 58% 48%) !important;
  background: hsl(174 58% 48%) !important;
  color: hsl(0 0% 100%) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
}

/* 深色模式下今天日期的顏色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-date.bg-muted\/50 {
  background-color: hsl(0 0% 20% / 0.5) !important;
  color: hsl(0 0% 100%) !important;
}

/* 深色模式下 hover 狀態 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-date:hover:not(.datetime-picker-selected) {
  background-color: hsl(0 0% 20%) !important;
}

/* 深色模式下所有日期數字顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-date {
  color: hsl(0 0% 100%) !important;
}

/* 深色模式下非當月日期和禁用日期也顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-date.text-muted-foreground {
  color: hsl(0 0% 100%) !important;
  opacity: 0.6 !important;
}

/* 深色模式下星期標題顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-weekday {
  color: hsl(0 0% 100%) !important;
}

/* 深色模式下時間選擇標籤顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-time-label,
[data-theme="dark"] .datetime-picker-popup .datetime-picker-time-input-label {
  color: hsl(0 0% 100%) !important;
}

/* 深色模式下年月選擇器文字顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-year-select,
[data-theme="dark"] .datetime-picker-popup .datetime-picker-month-select {
  color: hsl(0 0% 100%) !important;
}

[data-theme="dark"] .datetime-picker-popup .datetime-picker-year-select option,
[data-theme="dark"] .datetime-picker-popup .datetime-picker-month-select option {
  color: hsl(0 0% 100%) !important;
  background-color: hsl(0 0% 10%) !important;
}

/* 深色模式下時間選擇器數字顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-time-select {
  color: hsl(0 0% 100%) !important;
}

[data-theme="dark"] .datetime-picker-popup .datetime-picker-time-select option {
  color: hsl(0 0% 100%) !important;
  background-color: hsl(0 0% 10%) !important;
}

/* 深色模式下關閉按鈕文字顯示為白色並增加陰影突出 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-close-btn {
  color: hsl(0 0% 100%) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4) !important;
}

[data-theme="dark"] .datetime-picker-popup .datetime-picker-close-btn:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5) !important;
}

[data-theme="dark"] .datetime-picker-popup .datetime-picker-close-btn:active {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3) !important;
}

/* 深色模式下左右箭頭圖標顯示為白色 */
[data-theme="dark"] .datetime-picker-popup .datetime-picker-nav-icon {
  color: hsl(0 0% 100%) !important;
}
</style>

