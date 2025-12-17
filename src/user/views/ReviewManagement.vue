<template>
  <div class="review-management container my-5">
    <h2 class="mb-4">我的評論</h2>

    <!-- 沒有評論時的提示 -->
    <div v-if="reviews.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i> 您還沒有發布任何評論
    </div>

    <!-- 評論列表 -->
    <div v-else>
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-card card mb-3"
      >
        <div class="card-body">
          <!-- 評論標題 -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="card-title">訂單 #{{ review.bookingId }}</h5>
              <p class="text-muted small mb-0">
                <i class="far fa-calendar"></i>
                {{ formatDateTime(review.createdDate) }}
                <span v-if="review.isEdited" class="badge bg-secondary ms-2">
                  已編輯
                </span>
              </p>
            </div>
            <div class="btn-group">
              <button
                class="btn btn-sm btn-outline-primary"
                @click="openEditModal(review)"
              >
                <i class="fas fa-edit"></i> 編輯
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="confirmDelete(review.id)"
              >
                <i class="fas fa-trash"></i> 刪除
              </button>
            </div>
          </div>

          <!-- 評分 -->
          <div class="mb-2">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ filled: star <= review.rating }"
            >
              ★
            </span>
            <span class="ms-2 text-muted">{{ review.rating }}/5</span>
          </div>

          <!-- 評論內容 -->
          <p class="card-text">{{ review.comment }}</p>

          <!-- 飯店業者回覆 -->
          <div v-if="review.reply" class="hotel-reply mt-3 p-3 bg-light rounded">
            <div class="d-flex justify-content-between mb-2">
              <strong><i class="fas fa-hotel"></i> 飯店回覆：</strong>
              <small class="text-muted">
                {{ formatDateTime(review.replyCreatedDate) }}
              </small>
            </div>
            <p class="mb-0">{{ review.reply }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯評論Modal -->
    <div
      class="modal fade"
      id="editReviewModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯評論</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- 評分選擇 -->
            <div class="mb-3">
              <label class="form-label">評分</label>
              <div class="rating-input">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star-input"
                  :class="{ filled: star <= editForm.rating }"
                  @click="editForm.rating = star"
                >
                  ★
                </span>
              </div>
            </div>

            <!-- 評論內容 -->
            <div class="mb-3">
              <label class="form-label">評論內容</label>
              <textarea
                v-model="editForm.comment"
                class="form-control"
                rows="5"
                placeholder="請分享您的住宿體驗..."
                maxlength="1000"
              ></textarea>
              <div class="form-text text-end">
                {{ editForm.comment ? editForm.comment.length : 0 }}/1000
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="updateReview">
              儲存變更
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
import { Modal } from 'bootstrap';

export default {
  name: 'ReviewManagement',
  data() {
    return {
      reviews: [],
      editForm: {
        reviewId: null,
        rating: 5,
        comment: '',
      },
      editModal: null,
      userId: null,
    };
  },
  mounted() {
    this.userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (!this.userId) {
      Swal.fire('錯誤', '請先登入', 'error');
      this.$router.push('/login');
      return;
    }

    const modalElement = document.getElementById('editReviewModal');
    if (modalElement) {
      this.editModal = new Modal(modalElement);
    }

    this.loadReviews();
  },
  methods:  {
    async loadReviews() {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/reviews/user/${this.userId}`
        );
        if (response.data.success) {
          this.reviews = response.data.data;
        }
      } catch (error) {
        console.error('載入評論失敗:', error);
        Swal.fire('錯誤', '載入評論失敗', 'error');
      }
    },

    openEditModal(review) {
      this.editForm.reviewId = review.id;
      this.editForm.rating = review.rating;
      this.editForm.comment = review.comment;
      this.editModal.show();
    },

    async updateReview() {
      if (!this.editForm.rating || this.editForm.rating < 1 || this.editForm.rating > 5) {
        Swal.fire('提醒', '請選擇評分（1-5星）', 'warning');
        return;
      }

      if (!this.editForm.comment || this.editForm.comment.trim() === '') {
        Swal.fire('提醒', '請輸入評論內容', 'warning');
        return;
      }

      try {
        const response = await axios.put(
          `http://localhost:8080/api/reviews/${this.editForm.reviewId}?userId=${this.userId}`,
          {
            rating: this.editForm.rating,
            comment: this.editForm.comment,
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: '更新成功',
            text: '評論已更新',
            timer: 1500,
            showConfirmButton: false,
          });

          this.editModal.hide();
          this.loadReviews();
        } else {
          Swal.fire('錯誤', response.data.message, 'error');
        }
      } catch (error) {
        console.error('更新評論失敗:', error);
        Swal.fire('錯誤', '更新評論失敗', 'error');
      }
    },

    confirmDelete(reviewId) {
      Swal.fire({
        title: '確定要刪除這則評論嗎？',
        text: '此操作無法復原',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this.deleteReview(reviewId);
        }
      });
    },

    async deleteReview(reviewId) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/api/reviews/${reviewId}?userId=${this.userId}`
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            text: '評論已刪除',
            timer: 1500,
            showConfirmButton: false,
          });

          this.loadReviews();
        } else {
          Swal.fire('錯誤', response.data.message, 'error');
        }
      } catch (error) {
        console.error('刪除評論失敗:', error);
        Swal.fire('錯誤', '刪除評論失敗', 'error');
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
};
</script>

<style scoped>
.review-management {
  max-width: 900px;
}

.review-card {
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.star,
.star-input {
  font-size: 1.5rem;
  color: #ddd;
  margin-right: 2px;
}

.star.filled,
.star-input.filled {
  color: #ffc107;
}

.star-input {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.star-input:hover {
  transform: scale(1.2);
}

.hotel-reply {
  border-left: 4px solid #007bff;
}

.rating-input {
  display: flex;
  gap: 5px;
}
</style>