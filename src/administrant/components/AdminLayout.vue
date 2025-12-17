<template>
  <div class="flex h-screen bg-background">
    <!-- 側邊欄 -->
    <aside class="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <!-- Logo/標題 & 登出 -->
      <div class="px-6 py-5 border-b border-sidebar-border space-y-3">
        <h1 class="text-xl font-bold text-sidebar-primary">平台管理者後台</h1>
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-sidebar-foreground font-medium truncate">
            Hi<span v-if="greetingName">, {{ greetingName }}</span>
          </p>
          <button
            @click="handleLogout"
            class="logout-btn flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:border-destructive hover:shadow-md"
          >
            <component :is="ArrowRightOnRectangleIcon" class="w-4 h-4" />
            <span class="text-sm font-semibold">登出</span>
          </button>
        </div>
      </div>

      <!-- 導航選單 -->
      <nav class="flex-1 py-6 px-3 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          :class="{ 'bg-sidebar-accent text-sidebar-accent-foreground': isActive(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </router-link>
        
        <!-- 分隔線 -->
        <div class="my-4 mx-4 border-t border-sidebar-border"></div>
        
        <!-- 返回首頁按鈕 - 特殊樣式 -->
        <a
          href="/user.html"
          class="home-link flex items-center gap-3 px-4 py-3 mx-2 mb-2 rounded-lg border-2 border-sidebar-primary/30 bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-all duration-200 hover:border-sidebar-primary hover:shadow-md"
        >
          <component :is="HomeIcon" class="w-5 h-5" />
          <span class="font-semibold">返回首頁</span>
        </a>
      </nav>
    </aside>

    <!-- 主要內容區域 -->
    <main class="flex-1 overflow-auto">
      <div class="py-8 px-[60px]">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UsersIcon //新增usersIcon
} from './icons'

const route = useRoute()
const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const userName = ref('')

const syncUserProfile = () => {
  // 優先從 admin 相關的 localStorage 讀取
  firstName.value = localStorage.getItem('adminFirstName') || ''
  lastName.value = localStorage.getItem('adminLastName') || ''
  userName.value = localStorage.getItem('adminUserName') || ''
  
  // 如果沒有 admin 相關的數據，嘗試從 user.html 的存儲中讀取
  if (!userName.value) {
    // 從 Pinia persist 中讀取
    try {
      const piniaUserData = sessionStorage.getItem('pinia-user')
      if (piniaUserData) {
        const parsed = JSON.parse(piniaUserData)
        // 嘗試多種可能的數據結構
        userName.value = parsed?.userName || 
                        parsed?.state?.userName || 
                        (parsed?.$state && parsed.$state.userName) ||
                        ''
      }
    } catch (e) {
      // 忽略解析錯誤
    }
    
    // 如果還是沒有，嘗試從 localStorage 的 token 相關數據讀取
    if (!userName.value) {
      // 檢查是否有其他存儲的用戶名
      const storedUserName = localStorage.getItem('userName')
      if (storedUserName) {
        userName.value = storedUserName
      }
    }
  }
}

onMounted(() => {
  syncUserProfile()
  window.addEventListener('storage', syncUserProfile)
  window.addEventListener('auth-changed', syncUserProfile)
})

onUnmounted(() => {
  window.removeEventListener('storage', syncUserProfile)
  window.removeEventListener('auth-changed', syncUserProfile)
})

//新增使用者管理
const menuItems = [
  {
    path: '/dashboard',
    label: '營運分析',
    icon: ChartBarIcon
  },
  {
    path: '/reviews',
    label: '評論違規處理',
    icon: ChatBubbleLeftRightIcon
  },
  {
    path: '/coupons',
    label: '優惠券',
    icon: TicketIcon
  },
  {
    path: '/audit-logs',
    label: '系統操作紀錄',
    icon: DocumentTextIcon
  },
  {
    path:'/userList',
    label: '使用者管理',
    icon: UsersIcon
  }
]

const isActive = (path) => {
  return route.path === path
}

const handleLogout = () => {
  // 清除所有本地儲存的登入資訊
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUserName')
  localStorage.removeItem('adminRole')
  localStorage.removeItem('adminFirstName')
  localStorage.removeItem('adminLastName')
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  
  // 清除 sessionStorage
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('adminToken')
  sessionStorage.removeItem('pinia-user')
  
  syncUserProfile()
  window.dispatchEvent(new Event('auth-changed'))
  
  // 導航到 user.html 的登入頁面
  window.location.href = '/user.html/user/login'
}

const greetingName = computed(() => {
  const fullName = `${firstName.value} ${lastName.value}`.trim()
  if (fullName) {
    return fullName
  }
  return userName.value || ''
})
</script>

<style scoped>
.home-link {
  position: relative;
}

.home-link:hover {
  transform: translateX(2px);
}

.logout-btn {
  position: relative;
}

.logout-btn:hover {
  transform: scale(1.05);
}
</style>
