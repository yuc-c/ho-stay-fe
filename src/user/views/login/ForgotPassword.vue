<template>
    <div class="body">
        <div class="forgotPassword-container">
            <h3>申請重設密碼</h3>
            <input type="email" placeholder="請輸入電子郵件" v-model="email">
             <button @click="sendVerifyMail">發送驗證信</button>
        </div>
    </div> 
</template>
    
<script setup>
import myAxios from '@/user/plugin/axios.js';
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';
const route = useRoute();
onMounted(() => {
    if (route.query.verify === 'false') {
    Swal.fire({
      icon: 'error',
      title: '驗證失敗',
      text: '連結無效或已過期，請重新輸入電子郵件。',
      confirmButtonText: '重新輸入電子郵件',
      allowOutsideClick:false,
      heightAuto:false
    })
  }
})
const email = ref("");
    function sendVerifyMail(){
        Swal.fire({
            title: '正在發送驗證信......',
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        myAxios({
            method: 'post',
            url: '/api/forgotPassword',
            params: {
                email:email.value
            }
        })
            .then(response => {
                console.log(response);
                Swal.fire({
                    icon: 'info',
                    text: response.data,
                    allowOutsideClick:false,
                    confirmButtonText:'確定',
                    confirmButtonColor: '#9ed9c6e6',
                    allowOutsideClick:false,
                    customClass: {
                        confirmButton: 'my-confirm-button-text'
                    }
                })
            })
            .catch(error => {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    text: error.response.data,
                    confirmButtonText:'確定',
                    confirmButtonColor: '#9ed9c6e6',
                    allowOutsideClick:false,
                    customClass: {
                        confirmButton: 'my-confirm-button-text'
                    }
                })
            });
    }
</script>
    
<style>
    .my-confirm-button-text {
        color: #284141;
    }
    * {
        box-sizing: border-box;
        font-family: sans-serif;
    }

    .body {
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
    .forgotPassword-container {
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


    .forgotPassword-container h3 {
        text-align: center;
        margin-bottom: 25px;
        color: #2F4F4F;
        letter-spacing: 1px;
    }


    .forgotPassword-container input {
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


    .forgotPassword-container input::placeholder {
        color: rgba(47, 79, 79, 0.6);
    }


    .forgotPassword-container input:focus {
        border-color: #139898;
        background: rgba(255, 255, 255, 0.3);
    }


    .forgotPassword-container button {
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

    .forgotPassword-container .google-btn {
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

    .forgotPassword-container p {
        text-align: center;
        font-size: 14px;
        margin-top: 15px;
        color: #2F4F4F;
    }

    .forgotPassword-container a {
        color: #447A78;
        text-decoration: none;
        font-weight: 500;
    }

    .forgotPassword-container a:hover {
        text-decoration: underline;
    }
</style>