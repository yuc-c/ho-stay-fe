<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 先用最單純的假資料
const orders = ref([
  {
    bookingId: 1,
    bookingNumber: "BKG2025010001",
    roomName: "豪華雙人房",
    startDate: "2025-01-05",
    endDate: "2025-01-07",
    night: 2,
    totalPrice: 5600,
    status: 4,
    canReview: true,
    hasReview: false,
  },
  {
    bookingId: 2,
    bookingNumber: "BKG2024120008",
    roomName: "標準單人房",
    startDate: "2024-12-20",
    endDate: "2024-12-21",
    night: 1,
    totalPrice: 2000,
    status: 4,
    canReview: false,
    hasReview: true,
  },
  {
    bookingId: 3,
    bookingNumber: "BKG2025010201",
    roomName: "家庭四人房",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    night: 2,
    totalPrice: 8200,
    status: 3,
    canReview: false,
    hasReview: false,
  },
]);

const statusText = (status) => {
  switch (status) {
    case 1:
      return "未付款";
    case 2:
      return "已付款";
    case 3:
      return "已取消";
    case 4:
      return "已完成";
    default:
      return "未知狀態";
  }
};

// 👉 點「撰寫評論」時導到 /review/create/:bookingId
const goCreateReview = (bookingId) => {
  router.push(`/review/create/${bookingId}`);
};

// 👉 點「查看評論」時導到 /review/:bookingId
const goReviewDetail = (bookingId) => {
  router.push(`/review/${bookingId}`);
};
</script>


<template>
  <div class="container py-4">

    <h2 class="mb-4">
      <i class="bi bi-list-check"></i> 我的訂單（Mock）
    </h2>

    <div class="row g-3">

      <div 
        class="col-md-6 col-lg-4"
        v-for="order in orders"
        :key="order.bookingId"
      >
        <div class="card shadow-sm h-100">

          <div class="card-body">

            <div class="d-flex justify-content-between mb-2">
              <h5 class="card-title">訂單 #{{ order.bookingNumber }}</h5>
              <span class="badge bg-primary">
                {{ statusText(order.status) }}
              </span>
            </div>

            <p class="mb-1"><i class="bi bi-house"></i> 房型：{{ order.roomName }}</p>
            <p class="mb-1">
              <i class="bi bi-calendar-event"></i>
              {{ order.startDate }} → {{ order.endDate }} （{{ order.night }} 晚）
            </p>
            <p class="mb-2">
              <i class="bi bi-cash-coin"></i>
              <strong class="text-success">NT$ {{ order.totalPrice.toLocaleString() }}</strong>
            </p>

            <div class="d-grid gap-2 mt-3">

              <button 
                v-if="order.canReview"
                class="btn btn-outline-primary"
                @click="goCreateReview(order.bookingId)"
              >
                <i class="bi bi-pencil-square"></i> 撰寫評論
              </button>

              <button 
                v-if="order.hasReview"
                class="btn btn-outline-success"
                @click="goReviewDetail(order.bookingId)"
              >
                <i class="bi bi-chat-left-text"></i> 查看評論
              </button>

              <button 
                v-if="!order.canReview && !order.hasReview"
                class="btn btn-secondary"
                disabled
              >
                <i class="bi bi-dash-circle"></i> 無法評論
              </button>

            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

