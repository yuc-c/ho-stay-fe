import { createRouter, createWebHistory } from 'vue-router';
import UserProfile from '@/views/UserProfile.vue';
import BookingList from '@/views/BookingList.vue';
// ⭐ 移除這行：import ReviewManagement from '@/views/ReviewManagement.vue';

const routes = [
    // 預設路由 - 導向個人資料
    {
        path: '/',
        redirect: '/orders',
    },

    // 個人資料頁面
    {
        path: '/profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: {
            title: '個人資料 - HOHOSTAY',
        },
    },


    {
        path: '/payment-success',
        name: 'PaymentSuccess',
        component: () => import('@/views/PaymentSuccess.vue'),
        meta: { requiresAuth: true }
    },

    {
        path: '/payment-failed',
        name: 'PaymentFailed',
        component: () => import('@/views/PaymentFailed.vue'),
        meta: { requiresAuth: true }
    },

    // 訂單列表頁面
    {
        path: '/bookings',
        name: 'BookingList',
        component: () => import('@/views/BookingList.vue'),
        meta: {
            requiresAuth: true,
            title: '我的訂單 - HOHOSTAY',
        },
    },

    // OrderList
    {
        path: '/orders',
        name: 'OrderList',
        component: () => import('@/views/BookingList.vue'),
        meta: {
            title: '我的訂單（Mock） - HOHOSTAY',
        },
    },

    // ⭐ 用戶評論管理路由 - 使用懶加載
    {
        path: '/user/reviews',
        name: 'ReviewManagement',
        component: () => import('@/views/ReviewManagement.vue'),  // ← 改成這樣
        meta: {
            requiresAuth: true,
            title: '我的評論'
        }
    },

    // 訂單相關的評論路由
    {
        path: '/bookings/:bookingId/review/create',
        name: 'CreateReview',
        component: () => import('@/views/CreateReview.vue'),
        meta: {
            title: '撰寫評論 - HOHOSTAY',
        },
    },

    {
        path: '/bookings/:bookingId/review',
        name: 'ReviewDetail',
        component: () => import('@/views/ReviewDetail.vue'),
        meta: {
            title: '訂單評論 - HOHOSTAY',
        },
    },

    // 重導向路由
    {
        path: '/review/create/:bookingId',
        redirect: to => `/bookings/${to.params.bookingId}/review/create`
    },

    {
        path: '/review/:bookingId',
        redirect: to => `/bookings/${to.params.bookingId}/review`
    },
    {
        path: '/diagnostic',
        name: 'Diagnostic',
        component: () => import('@/views/DiagnosticTest.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// 路由守衛
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});

export default router;