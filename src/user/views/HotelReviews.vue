<template>
  <div class="hotel-reviews">
    <div class="reviews-header mb-4">
      <h3>
        <i class="fas fa-star text-warning"></i> 住客評價
        <span class="badge bg-primary ms-2">{{ reviews.length }} 則評論</span>
      </h3>
      
      <!-- 評分統計 -->
      <div v-if="reviews.length > 0" class="rating-summary card p-4 mb-4">
        <div class="row align-items-center">
          <div class="col-md-4 text-center">
            <div class="average-rating">
              <h1 class="display-3 fw-bold text-warning mb-0">
                {{ averageRating }}
              </h1>
              <div class="stars mb-2">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ filled: star <= Math.round(averageRating) }"
                >
                  ★
                </span>
              </div>
              <p class="text-muted mb-0">基於 {{ reviews.length }} 則評論</p>
            </div>
          </div>
          <div class="col-md-8">
            <!-- 評分分布 -->
            <div
              v-for="rating in [5, 4, 3, 2, 1]"
              :key="rating"
              class="rating-bar mb-2"
            >
              <div class="row align-items-center">
                <div class="col-2 text-end">
                  <small>{{ rating }} 星</small>
                </div>
                <div class="col-8">
                  <div class="progress">
                    <div
                      class="progress-bar bg-warning"
                      :style="{ width: getRatingPercentage(rating) + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="col-2">
                  <small class="text-muted">{{ getRatingCount(rating) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 沒有評論時 -->
    <div v-if="reviews.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i> 此飯店尚無評論
    </div>

    <!-- 評論列表 -->
    <div v-else class="reviews-list">
      <div
        v-for="review in displayedReviews"
        :key="review.id"
        class="review-item card mb-3"
      >
        <div class="card-body">
          <!-- 評論標題 -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="reviewer-info">
              <div class="d-flex align-items-center mb-2">
                <div class="avatar me-2">
                  <i class="fas fa-user-circle fa-2x text-secondary"></i>
                </div>
                <div>
                  <h6 class="mb-0">{{ review.userName || '匿名用戶' }}</h6>
                  <small class="text-muted">
                    {{ formatDate(review.createdDate) }}
                    <span v-if="review.isEdited" class="badge bg-secondary ms-1">
                      已編輯
                    </span>
                  </small>
                </div>
              </div>
            </div>
            <div class="rating-display">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ filled: star <= review.rating }"
              >
                ★
              </span>
            </div>
          </div>

          <!-- 評論內容 -->
          <p class="review-comment">{{ review.comment }}</p>

          <!-- 飯店業者回覆 -->
          <div
            v-if="review.reply"
            class="hotel-reply mt-3 p-3 bg-light rounded"
          >
            <div class="d-flex align-items-start">
              <div class="reply-icon me-3">
                <i class="fas fa-hotel fa-2x text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between mb-2">
                  <strong class="text-primary">
                    <i class="fas fa-reply"></i> 飯店回覆
                  </strong>
                  <small class="text-muted">
                    {{ formatDate(review.replyCreatedDate) }}
                  </small>
                </div>
                <p class="mb-0">{{ review.reply }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 載入更多按鈕 -->
      <div v-if="reviews.length > displayLimit" class="text-center mt-4">
        <button
          v-if="displayedReviews.length < reviews.length"
          class="btn btn-outline-primary"
          @click="loadMore"
        >
          <i class="fas fa-chevron-down"></i> 載入更多評論
        </button>
        <button
          v-else
          class="btn btn-outline-secondary"
          @click="displayLimit = 5"
        >
          <i class="fas fa-chevron-up"></i> 收起評論
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HotelReviews',
  props: {
    hotelId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      reviews: [],
      displayLimit: 5,
      loading: false,
    };
  },
  computed: {
    displayedReviews() {
      return this.reviews.slice(0, this.displayLimit);
    },

    averageRating() {
      if (this.reviews.length === 0) return 0;
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / this.reviews.length).toFixed(1);
    },
  },
  mounted() {
    this.loadReviews();
  },
  methods: {
    async loadReviews() {
      this.loading = true;
      try {
        const response = await axios.get(
          `http://localhost:8080/api/reviews/hotel/${this.hotelId}`
        );
        if (response.data.success) {
          this.reviews = response.data.data;
        }
      } catch (error) {
        console.error('載入評論失敗:', error);
      } finally {
        this.loading = false;
      }
    },

    loadMore() {
      this.displayLimit += 5;
    },

    getRatingCount(rating) {
      return this.reviews.filter((r) => r.rating === rating).length;
    },

    getRatingPercentage(rating) {
      if (this.reviews.length === 0) return 0;
      const count = this.getRatingCount(rating);
      return ((count / this.reviews.length) * 100).toFixed(1);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.hotel-reviews {
  padding: 20px 0;
}

.rating-summary {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.average-rating {
  padding: 20px;
}

.star {
  font-size: 1.5rem;
  color: #ddd;
  margin: 0 2px;
}

.star.filled {
  color: #ffc107;
}

.rating-display .star {
  font-size: 1.2rem;
}

.rating-bar .progress {
  height: 8px;
}

.review-item {
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.reviewer-info .avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-comment {
  line-height: 1.6;
  color: #333;
}

.hotel-reply {
  border-left: 4px solid #007bff;
  background-color: #f8f9fa !important;
}

.reply-icon {
  min-width: 40px;
}

@media (max-width: 768px) {
  .rating-summary .col-md-4,
  .rating-summary .col-md-8 {
    text-align: center !important;
  }

  .rating-summary .row {
    flex-direction: column;
  }

  .rating-bar .row {
    flex-direction: row !important;
  }
}
</style>