<template>
  <div class="become-host-container">
    <div class="become-host-card">
      <div class="icon-container">
        <Building2 class="icon" />
      </div>
      <h1 class="title">註冊成為房東</h1>
      <p class="description">
        成為房東後，您可以管理自己的飯店、設定房型和價格，開始您的飯店經營之旅！
      </p>
      
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>處理中...</p>
      </div>
      
      <div v-else-if="success" class="success-container">
        <div class="success-icon">✓</div>
        <h2>註冊成功！</h2>
        <p>您現在已經是房東了，可以開始管理您的飯店。</p>
        <Button @click="goToHotelManagement" class="mt-4 green-button">
          前往飯店管理
        </Button>
      </div>
      
      <div v-else class="form-container">
        <div class="info-box">
          <h3>成為房東後，您可以：</h3>
          <ul>
            <li>新增和管理您的飯店資訊</li>
            <li>設定房型和價格</li>
            <li>上傳飯店照片</li>
            <li>管理訂單和回覆評論</li>
          </ul>
        </div>
        
        <Button 
          @click="handleBecomeHost" 
          :disabled="loading"
          class="submit-button green-button"
          size="lg"
        >
          確認註冊成為房東
        </Button>
        
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Building2 } from 'lucide-vue-next'
import Button from '@/user/components/ui/Button.vue'
import { toast } from 'vue-sonner'
import useUserStore from '@/user/stores/user.js'
import { userAPI } from '@/user/api/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleBecomeHost = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 檢查是否有 token
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = '請先登入'
      toast.error('請先登入後再註冊成為房東')
      loading.value = false
      return
    }
    
    // 調用 API 更新後端資料庫中的用戶角色
    const response = await userAPI.becomeHotelOwner()
    
    // 更新本地存儲的角色資訊
    let updatedRoles = []
    
    // 如果 API 返回了更新的用戶資訊，優先使用 API 返回的資料
    if (response && response.roles) {
      updatedRoles = Array.isArray(response.roles) ? response.roles : [response.roles]
      userStore.setrole(updatedRoles)
    } else if (response && response.user && response.user.roles) {
      updatedRoles = Array.isArray(response.user.roles) ? response.user.roles : [response.user.roles]
      userStore.setrole(updatedRoles)
    } else {
      // 如果 API 沒有返回角色資訊，手動添加房東角色
      const currentRoles = userStore.role || []
      const newRole = {
        role_id: 3,
        name: '業者',
        role: 'HOTEL_OWNER'
      }
      
      // 檢查是否已經有房東角色
      const hasOwnerRole = currentRoles.some(role => 
        (role.role_id === 3) || (role.roleId === 3) || (role.id === 3)
      )
      
      if (!hasOwnerRole) {
        // 添加新角色
        updatedRoles = Array.isArray(currentRoles) 
          ? [...currentRoles, newRole]
          : [newRole]
        userStore.setrole(updatedRoles)
      } else {
        updatedRoles = currentRoles
      }
    }
    
    // 觸發頁面刷新以更新角色檢查
    success.value = true
    toast.success('註冊成為房東成功！')
    
    // 觸發 storage 事件，讓其他頁面知道角色已更新
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('userRoleUpdated', { detail: { roles: updatedRoles } }))
    
  } catch (err) {
    console.error('註冊成為房東失敗:', err)
    error.value = err.message || '註冊失敗，請稍後再試'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const goToHotelManagement = () => {
  window.location.href = '/owner.html'
}
</script>

<style scoped>
.become-host-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.become-host-card {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon {
  width: 80px;
  height: 80px;
  color: #16a34a;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #15803d;
  margin-bottom: 1rem;
}

.description {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #16a34a;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-container {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #16a34a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
  font-weight: bold;
}

.success-container h2 {
  color: #15803d;
  margin-bottom: 1rem;
}

.info-box {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-box h3 {
  color: #15803d;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-box li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #475569;
}

.info-box li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: bold;
}

.submit-button {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
}

.green-button {
  background: #16a34a !important;
  color: white !important;
  border: none !important;
}

.green-button:hover {
  background: #15803d !important;
}

.green-button:disabled {
  background: #86efac !important;
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 0.5rem;
}
</style>

