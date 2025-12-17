<template>
    <div class="layout-wrapper">

        <!-- RWD 漢堡按鈕（Top） -->
        <button class="sidebar-toggle-btn" @click="toggleSidebar">
            <i class="bi bi-list"></i>
        </button>

        <!-- Sidebar -->
        <AdminSidebar :open="isSidebarOpen" @close="closeSidebar" />

        <!-- 手機版遮罩 -->
        <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

        <!-- 主內容 -->
        <main class="main-content">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '@/admin/views/Sidebar/AdminSideBar.vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
    isSidebarOpen.value = false
}
</script>

<style scoped>
.layout-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.sidebar-container {
    width: 240px;
    flex-shrink: 0;
}

.main-content {
    flex: 1;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 2rem;
}

/* 漢堡按鈕 */
.sidebar-toggle-btn {
    position: fixed;
    left: 16px;
    top: 12px;
    z-index: 2001;
    font-size: 20px;
    background: white;
    border: 1px solid #E2E8F0;
    padding: 6px 10px;
    display: none;
}

/* 手機版顯示漢堡 */
@media (max-width: 768px) {
    .sidebar-toggle-btn {
        display: block;
    }
}
</style>
