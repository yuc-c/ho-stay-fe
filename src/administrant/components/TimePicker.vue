<template>
  <div class="relative" ref="pickerRef">
    <!-- 顯示選中的時間 -->
    <div
      @click="togglePicker"
      class="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground cursor-pointer flex items-center justify-between"
      :class="{ 'border-primary ring-2 ring-primary': showPicker }"
    >
      <span :class="{ 'text-muted-foreground': !displayTime }">
        {{ displayTime || placeholder || '請選擇時間' }}
      </span>
      <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 時間選擇器彈出層 -->
    <div
      v-if="showPicker"
      class="absolute z-50 mt-1 bg-card border border-border rounded-lg shadow-lg p-4"
      style="width: 280px;"
      @click.stop
    >
      <div class="flex gap-4">
        <!-- 小時滾動列表 -->
        <div class="flex-1">
          <div class="text-xs text-muted-foreground mb-2 text-center">時</div>
          <div
            class="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            @scroll="handleHourScroll"
            ref="hourScrollRef"
          >
            <div
              v-for="h in hours"
              :key="h"
              :ref="el => { if (el) hourRefs[h] = el }"
              class="px-3 py-2 text-center cursor-pointer transition-colors"
              :class="{
                'bg-primary text-primary-foreground font-semibold': selectedHour === h,
                'hover:bg-muted': selectedHour !== h
              }"
              @click="selectHour(h)"
            >
              {{ String(h).padStart(2, '0') }}
            </div>
          </div>
        </div>

        <!-- 分鐘滾動列表 -->
        <div class="flex-1">
          <div class="text-xs text-muted-foreground mb-2 text-center">分</div>
          <div
            class="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            @scroll="handleMinuteScroll"
            ref="minuteScrollRef"
          >
            <div
              v-for="m in minutes"
              :key="m"
              :ref="el => { if (el) minuteRefs[m] = el }"
              class="px-3 py-2 text-center cursor-pointer transition-colors"
              :class="{
                'bg-primary text-primary-foreground font-semibold': selectedMinute === m,
                'hover:bg-muted': selectedMinute !== m
              }"
              @click="selectMinute(m)"
            >
              {{ String(m).padStart(2, '0') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 確認按鈕 -->
      <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
        <button
          @click="clearTime"
          class="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          v-if="!required"
        >
          清除
        </button>
        <button
          @click="confirmTime"
          class="px-4 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary-hover"
        >
          確認
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const hourScrollRef = ref(null)
const minuteScrollRef = ref(null)
const hourRefs = {}
const minuteRefs = {}

// 小時選項：00-23
const hours = Array.from({ length: 24 }, (_, i) => i)

// 分鐘選項：00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

// 當前選中的小時和分鐘
const selectedHour = ref(0)
const selectedMinute = ref(0)

// 顯示的時間格式
const displayTime = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue
})

// 切換選擇器顯示
const togglePicker = () => {
  showPicker.value = !showPicker.value
  if (showPicker.value) {
    // 解析當前值
    if (props.modelValue) {
      const [hour, minute] = props.modelValue.split(':')
      selectedHour.value = parseInt(hour) || 0
      selectedMinute.value = parseInt(minute) || 0
    }
    nextTick(() => {
      scrollToSelected()
    })
  }
}

// 選擇小時
const selectHour = (hour) => {
  selectedHour.value = hour
  scrollToHour(hour)
}

// 選擇分鐘
const selectMinute = (minute) => {
  selectedMinute.value = minute
  scrollToMinute(minute)
}

// 滾動到選中的小時
const scrollToHour = (hour) => {
  if (hourRefs[hour] && hourScrollRef.value) {
    const element = hourRefs[hour]
    const container = hourScrollRef.value
    const elementTop = element.offsetTop
    const containerHeight = container.clientHeight
    const scrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2
    container.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }
}

// 滾動到選中的分鐘
const scrollToMinute = (minute) => {
  if (minuteRefs[minute] && minuteScrollRef.value) {
    const element = minuteRefs[minute]
    const container = minuteScrollRef.value
    const elementTop = element.offsetTop
    const containerHeight = container.clientHeight
    const scrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2
    container.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }
}

// 處理小時滾動
const handleHourScroll = () => {
  if (!hourScrollRef.value) return
  const container = hourScrollRef.value
  const scrollTop = container.scrollTop
  const containerHeight = container.clientHeight
  const centerY = scrollTop + containerHeight / 2

  // 找到最接近中心的小時
  let closestHour = 0
  let minDistance = Infinity

  hours.forEach(hour => {
    if (hourRefs[hour]) {
      const element = hourRefs[hour]
      const elementTop = element.offsetTop
      const elementCenter = elementTop + element.clientHeight / 2
      const distance = Math.abs(elementCenter - centerY)
      if (distance < minDistance) {
        minDistance = distance
        closestHour = hour
      }
    }
  })

  selectedHour.value = closestHour
}

// 處理分鐘滾動
const handleMinuteScroll = () => {
  if (!minuteScrollRef.value) return
  const container = minuteScrollRef.value
  const scrollTop = container.scrollTop
  const containerHeight = container.clientHeight
  const centerY = scrollTop + containerHeight / 2

  // 找到最接近中心的分鐘
  let closestMinute = 0
  let minDistance = Infinity

  minutes.forEach(minute => {
    if (minuteRefs[minute]) {
      const element = minuteRefs[minute]
      const elementTop = element.offsetTop
      const elementCenter = elementTop + element.clientHeight / 2
      const distance = Math.abs(elementCenter - centerY)
      if (distance < minDistance) {
        minDistance = distance
        closestMinute = minute
      }
    }
  })

  selectedMinute.value = closestMinute
}

// 滾動到選中的值
const scrollToSelected = () => {
  scrollToHour(selectedHour.value)
  scrollToMinute(selectedMinute.value)
}

// 確認選擇
const confirmTime = () => {
  const time = `${String(selectedHour.value).padStart(2, '0')}:${String(selectedMinute.value).padStart(2, '0')}`
  emit('update:modelValue', time)
  showPicker.value = false
}

// 清除時間
const clearTime = () => {
  emit('update:modelValue', '')
  showPicker.value = false
}

// 點擊外部關閉
const pickerRef = ref(null)

const handleClickOutside = (event) => {
  if (showPicker.value && pickerRef.value && !pickerRef.value.contains(event.target)) {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 初始化時解析當前值
  if (props.modelValue) {
    const [hour, minute] = props.modelValue.split(':')
    selectedHour.value = parseInt(hour) || 0
    selectedMinute.value = parseInt(minute) || 0
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 監聽外部值變化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const [hour, minute] = newValue.split(':')
    selectedHour.value = parseInt(hour) || 0
    selectedMinute.value = parseInt(minute) || 0
  } else {
    selectedHour.value = 0
    selectedMinute.value = 0
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

