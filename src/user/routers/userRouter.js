import UserNavbar from "@/user/Navbar/UserNavbar.vue";
import useUserStore from "@/user/stores/user";
import BecomeHost from "@/user/views/BecomeHost.vue";
import Booking from "@/user/views/Booking.vue";
import Home from "@/user/views/Home.vue";
import HotelInfo from "@/user/views/HotelInfo.vue";
import ForgotPassword from "@/user/views/login/ForgotPassword.vue";
import Login from "@/user/views/login/Login.vue";
import ResetPassword from "@/user/views/login/ResetPassword.vue";
import MapPicker from "@/user/views/MapPicker.vue";
import Registry from "@/user/views/registry/Registry.vue";
import SearchResult from "@/user/views/SearchResult.vue";
import WishList from "@/user/views/WishList.vue";
import Swal from "sweetalert2";
import { createRouter, createWebHistory } from "vue-router";

//個人資料+我的訂單
import Profile from '@/user/views/Profile.vue';
import BookingList from '@/user/views/BookingList.vue';

//飯店庫存+評論回覆+歷史訂單
import BackOrders from '@/user/pages/BackOrders.vue';
import BookingReply from '@/user/pages/BookingReply.vue';
import Inventory from '@/user/pages/Inventory.vue';




//*客服的頁面
import FAQPage from "@/user/views/FAQPage.vue";
import SupportCenterPage from "@/user/views/SupportCenterPage.vue";


const routes = [
    {
        name: 'home',
        path: '/',
        component: Home
    },
    {
        path: '/user',
        component: UserNavbar,
        children: [
            {
                name: 'registry',
                path: 'registry',
                component: Registry
            }, {
                name: 'login',
                path: 'login',
                component: Login
            }, {
                name: 'forgotPassword',
                path: 'forgotPassword',
                component: ForgotPassword
            }, {
                name: 'resetPassword',
                path: 'resetPassword',
                component: ResetPassword
            }, {
                name: 'searchResult',
                path: 'searchResult',
                component: SearchResult
            },

            //加入個人資料、我的訂單
            {
                name: 'profile',
                path: 'profile',
                component: Profile
            },
            {
                name: 'bookinglist',
                path: 'bookinglist',
                component: BookingList
            },
            // 評論相關路由
            {
                name: 'createReview',
                path: 'bookings/:bookingId/review/create',
                component: () => import('@/user/views/CreateReview.vue'),
                meta: { requiresAuth: true }
            },
            {
                name: 'reviewDetail',
                path: 'bookings/:bookingId/review',
                component: () => import('@/user/views/ReviewDetail.vue'),
                meta: { requiresAuth: true }
            },
            // 加入 FAQ 與 Support
            {
                name: "faq",
                path: "faq",
                component: FAQPage,
            },
            {
                name: "support",
                path: "support",
                component: SupportCenterPage,
            },
            // 成為房東
            {
                name: "becomeHost",
                path: "become-host",
                component: BecomeHost,
            }, {
                name: 'hotelInfo',
                path: 'hotelInfo/:hotelId',
                component: HotelInfo
            }, {
                name: 'booking',
                path: 'booking',
                component: Booking,
                meta: { requiresAuth: true }
            }, {
                name: 'wishlist',
                path: 'wishlist',
                component: WishList
            }, {
                name: 'mapPicker',
                path: 'mapPicker',
                component: MapPicker
            },
            {
                path: '/pages',
                // component: HotelBackNavigation, 
                // ⭐父層，包含 navbar
                children: [
                    { path: 'inventory', component: Inventory },
                    { path: 'backorders', component: BackOrders },
                    { path: 'bookingreply', component: BookingReply },
                ]
            },
        ]
    }]

const router = createRouter({
    history: createWebHistory('/user.html'),
    routes
})
//跳轉頁面時攔截
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const token = userStore.token;
    console.log(router.currentRoute.value.path);
    if (to.meta.requiresAuth && !token) {
        Swal.fire({
            icon: 'warning',
            title: '請先登入',
            showCancelButton: true,
            confirmButtonText: '確認',
            cancelButtonText: '前往登入',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // 使用者點了「確認」
                console.log('使用者確認');
                next(false);
            } else if (result.isDismissed) {
                localStorage.setItem("redirectAfterLogin", router.currentRoute.value.path);
                next("/user/login");
            }
        });
    } else {
        next();
    }
})

export default router;