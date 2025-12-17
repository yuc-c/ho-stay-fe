<template>
<div class="row mb-3 gap-3"> </div>
<div class="row mb-3 gap-3"> </div>
<div class="row mb-3 gap-3"> </div>

<div class="row">
<!-- 一次傳整份資料給子元件 -->
<BackOrdersTable :orders="orders" />
</div>
</template>
<script setup >
    import BackOrdersTable from "@/user/components/BackOrdersTable.vue";
    import myAxios from '@/user/plugin/axios.js';
    import { ref,onMounted } from "vue";
    import Swal from "sweetalert2";
    import useUserStore from "@/user/stores/user.js";
    const userStore = useUserStore();
    const orders = ref([]);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    onMounted(() => {
    loadOrders();
    });

    function loadOrders() {
    Swal.fire({
        title: '處理中......',
        showConfirmButton: false,
        allowOutsideClick: false,
    });

   
  myAxios.get(`${API_BASE_URL}/api/findBookingDetails`, {
    headers: {
      userId: userStore.userId
    }
  })
    .then(function(response) {
        orders.value = response.data;
        setTimeout(function() {
            Swal.close();
        }, 500);
    })
    .catch(function(error) {   // catch 必須接在 then 之後
        Swal.fire({
            text: "執行錯誤：" + error.message,
            icon: 'error',
        });
    });
}
</script>
   
<style scoped>
    /* 標題 */
h3 {
    margin-bottom: 20px;
    text-align: center;
    font-weight: 700;
    color: #279f6a;
}
</style>

