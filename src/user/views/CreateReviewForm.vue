<template>
  <div class="create-review-form">
    <!-- 評論按鈕 -->
    <button
      v-if="!hasReview && canReview"
      class="btn btn-primary"
      @click="showReviewModal = true"
    >
      <i class="fas fa-star"></i> 評論此訂單
    </button>

    <!-- 已評論提示 -->
    <div v-if="hasReview" class="alert alert-success">
      <i class="fas fa-check-circle"></i> 您已評論過此訂單
      <router-link to="/user/reviews" class="ms-2">查看我的評論</router-link>
    </div>

    <!-- 不符合評論條件的提示 -->
    <div v-if="!canReview && !hasReview" class="alert alert-info">
      <i class="fas fa-info-circle"></i> 
      {{ canReviewMessage }}
    </div>

    <!-- 評論Modal -->
    <div
      v-if="showReviewModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-star text-warning"></i> 評論訂單 #{{ bookingId }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- 評分選擇 -->
            <div class="mb-4">
              <label class="form-label fw-bold">
                <i class="fas fa-star text-warning"></i> 您的評分
              </label>
              <div class="rating-input d-flex justify-content-center">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star-input"
                  :class="{ filled: star <= reviewForm.rating }"
                  @click="reviewForm.rating = star"
                  @mouseover="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  ★
                </span>
              </div>
              <div class="text-center mt-2">
                <span class="badge bg-warning text-dark">
                  {{ ratingText }}
                </span>
              </div>
            </div>

            <!-- 評論內容 -->
            <div class="mb-3">
              <label class="form-label fw-bold">
                <i class="fas fa-comment"></i> 您的評論
              </label>
              <textarea
                v-model="reviewForm.comment"
                class="form-control"
                rows="6"
                placeholder="請分享您的住宿體驗，包括房間、服務、設施等方面的感受..."
                maxlength="1000"
              ></textarea>
              <div class="form-text text-end">
                {{ reviewForm.comment ? reviewForm.comment.length : 0 }}/1000
              </div>
            </div>

            <!-- 提示訊息 -->
            <div class="alert alert-info small">
              <i class="fas fa-info-circle"></i>
              評論發布後，飯店業者可能會回覆您的評論，評論也會顯示在飯店介紹頁面供其他客人參考。
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
            >
              <i class="fas fa-times"></i> 取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="submitReview"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                發布中...
              </span>
              <span v-else>
                <i class="fas fa-paper-plane"></i> 發布評論
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'CreateReviewForm',
  props: {
    bookingId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showReviewModal: false,
      canReview: false,
      hasReview: false,
      canReviewMessage: '',
      reviewForm: {
        rating: 5,
        comment: '',
      },
      hoverRating: 0,
      isSubmitting: false,
      userId: null,
    };
  },
  computed: {
    ratingText() {
      const displayRating = this.hoverRating || this.reviewForm.rating;
      const texts = {
        1: '😞 非常不滿意',
        2: '😕 不太滿意',
        3: '😐 普通',
        4: '😊 滿意',
        5: '😍 非常滿意',
      };
      return texts[displayRating] || '';
    },
  },
  mounted() {
    this.userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (!this.userId) {
      this.canReviewMessage = '請先登入';
      return;
    }

    this.checkCanReview();
  },
  methods: {
    async checkCanReview() {
      try {
        // 1. 檢查是否已評論
        const reviewResponse = await axios.get(
          `http://192.168.25.152:8080/api/reviews/booking/${this.bookingId}`
        );

        if (reviewResponse.data.success && reviewResponse.data.data) {
          this.hasReview = true;
          return;
        }

        // 2. 檢查是否符合評論條件
        const canReviewResponse = await axios.get(
          `http://192.168.25.152:8080/api/reviews/can-review/${this.bookingId}?userId=${this.userId}`
        );

        if (canReviewResponse.data.success) {
          this.canReview = canReviewResponse.data.canReview;
          if (!this.canReview) {
            this.canReviewMessage = '只有完成的訂單才能評論';
          }
        }
      } catch (error) {
        console.error('檢查評論權限失敗:', error);
      }
    },

    async submitReview() {
      if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
        Swal.fire({
          icon: 'warning',
          title: '提醒',
          text: '請選擇評分（1-5星）',
        });
        return;
      }

      if (!this.reviewForm.comment || this.reviewForm.comment.trim() === '') {
        Swal.fire({
          icon: 'warning',
          title: '提醒',
          text: '請輸入評論內容',
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await axios.post(
          `http://192.168.25.152:8080/api/reviews?userId=${this.userId}`,
          {
            bookingId: this.bookingId,
            rating: this.reviewForm.rating,
            comment: this.reviewForm.comment,
          }
        );

        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: '發布成功！',
            text: '感謝您的評論',
            timer: 2000,
            showConfirmButton: false,
          });

          this.closeModal();
          this.hasReview = true;
          this.canReview = false;

          this.$emit('review-created', response.data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: '發布失敗',
            text: response.data.message,
          });
        }
      } catch (error) {
        console.error('發布評論失敗:', error);
        Swal.fire({
          icon: 'error',
          title: '發布失敗',
          text: '發生錯誤，請稍後再試',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    closeModal() {
      this.showReviewModal = false;
      this.reviewForm = {
        rating: 5,
        comment: '',
      };
    },
  },
};
</script>

<style scoped>
.star-input {
  font-size: 3rem;
  color: #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 5px;
}

.star-input.filled {
  color: #ffc107;
}

.star-input:hover {
  transform: scale(1.1);
}

.rating-input {
  padding: 20px 0;
}

.modal.show {
  display: block;
}
</style>