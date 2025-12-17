<template>
  <div class="register-page">
    <h3 class="title">註冊帳號</h3>
    <ProgressBar :currentStep="currentStep" :step="steps"></ProgressBar>

    <div class="form-container">
      <component :is="currentComponent" :key="currentStep" @nextStep="nextStep" />
    </div>
  </div>
</template>

<script setup>
import ProgressBar from '@/user/components/ProgressBar.vue';
import Step1 from './Step1.vue';
import Step2 from './Step2.vue';
import Step3 from './Step3.vue';
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
const router = useRouter();
const steps = ref(['填寫資料', '收取驗證信', '註冊成功'])
const currentStep = ref(1);

const components = [Step1, Step2, Step3];

const currentComponent = computed(() => components[currentStep.value - 1]);

function nextStep() {
  console.log(currentStep.value)
  currentStep.value++;
}
//點擊信箱後redirect回來顯示驗證成功
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('verify') === 'true') {
    Swal.fire({
      icon: 'success',
      title: '信箱驗證成功！',
      text: '您的帳號已完成驗證，歡迎使用。',
      confirmButtonText: '立即登入',
      confirmButtonColor: '#3aac5d',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/user/login");
      }
    })
    currentStep.value = 3 // 顯示 Step3
  } else if (params.get('verify') === 'false') {
    Swal.fire({
      icon: 'error',
      title: '驗證失敗',
      text: '連結無效或已過期，請重新註冊。',
      confirmButtonText: '重新註冊',
      allowOutsideClick: false,
      heightAuto: false
    })
    currentStep.value = 2 // 顯示 Step3
  }
})

</script>

<style scoped>
/* 整體布局 */
.register-page {
  height: 100vh;
  background: linear-gradient(135deg, #BFEAD6, rgba(163, 211, 161, 0.578));
  overflow: scroll;
  width: 100%;
  z-index: 0;
  padding-bottom: 70px;
}

h3 {
  text-align: center;
}

.title {
  padding-top: 30px;
}
</style>