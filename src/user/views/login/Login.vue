<template>
    <div id="body">
        <div class="login-container">
            <h2>登入帳號</h2>
            <input type="email" placeholder="電子郵件" v-model="email">
            <input type="password" placeholder="密碼" v-model="password">
            <p class="login-message">{{ loginMessage }}</p>
            <button @click="login">登入</button>
            <button class="google-btn" @click="redirectGoogle">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo"
                    width="20">以
                Google 登入</button>
            <p>
                <RouterLink to="/user/forgotPassword">忘記密碼</RouterLink>
            </p>
            <p>還沒有帳號？<RouterLink to="/user/registry">立即註冊</RouterLink>
            </p>

        </div>
    </div>
</template>

<script setup>
import myAxios from '@/user/plugin/axios';
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import useUserStore from '@/user/stores/user.js';
const userStore = useUserStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const loginMessage = ref('');
function login() {
    const formData = new URLSearchParams();
    formData.append('email', email.value);
    formData.append('password', password.value);

    myAxios({
        method: 'post',
        url: '/api/login',
        data: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => {
            console.log(response)
            if (response.data.success) {
                const token = response.data.token;
                const userName = response.data.userLastName + response.data.userFirstName;
                // 存儲到 Pinia store
                userStore.setToken(response.data.token);
                userStore.setFirstName(response.data.userFirstName);
                userStore.setLastName(response.data.userLastName);
                userStore.setrole(response.data.role);
                userStore.setEmail(response.data.email);
                userStore.setPhone(response.data.phone);
                userStore.setId(response.data.id);
                userStore.setPhoto(response.data.photo);
                // ⬅ 新增你需要的 userId（客服用）
                if (response.data.id) {
                    userStore.setUserId(Number(response.data.id));
                    localStorage.setItem('userId', response.data.id.toString()); // ✅ 保存到 localStorage
                }

                // ⬅ 保留組員的 localStorage（後台判斷用）
                if (token) localStorage.setItem('token', token);
                if (userName) {
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('adminUserName', userName);
                }
                const redirectPath = localStorage.getItem("redirectAfterLogin");
                if (redirectPath) {
                    router.push(redirectPath);
                    localStorage.removeItem("redirectAfterLogin");
                } else {
                    router.push('/');
                }
            }
        })
        .catch(error => {
            console.log(error);
            loginMessage.value = error.response.data.message;
        });
}
function redirectGoogle() {
    window.location.href = "http://localhost:8080/google/login";
}
//----------------------------------------
//google登入後取得使用者資料（僅在 URL 參數包含 token 時執行，例如 Google 登入回調）
onMounted(() => {
    // 檢查是否有 token（可能是 Google 登入回調）
    // const urlParams = new URLSearchParams(window.location.search);
    // const hasToken = urlParams.get('token') || localStorage.getItem('token') || sessionStorage.getItem('token');

    // 只有在有 token 的情況下才檢查用戶狀態（通常是 Google 登入回調）
    // if (hasToken) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            userStore.setToken(token);
            // 清除 URL 中的 token
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        myAxios({
            method: 'get',
            url: '/api/user'
        })
            .then(response => {
                console.log(response);
                if (response.data) {
                    const token = response.data.token;
                    const userName = response.data.userLastName + response.data.userFirstName;
                    const id = response.data.id;
                    console.log("使用者id" + id);
                    // 存儲到 Pinia store
                    userStore.setToken(response.data.token);
                    userStore.setFirstName(response.data.userFirstName);
                    userStore.setLastName(response.data.userLastName);
                    userStore.setrole(response.data.role);
                    userStore.setEmail(response.data.email);
                    userStore.setPhone(response.data.phone);
                    userStore.setId(response.data.id);
                    userStore.setPhoto(response.data.photo);

                     // ⬅ 新增你需要的 userId（客服用）
                    if (id) {
                        userStore.setUserId(Number(id));
                        localStorage.setItem('userId', id.toString()); // ✅ 保存到 localStorage
                    }
                    // 同時存儲到 localStorage，方便其他頁面讀取
                    if (token) {
                        localStorage.setItem('token', token);
                    }
                    if (userName) {
                        localStorage.setItem('userName', userName);
                        localStorage.setItem('adminUserName', userName);
                    }
                    const redirectPath = localStorage.getItem("redirectAfterLogin");
                    if (redirectPath) {
                        router.push(redirectPath);
                        localStorage.removeItem("redirectAfterLogin");
                    } else {
                        router.push('/');
                    }
                }
            })
            .catch(error => {
                console.log(error);
                // 如果 API 失敗，清除可能的殘留 token
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('pinia-user');
                userStore.clearUser();
            });
    // } else {
        // 沒有 token，確保清除所有可能的殘留數據
    //     userStore.clearUser();
    // }
});

</script>

<style scoped>
* {
    box-sizing: border-box;
    font-family: sans-serif;
}

#body {
    position: fixed;
    height: 100vh;
    width: 100vw;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #BFEAD6, rgba(163, 211, 161, 0.578));
    background-attachment: fixed;
}

/* 背景裝飾圖案（柔霧圓圈） */
#body::before {
    content: "";
    position: fixed;
    top: 150px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    filter: blur(80px);
}


#body::after {
    content: "";
    position: fixed;
    bottom: -120px;
    left: -120px;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    filter: blur(100px);
}

/* 毛玻璃特效 */
.login-container {
    position: relative;
    z-index: 10;
    width: 350px;
    padding: 40px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 40px rgba(0, 0, 0, 0.1);
    color: #2f2f2f;
}


.login-container h2 {
    text-align: center;
    margin-bottom: 25px;
    color: #2F4F4F;
    letter-spacing: 1px;
}


.login-container input {
    width: 100%;
    padding: 12px 15px;
    margin-bottom: 15px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    color: #2F4F4F;
    font-size: 15px;
    outline: none;
    transition: 0.3s;
}


.login-container input::placeholder {
    color: rgba(47, 79, 79, 0.6);
}


.login-container input:focus {
    border-color: #139898;
    background: rgba(255, 255, 255, 0.3);
}


.login-container button {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    border: none;
    border-radius: 10px;
    background: rgba(158, 217, 198, 0.9);
    color: #284141;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: 0.3s;
}

button:hover {
    background: rgba(143, 204, 185, 1);
}

/* .google-btn {
        background: rgba(255, 255, 255, 0.3);
        color: #2F4F4F;
        margin-top: 15px;
    } */

.login-container .google-btn {
    background: rgba(255, 255, 255, 0.85);
    color: #2F4F4F;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
}

.google-btn:hover {
    background: rgba(255, 255, 255, 0.5);
}

.login-container p {
    text-align: center;
    font-size: 14px;
    margin-top: 15px;
    color: #2F4F4F;
}

.login-container a {
    color: #447A78;
    text-decoration: none;
    font-weight: 500;
}

.login-container a:hover {
    text-decoration: underline;
}
.login-message {
    color: red !important; 
}
</style>