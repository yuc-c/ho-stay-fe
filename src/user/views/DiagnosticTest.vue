<template>
  <div class="container py-5">
    <h2 class="mb-4">🔍 前後端連線診斷工具</h2>
    
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">測試結果</h5>
        
        <!-- 測試 1: 後端連線 -->
        <div class="test-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>1. 後端服務連線 (http://192.168.25.152:8080)</span>
            <span v-if="tests.backend === null" class="badge bg-secondary">未測試</span>
            <span v-else-if="tests.backend" class="badge bg-success">✓ 成功</span>
            <span v-else class="badge bg-danger">✗ 失敗</span>
          </div>
          <small v-if="errors.backend" class="text-danger d-block mt-1">
            錯誤: {{ errors.backend }}
          </small>
        </div>

        <!-- 測試 2: CORS -->
        <div class="test-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>2. CORS 配置測試</span>
            <span v-if="tests.cors === null" class="badge bg-secondary">未測試</span>
            <span v-else-if="tests.cors" class="badge bg-success">✓ 成功</span>
            <span v-else class="badge bg-danger">✗ 失敗</span>
          </div>
          <small v-if="errors.cors" class="text-danger d-block mt-1">
            錯誤: {{ errors.cors }}
          </small>
        </div>

        <!-- 測試 3: 訂單 API -->
        <div class="test-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>3. 訂單 API (/api/test/bookings)</span>
            <span v-if="tests.bookings === null" class="badge bg-secondary">未測試</span>
            <span v-else-if="tests.bookings" class="badge bg-success">✓ 成功</span>
            <span v-else class="badge bg-danger">✗ 失敗</span>
          </div>
          <small v-if="errors.bookings" class="text-danger d-block mt-1">
            錯誤: {{ errors.bookings }}
          </small>
          <div v-if="bookingsData" class="mt-2">
            <small class="text-success">
              收到 {{ bookingsData.totalElements }} 筆訂單資料
            </small>
          </div>
        </div>

        <button 
          class="btn btn-primary mt-3" 
          @click="runAllTests"
          :disabled="isRunning">
          <span v-if="isRunning" class="spinner-border spinner-border-sm me-2"></span>
          {{ isRunning ? '測試中...' : '重新測試' }}
        </button>
      </div>
    </div>

    <!-- 建議 -->
    <div v-if="showSuggestions" class="card">
      <div class="card-body">
        <h5 class="card-title">💡 問題診斷與建議</h5>
        <ul class="list-unstyled">
          <li v-for="(suggestion, index) in suggestions" :key="index" class="mb-2">
            <i class="bi bi-arrow-right-circle text-primary me-2"></i>
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DiagnosticTest',
  
  data() {
    return {
      tests: {
        backend: null,
        cors: null,
        bookings: null
      },
      errors: {
        backend: '',
        cors: '',
        bookings: ''
      },
      bookingsData: null,
      isRunning: false
    }
  },
  
  computed: {
    showSuggestions() {
      return this.tests.backend !== null
    },
    
    suggestions() {
      const suggestions = []
      
      if (this.tests.backend === false) {
        suggestions.push('❌ 後端服務未啟動 - 請確認 Spring Boot 應用正在運行於 http://192.168.25.152:8080')
        suggestions.push('檢查指令：在後端專案執行 mvn spring-boot:run 或使用 IDE 啟動')
      }
      
      if (this.tests.cors === false) {
        suggestions.push('❌ CORS 設定有問題 - 請檢查後端 CorsConfig.java 和 SecurityConfig.java')
      }
      
      if (this.tests.bookings === false) {
        suggestions.push('❌ 訂單 API 回應失敗 - 可能是資料庫連線問題')
        suggestions.push('請檢查 SQL Server 是否正常運行')
        suggestions.push('請檢查 application.properties 中的資料庫連線設定')
      }
      
      if (this.tests.backend && this.tests.cors && this.tests.bookings) {
        suggestions.push('✅ 所有測試通過！前後端連線正常')
        suggestions.push('如果訂單列表頁面仍有問題，請檢查瀏覽器控制台的錯誤訊息')
      }
      
      return suggestions
    }
  },
  
  mounted() {
    this.runAllTests()
  },
  
  methods: {
    async runAllTests() {
      this.isRunning = true
      
      // 重置狀態
      this.tests = {
        backend: null,
        cors: null,
        bookings: null
      }
      this.errors = {
        backend: '',
        cors: '',
        bookings: ''
      }
      this.bookingsData = null
      
      // 測試 1: 後端連線
      await this.testBackend()
      
      // 只有當後端連線成功時才繼續測試
      if (this.tests.backend) {
        await this.testCors()
        await this.testBookingsAPI()
      }
      
      this.isRunning = false
    },
    
    async testBackend() {
      try {
        const response = await axios.get('http://192.168.25.152:8080/api/test/cors', {
          timeout: 5000
        })
        this.tests.backend = response.status === 200
      } catch (error) {
        this.tests.backend = false
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          this.errors.backend = '無法連線到後端服務 (連線被拒絕)'
        } else if (error.code === 'ECONNABORTED') {
          this.errors.backend = '連線逾時'
        } else {
          this.errors.backend = error.message
        }
      }
    },
    
    async testCors() {
      try {
        const response = await axios.get('http://192.168.25.152:8080/api/test/cors')
        this.tests.cors = response.data.success === true
      } catch (error) {
        this.tests.cors = false
        this.errors.cors = error.message
      }
    },
    
    async testBookingsAPI() {
      try {
        const response = await axios.get('http://192.168.25.152:8080/api/test/bookings')
        this.tests.bookings = response.status === 200 && response.data.content
        this.bookingsData = response.data
      } catch (error) {
        this.tests.bookings = false
        if (error.response) {
          this.errors.bookings = `HTTP ${error.response.status}: ${error.response.data.message || error.message}`
        } else {
          this.errors.bookings = error.message
        }
      }
    }
  }
}
</script>

<style scoped>
.test-item {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.test-item:last-child {
  border-bottom: none;
}

.badge {
  min-width: 60px;
}
</style>