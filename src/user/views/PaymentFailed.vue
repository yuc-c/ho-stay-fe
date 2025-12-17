<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <!-- 失敗圖示 -->
            <div class="mb-4">
              <i class="bi bi-x-circle-fill text-danger" style="font-size: 5rem;"></i>
            </div>
            
            <!-- 標題 -->
            <h2 class="text-danger mb-3">付款失敗</h2>
            <p class="text-muted mb-4">很抱歉,您的付款未能完成</p>
            
            <!-- 失敗原因 -->
            <div v-if="errorInfo" class="alert alert-danger text-start">
              <h6 class="alert-heading">
                <i class="bi bi-exclamation-triangle"></i> 失敗原因
              </h6>
              <p class="mb-0">{{ errorInfo.message }}</p>
            </div>
            
            <!-- 可能的原因 -->
            <div class="card bg-light mb-4">
              <div class="card-body text-start">
                <h6 class="card-title">可能的原因:</h6>
                <ul class="mb-0">
                  <li>信用卡餘額不足</li>
                  <li>信用卡資訊輸入錯誤</li>
                  <li>交易逾時</li>
                  <li>銀行系統維護中</li>
                  <li>其他系統問題</li>
                </ul>
              </div>
            </div>
            
            <!-- 建議 -->
            <div class="alert alert-info text-start">
              <i class="bi bi-lightbulb"></i>
              <strong>建議:</strong>
              <ul class="mb-0 mt-2">
                <li>請檢查信用卡資訊是否正確</li>
                <li>確認信用卡有足夠額度</li>
                <li>稍後再試一次</li>
                <li>若問題持續,請聯絡客服</li>
              </ul>
            </div>
            
            <!-- 操作按鈕 -->
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <button 
                class="btn btn-primary btn-lg"
                @click="retryPayment">
                <i class="bi bi-arrow-clockwise"></i> 重新付款
              </button>
              <button 
                class="btn btn-outline-secondary btn-lg"
                @click="goToBookings">
                <i class="bi bi-list-ul"></i> 返回訂單列表
              </button>
            </div>
            
            <!-- 客服資訊 -->
            <div class="mt-4 pt-4 border-top">
              <p class="text-muted mb-2">
                <i class="bi bi-headset"></i> 需要協助?
              </p>
              <p class="mb-0">
                <a href="mailto:support@hohostay.com" class="text-decoration-none">
                  support@hohostay.com
                </a>
                 | 
                <a href="tel:0800-123-456" class="text-decoration-none">
                  0800-123-456
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentFailed',
  
  data() {
    return {
      errorInfo: null,
      tradeNo: null
    }
  },
  
  mounted() {
    // 從 URL 參數取得錯誤資訊
    this.tradeNo = this.$route.query.tradeNo
    const errorMsg = this.$route.query.error
    
    if (errorMsg) {
      this.errorInfo = {
        message: errorMsg
      }
    } else {
      this.errorInfo = {
        message: '付款處理失敗,請稍後再試'
      }
    }
  },
  
  methods: {
    retryPayment() {
      // 返回訂單列表,讓使用者重新嘗試付款
      this.$router.push('/bookings')
    },
    
    goToBookings() {
      this.$router.push('/bookings')
    }
  }
}
</script>

<style scoped>
.bi-x-circle-fill {
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}
</style>