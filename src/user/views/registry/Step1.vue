<template>
        <div class="form-container">
            <div class= "d-flex gap-5">
                <div class="mb-1">
                    <label for="lastName" class="form-label"><span class="required">*</span>姓氏</label>
                    <input type="text" class="form-control" id="lastName" v-model="lastName">
                    <p class="required">{{ lastNameMessage }}</p>
                </div>
                <div class="mb-1">
                    <label for="firstName" class="form-label"><span class="required">*</span>名字</label>
                    <input type="text" class="form-control" id="firstName" v-model="firstName">
                    <p class="required">{{ firstNameMessage }}</p>
                </div>        
            </div>
            <div class="mb-1" >
                <label for="email" class="form-label"><span class="required">*</span>電子郵件</label>
                <input type="email" class="form-control" id="email" v-model="email" @focus="resetChechEmailResult" @blur="checkEmail">
                <p class="required">{{ emailMessage }}{{ checkEmailResult }}</p>
            </div>
            <div class="mb-1">
                <label for="password" class="form-label"><span class="required">*</span>密碼</label>
                <input type="password" class="form-control" id="password" v-model="password">
                <p class="required">{{ passwordMessage }}</p>
            </div>
            <div class="mb-1">
                <label for="checkPassword" class="form-label"><span class="required">*</span>確認密碼</label>
                <input type="password" class="form-control" id="checkPassword" v-model="checkPassword">
                <p class="required">{{ checkPasswordMessage }}</p>
            </div>
            
            <button @click="validateForm">註冊</button>
            
        </div>
    </template>

<script setup >
    import myAxios from '@/user/plugin/axios.js'; 
    import { ref } from 'vue';
    import useUserStore from '@/user/stores/user.js';
    import Swal from 'sweetalert2';
    const userStore = useUserStore();
    const emits = defineEmits(["nextStep"]);
    const lastName = ref("");
    const firstName = ref("");
    const email = ref("");
    const password = ref("");
    const checkPassword = ref("");
    let checkEmailResult = ref("");
    let lastNameMessage = ref("");
    let firstNameMessage = ref("");
    let emailMessage = ref("");
    let passwordMessage = ref("");
    let checkPasswordMessage = ref("");
    let isValidated = ref(false);
    
    //驗證表單欄位
    //email驗證規則xxxx@xxx.xx
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    //密碼驗證規則大寫、小寫、數字、特殊符號，長度8-20
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,20}$/;
    function validateForm(){
        lastNameMessage.value = "";
        firstNameMessage.value = "";
        emailMessage.value = "";
        passwordMessage.value = "";
        checkPasswordMessage.value = "";
        checkEmailResult.value = "";
        console.log("isValidated" + isValidated.value);
        if (isValidated.value) {
            Swal.fire({
            title: '正在發送驗證信......',
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        }
        myAxios({
            method: 'post',
            url: '/api/validate',
            data:{
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                checkPassword: checkPassword.value
            }
        })
            .then(response => {
                console.log(response)
                Swal.fire({
                icon: 'info',
                title: '請至信箱收取驗證信',
                text: `我們已寄出驗證信到 ${email.value}，請點擊信件中的連結完成驗證。`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
      })
                userStore.setValidateEmail(email.value);
                isValidated = true;
                emits("nextStep");
            })
        
            .catch(error => {
                console.log(error);
                lastNameMessage.value = error.response.data.lastName || '';
                firstNameMessage.value = error.response.data.firstName || '';
                emailMessage.value = error.response.data.email || '';
                passwordMessage.value = error.response.data.password || '';
                checkPasswordMessage.value = error.response.data.checkPassword || '';
            });
        // if (lastName.value == null || lastName.value.length == 0){
        //     lastNameMessage.value = "姓氏為必填";
        // }
        // if (firstName.value == null || firstName.value.length == 0){
        //     firstNameMessage.value = "名字為必填";
        // }
        // if (email.value == null || email.value.length == 0){
        //     emailMessage.value = "電子郵件為必填";
        // } else {
        //     if (!emailPattern.test(email.value)){
        //         emailMessage.value = "請輸入正確的email格式";
        //     } else {
        //         checkEmail()
        //     }
        // }
        // if (password.value == null || password.value.length == 0){
        //     passwordMessage.value = "密碼為必填";
        // } else {

        // }
        // if (checkPassword.value == null || checkPassword.value.length == 0){
        //         checkPasswordMessage.value = "請再輸入一次密碼";
        // } else {
        //     if (password.value !== checkPassword.value){
        //         checkPasswordMessage.value = "密碼不一致";
        //     }
        // }

    }

    function resetChechEmailResult(){
        checkEmailResult.value = ''
    }
    function checkEmail(){
        myAxios({
            method: 'post',
            url: '/api/checkemail',
            params: {
                email: email.value
            }
        })
        .then(response => {
            console.log(response);
            emailMessage.value = "";
            checkEmailResult.value = response.data.message
        })
    
        .catch(error => console.log(error));
    }

</script>
    
<style scoped>

    .required {
        color: red;
    }
    .form-container{
        max-width: 500px;
        display: flex;
        flex-direction: column;
        margin: auto;
        position: relative;
        z-index: 10;
        padding: 40px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 40px rgba(0, 0, 0, 0.1);
        color: #2f2f2f;
    }
    button {
        width: 50%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: rgba(158, 217, 198, 0.9);
        color: #284141;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: 0.3s;
        margin-left: auto;
        margin:0 auto;
    }

    button:hover {
        background: rgba(143, 204, 185, 1);
    } 
    
    
</style>