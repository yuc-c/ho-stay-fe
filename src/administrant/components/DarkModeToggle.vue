<template>
  <button
    @click="toggleDarkMode"
    class="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover transition-all duration-200 hover:scale-110 flex items-center gap-2"
    :aria-label="isDark ? '切換到淺色模式' : '切換到深色模式'"
  >
    <component :is="isDark ? SunIcon : MoonIcon" class="w-5 h-5" />
    <span class="text-sm font-medium whitespace-nowrap">
      {{ isDark ? '切換淺色模式' : '切換深色模式' }}
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { SunIcon, MoonIcon } from './icons'

const isDark = ref(false)
let themeObserver = null

const checkTheme = () => {
  const html = document.documentElement
  const hoApp = document.querySelector('.ho-app')
  const theme = html.getAttribute('data-theme') || (hoApp?.getAttribute('data-theme'))
  isDark.value = theme === 'dark'
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  const html = document.documentElement
  const hoApp = document.querySelector('.ho-app')
  
  if (isDark.value) {
    html.setAttribute('data-theme', 'dark')
    if (hoApp) {
      hoApp.setAttribute('data-theme', 'dark')
    }
    localStorage.setItem('theme', 'dark')
  } else {
    html.removeAttribute('data-theme')
    if (hoApp) {
      hoApp.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // 從 localStorage 讀取保存的主題偏好
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
  } else {
    // 預設為明亮模式
    isDark.value = false
  }
  // 立即應用主題
  updateTheme()
  
  // 監聽主題變化
  themeObserver = new MutationObserver(checkTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
  }
})
</script>

