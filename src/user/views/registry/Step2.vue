<template>
    <div class="step2-container">
        <h3>請到{{email}}信箱驗證</h3>
        <button @click="sendVerifyMail">重新發送驗證信</button>
    </div>
</template>
    
<script setup>
    import useUserStore from '@/user/stores/user.js';
    import myAxios from '@/user/plugin/axios.js'; 
    import Swal from 'sweetalert2';
    const userStore = useUserStore();
    const email = userStore.validateEmail;
    function sendVerifyMail(){
        Swal.fire({
            title: '正在發送驗證信......',
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        myAxios({
            method: 'get',
            url: '/api/resendVerifyEmail',
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
                    allowOutsideClick:false,
                    heightAuto:false
                })
            });
    }

</script>
    
<style scoped>
    .step2-container{
        text-align: center;
    }
    button {
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
</style>