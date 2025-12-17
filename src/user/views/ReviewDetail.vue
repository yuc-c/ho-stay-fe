<template>
  <div class="container py-4">
    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-body">
        <h3 class="mb-3">
          <i class="bi bi-chat-left-text"></i> 訂單 #{{ bookingId }} 的評論
        </h3>

        <!-- 載入中 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> {{ error }}
        </div>

        <!-- 評論內容 -->
        <div v-else-if="review" class="p-3 bg-light rounded mb-3">
          <div class="mb-3">
            <strong>評分：</strong>
            <span v-for="star in 5" :key="star" class="text-warning">
              {{ star <= review.rating ? '★' : '☆' }}
            </span>
            <span class="ms-2">({{ review.rating }}/5)</span>
            <span v-if="review.isEdited" class="badge bg-secondary ms-2">已編輯</span>
          </div>

          <div class="mb-3">
            <strong>評論內容：</strong>
            <p class="mb-0">{{ review.comment }}</p>
            <small class="text-muted">
              <i class="bi bi-calendar"></i> 
              發表時間：{{ formatDateTime(review.createdDate) }}
              <span v-if="review.updatedDate && review.updatedDate !== review.createdDate">
                （最後更新：{{ formatDateTime(review.updatedDate) }}）
              </span>
            </small>
          </div>

          <!-- 業者回覆 -->
          <div v-if="review.reply" class="mt-3 p-3 bg-white rounded border">
            <div class="d-flex justify-content-between mb-2">
              <strong><i class="bi bi-building"></i> 飯店業者回覆：</strong>
              <small class="text-muted">
                {{ formatDateTime(review.replyCreatedDate) }}
                <span v-if="review.replyUpdatedDate && review.replyUpdatedDate !== review.replyCreatedDate">
                  （更新：{{ formatDateTime(review.replyUpdatedDate) }}）
                </span>
              </small>
            </div>
            <p class="mb-0">{{ review.reply }}</p>
          </div>
        </div>

        <!-- 沒有評論 -->
        <div v-else class="alert alert-info">
          <i class="bi bi-info-circle"></i> 此訂單尚未有評論
        </div>

        <div class="d-flex gap-2 mt-3">
          <button v-if="review" class="btn btn-warning" @click="goToEdit">
            <i class="bi bi-pencil"></i> 修改評論
          </button>
          <button class="btn btn-secondary" @click="goBack">
            <i class="bi bi-arrow-left"></i> 返回訂單列表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getReviewByBookingId } from "@/user/api/review.js";

const route = useRoute();
const router = useRouter();

const bookingId = route.params.bookingId;
const review = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getReviewByBookingId(bookingId);
    
    console.log('📥 評論 API 回應:', response);
    
    // 處理不同的回應格式
    if (response.data) {
      // 如果後端返回 ApiResponse 格式 { success, data, message }
      if (response.data.success && response.data.data) {
        review.value = response.data.data;
      } 
      // 如果後端直接返回評論物件
      else if (response.data.id || response.data.rating) {
        review.value = response.data;
      }
      // 如果沒有評論（success: true 但 data: null）
      else if (response.data.success === false) {
        review.value = null;
        error.value = response.data.message || '此訂單尚未有評論';
      }
      else {
        review.value = null;
      }
    } else {
      review.value = null;
    }
  } catch (err) {
    console.error('載入評論失敗:', err);
    
    // 如果是 404 或 500，表示沒有評論或後端錯誤
    if (err.response?.status === 404) {
      review.value = null;
      error.value = null; // 404 不算錯誤，只是沒有評論
    } else if (err.response?.status === 500) {
      // 500 可能是後端錯誤，但也可能是沒有評論
      // 不顯示錯誤訊息，只顯示"此訂單尚未有評論"
      review.value = null;
      error.value = null; // 不顯示錯誤，讓它顯示"此訂單尚未有評論"
    } else {
      error.value = '載入評論失敗，請稍後再試';
    }
  } finally {
    loading.value = false;
  }
});

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const goToEdit = () => {
  router.push(`/user/bookings/${bookingId}/review/create`);
};

const goBack = () => {
  router.push("/user/bookinglist");
};
</script>

<style scoped>
.review-detail-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.mock-block {
  margin: 16px 0;
  padding: 12px;
  background: #f7f7f7;
  border-radius: 4px;
}

button {
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #2c7be5;
  color: #fff;
}
</style>
