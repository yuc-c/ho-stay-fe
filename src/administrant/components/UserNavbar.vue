<template>
  <nav class="user-navbar">
    <div class="navbar-inner">
      <RouterLink class="brand" to="/home">🏠 好好住 HoHoStay</RouterLink>

      <div class="nav-actions">
        <RouterLink v-if="!token" class="nav-btn outline" to="/login">登入</RouterLink>
        <button v-else class="nav-btn solid" @click="logout">登出</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('adminToken') || '')

const syncAuth = () => {
  token.value = localStorage.getItem('adminToken') || ''
}

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUserName')
  localStorage.removeItem('adminRole')
  localStorage.removeItem('adminFirstName')
  localStorage.removeItem('adminLastName')
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/login')
}

onMounted(() => {
  syncAuth()
  window.addEventListener('storage', syncAuth)
  window.addEventListener('auth-changed', syncAuth)
})

onUnmounted(() => {
  window.removeEventListener('storage', syncAuth)
  window.removeEventListener('auth-changed', syncAuth)
})
</script>

<style scoped>
.user-navbar {
  background: #0f4d46;
  color: #fff;
  padding: 0.75rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-btn {
  border-radius: 999px;
  padding: 0.4rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.nav-btn.outline {
  border-color: #fff;
  background: transparent;
  color: #fff;
}

.nav-btn.outline:hover {
  background: rgba(255, 255, 255, 0.16);
}

.nav-btn.solid {
  background: #fff;
  color: #0f4d46;
}

.nav-btn.solid:hover {
  background: #d7f5eb;
}
</style>

