<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <!-- 成功圖示 -->
            <div class="mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
            </div>
            
            <!-- 標題 -->
            <h2 class="text-success mb-3">付款成功!</h2>
            <p class="text-muted mb-4">感謝您的付款,您的訂單已確認</p>
            
            <!-- 訂單資訊 -->
            <div v-if="orderInfo" class="border rounded p-4 mb-4 text-start">
              <h5 class="mb-3"><i class="bi bi-receipt"></i> 訂單資訊</h5>
              <div class="row">
                <div class="col-6">
                  <p class="mb-2">
                    <strong>訂單編號:</strong><br>
                    <span class="text-primary">{{ orderInfo.merchantTradeNo }}</span>
                  </p>
                </div>
                <div class="col-6">
                  <p class="mb-2">
                    <strong>付款金額:</strong><br>
                    <span class="text-success fs-5">NT$ {{ formatAmount(orderInfo.amount) }}</span>
                  </p>
                </div>
              </div>
              <hr>
              <p class="mb-0 small text-muted">
                <i class="bi bi-clock"></i> 
                付款時間: {{ orderInfo.paymentTime }}
              </p>
            </div>
            
            <!-- 提示訊息 -->
            <div class="alert alert-info">
              <i class="bi bi-info-circle"></i>
              訂單確認郵件已發送至您的信箱,請查收
            </div>
            
            <!-- 操作按鈕 -->
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <button 
                class="btn btn-primary btn-lg"
                @click="goToBookings">
                <i class="bi bi-list-ul"></i> 查看我的訂單
              </button>
              <button 
                class="btn btn-outline-secondary btn-lg"
                @click="goToHome">
                <i class="bi bi-house"></i> 返回首頁
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccess',
  
  data() {
    return {
      orderInfo: null
    }
  },
  
  mounted() {
    // 從 URL 參數取得訂單資訊
    const tradeNo = this.$route.query.tradeNo
    
    if (tradeNo) {
      // 這裡可以呼叫 API 取得完整訂單資訊
      // 暫時使用假資料
      this.orderInfo = {
        merchantTradeNo: tradeNo,
        amount: 5000,
        paymentTime: new Date().toLocaleString('zh-TW')
      }
    }
    
    // 3秒後自動跳轉到訂單列表
    setTimeout(() => {
      this.goToBookings()
    }, 5000)
  },
  
  methods: {
    goToBookings() {
      this.$router.push('/bookings')
    },
    
    goToHome() {
      this.$router.push('/')
    },
    
    formatAmount(amount) {
      return amount.toLocaleString('zh-TW')
    }
  }
}
</script>

<style scoped>
.bi-check-circle-fill {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>