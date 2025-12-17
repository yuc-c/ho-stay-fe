<template>
  <div>
    <div class="main-container">
      <!-- 分頁切換 -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'">
          基本資料
        </button>
        <button 
          class="tab-btn"
          :class="{ active: activeTab === 'password' }"
          @click="activeTab = 'password'">
          修改密碼
        </button>
      </div>

      <!-- 基本資料頁面 -->
      <div v-show="activeTab === 'profile'" class="tab-content">
        <div class="card">
          <h1>📝 個人資料維護</h1>

          <!-- 照片上傳 -->
          <div class="photo-upload-area">
            <div id="photoContainer">
              <img v-if="photoPreview" :src="photoPreview" class="photo-preview">
              <div v-else class="photo-placeholder">👤</div>
            </div>
            <div class="file-input-wrapper">
              <label class="file-input-btn">
                📷 上傳照片
                <input type="file" accept="image/*" @change="uploadPhoto">
              </label>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">支援 JPG, PNG 格式</p>
          </div>

          <!-- 個人資料表單 -->
          <form @submit.prevent="saveProfile">
            <div class="form-group">
              <label>Email:</label>
              <input type="email" v-model="userProfile.email" readonly>
            </div>

            <div class="form-group">
              <label>姓氏:</label>
              <input type="text" v-model="userProfile.lastName" placeholder="Last Name" >
            </div>

            <div class="form-group">
              <label>名字:</label>
              <input type="text" v-model="userProfile.firstName" placeholder="First Name">
            </div>

            <div class="form-group">
              <label>性別:</label>
              <select v-model="userProfile.gender">
                <option value="">請選擇</option>
                <option value="M">男</option>
                <option value="F">女</option>
                <option value="O">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label>生日:</label>
              <input type="date" v-model="userProfile.dateOfBirth">
            </div>

            <div class="form-group">
              <label>連絡電話:</label>
              <input type="tel" v-model="userProfile.phoneNumber" placeholder="請輸入手機或市話">
            </div>

            <div class="form-group">
              <label>地址:</label>
              <input type="text" v-model="userProfile.address" placeholder="請輸入完整地址">
            </div>

            <div class="button-group">
              <button type="button" class="btn-secondary" @click="loadData">🔄 重新載入</button>
              <button type="submit" class="btn-success">💾 儲存變更</button>
            </div>
          </form>

          <!-- 載入中 -->
          <div v-show="isLoading" class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px; color: #666;">處理中...</p>
          </div>

          <!-- 訊息提示 -->
          <div v-show="message.show" class="message" :class="message.type">
            {{ message.text }}
          </div>
        </div>
      </div>

      <!-- 修改密碼頁面 -->
      <div v-show="activeTab === 'password'" class="tab-content">
        <div class="card">
          <h1>🔒 修改密碼</h1>

          <form @submit.prevent="changePasswordSubmit">
            <div class="form-group">
              <label>目前密碼:</label>
              <div class="password-input-wrapper">
                <input 
                  :type="showCurrentPassword ? 'text' : 'password'" 
                  v-model="passwordForm.currentPassword" 
                  placeholder="請輸入目前密碼" 
                  required>
                <span 
                  class="password-toggle" 
                  @click="showCurrentPassword = !showCurrentPassword"
                  :title="showCurrentPassword ? '隱藏密碼' : '顯示密碼'">
                  {{ showCurrentPassword ? '👁️' : '👁️‍🗨️' }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>新密碼:</label>
              <div class="password-input-wrapper">
                <input 
                  :type="showNewPassword ? 'text' : 'password'" 
                  v-model="passwordForm.newPassword" 
                  placeholder="請輸入新密碼 (至少 8 碼，英文數字混合)" 
                  required>
                <span 
                  class="password-toggle" 
                  @click="showNewPassword = !showNewPassword"
                  :title="showNewPassword ? '隱藏密碼' : '顯示密碼'">
                  {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>確認新密碼:</label>
              <div class="password-input-wrapper">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="passwordForm.confirmPassword" 
                  placeholder="再次輸入新密碼" 
                  required>
                <span 
                  class="password-toggle" 
                  @click="showConfirmPassword = !showConfirmPassword"
                  :title="showConfirmPassword ? '隱藏密碼' : '顯示密碼'">
                  {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
                </span>
              </div>
            </div>

            <div class="button-group">
              <button type="button" class="btn-secondary" @click="clearPassword">🗑️ 清空</button>
              <button type="submit" class="btn-success">💾 確認修改</button>
            </div>
          </form>

          <!-- 載入中 -->
          <div v-show="isPasswordLoading" class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px; color: #666;">處理中...</p>
          </div>

          <!-- 訊息提示 -->
          <div v-show="passwordMessage.show" class="message" :class="passwordMessage.type">
            {{ passwordMessage.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ✅ 修正：使用標準化的 API
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadUserAvatar, 
  changePassword,
  convertGenderToFrontend 
} from '@/user/api/user.js'
import { API_BASE_URL } from '@/user/api/request.js'
import useUserStore from '@/user/stores/user.js'

// 後端 base URL（用於圖片訪問）
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '') || 'http://localhost:8080'

export default {
  name: 'UserProfile',
  
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  
  data() {
    return {
      // 分頁狀態
      activeTab: 'profile',
      
      // 個人資料
      userProfile: {
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        image: ''
      },
      
      // 照片相關
      selectedPhoto: null,
      photoPreview: null,
      
      // 密碼表單
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      // 密碼顯示/隱藏狀態
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      
      // 載入狀態
      isLoading: false,
      isPasswordLoading: false,
      
      // 訊息提示
      message: {
        show: false,
        text: '',
        type: ''
      },
      passwordMessage: {
        show: false,
        text: '',
        type: ''
      }
    }
  },
  
  mounted() {
    // 頁面載入時自動載入資料
    this.loadData()
  },
  
  methods: {
    /**
     * 上傳照片（預覽）
     */
    uploadPhoto(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('檔案太大！請選擇小於 5MB 的圖片')
        return
      }
      
      this.selectedPhoto = file
      
      // 預覽照片
      const reader = new FileReader()
      reader.onload = (e) => {
        this.photoPreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    /**
     * ✅ 修正：載入個人資料
     * 使用標準化 API 並處理 ApiResponse
     */
    async loadData() {
      this.isLoading = true
      
      try {
        console.log('🔄 載入個人資料...')
        
        const response = await getUserProfile()
        console.log('📥 收到回應:', response)
        
        // ✅ 修正：後端 /api/user 返回的是 Map，不是 ApiResponse 包裝
        // 後端返回格式：{ success, id, userLastName, userFirstName, email, phone, token, role, photo }
        const userData = response.data || response
        
        console.log('👤 使用者資料:', userData)
        
        // 後端返回 userFirstName 和 userLastName，不需要拆分
        const firstName = userData.userFirstName || ''
        const lastName = userData.userLastName || ''
        
        // 更新資料
        // 處理日期格式（後端返回 LocalDate，格式為 "yyyy-MM-dd"）
        let dateOfBirth = ''
        if (userData.dateOfBirth) {
          dateOfBirth = userData.dateOfBirth
        } else if (userData.birthday) {
          dateOfBirth = userData.birthday
        }
        
        this.userProfile = {
          email: userData.email || '',
          firstName: firstName,
          lastName: lastName,
          phoneNumber: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: dateOfBirth,
          gender: convertGenderToFrontend(userData.gender),  // ✅ 修正：使用正確的性別轉換（M/F/O）
          image: userData.photo || userData.image || ''
        }
        
        console.log('✅ 個人資料已更新:', this.userProfile)
        
        // 顯示照片
        if (userData.photo || userData.image) {
          const photoUrl = userData.photo || userData.image
          // 如果已經是完整 URL，直接使用；否則通過後端 API 獲取
          if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
            this.photoPreview = photoUrl
          } else {
            // 通過後端 API 獲取圖片
            this.photoPreview = `${BACKEND_BASE_URL}/api/user/photo?photoUrl=${encodeURIComponent(photoUrl)}`
          }
          
          // ✅ 更新 userStore 中的照片，讓右上角頭像顯示正確
          this.userStore.setPhoto(photoUrl)
        }
        
        // ✅ 更新 userStore 中的其他用戶資料
        this.userStore.setFirstName(firstName)
        this.userStore.setLastName(lastName)
        
        this.showMessage('資料載入成功！', 'success')
        
      } catch (error) {
        console.error('❌ 載入失敗:', error)
        
        // 詳細錯誤處理
        let errorMessage = '載入個人資料失敗'
        
        if (error.status === 401 || error.response?.status === 401) {
          errorMessage = '請先登入\n\nToken 可能已過期，請重新登入'
        } else if (error.status === 500 || error.response?.status === 500) {
          // 處理 500 錯誤（可能是 token 無效或 userId 為 null）
          const errorData = error.response?.data || error.errorData
          if (errorData?.message) {
            if (errorData.message.includes('id must not be null') || 
                errorData.message.includes('無法從 token')) {
              errorMessage = 'Token 無效或已過期，請重新登入'
            } else {
              errorMessage = '伺服器錯誤：' + errorData.message
            }
          } else {
            errorMessage = '伺服器內部錯誤，請稍後再試'
          }
        } else if (error.message) {
          errorMessage = error.message
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        this.showMessage(errorMessage, 'error')
        
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * ✅ 修正：儲存個人資料
     * 使用標準化 API
     */
    async saveProfile() {
      // 驗證手機號碼
      if (this.userProfile.phoneNumber && this.userProfile.phoneNumber.length !== 10) {
        alert('手機號碼格式不正確，應為 10 碼')
        return
      }
      
      this.isLoading = true
      
      try {
        console.log('💾 儲存個人資料...')
        
        // ✅ 修正：先處理照片上傳（如果有的話）
        if (this.selectedPhoto) {
          console.log('📸 上傳照片...')
          
          try {
            const uploadResponse = await uploadUserAvatar(this.selectedPhoto)
            console.log('✅ 照片上傳成功:', uploadResponse)
            
            // 更新預覽圖片（使用後端返回的文件名）
            if (uploadResponse.data?.filename || uploadResponse.data?.url) {
              const filename = uploadResponse.data.filename || uploadResponse.data.url
              // 通過後端 API 獲取圖片 URL
              this.photoPreview = `${BACKEND_BASE_URL}/api/user/photo?photoUrl=${encodeURIComponent(filename)}`
              
              // ✅ 更新 userStore 中的照片，讓右上角頭像即時更新
              this.userStore.setPhoto(filename)
              console.log('✅ 已更新 userStore.photo:', filename)
            }
            
            this.showMessage('照片上傳成功！', 'success')
          } catch (uploadError) {
            console.error('❌ 照片上傳失敗:', uploadError)
            // 照片上傳失敗不影響資料更新，只顯示警告
            this.showMessage('照片上傳失敗，但資料仍會更新', 'error')
          }
          
          this.selectedPhoto = null
        }
        
        // ✅ 修正：使用標準化 API 更新資料
        // updateUserProfile 會自動處理性別轉換和欄位格式
        const profileData = {
          name: `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim(),
          email: this.userProfile.email,
          phoneNumber: this.userProfile.phoneNumber,
          dateOfBirth: this.userProfile.dateOfBirth,
          address: this.userProfile.address,
          gender: this.userProfile.gender  // 會在 user.js 中自動轉換
        }
        
        console.log('📤 更新資料:', profileData)
        
        const response = await updateUserProfile(profileData)
        console.log('📥 更新回應:', response)
        
        // ✅ 修正：處理回應格式（後端返回 Map，不是 ApiResponse）
        let successMessage = '更新成功！'
        if (response.data) {
          if (typeof response.data === 'string') {
            successMessage = response.data
          } else if (response.data.message) {
            successMessage = response.data.message
          } else if (response.data.success) {
            successMessage = response.data.message || '更新成功！'
          }
        }
        
        this.showMessage(successMessage, 'success')
        
        // ✅ 更新 userStore 中的用戶資料，讓右上角即時更新
        this.userStore.setFirstName(this.userProfile.firstName)
        this.userStore.setLastName(this.userProfile.lastName)
        // 如果上傳了照片，photo 已經在上傳時更新了
        
        // 1 秒後自動重新整理頁面
        setTimeout(() => {
          window.location.reload()
        }, 500)
        
      } catch (error) {
        console.error('❌ 更新失敗:', error)
        
        // 詳細錯誤處理
        let errorMessage = '更新個人資料失敗'
        
        if (error.status === 401 || error.response?.status === 401) {
          errorMessage = '請先登入\n\nToken 可能已過期，請重新登入'
        } else if (error.status === 500 || error.response?.status === 500) {
          const errorData = error.response?.data || error.errorData
          if (errorData?.message) {
            errorMessage = '伺服器錯誤：' + errorData.message
          } else {
            errorMessage = '伺服器內部錯誤，請稍後再試'
          }
        } else if (error.message) {
          errorMessage = error.message
        } else if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          }
        }
        
        this.showMessage(errorMessage, 'error')
        
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * ✅ 修正：修改密碼
     * 使用標準化 API
     */
    async changePasswordSubmit() {
      // 驗證：新密碼不能與舊密碼相同
      if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
        this.showPasswordMessage('新密碼不能與目前密碼相同', 'error')
        return
      }
      
      // 驗證：兩次密碼輸入必須一致
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.showPasswordMessage('兩次密碼不一致', 'error')
        return
      }
      
      // 驗證：密碼長度至少 8 碼
      if (this.passwordForm.newPassword.length < 8) {
        this.showPasswordMessage('密碼至少需要 8 碼', 'error')
        return
      }
      
      // 驗證：密碼必須包含英文和數字
      const hasLetter = /[a-zA-Z]/.test(this.passwordForm.newPassword)
      const hasNumber = /[0-9]/.test(this.passwordForm.newPassword)
      
      if (!hasLetter || !hasNumber) {
        this.showPasswordMessage('密碼必須包含英文和數字', 'error')
        return
      }
      
      this.isPasswordLoading = true
      
      try {
        console.log('🔒 修改密碼...')
        
        // ✅ 修正：使用標準化 API
        const response = await changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword
        })
        
        console.log('📥 密碼修改回應:', response)
        
        // ✅ 修正：處理後端返回格式（後端返回 { success, message }，不是 ApiResponse）
        let successMessage = '密碼修改成功！'
        if (response.data) {
          if (typeof response.data === 'string') {
            successMessage = response.data
          } else if (response.data.message) {
            successMessage = response.data.message
          } else if (response.data.success) {
            successMessage = response.data.message || '密碼修改成功！'
          }
        } else if (response.message) {
          successMessage = response.message
        }
        
        this.showPasswordMessage(successMessage, 'success')
        this.clearPassword()
        
      } catch (error) {
        console.error('❌ 修改失敗:', error)
        
        // ✅ 修正：處理錯誤訊息格式
        let errorMsg = '修改密碼失敗'
        if (error.errorData) {
          if (typeof error.errorData === 'string') {
            errorMsg = error.errorData
          } else if (error.errorData.message) {
            errorMsg = error.errorData.message
          }
        } else if (error.message) {
          errorMsg = error.message
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message
        }
        
        this.showPasswordMessage(errorMsg, 'error')
        
      } finally {
        this.isPasswordLoading = false
      }
    },
    
    /**
     * 清空密碼表單
     */
    clearPassword() {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      // 同時重置顯示狀態
      this.showCurrentPassword = false
      this.showNewPassword = false
      this.showConfirmPassword = false
    },
    
    /**
     * 顯示訊息（個人資料）
     */
    showMessage(text, type) {
      this.message = {
        show: true,
        text: text,
        type: type
      }
      
      setTimeout(() => {
        this.message.show = false
      }, 3000)
    },
    
    /**
     * 顯示訊息（密碼）
     */
    showPasswordMessage(text, type) {
      this.passwordMessage = {
        show: true,
        text: text,
        type: type
      }
      
      setTimeout(() => {
        this.passwordMessage.show = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft JhengHei', sans-serif;
  background: linear-gradient(135deg, #7dfdf7 0%, #bafff5 100%);
  min-height: 100vh;
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f4d46;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.navbar-menu a {
  text-decoration: none;
  color: #555;
  font-weight: 600;
  transition: color 0.3s;
}

.navbar-menu a:hover {
  color: #0f4d46;
}

.main-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  padding: 12px 24px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #555;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #89A48C;
  color: #89A48C;
}

.tab-btn.active {
  background: #89A48C !important;
  color: white !important;
  border-color: #89A48C !important;
}

.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.photo-upload-area {
  text-align: center;
  margin-bottom: 30px;
}

.photo-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #89A48C;
  margin-bottom: 20px;
}

.photo-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 4px dashed #ccc;
  color: #999;
  font-size: 48px;
}

.file-input-wrapper {
  position: relative;
  display: inline-block;
}

.file-input-wrapper input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #89A48C !important;
  color: white !important;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.file-input-btn:hover {
  background: #6F8A72 !important;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper input {
  padding-right: 45px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  transition: opacity 0.3s;
}

.password-toggle:hover {
  opacity: 0.7;
}

input:focus,
select:focus {
  outline: none;
  border-color: #89A48C;
}

input:disabled,
input[readonly] {
  background: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #ff4d00;
  color: white;
}

.btn-secondary:hover {
  background: #ff753a;
}

.btn-success {
  background: #2c8432;
  color: white;
}

.btn-success:hover {
  background: #004a0e;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  white-space: pre-line;  /* 支援換行 */
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.loading {
  text-align: center;
  margin-top: 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #89A48C;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>