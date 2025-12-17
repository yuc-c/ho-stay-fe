import axios from "axios";
import useUserStore from '@/user/stores/user.js';
import Swal from "sweetalert2";
import router from "@/user/routers/userRouter.js"


const myAxios = axios.create({
    // baseURL: 'http://192.168.25.152:8080'
})
//發api時自動帶入token
myAxios.interceptors.request.use(
    (config) => {
        const userStore = useUserStore();
        const token = userStore.token;
        // console.log("current path" + router.currentRoute.value.path);
        if (config.requiresAuth && (token.length == 0)) {
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
                } else if (result.isDismissed) {
                    localStorage.setItem("redirectAfterLogin", router.currentRoute.value.path);
                    window.location.href = '/user.html/user/login';
                }
            });
        }
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default myAxios;