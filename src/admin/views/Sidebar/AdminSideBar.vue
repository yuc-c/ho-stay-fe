<template>
    <aside :class="['sidebar-container', { 'open': open }]">
        <div class="sidebar bg-light border-end vh-100 p-3 d-flex flex-column">
            <h5 class="fw-bold mb-4 sidebartitle">支援中心</h5>


            <!-- 客服案件管理 -->
            <li class="nav-item mb-2">
                <div class="sidebar-section-title" @click="toggle('support')">
                    客服案件管理
                    <i class="bi" :class="isOpen.support ? 'bi-chevron-up' : 'bi-chevron-down'"
                        style="font-size: 0.8rem;"></i>
                </div>
            </li>

            <ul v-show="isOpen.support" class="nav flex-column ms-3">
                <li class="nav-item mb-2">
                    <RouterLink to="/admin/supportList" class="nav-link text-dark" @click="closeSidebar">
                        客服案件紀錄
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/supportCategory" class="nav-link text-dark" @click="closeSidebar">
                        客服類別維護
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/reasonmanage" class="nav-link text-dark" @click="closeSidebar">
                        結案代碼維護
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/report/export" class="nav-link text-dark" @click="closeSidebar">
                        案件紀錄匯出
                    </RouterLink>
                </li>
            </ul>

            <!-- 常見問題管理 -->
            <li class="nav-item mb-2 mt-3">
                <div class="sidebar-section-title" @click="toggle('faq')">
                    常見問題管理
                    <i class="bi" :class="isOpen.faq ? 'bi-chevron-up' : 'bi-chevron-down'"
                        style="font-size: 0.8rem;"></i>
                </div>
            </li>

            <ul v-show="isOpen.faq" class="nav flex-column ms-3">
                <li class="nav-item mb-2">
                    <RouterLink to="/admin/faq/articles" class="nav-link text-dark" @click="closeSidebar">
                        文章管理
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/faqCategory" class="nav-link text-dark" @click="closeSidebar">
                        文章類別維護
                    </RouterLink>
                </li>
            </ul>

            <!-- Footer -->
            <div class="admin-footer mt-auto pt-3 border-top">
                <div class="text-muted mb-2 d-flex align-items-center">
                    您好，{{ currentUser.first_name }}
                </div>
                <button class="btn btn-secondary btn-sm w-100 mb-2" @click="gohome">
                    回首頁
                </button>
                <button class="btn btn-primary btn-sm w-100" @click="logout">登出</button>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/user/stores/user.js';
const userStore = useUserStore();

const props = defineProps({
    open: Boolean
})

const emit = defineEmits(['close'])

const closeSidebar = () => emit('close')

const router = useRouter()

const currentUser = ref({ first_name: 'Admin' })

function gohome() {
    window.location.href = '/user.html';
}


function logout() {
    const userStore = useUserStore();

    // 1. 清除 Pinia 資料
    userStore.clearUser();

    // 2. 清除 sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('adminUserName');
    sessionStorage.removeItem('hoUser');   // ← 這是 Pinia persist 的 key

    // 3. 導回登入頁
    window.location.href = '/user.html';
}

const isOpen = ref({
    support: true,
    faq: true
})

function toggle(section) {
    isOpen.value[section] = !isOpen.value[section]
}
</script>

<style scoped>
/* 手機版隱藏，open 時滑出 */
.sidebar-container {
    width: 240px;
    transition: transform 0.3s ease;
}

@media (max-width: 768px) {
    .sidebar-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 2000;
        transform: translateX(-100%);
    }

    .sidebartitle {
        text-align: center !important;
        padding-top: 6px;
    }

    .sidebar-container.open {
        transform: translateX(0);
    }
}
</style>
