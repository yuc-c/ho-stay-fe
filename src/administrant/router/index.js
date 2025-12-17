import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/administrant.html'),
  routes: [
    {
      path: '/login',
      beforeEnter: (to, from, next) => {
        // 重定向到 user.html 的登入頁面
        window.location.href = '/user.html/user/login'
      }
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/administrant/views/Home.vue'),
      meta: { title: '首頁', requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/administrant/views/Dashboard.vue'),
      meta: { title: '營運分析', requiresAuth: true }
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: () => import('@/administrant/views/ReviewModeration.vue'),
      meta: { title: '評論違規處理', requiresAuth: true }
    },
    {
      path: '/coupons',
      name: 'coupons',
      component: () => import('@/administrant/views/Coupons.vue'),
      meta: { title: '優惠券', requiresAuth: true }
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: () => import('@/administrant/views/AuditLogs.vue'),
      meta: { title: '系統操作紀錄', requiresAuth: true }
    },
    //使用者列表
    {
      name: "userlist",
      path: "/userlist",
      component: () => import('@/administrant/views/UserList.vue'),
      meta: { title: '使用者列表' }
    }
  ]
})

// 路由守衛：檢查是否需要登入
router.beforeEach((to, from, next) => {
  // 檢查 adminToken
  const adminToken = localStorage.getItem('adminToken')

  // 檢查 user.html 的 token（可能存儲在多個地方）
  let userToken = localStorage.getItem('token') || sessionStorage.getItem('token')

  // 如果沒有找到，嘗試從 pinia persist 中讀取（pinia-user store）
  if (!userToken) {
    try {
      const piniaUserData = sessionStorage.getItem('pinia-user')
      if (piniaUserData) {
        const parsed = JSON.parse(piniaUserData)
        userToken = parsed?.token || parsed?.state?.token || ''
      }
    } catch (e) {
      // 忽略解析錯誤
    }
  }

  const token = adminToken || userToken

  // 如果檢測到 userToken 但沒有 adminToken，自動同步（方便後續使用）
  if (userToken && !adminToken) {
    localStorage.setItem('adminToken', userToken)

    // 同步用戶信息
    try {
      const piniaUserData = sessionStorage.getItem('pinia-user')
      if (piniaUserData) {
        const parsed = JSON.parse(piniaUserData)
        const userName = parsed?.userName || parsed?.state?.userName || ''
        if (userName && !localStorage.getItem('adminUserName')) {
          localStorage.setItem('adminUserName', userName)
        }
      }
    } catch (e) {
      // 忽略解析錯誤
    }
  }

  // 如果前往登入頁面且已經有 token，重定向到 dashboard
  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  // 如果需要認證但沒有 token，重定向到 user.html 的登入頁面
  if (to.meta.requiresAuth && !token) {
    window.location.href = '/user.html/user/login'
    return
  }

  next()
})

export default router
