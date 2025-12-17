<template>
  <div class="review-header">
    <h3>💬 顧客評論</h3>
    <button 
      v-if="reviews.length > 0" 
      class="more-btn" 
      @click="showAllReviews = true"
    >
      查看全部 {{ reviews.length }} 則評論
    </button>
  </div>
  <div class="review-card">
    <div class="review-user-info"> 
      
      <div class="review-title">
        <div class="left-info">
          <img :src="`${photoPath}?photoUrl=${reviews[0].image}`" class="rounded-circle me-2 border border-2 border-light" width="40" height="40" />
          <span>{{ reviews[0].lastName }} {{ reviews[0].firstName }}</span>
        </div>
        <div class="review-header-right">
          <span class="review-date">{{ reviews[0].createdDate }}</span>
          <button 
            v-if="reviews[0].comment !== '此評論因違規已被隱藏'"
            class="report-btn" 
            @click="openReportModal(reviews[0])" 
            title="檢舉此評論"
          >
            ⚠️
          </button>
        </div>
      </div>
    </div>

    <!-- 評論、平均分數 -->
    <div class="thumbs-up-icon-wrapper">
      <span v-for="n in 5" :key="n" >
        <ThumpUpIcon :color="n <= hotelDetail.avgRating ? '#0f4d46' : '#cccccc'"
                      class="thumb-up-icon">
        </ThumpUpIcon>
      </span>
    </div>  

    <p 
      class="review-comment" 
      :class="{ 'hidden-comment': reviews[0].comment === '此評論因違規已被隱藏' }"
    >
      {{ reviews[0].comment }}
    </p>
      

    <div v-if="reviews[0].reply" class="modal-reply">
      <p class="reply-title">
        <span >{{ hotelDetail.hotelName }}</span>
        <span class="review-date">{{ reviews[0].replyCreatedDate }}</span> </p>
      <p class="review-comment">{{ reviews[0].reply }}</p>
    </div>
  </div>

    <!-- 顯示多則評論 -->
  <div v-if="showAllReviews" class="modal-overlay" @click.self="showAllReviews = false">
    <div class="modal-content">

      <h3>{{ hotelDetail.hotelName }} — 所有評論</h3>

      <div
        v-for="(review, idx) in reviews"
        :key="idx"
        class="modal-review-item"
      >
        <div class="review-title">
          <div class="left-info">
            <img :src="`${photoPath}?photoUrl=${review.image}`" class="rounded-circle me-2 border border-2 border-light" width="40" height="40">
            <span>{{ review.lastName }}{{ review.firstName }}</span>
          </div>
          <div class="review-header-right">
            <span class="review-date">{{ review.createdDate }}</span>
            <button 
              v-if="review.comment !== '此評論因違規已被隱藏'"
              class="report-btn" 
              @click="openReportModal(review)" 
              title="檢舉此評論"
            >
              ⚠️
            </button>
          </div>
        </div>

      <!-- 評論、平均分數 -->
      <div class="thumbs-up-icon-wrapper">
        <span v-for="n in 5" :key="n" >
          <ThumpUpIcon :color="n <= hotelDetail.avgRating ? '#0f4d46' : '#cccccc'"
                        class="thumb-up-icon">
          </ThumpUpIcon>
        </span>
      </div>  

        <p 
          class="review-comment" 
          :class="{ 'hidden-comment': review.comment === '此評論因違規已被隱藏' }"
        >
          {{ review.comment }}
        </p>

        <div v-if="review.reply" class="modal-reply">
          <p class="reply-title">
            <span class="reply-indicator">{{ hotelDetail.hotelName }} 回覆：</span> <span class="review-date">{{ review.replyCreatedDate }}</span> </p>
          <p class="review-comment">{{ review.reply }}</p>
        </div>

        <hr />
      </div>

      <button class="close-btn" @click="showAllReviews = false">關閉</button>
    </div>
  </div>

  <!-- 檢舉彈窗 -->
  <div v-if="showReportModal" class="modal-overlay" @click.self="closeReportModal">
    <div class="report-modal-content">
      <h3>檢舉評論</h3>
      <p class="report-modal-text">請選擇檢舉原因：</p>
      
      <div class="report-reasons">
        <label v-for="reason in reportReasons" :key="reason.value" class="report-reason-item">
          <input 
            type="radio" 
            :value="reason.value" 
            v-model="selectedReason"
            name="reportReason"
          />
          <span>{{ reason.label }}</span>
        </label>
      </div>

      <div class="report-modal-actions">
        <button class="report-cancel-btn" @click="closeReportModal">取消</button>
        <button 
          class="report-submit-btn" 
          @click="submitReport"
          :disabled="!selectedReason || isSubmitting"
        >
          {{ isSubmitting ? '提交中...' : '提交檢舉' }}
        </button>
      </div>
    </div>
  </div>
</template>
    
<script setup>
import { ref } from 'vue';
import { moderationAPI } from '@/user/api/moderation.js';
import useUserStore from '@/user/stores/user.js';
import Swal from 'sweetalert2';
import ThumpUpIcon from '@/user/components/icons/ThumpUpIcon.vue'

const photoPath = import.meta.env.VITE_PROFILE_PHOTO_URL;
const props = defineProps(['reviews', 'hotelDetail'])
const showAllReviews = ref(false);

// 檢舉相關
const showReportModal = ref(false);
const selectedReview = ref(null);
const selectedReason = ref('');
const isSubmitting = ref(false);
const userStore = useUserStore();

const reportReasons = [
  { value: 'ABUSE', label: '辱罵字眼' },
  { value: 'SPAM', label: '垃圾內容' },
  { value: 'ADVERTISING', label: '廣告訊息' },
  { value: 'OFFENSIVE', label: '冒犯性內容' },
  { value: 'OTHER', label: '其他' }
];

function openReportModal(review) {
  // 檢查是否已登入
  if (!userStore.userId) {
    Swal.fire({
      icon: 'warning',
      title: '請先登入',
      text: '檢舉功能需要登入後才能使用',
      confirmButtonText: '確認'
    });
    return;
  }
  
  selectedReview.value = review;
  selectedReason.value = '';
  showReportModal.value = true;
}

function closeReportModal() {
  showReportModal.value = false;
  selectedReview.value = null;
  selectedReason.value = '';
}

async function submitReport() {
  if (!selectedReason.value || !selectedReview.value) {
    return;
  }

  // 驗證必要欄位
  const reviewId = selectedReview.value.reviewId || selectedReview.value.id;
  const reviewAuthorId = selectedReview.value.userId;

  if (!reviewId) {
    Swal.fire({
      icon: 'error',
      title: '檢舉失敗',
      text: '無法獲取評論ID，請重新整理頁面後再試',
      confirmButtonText: '確認'
    });
    return;
  }

  if (!reviewAuthorId) {
    Swal.fire({
      icon: 'error',
      title: '檢舉失敗',
      text: '無法獲取評論作者資訊，請重新整理頁面後再試',
      confirmButtonText: '確認'
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // 構建檢舉數據
    const reportData = {
      reviewId: reviewId,
      reviewAuthorId: reviewAuthorId,
      reporterId: userStore.userId,
      moderatorId: 1, // 預設審核人員ID
      reason: selectedReason.value,
      status: 'PENDING'
    };

    await moderationAPI.reportReview(reportData);

    // 先關閉檢舉彈窗，確保成功訊息顯示在最上層
    closeReportModal();

    // 使用 setTimeout 確保彈窗完全關閉後再顯示成功訊息
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: '檢舉已提交',
        text: '您的檢舉已成功提交，我們會盡快處理',
        confirmButtonText: '確認',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          // 當彈窗打開時，強制設置 z-index
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '99999';
            swalContainer.style.position = 'fixed';
          }
        }
      });
      
      // 額外確保 z-index 設置（多次嘗試以確保生效）
      const setZIndex = () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '99999';
          swalContainer.style.position = 'fixed';
        }
      };
      
      setTimeout(setZIndex, 50);
      setTimeout(setZIndex, 100);
      setTimeout(setZIndex, 200);
    }, 300);
  } catch (error) {
    console.error('檢舉失敗:', error);
    Swal.fire({
      icon: 'error',
      title: '檢舉失敗',
      text: error.message || '提交檢舉時發生錯誤，請稍後再試',
      confirmButtonText: '確認'
    });
  } finally {
    isSubmitting.value = false;
  }
}

</script>
    
<style scoped>
    .star-rating .star {
        color: #ccc;
        margin-right: 2px;
    }

    .star-rating .filled {
        color: #ffc107; /* 金色星星 */
    }

    .review-card {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 6px;
  background-color: #ddf8dd;
  max-width: 400px;
  width: 100%; /* 確保卡片寬度是100% */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  flex-direction: column; 
}
.review-user {
  display:flex;
}

.review-title .review-date,
.reply-title .review-date {
  font-weight: normal; 
  font-size: small;
}

.review-star-date {
  display: flex;
  gap: 10px;
}

.review-comment {
  line-height: 1.6;
}

.review-comment.hidden-comment {
  color: #999;
  font-style: italic;
  text-decoration: line-through;
}
/* 查看更多按鈕 */
.review-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 10px;
}

.more-btn {
  background: none;
  color: black;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}



/* Modal 遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Modal 內容 */
.modal-content {
  background: #ddf8dd;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 10px;
  animation: fadeIn .2s ease;
}

/* 單筆評論 */
.modal-review-item {
  padding: 10px 0;
}

.reply-title {
    font-weight: bold;
    display: flex; 
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px; 
  }

.review-title {
  font-weight: bold;
  display: flex;
  justify-content: space-between; 
  align-items: center;
}
.review-title .left-info {
  display: flex;
  align-items: center;
  gap: 8px; /* 圖片和姓名間距 */
}

.review-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.report-btn:hover {
  background-color: rgba(255, 0, 0, 0.1);
}




/* 關閉按鈕 */
.close-btn {
  margin-top: 10px;
  background: #8ff382;
  color: black;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.close-btn:hover {
  background: rgb(40, 215, 40)
}

.modal-reply {
  margin-top: 10px;
  padding: 10px 15px;
  border-left: 4px solid var(--primary-color, #98ec98); 
  background-color: #e9ffe9; 
  border-radius: 4px;
}

/* 效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 檢舉彈窗樣式 */
.report-modal-content {
  background: white;
  width: 500px;
  max-width: 90vw;
  padding: 30px;
  border-radius: 10px;
  animation: fadeIn .2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.report-modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.report-modal-text {
  margin-bottom: 20px;
  color: #666;
}

.report-reasons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.report-reason-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.report-reason-item:hover {
  background-color: #f5f5f5;
  border-color: #98ec98;
}

.report-reason-item input[type="radio"] {
  cursor: pointer;
}

.report-reason-item span {
  cursor: pointer;
  flex: 1;
}

.report-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.report-cancel-btn,
.report-submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.report-cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.report-cancel-btn:hover {
  background-color: #d0d0d0;
}

.report-submit-btn {
  background-color: #98ec98;
  color: #333;
}

.report-submit-btn:hover:not(:disabled) {
  background-color: #8ff382;
}

.report-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>

<style>
/* 全局樣式：確保 SweetAlert2 顯示在最上層 */
.swal2-container {
  z-index: 99999 !important;
}

.thumbs-up-icon-wrapper {
  margin-bottom: 10px;
}

.thumb-up-icon {
  width: 20px;
  height: 20px;
  margin: 0 2px;
}

</style>