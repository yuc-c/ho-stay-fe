<template>
  <div class="bg-card rounded-lg border border-border p-6 shadow-md hover:shadow-lg transition-shadow relative">
    <!-- Icon - 固定在右上角，不受內容影響 -->
    <div 
      class="absolute top-4 right-4 p-3 rounded-lg"
      :style="{ backgroundColor: `hsl(var(--${iconColor}-light, var(--primary-light)))` }"
    >
      <component :is="icon" :class="`text-${iconColor}`" class="w-6 h-6" />
    </div>
    
    <div class="flex-1 pr-16">
      <!-- 副標題 -->
      <p class="text-sm text-muted-foreground mb-3">{{ title }}</p>
      
      <!-- 主數字 -->
      <div class="mb-3">
        <h3 class="text-3xl font-bold text-foreground">{{ value }}</h3>
        <p v-if="unit" class="text-xs text-muted-foreground mt-1">{{ unit }}</p>
      </div>
      
      <!-- Diff 變化 -->
      <p 
        v-if="diff || trend"
        class="text-sm font-medium flex items-center gap-1"
        :class="trendClass"
      >
        <component v-if="trend || diff" :is="TrendingUpIcon" class="w-4 h-4" />
        {{ diff || trend }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUpIcon } from './icons'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: ''
  },
  diff: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  }
})

const trendClass = computed(() => {
  const trendText = props.diff || props.trend
  if (!trendText) return ''
  
  if (trendText.includes('+') || trendText.includes('較昨日') || trendText.includes('↑')) {
    return 'text-success'
  }
  
  if (trendText.includes('-') || trendText.includes('↓')) {
    return 'text-destructive'
  }
  
  return 'text-muted-foreground'
})
</script>

